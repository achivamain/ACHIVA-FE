"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CloseIcon } from "@/components/Icons";
import type { Moim } from "@/types/moim";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FeedPost from "@/features/feed/FeedPost";
import type { PostRes } from "@/types/Post";

export default function MoimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMaxMember, setEditMaxMember] = useState("10");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [visibleMemberCount, setVisibleMemberCount] = useState(10);

  const { data: moimDetail, isLoading } = useQuery<Moim>({
    queryKey: ["moimDetail", id],
    queryFn: async () => {
      const res = await fetch(`/api/moim/${id}`);
      if (!res.ok) throw new Error("Failed to fetch moim detail");
      return (await res.json()).data as Moim;
    },
  });

  const { data: feedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ["moimFeed", id],
    queryFn: async () => {
      const res = await fetch(`/api/moim/${id}/feed`);
      if (!res.ok) throw new Error("Failed to fetch moim feed");
      return (await res.json()).data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      maxMember: number;
      isPrivate: boolean;
      password?: string;
    }) => {
      const res = await fetch(`/api/moim/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("설정 변경 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moimDetail", id] });
      setIsSettingModalOpen(false);
      alert("모임 설정이 변경되었습니다.");
    },
    onError: () => {
      alert("설정 변경 중 오류가 발생했습니다.");
    },
  });

  const kickMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (currentUserId && memberId === currentUserId) {
        throw new Error("본인은 내보낼 수 없습니다.");
      }

      const res = await fetch(`/api/moim/${id}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "내보내기 실패");
      }

      return res.json();
    },
    onSuccess: () => {
      alert("멤버를 내보냈습니다.");
      queryClient.invalidateQueries({ queryKey: ["moimDetail", id] });
    },
    onError: (error: Error) => {
      alert(error.message || "멤버 내보내기 중 오류가 발생했습니다.");
    },
  });

  const leaveMoimMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/moim/${id}/members/me`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("탈퇴 실패");
      return res.json();
    },
    onSuccess: () => {
      alert("모임에서 탈퇴했습니다.");
      queryClient.invalidateQueries({ queryKey: ["moimDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["moims"] });
      queryClient.invalidateQueries({ queryKey: ["myMoims"] });
      router.push("/moim");
    },
    onError: () => {
      alert("탈퇴 중 오류가 발생했습니다.");
    },
  });

  const joinMoimMutation = useMutation({
    mutationFn: async (password?: string) => {
      if (moimDetail?.memberCount === moimDetail?.maxMember)
        throw new Error("최대 인원이 초과되어 가입할 수 없습니다.");

      const payload = password ? { password } : {};

      const res = await fetch(`/api/moim/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) throw new Error("비밀번호가 다릅니다.");
      else if (!res.ok) throw new Error("모임 가입 중 오류가 발생했습니다.");
      return res.json();
    },
    onSuccess: () => {
      alert("모임에 가입했습니다!");
      queryClient.invalidateQueries({ queryKey: ["moimDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["myMoims"] });
    },
    onError: (e: Error) => {
      alert(e.message);
    },
  });

  const deleteMoimMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/moim/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      return res.json();
    },
    onSuccess: () => {
      alert("모임이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["moims"] });
      queryClient.invalidateQueries({ queryKey: ["myMoims"] });
      router.push("/moim");
    },
    onError: () => {
      alert("모임 삭제 중 오류가 발생했습니다.");
    },
  });

  useEffect(() => {
    setVisibleMemberCount(10);
  }, [id]);

  if (isLoading) return <div className="p-10 text-center">불러오는 중...</div>;
  if (!moimDetail)
    return <div className="p-10 text-center">모임을 찾을 수 없습니다.</div>;

  // 프론트엔드에서 세션 기반으로 isLeader 판별
  const currentUserId = session?.user?.id; // Cognito sub (UUID)

  const isJoined: boolean = moimDetail.members?.some(
    (m: any) => m.isMe || (currentUserId && m.id === currentUserId),
  );

  // 백엔드 isMe가 실패하더라도 세션 ID 기반으로 직접 판단
  const isLeader: boolean = moimDetail.members?.some(
    (m: any) =>
      m.role === "LEADER" &&
      (m.isMe || (currentUserId && m.id === currentUserId)),
  );
  const isSoloLeader = isLeader && moimDetail.memberCount === 1;

  const trimmedEditName = editName.trim();
  const trimmedEditDescription = editDescription.trim();
  const parsedEditMaxMember = Number(editMaxMember);
  const isNameInvalid = !trimmedEditName;
  const isDescriptionInvalid = !trimmedEditDescription;
  const isMaxMemberInvalid =
    !editMaxMember.trim() ||
    !Number.isInteger(parsedEditMaxMember) ||
    parsedEditMaxMember < moimDetail.memberCount;
  const isPrivatePasswordInvalid = editIsPrivate && !editPassword.trim();
  const isUpdateDisabled =
    updateSettingsMutation.isPending ||
    isNameInvalid ||
    isDescriptionInvalid ||
    isMaxMemberInvalid ||
    isPrivatePasswordInvalid;
  // 이번 주 streak -> 이번 달 post 수 순서로 정렬
  const sortedMembers = [...(moimDetail.members || [])].sort(
    (a: any, b: any) =>
      (b.weeklyStreak || 0) - (a.weeklyStreak || 0) ||
      (b.monthlyPosts || 0) - (a.monthlyPosts || 0),
  );
  const manageableMembers = sortedMembers.filter(
    (m: any) => !(m.isMe || (currentUserId && m.id === currentUserId)),
  );
  const visibleMembers = sortedMembers.slice(0, visibleMemberCount);
  const hasMoreMembers = sortedMembers.length > visibleMemberCount;
  const debugTemp = (() => {
    const raw = searchParams.get("debugTemp");
    if (!raw) return null;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;

    return Math.max(36.5, Math.min(100, Number(parsed.toFixed(1))));
  })();

  return (
    <div className="flex min-h-full flex-col bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF3E8_52%,#FFF9F2_100%)] pb-20 lg:pb-0">
      {/* 뒤로가기 & 헤더 */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#EADBCB] bg-[#FFF9F2]/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/moim"
            className="-ml-1 rounded-full p-1 text-[#8A6545] transition-colors hover:bg-[#F3E4D4]"
          >
            <CloseIcon />
          </Link>
          <h1 className="line-clamp-1 text-lg font-bold text-[#4E3422]">
            {moimDetail?.name || "로딩 중..."}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* 공유/초대 버튼 */}
          <button
            onClick={async () => {
              const shareUrl = window.location.href;
              const shareData = {
                title: `[Grace Record] ${moimDetail?.name || "구역"} 모임에 합류하세요!`,
                text: `${moimDetail?.description || "같이 은혜 나눠요!"} 🔥\n앱이 없다면 먼저 다운로드하세요:\n• iOS: https://apps.apple.com/kr/app/%EB%82%98%EB%8A%94%EC%98%A4%EB%8A%98%EC%9A%B4%EB%8F%99%ED%95%9C%EB%8B%A4/id6759653594\n• Android: https://play.google.com/store/apps/details?id=com.iworkouttoday.app`,
                url: shareUrl,
              };
              if (navigator.share) {
                try {
                  await navigator.share(shareData);
                } catch {
                  // 사용자가 취소한 경우 등 무시
                }
              } else {
                navigator.clipboard?.writeText(shareUrl);
                alert("초대 링크가 복사되었습니다! 🎉");
              }
            }}
            className="rounded-full bg-[#F7EBDD] p-1.5 text-[#A07652] transition-colors hover:bg-[#EFD9C4] hover:text-[#8D6038]"
            title="초대 링크 공유"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
          </button>

          {/* 미가입 시: 가입하기 버튼 */}
          {!isJoined && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => {
                  if (moimDetail.isPrivate) {
                    const pw = window.prompt(
                      "비공개 모임입니다. 비밀번호를 입력하세요:",
                    );
                    if (pw !== null) joinMoimMutation.mutate(pw);
                  } else {
                    if (window.confirm("이 모임에 가입하시겠습니까?"))
                      joinMoimMutation.mutate(undefined);
                  }
                }, 50);
              }}
              className="rounded-xl bg-[linear-gradient(135deg,#D88B55_0%,#C96C34_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(201,108,52,0.24)] transition-transform hover:-translate-y-[1px]"
              disabled={joinMoimMutation.isPending}
            >
              ✅ 가입하기
            </button>
          )}
          {/* 가입 멤버 (방장/일반 공통): 설정 모달 열기 */}
          {isJoined && (
            <button
              onClick={() => {
                if (isLeader) {
                  setEditName(moimDetail.name || "");
                  setEditDescription(moimDetail.description || "");
                  setEditMaxMember(String(moimDetail.maxMember || 10));
                  setEditIsPrivate(moimDetail.isPrivate || false);
                  setEditPassword(""); // 비밀번호는 초기화해 둠
                  setIsMemberManagementOpen(false);
                }
                setIsSettingModalOpen(true);
              }}
              className="rounded-full bg-[#F7EBDD] p-1.5 text-[#A07652] transition-colors hover:bg-[#EFD9C4] hover:text-[#8D6038]"
              title="모임 설정"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 pb-24 sm:py-6">

        {/* 통합 카드 */}
        <div className="overflow-hidden rounded-2xl border border-[#EDE5DA] bg-white shadow-[0_2px_20px_rgba(160,120,80,0.08)]">

          {/* 상단 accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#F5A96B] via-[#E87848] to-[#D96030]" />

          {/* ── 모임 기본 정보 ── */}
          <div className="px-5 py-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C09060]">
                Grace Crew
              </span>
              {moimDetail.isOfficial && (
                <span className="rounded-full bg-[#3C2718] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Official
                </span>
              )}
              {moimDetail.isPrivate && (
                <span className="text-sm text-[#C8A080]">🔒</span>
              )}
            </div>
            <h2 className="text-[22px] font-extrabold tracking-tight text-[#3A2418]">
              {moimDetail.name}
            </h2>
            {moimDetail.description && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#9A8272]">
                {moimDetail.description}
              </p>
            )}
          </div>

          {/* ── 구분선 ── */}
          <div className="mx-5 border-t border-[#F0EAE2]" />

          {/* ── 열정 온도 ── */}
          <div className="px-5 py-5">
            {(() => {
              const calculatedTemp = Math.max(
                36.5,
                Math.min(100, 36.5 + 0.8 * moimDetail.score),
              );
              const passionTemp = debugTemp ?? calculatedTemp;

              const getStatus = (temp: number) => {
                if (temp <= 36.5) return { label: "🌱 함께 시작하는 은혜", gradient: "from-[#E2C59D] to-[#D8A76D]" };
                if (temp < 40) return { label: "🌱 모임 은혜의 첫걸음", gradient: "from-[#D8C3A3] to-[#E3A85A]" };
                if (temp < 50) return { label: "✨ 모여서 커지는 은혜", gradient: "from-[#E8C067] to-[#E09247]" };
                if (temp < 65) return { label: "✝️ 굳건한 믿음의 공동체", gradient: "from-[#E49454] to-[#DA6B4A]" };
                if (temp < 80) return { label: "⚡ 성령이 충만한 모임", gradient: "from-[#DD7453] to-[#D45158]" };
                if (temp < 90) return { label: "🔥 은혜와 기쁨이 넘치는 곳", gradient: "from-[#D65D4F] to-[#B86A5C]" };
                return { label: "🌋 넘치는 은혜의 기적!", gradient: "from-[#A66B57] via-[#D45C45] to-[#E5B256]" };
              };

              const status = getStatus(passionTemp);
              const percent = passionTemp;

              return (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C09060]">이번 달 은혜 온도</p>
                      <p className="text-[13px] font-medium text-[#7A6858]">{status.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[#B8A898]">은혜 나눔 누적 {moimDetail.score ?? 0}회</p>
                      <p className="text-[22px] font-black tracking-tight text-[#D06530]">
                        {passionTemp.toFixed(1)}°C
                      </p>
                    </div>
                  </div>
                  {/* progress bar */}
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-[#F3EDE5]">
                    {passionTemp > 37.6 && (
                      <div
                        className="absolute bottom-0 top-0 z-10 w-[2px] bg-[#E6C8A6]"
                        style={{ left: `36.5%` }}
                      />
                    )}
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${status.gradient}`}
                      style={{ width: `${Math.max(2, percent)}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-[#C0B4A8]">
                    <span>0°C</span>
                    <span className="absolute left-[calc(36.5%+1rem)] -translate-x-1/2 font-semibold text-[#C09060]">36.5°C</span>
                    <span>100°C</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* ── 구분선 ── */}
          <div className="mx-5 border-t border-[#F0EAE2]" />

          {/* ── 멤버 현황 ── */}
          <div className="px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C09060]">멤버</p>
              <span className="text-[12px] text-[#B8A898]">
                총 {moimDetail.memberCount}{!moimDetail.isOfficial && ` / ${moimDetail.maxMember}`}명
              </span>
            </div>

            {visibleMembers.length === 0 ? (
              <p className="py-4 text-center text-sm text-[#C0B0A0]">아직 멤버가 없어요.</p>
            ) : (
              <div className="divide-y divide-[#F5EFE8]">
                {visibleMembers.map((member: any, index: number) => {
                  const rank = index + 1;
                  const isCurrentUser =
                    member.isMe || (currentUserId && member.id === currentUserId);

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 py-3"
                    >
                      {/* 순위 */}
                      <span className={`w-5 shrink-0 text-center text-[12px] font-bold ${
                        rank === 1 ? "text-[#C09060]" : "text-[#C8BEB4]"
                      }`}>
                        {rank}
                      </span>

                      {/* 아바타 */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3EDE5]">
                        {member.profileImageUrl ? (
                          <img
                            src={member.profileImageUrl}
                            alt="profile"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).parentElement!.innerHTML =
                                `<span class="text-xs font-bold text-[#A08070]">${(member.name || "?")[0].toUpperCase()}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#A08070]">
                            {(member.name || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* 이름 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {member.role === "LEADER" && (
                            <span className="text-[11px] text-[#C09060]">👑</span>
                          )}
                          <span className="truncate text-[13px] font-semibold text-[#3D2B1F]">
                            {member.name}
                          </span>
                          {isCurrentUser && (
                            <span className="rounded bg-[#F5E8D5] px-1.5 py-0.5 text-[10px] font-bold text-[#B07840]">
                              나
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#C0AE9E]">이번 달 {member.monthlyPosts}개</p>
                      </div>

                      {/* streak */}
                      <div className="text-right">
                        <p className="text-[12px] font-bold text-[#D06530]">🔥 {member.weeklyStreak || 0}일</p>
                        <p className="text-[10px] text-[#C0B4A8]">이번 주</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasMoreMembers && (
              <button
                onClick={() => setVisibleMemberCount((prev) => prev + 10)}
                className="mt-3 w-full rounded-xl py-2 text-[13px] font-semibold text-[#B09080] transition-colors hover:bg-[#FAF5F0]"
              >
                더 보기
              </button>
            )}
          </div>

          {/* ── 구분선 ── */}
          <div className="mx-5 border-t border-[#F0EAE2]" />

          {/* ── 이번 달 은혜 나눔 피드 ── */}
          <div className="px-5 py-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[#C09060]">
              이번 달 은혜 나눔 피드
            </p>

            {isFeedLoading && (
              <p className="py-8 text-center text-sm text-[#C0B0A0]">불러오는 중...</p>
            )}

            {!isFeedLoading && (!feedData?.content || feedData.content.length === 0) && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="text-3xl">🙂</span>
                <p className="text-sm text-[#B8A898]">
                  아직 이번 달에 나눈 은혜가 없어요.
                  <br />
                  첫 번째 은혜를 나눠보세요!
                </p>
              </div>
            )}

            <div className="divide-y divide-[#F5EFE8]">
              {feedData?.content?.map((post: PostRes) => (
                <div key={post.id} className="py-5 first:pt-0">
                  <FeedPost post={post} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {isSettingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(34,21,12,0.58)] px-4">
          <div className="scrollbar-hide max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[28px] border border-[#ECDAC7] bg-[linear-gradient(180deg,#FFFDFB_0%,#F6EBDD_100%)] p-6 shadow-[0_24px_60px_rgba(78,48,25,0.2)]">
            <h2 className="mb-4 text-xl font-bold text-[#4F3422]">모임 설정</h2>

            {isLeader && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#6B4D38]">
                    모임 이름
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-xl border bg-white/85 px-4 py-3 font-medium text-[#4F3422] outline-none transition-colors focus:border-theme focus:ring-1 focus:ring-theme ${
                      isNameInvalid ? "border-red-300" : "border-gray-200"
                    }`}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="모임 이름을 입력하세요"
                  />
                  {isNameInvalid && (
                    <p className="text-xs text-red-500 mt-1.5">
                      모임 이름을 입력해주세요.
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#6B4D38]">
                    모임 소개글
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full resize-none rounded-xl border bg-white/85 px-4 py-3 font-medium text-[#4F3422] outline-none transition-colors focus:border-theme focus:ring-1 focus:ring-theme ${
                      isDescriptionInvalid
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="모임 소개글을 입력하세요"
                  />
                  {isDescriptionInvalid && (
                    <p className="text-xs text-red-500 mt-1.5">
                      모임 소개글을 입력해주세요.
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#6B4D38]">
                    최대 인원 제한 (명)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-[#E7D8C7] bg-white/85 px-4 py-3 font-medium text-[#4F3422] outline-none transition-colors focus:border-theme focus:ring-1 focus:ring-theme"
                    value={editMaxMember}
                    onChange={(e) => setEditMaxMember(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-[#A38B77]">
                    현재 모임 인원({moimDetail.memberCount}명)보다 작게 설정할
                    수 없습니다.
                  </p>
                </div>

                <div className="border-t border-[#E9DDCF] pt-2">
                  <div className="mb-3 mt-2 flex items-center justify-between">
                    <label className="text-sm font-bold text-[#6B4D38]">
                      비공개 모임 여부
                    </label>
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsPrivate ? "bg-theme" : "bg-[#D8C5B2]"}`}
                      onClick={() => setEditIsPrivate(!editIsPrivate)}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsPrivate ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  {editIsPrivate && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="mb-1 block text-sm font-bold text-[#6B4D38]">
                        초대 비밀번호
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-xl border border-[#E7D8C7] bg-white/85 px-4 py-3 font-medium text-[#4F3422] outline-none transition-colors focus:border-theme focus:ring-1 focus:ring-theme"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                      />
                      <p className="text-xs text-theme mt-1.5 font-medium">
                        * 비공개 모임은 비밀번호 입력이 필요합니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div
              className={`mb-6 border-t border-[#E9DDCF] pt-2 ${!isLeader && "border-t-0"}`}
            >
              <h3 className="mb-3 mt-4 text-sm font-bold text-red-500">
                위험 구역
              </h3>
              <div className="space-y-2">
                {isLeader && manageableMembers.length > 0 && (
                  <div className="overflow-hidden rounded-xl bg-[#FFF1EE]">
                    <button
                      type="button"
                      onClick={() => setIsMemberManagementOpen((prev) => !prev)}
                      className="w-full flex items-center px-4 py-3 text-left text-red-600 font-bold hover:bg-red-100 transition-colors text-sm rounded-xl"
                    >
                      <span>👥 모임 인원 관리</span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="flex w-4 justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`w-4 h-4 transition-transform ${
                              isMemberManagementOpen ? "rotate-90" : ""
                            }`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    </button>

                    {isMemberManagementOpen && (
                      <div className="max-h-56 space-y-2 overflow-y-auto bg-white/70 px-3 pb-3">
                        {manageableMembers.map((m: any) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-xl border border-red-100 bg-white p-3"
                          >
                            <div className="flex items-center gap-2">
                              {m.profileImageUrl ? (
                                <img
                                  src={m.profileImageUrl}
                                  className="w-8 h-8 rounded-full object-cover"
                                  alt=""
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBD9C7] text-xs font-bold text-[#8B6B55]">
                                  {(m.name || "?")[0].toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm font-medium text-[#5A3C28]">
                                {m.name}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `${m.name}님을 이 모임에서 내보내시겠습니까?`,
                                  )
                                )
                                  kickMemberMutation.mutate(m.id);
                              }}
                              disabled={kickMemberMutation.isPending}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors"
                            >
                              내보내기
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!isSoloLeader && (
                  <button
                    onClick={() => {
                      const msg = isLeader
                        ? "방장 권한을 다음 멤버에게 위임하고 탈퇴하시겠습니까?"
                        : "정말로 모임에서 탈퇴하시겠습니까?";
                      if (window.confirm(msg)) {
                        leaveMoimMutation.mutate();
                      }
                    }}
                    className="w-full flex items-center px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm"
                    disabled={leaveMoimMutation.isPending}
                  >
                    <span>🚪 모임 탈퇴{isLeader ? " (방장 위임)" : ""}</span>
                    <span className="ml-auto flex w-4 justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>
                )}
                {isLeader && !moimDetail.isOfficial && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "정말로 이 모임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
                        )
                      ) {
                        deleteMoimMutation.mutate();
                      }
                    }}
                    className="w-full flex items-center px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm"
                    disabled={deleteMoimMutation.isPending}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>❌ 모임 삭제</span>
                    </span>
                    <span className="ml-auto flex w-4 justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-[#EFE0CF] py-3.5 font-bold text-[#836550] transition-colors hover:bg-[#E7D3BF]"
                onClick={() => setIsSettingModalOpen(false)}
              >
                닫기
              </button>
              {isLeader && (
                <button
                  className="flex-1 py-3.5 bg-theme text-white font-bold rounded-xl shadow-md shadow-theme/30 disabled:opacity-50"
                  onClick={() =>
                    updateSettingsMutation.mutate({
                      name: trimmedEditName,
                      description: trimmedEditDescription,
                      maxMember: parsedEditMaxMember,
                      isPrivate: editIsPrivate,
                      ...(editPassword && { password: editPassword }),
                    })
                  }
                  disabled={isUpdateDisabled}
                >
                  {updateSettingsMutation.isPending ? "저장 중..." : "저장"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
