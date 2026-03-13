"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

  if (isLoading) return <div className="p-10 text-center">불러오는 중...</div>;
  if (!detail) return <div className="p-10 text-center">모임을 찾을 수 없습니다.</div>;

  // 프론트엔드에서 세션 기반으로 isLeader 판별
  const currentUserId = session?.user?.id; // Cognito sub (UUID)

  // 백엔드 isMe가 실패하더라도 세션 ID 기반으로 직접 판단
  const isLeader = detail.members?.some((m: any) =>
    (m.role === "LEADER") && (m.isMe || (currentUserId && m.id === currentUserId))
  );

  const progressPercentage = Math.min(
    100,
    detail.groupGoalTarget > 0 ? (detail.groupGoalCurrent / detail.groupGoalTarget) * 100 : 0
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
        {isLeader && (
          <button 
            onClick={() => {
              setEditTarget(detail.groupGoalTarget || 100);
              setEditPokeDays(detail.pokeDays || 5);
              setIsSettingModalOpen(true);
            }}
            className="text-sm font-semibold text-white bg-theme px-4 py-1.5 rounded-lg shadow-sm shadow-theme/30 hover:bg-theme/90 transition-colors"
          >
            ⚙️ 설정
          </button>
        )}
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
             <div className="flex items-center gap-1.5"><span className="text-lg">👥</span> {detail.memberCount} / {detail.maxMember}명</div>
          </div>
        </section>

        {/* 킬러 피처 1: 모임 공동 게이지 */}
        <section className="bg-white p-5 sm:rounded-2xl shadow-sm border-y sm:border border-gray-100">
          <div className="flex items-start justify-between mb-4">
             <div>
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 🎯 공동 목표 달성
               </h3>
               <p className="text-sm text-gray-500 mt-1">이번 달 모임원 총합 게시글 {detail.groupGoalTarget}개 작성 달성하기!</p>
             </div>
             <div className="bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full">
               D-{detail.deadlineDaysLeft}
             </div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-5 mb-2 relative overflow-hidden">
             <div 
               className="bg-theme h-5 rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
               style={{ width: `${progressPercentage}%` }}
             >
                {progressPercentage > 10 && <span className="text-[10px] text-white font-bold">{Math.round(progressPercentage)}%</span>}
             </div>
          </div>
          
          <div className="flex justify-between text-sm font-semibold text-gray-700">
             <span>현재 {detail.groupGoalCurrent}개</span>
             <span>목표 {detail.groupGoalTarget}개</span>
          </div>
        </section>

        {/* 킬러 피처 2: 멤버 현황 & 넛지 시스템 */}
        <section className="bg-white p-5 sm:rounded-2xl shadow-sm border-y sm:border border-gray-100">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              📋 멤버 현황
            </h3>
            <p className="text-sm text-gray-500 mt-1">최근 {detail.pokeDays || 5}일 이상 인증 게시글이 없는 멤버를 찔러보세요!</p>
          </div>

          <div className="space-y-3">
            {detail.members.map((member: any) => {
              const needsNudge = member.lastActiveDaysAgo >= (detail.pokeDays || 5);
              const isNudged = nudgedMembers.has(member.id);

              return (
                <div key={member.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center text-lg">
                      {member.isMe ? "😎" : "👤"}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                        {member.role === "LEADER" && <span title="방장">👑</span>}
                        {member.name}
                        {member.isMe && <span className="bg-theme text-white text-[10px] px-1.5 py-0.5 rounded-md ml-0.5">ME</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        이번 달 게시글 <span className="text-theme font-bold">{member.monthlyPosts}개</span> 작성!
                        {member.lastActiveDaysAgo > 0 && <span className="text-gray-400">({member.lastActiveDaysAgo}일 전)</span>}
                      </div>
                    </div>
                  </div>

                  {needsNudge && !member.isMe && (
                    <button
                      onClick={() => handleNudge(member.id)}
                      disabled={isNudged}
                      className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                        isNudged 
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                      }`}
                    >
                      {isNudged ? "콕 찌름 완료!" : "🔥 찌르기"}
                    </button>
                  )}
                  {(!needsNudge || member.isMe) && (
                    <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                      👍 훌륭해요
                    </div>
                  )}
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
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">모임 설정</h2>
            
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

            <div className="flex gap-2">
              <button 
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                onClick={() => setIsSettingModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="flex-1 py-3.5 bg-theme text-white font-bold rounded-xl shadow-md shadow-theme/30 disabled:opacity-50"
                onClick={() => updateSettingsMutation.mutate({ targetAmount: editTarget, pokeDays: editPokeDays })}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
