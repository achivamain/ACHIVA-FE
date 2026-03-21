"use client";

import { useEffect, useState } from "react";

type TickerActivity = {
  id: string;
  memberNickName: string;
  weeklyCount: number;
};

const DUMMY_ACTIVITIES: TickerActivity[] = [
  { id: "1", memberNickName: "운동하는사자", weeklyCount: 3 },
  { id: "2", memberNickName: "근육요정", weeklyCount: 5 },
  { id: "3", memberNickName: "러닝머신", weeklyCount: 4 },
  { id: "4", memberNickName: "득근파워", weeklyCount: 2 },
  { id: "5", memberNickName: "요가파이어", weeklyCount: 6 },
];

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState<TickerActivity[]>(DUMMY_ACTIVITIES);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadFeed() {
      try {
        const response = await fetch("/api/feed?pageParam=0", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (response.ok) {
          const json = await response.json();
          const data = json.data ?? json;
          const posts = data.content ?? [];
          if (posts.length > 0) {
            const processed = posts.slice(0, 5).map((post: any, i: number) => {
              // 실제 데이터나 데모 목적으로 주간 횟수를 가상으로 생성합니다.
              // (추후 백엔드에서 실질적인 주간 누적 횟수를 제공하면 해당 필드로 대체합니다.)
              const fakeWeeklyCount = post.authorCategorySeq ? (post.authorCategorySeq % 4) + 2 : (i % 3) + 2;
              return { ...post, weeklyCount: fakeWeeklyCount };
            });
            setActivities(processed);
          }
        }
      } catch (error) {
        console.error("Failed to load live activity", error);
      }
    }
    // 실제 API 연동 전에 더미데이터를 우선 보여주기 위해 주석 처리하거나, 
    // API 호출 후 실패하거나 0개일 때 DUMMY를 유지하도록 합니다.
    loadFeed();
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 3500); // 3.5초마다 위로 롤링
    return () => clearInterval(interval);
  }, [activities.length]);

  if (activities.length === 0) return null;

  return (
    <div className="mx-5 mb-2 overflow-hidden rounded-[16px] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ring-1 ring-[#F0EBE3] flex items-center gap-2.5">
      <span className="text-[15px] animate-pulse">🔥</span>
      <div className="flex-1 relative h-[20px] overflow-hidden">
        {activities.map((act, index) => {
          // 상태 및 위치 계산
          const offsetIndex = index - currentIndex;
          // 배열의 끝에서 처음으로 자연스럽게 넘어가게 하기 위한 약간의 트릭
          let transformY = offsetIndex * 100;
          let opacity = index === currentIndex ? 1 : 0;
          
          if (offsetIndex < 0) {
            transformY = (activities.length + offsetIndex) * 100;
          }
          
          return (
            <div
              key={act.id}
              className="absolute left-0 w-full flex items-center gap-1.5 transition-all duration-500 ease-in-out"
              style={{
                transform: `translateY(${transformY}%)`,
                opacity: opacity,
              }}
            >
              <span className="truncate text-[13px] font-medium text-[#4B5563]">
                <strong className="font-bold text-[#D96B2B]">{act.memberNickName}</strong>
                님이 <strong className="font-bold text-[#1A1A1A]">주 {act.weeklyCount}회 운동</strong>을 달성했어요! 🎉
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
