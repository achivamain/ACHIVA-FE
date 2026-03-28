"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CloseIcon } from "@/components/Icons";
import type { Moim } from "@/types/moim";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FeedPost from "@/features/feed/FeedPost";
import type { PostRes } from "@/types/Post";

// 카테고리별 임시 이모지 매핑
const CATEGORY_ICONS: Record<string, string> = {
  헬스: "💪",
  맨몸운동: "🤸",
  크로스핏: "🏋️",
  러닝: "🏃",
  걷기: "🚶",
  사이클: "🚲",
  축구: "⚽",
  농구: "🏀",
  야구: "⚾",
  수영: "🏊",
  등산: "🧗",
  요가: "🧘",
};

const getCategoryIcon = (cat: string) => CATEGORY_ICONS[cat] || "🎯";

export default function MoimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
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

      const res = await fetch(`/api/moim/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: password ? JSON.stringify(password) : undefined,
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

  // 이거 하드코딩된 거 같은데 나중에 체크 필요
  const achieverCount: number =
    moimDetail.members?.filter((m: any) => m.weeklyStreak >= 3).length || 0;
  const progressPercentage = Math.min(
    100,
    moimDetail.memberCount > 0
      ? (achieverCount / moimDetail.memberCount) * 100
      : 0,
  );
  const parsedEditMaxMember = Number(editMaxMember);
  const isMaxMemberInvalid =
    !editMaxMember.trim() ||
    !Number.isInteger(parsedEditMaxMember) ||
    parsedEditMaxMember < moimDetail.memberCount;
  const isPrivatePasswordInvalid = editIsPrivate && !editPassword.trim();
  const isUpdateDisabled =
    updateSettingsMutation.isPending ||
    isMaxMemberInvalid ||
    isPrivatePasswordInvalid;
  // 이번 주 streak -> 이번 달 post 수 순서로 정렬
  const sortedMembers = [...(moimDetail.members || [])].sort(
    (a: any, b: any) =>
      (b.weeklyStreak || 0) - (a.weeklyStreak || 0) ||
      (b.monthlyPosts || 0) - (a.monthlyPosts || 0),
  );
  const visibleMembers = sortedMembers.slice(0, visibleMemberCount);
  const hasMoreMembers = sortedMembers.length > visibleMemberCount;

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20 lg:pb-0">
      {/* 뒤로가기 & 헤더 */}
      <header className="sticky top-0 bg-white z-20 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/moim"
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon />
          </Link>
          <h1 className="text-lg font-bold text-gray-800 line-clamp-1">
            {moimDetail?.name || "로딩 중..."}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* 공유/초대 버튼 */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("크루 초대 링크가 복사되었습니다! 🎉");
              }
            }}
            className="p-1.5 text-gray-400 hover:text-theme hover:bg-theme/5 rounded-full transition-colors"
            title="초대 링크 복사"
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
              onClick={() => {
                if (moimDetail.isPrivate) {
                  const pw = window.prompt(
                    "비공개 모임입니다. 비밀번호를 입력하세요:",
                  );
                  if (pw !== null) joinMoimMutation.mutate(pw);
                } else {
                  if (window.confirm("이 모임에 가입하시겠습니까?"))
                    joinMoimMutation.mutate(undefined);
                }
              }}
              className="text-sm font-semibold text-white bg-theme px-4 py-1.5 rounded-lg shadow-sm hover:bg-theme/90 transition-colors"
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
                  setEditMaxMember(String(moimDetail.maxMember || 10));
                  setEditIsPrivate(moimDetail.isPrivate || false);
                  setEditPassword(""); // 비밀번호는 초기화해 둠
                }
                setIsSettingModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-theme hover:bg-theme/5 rounded-full transition-colors"
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

      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto xl:max-w-4xl 2xl:max-w-5xl px-0 sm:px-4 py-0 sm:py-6 space-y-2 sm:space-y-6">
        {/* 모임 기본 정보 카드 */}
        <section className="bg-white p-6 sm:rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] border-y sm:border border-gray-100 flex flex-col justify-center">
          <div className="flex gap-2 flex-wrap mb-3">
            {moimDetail.categories.map((cat: string) => (
              <span
                key={cat}
                className="flex items-center gap-1 text-xs bg-theme/10 text-theme px-3 py-1.5 rounded-full font-bold"
              >
                <span>{getCategoryIcon(cat)}</span> {cat}
              </span>
            ))}
            {moimDetail.isOfficial && (
              <span className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-bold shadow-sm">
                OFFICIAL
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {moimDetail.name}
          </h2>
          <p className="text-gray-600 font-medium leading-relaxed">
            {moimDetail.description}
          </p>
        </section>

        {/* 킬러 피처: 모임 열정 온도 */}
        <section className="bg-white p-5 sm:rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] border-y sm:border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5 mb-2">
            🔥 우리 모임 열정 온도
          </h3>
          {(() => {
            const passionTemp = Math.max(
              36.5,
              Math.min(100, 36.5 + 0.8 * moimDetail.score),
            );

            // 모임 특화 상태 매핑
            const getStatus = (temp: number) => {
              if (temp < 40)
                return {
                  label: "🌱 작은 불씨 지피기",
                  gradient: "from-gray-300 to-gray-400",
                  bg: "bg-gray-50",
                  text: "text-gray-600",
                };
              if (temp < 50)
                return {
                  label: "✨ 온기가 도는 우리 모임",
                  gradient: "from-yellow-300 to-orange-400",
                  bg: "bg-orange-50",
                  text: "text-orange-600",
                };
              if (temp < 65)
                return {
                  label: "🤝 함께 뛰는 즐거움",
                  gradient: "from-orange-400 to-red-400",
                  bg: "bg-red-50",
                  text: "text-red-500",
                };
              if (temp < 80)
                return {
                  label: "⚡ 뜨거운 시너지 폭발!",
                  gradient: "from-red-400 to-rose-500",
                  bg: "bg-rose-50",
                  text: "text-rose-600",
                };
              if (temp < 90)
                return {
                  label: "🔥 멈추지 않는 열정 크루",
                  gradient: "from-rose-500 to-purple-500",
                  bg: "bg-purple-50",
                  text: "text-purple-600",
                };
              return {
                label: "🌋 완벽한 팀워크, 기적의 모임!",
                gradient: "from-purple-500 via-red-500 to-yellow-500",
                bg: "bg-gradient-to-r from-purple-50 to-red-50",
                text: "text-red-600",
              };
            };

            const statusInfo = getStatus(passionTemp);

            // 온도 바 표시는 0도 ~ 100도 구간을 0~100%로 매핑
            const percent = passionTemp;

            return (
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-end justify-between px-1 mb-1">
                  <div
                    className={`text-sm font-bold px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.text} shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-white/50`}
                  >
                    {statusInfo.label}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 mr-1.5 font-medium">
                      누적 인증 {moimDetail.score ?? 0}회
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      {passionTemp.toFixed(1)}°C
                    </span>
                  </div>
                </div>

                {/* 온도바 (Progress Bar) */}
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  {/* 기본 체온 36.5도 마커 */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-300 z-10 shadow-sm"
                    style={{ left: `36.5%` }}
                    title="기본 체온 (36.5°C)"
                  />
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${statusInfo.gradient}`}
                    style={{ width: `${Math.max(2, percent)}%` }} // 최소 2%는 보여서 둥근 모서리 유지
                  />
                </div>

                <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-medium px-2 mt-0.5 relative">
                  <span>0°C</span>
                  <span className="absolute left-[36.5%] -translate-x-1/2 text-theme font-bold">
                    36.5°C
                  </span>
                  <span>100°C</span>
                </div>
              </div>
            );
          })()}
        </section>

        {/* 멤버 현황 */}
        <section className="bg-white p-6 sm:rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] border-y sm:border border-gray-100">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              📋 멤버 현황
            </h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              총 {moimDetail.memberCount}
              {!moimDetail.isOfficial && ` / ${moimDetail.maxMember}`}명
            </span>
          </div>
          <div className="space-y-3">
            {visibleMembers.map((member: any, index: number) => {
              const rank = index + 1;
              const isCurrentUser =
                member.isMe || (currentUserId && member.id === currentUserId);

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl relative overflow-hidden shadow-sm border border-gray-100 hover:border-theme/30 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* 랭킹 뱃지 */}
                    <div className="w-6 sm:w-8 flex justify-center shrink-0">
                      {rank === 1 ? (
                        <span className="text-xl sm:text-2xl" title="1위">
                          🥇
                        </span>
                      ) : rank === 2 ? (
                        <span className="text-xl sm:text-2xl" title="2위">
                          🥈
                        </span>
                      ) : rank === 3 ? (
                        <span className="text-xl sm:text-2xl" title="3위">
                          🥉
                        </span>
                      ) : (
                        <span className="text-sm sm:text-base font-black italic text-gray-400">
                          {rank}
                        </span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-lg z-10 shrink-0 overflow-hidden">
                      {member.profileImageUrl ? (
                        <img
                          src={member.profileImageUrl}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : isCurrentUser ? (
                        "😎"
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-gray-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                        {member.role === "LEADER" && (
                          <span title="방장">👑</span>
                        )}
                        {member.name}
                        {isCurrentUser && (
                          <span className="bg-theme text-white text-[10px] px-1.5 py-0.5 rounded-md ml-0.5">
                            ME
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex gap-1 flex-wrap items-center">
                        이번 달{" "}
                        <span className="text-gray-700 font-medium">
                          {member.monthlyPosts}개
                        </span>
                        {member.lastActiveDaysAgo > 0 && (
                          <span className="text-gray-400 ml-1 opacity-80">
                            ({member.lastActiveDaysAgo}일 전)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs flex flex-col items-end justify-center">
                      <span className="text-gray-400 font-medium text-[10px] sm:text-xs">
                        이번 주 스트릭
                      </span>
                      <span className="text-theme font-bold text-sm flex items-center mt-0.5">
                        🔥 {member.weeklyStreak || 0}일
                      </span>
                    </div>

                    {isLeader && !isCurrentUser && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `${member.name}님을 이 모임에서 내보내시겠습니까?`,
                            )
                          ) {
                            kickMemberMutation.mutate(member.id);
                          }
                        }}
                        disabled={kickMemberMutation.isPending}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center shrink-0 bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 ml-1"
                      >
                        내보내기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {hasMoreMembers && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setVisibleMemberCount((prev) => prev + 10)}
                className="text-sm font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                더 보기
              </button>
            </div>
          )}
        </section>

        {/* 하단: 모임 전용 피드 */}
        <section className="bg-white p-6 sm:rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] border-y sm:border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            📸 이번 달 모임 인증 피드
          </h3>

          {isFeedLoading && (
            <div className="text-center py-10 text-gray-500">
              피드를 불러오는 중...
            </div>
          )}

          {!isFeedLoading &&
            (!feedData?.content || feedData.content.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">😶</div>
                <p className="text-gray-500 text-sm">
                  아직 이번 달 인증글이 없습니다.
                  <br />
                  모임원들의 첫 번째 오운완을 기다려보세요!
                </p>
              </div>
            )}

          <div className="divide-y divide-gray-100">
            {feedData?.content?.map((post: PostRes) => (
              <div key={post.id} className="py-6 first:pt-0">
                <FeedPost post={post} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {isSettingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-xl font-bold text-gray-900 mb-4">모임 설정</h2>

            {isLeader && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    모임 이름
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-theme focus:ring-1 focus:ring-theme transition-colors font-medium text-gray-900"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="모임 이름을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    최대 인원 제한 (명)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-theme focus:ring-1 focus:ring-theme transition-colors font-medium text-gray-900"
                    value={editMaxMember}
                    onChange={(e) => setEditMaxMember(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    현재 모임 인원({moimDetail.memberCount}명)보다 작게 설정할
                    수 없습니다.
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3 mt-2">
                    <label className="text-sm font-bold text-gray-700">
                      비공개 모임 여부
                    </label>
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsPrivate ? "bg-theme" : "bg-gray-300"}`}
                      onClick={() => setEditIsPrivate(!editIsPrivate)}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsPrivate ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  {editIsPrivate && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        초대 비밀번호
                      </label>
                      <input
                        type="password"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-theme focus:ring-1 focus:ring-theme transition-colors font-medium text-gray-900"
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
              className={`pt-2 border-t border-gray-100 mb-6 ${!isLeader && "border-t-0"}`}
            >
              <h3 className="text-sm font-bold text-red-500 mb-3 mt-4">
                위험 구역
              </h3>
              <div className="space-y-2">
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
                    className="w-full flex items-center justify-between px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm"
                    disabled={leaveMoimMutation.isPending}
                  >
                    <span>🚪 모임 탈퇴{isLeader ? " (방장 위임)" : ""}</span>
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
                    className="w-full flex items-center justify-between px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm"
                    disabled={deleteMoimMutation.isPending}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>❌ 모임 삭제</span>
                    </span>
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
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                onClick={() => setIsSettingModalOpen(false)}
              >
                닫기
              </button>
              {isLeader && (
                <button
                  className="flex-1 py-3.5 bg-theme text-white font-bold rounded-xl shadow-md shadow-theme/30 disabled:opacity-50"
                  onClick={() =>
                    updateSettingsMutation.mutate({
                      name: editName,
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
