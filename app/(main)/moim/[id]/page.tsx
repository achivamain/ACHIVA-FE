"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type Category } from "@/types/Categories";
import { CloseIcon } from "@/components/Icons";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FeedPost from "@/features/feed/FeedPost";
import type { PostRes } from "@/types/Post";

// 카테고리별 임시 이모지 매핑
const CATEGORY_ICONS: Record<string, string> = {
  "헬스": "💪", "맨몸운동": "🤸", "크로스핏": "🏋️",
  "러닝": "🏃", "걷기": "🚶", "사이클": "🚲",
  "축구": "⚽", "농구": "🏀", "야구": "⚾",
  "수영": "🏊", "등산": "🧗", "요가": "🧘",
};

const getCategoryIcon = (cat: string) => CATEGORY_ICONS[cat] || "🎯";

export default function MoimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [nudgedMembers, setNudgedMembers] = useState<Set<string>>(new Set());
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(100);
  const [editPokeDays, setEditPokeDays] = useState(5);

  const { data: detail, isLoading } = useQuery({
    queryKey: ["moimDetail", id],
    queryFn: async () => {
      const res = await fetch(`/api/moim/${id}`);
      if (!res.ok) throw new Error("Failed to fetch moim detail");
      return (await res.json()).data;
    },
  });

  const handleNudge = (memberId: string) => {
    setNudgedMembers(prev => {
      const newSet = new Set(prev);
      newSet.add(memberId);
      return newSet;
    });
    // 실제로는 여기에 푸시 알림 API 호출이 들어감
  };

  const { data: feedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ["moimFeed", id],
    queryFn: async () => {
      const res = await fetch(`/api/moim/${id}/feed`);
      if (!res.ok) throw new Error("Failed to fetch moim feed");
      return (await res.json()).data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: { targetAmount: number; pokeDays: number }) => {
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
    }
  });

  const leaveMoimMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/moim/${id}/members/me`, { method: "DELETE" });
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
    }
  });

  const joinMoimMutation = useMutation({
    mutationFn: async (password?: string) => {
      const res = await fetch(`/api/moim/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: password ? JSON.stringify(password) : undefined,
      });
      if (!res.ok) throw new Error("가입 실패");
      return res.json();
    },
    onSuccess: () => {
      alert("모임에 가입했습니다!");
      queryClient.invalidateQueries({ queryKey: ["moimDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["myMoims"] });
    },
    onError: () => {
      alert("가입 중 오류가 발생했습니다.");
    }
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
    }
  });


  if (isLoading) return <div className="p-10 text-center">불러오는 중...</div>;
  if (!detail) return <div className="p-10 text-center">모임을 찾을 수 없습니다.</div>;

  // 프론트엔드에서 세션 기반으로 isLeader 판별
  const currentUserId = session?.user?.id; // Cognito sub (UUID)

  const isJoined = detail.members?.some((m: any) =>
    (m.isMe || (currentUserId && m.id === currentUserId))
  );

  // 백엔드 isMe가 실패하더라도 세션 ID 기반으로 직접 판단
  const isLeader = detail.members?.some((m: any) =>
    (m.role === "LEADER") && (m.isMe || (currentUserId && m.id === currentUserId))
  );

  const achieverCount = detail.members?.filter((m: any) => m.weeklyStreak >= 3).length || 0;
  const progressPercentage = Math.min(
    100,
    detail.memberCount > 0 ? (achieverCount / detail.memberCount) * 100 : 0
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20 lg:pb-0">
      {/* 뒤로가기 & 헤더 */}
      <header className="sticky top-0 bg-white z-20 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/moim" className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon />
          </Link>
          <h1 className="text-lg font-bold text-gray-800 line-clamp-1">{detail?.name || '로딩 중...'}</h1>
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
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </button>

          {/* 미가입 시: 가입하기 버튼 */}
          {!isJoined && (
            <button
              onClick={() => {
                if (detail.isPrivate) {
                  const pw = window.prompt("비공개 모임입니다. 비밀번호를 입력하세요:");
                  if (pw !== null) joinMoimMutation.mutate(pw);
                } else {
                  if (window.confirm("이 모임에 가입하시겠습니까?")) joinMoimMutation.mutate(undefined);
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
                  setEditTarget(detail.groupGoalTarget || 100);
                  setEditPokeDays(detail.pokeDays || 5);
                }
                setIsSettingModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-theme hover:bg-theme/5 rounded-full transition-colors"
              title="모임 설정"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto xl:max-w-4xl 2xl:max-w-5xl px-0 sm:px-4 py-0 sm:py-6 space-y-2 sm:space-y-6">
        
        {/* 모임 기본 정보 카드 */}
        <section className="bg-white p-5 sm:rounded-2xl shadow-sm border-y sm:border border-gray-100">
          <div className="flex gap-2 flex-wrap mb-3">
             {detail.categories.map((cat: string) => (
                <span key={cat} className="flex items-center gap-1 text-xs bg-theme/10 text-theme px-2.5 py-1 rounded-full font-bold">
                  <span>{getCategoryIcon(cat)}</span> {cat}
                </span>
             ))}
             {detail.isOfficial && (
                <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full font-bold">OFFICIAL</span>
             )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{detail.name}</h2>
          <p className="text-gray-600 mb-4">{detail.description}</p>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
             <div className="flex items-center gap-1.5">
               <span className="text-lg">👥</span> 
               {detail.memberCount}{!detail.isOfficial && ` / ${detail.maxMember}`}명
             </div>
          </div>
        </section>

        {/* 킬러 피처 1: 주간 활동 비교 (주석 처리하여 임시 숨김) */}
        {/*
        <section className="bg-white p-5 sm:rounded-2xl shadow-sm border-y sm:border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-theme/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-start justify-between mb-2">
             <div className="z-10 relative">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 🔥 주간 활동 리포트
               </h3>
               <p className="text-sm text-gray-600 mt-2 font-medium">
                 이번 주는 저번 주 이 시간보다 <span className="text-theme font-bold text-base bg-theme/10 px-1.5 py-0.5 rounded mx-0.5">{feedData?.content?.length || 0}번</span> 더 운동했어요!
               </p>
               <p className="text-xs text-gray-400 mt-1">저번 주 대비 상승세를 타볼까요?</p>
             </div>
             <div className="bg-orange-50 text-theme text-xs font-bold px-3 py-1.5 rounded-full z-10 shrink-0">
               활동 비교
             </div>
          </div>
        </section>
        */}

        {/* 킬러 피처 2: 멤버 현황 & 넛지 시스템 */}
        <section className="bg-white p-5 sm:rounded-2xl shadow-sm border-y sm:border border-gray-100">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              📋 멤버 현황
            </h3>
            <p className="text-sm text-gray-500 mt-1">최근 {detail.pokeDays || 5}일 이상 인증 게시글이 없는 멤버를 찔러보세요!</p>
          </div>

          <div className="space-y-3">
            {[...(detail.members || [])]
              .sort((a: any, b: any) => (b.monthlyPosts || 0) - (a.monthlyPosts || 0))
              .map((member: any, index: number) => {
              const needsNudge = member.lastActiveDaysAgo >= (detail.pokeDays || 5);
              const isNudged = nudgedMembers.has(member.id);
              const rank = index + 1;

              return (
                <div key={member.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl relative overflow-hidden shadow-sm border border-gray-100 hover:border-theme/30 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* 랭킹 뱃지 */}
                    <div className="w-6 sm:w-8 flex justify-center shrink-0">
                      {rank === 1 ? <span className="text-xl sm:text-2xl" title="1위">🥇</span> : 
                       rank === 2 ? <span className="text-xl sm:text-2xl" title="2위">🥈</span> : 
                       rank === 3 ? <span className="text-xl sm:text-2xl" title="3위">🥉</span> : 
                       <span className="text-sm sm:text-base font-black italic text-gray-400">{rank}</span>}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-lg z-10 shrink-0 overflow-hidden">
                      {member.profileImageUrl ? (
                        <img src={member.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        member.isMe ? "😎" : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                          </svg>
                        )
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                        {member.role === "LEADER" && <span title="방장">👑</span>}
                        {member.name}
                        {member.isMe && <span className="bg-theme text-white text-[10px] px-1.5 py-0.5 rounded-md ml-0.5">ME</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex gap-1 flex-wrap items-center">
                        이번 달 <span className="text-gray-700 font-medium">{member.monthlyPosts}개</span>
                        {member.lastActiveDaysAgo > 0 && <span className="text-gray-400 ml-1 opacity-80">({member.lastActiveDaysAgo}일 전)</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs flex flex-col items-end justify-center">
                      <span className="text-gray-400 font-medium text-[10px] sm:text-xs">이번 주 스트릭</span>
                      <span className="text-theme font-bold text-sm flex items-center mt-0.5">🔥 {member.weeklyStreak || 0}일</span>
                    </div>

                    {needsNudge && !member.isMe && (
                      <button
                        onClick={() => handleNudge(member.id)}
                        disabled={isNudged}
                        className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shrink-0 ${
                          isNudged 
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                        }`}
                      >
                        {isNudged ? "완료" : "찌르기"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 하단: 모임 전용 피드 */}
        <section className="bg-white p-5 sm:rounded-2xl shadow-sm border-y sm:border border-gray-100 min-h-[300px]">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📸 이번 달 모임 인증 피드
            </h3>
            
            {isFeedLoading && <div className="text-center py-10 text-gray-500">피드를 불러오는 중...</div>}
            
            {!isFeedLoading && (!feedData?.content || feedData.content.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">😶</div>
                <p className="text-gray-500 text-sm">
                  아직 이번 달 인증글이 없습니다.<br/>
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">월 공동 목표 개수</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-theme focus:ring-1 focus:ring-theme transition-colors font-medium text-gray-900"
                    value={editTarget}
                    onChange={(e) => setEditTarget(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">찌르기 기준 (미활동 일수)</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-theme focus:ring-1 focus:ring-theme transition-colors font-medium text-gray-900"
                    value={editPokeDays}
                    onChange={(e) => setEditPokeDays(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
            )}

            <div className={`pt-2 border-t border-gray-100 mb-6 ${!isLeader && 'border-t-0'}`}>
              <h3 className="text-sm font-bold text-red-500 mb-3 mt-4">위험 구역</h3>
              <div className="space-y-2">
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                </button>
                {isLeader && !detail.isOfficial && (
                  <button
                    onClick={() => {
                      if (window.confirm("정말로 이 모임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                        deleteMoimMutation.mutate();
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm"
                    disabled={deleteMoimMutation.isPending}
                  >
                    <span>🗑 모임 삭제</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
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
                  onClick={() => updateSettingsMutation.mutate({ targetAmount: editTarget, pokeDays: editPokeDays })}
                  disabled={updateSettingsMutation.isPending}
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
