"use client";

import React from "react";
import HeartButton from "@/components/HeartButton";
import { useClickGoal } from "@/hooks/useGoals";
import type { Goal } from "@/types/Goal";

interface GoalCardProps {
  type: "vision" | "mission" | "mindset";
  title: string;
  emoji: string;
  data: Goal[];
  variant?: "web" | "mobile";
}

// 타입별 빈 상태 메시지
const emptyMessages: Record<GoalCardProps["type"], string> = {
  vision: "아직 꿈이 설정되지 않았습니다",
  mission: "아직 미션이 설정되지 않았습니다",
  mindset: "아직 마음가짐이 설정되지 않았습니다",
};

const GoalCard: React.FC<GoalCardProps> = ({
  type,
  title,
  emoji,
  data,
  variant = "web",
}) => {
  const clickGoal = useClickGoal();
  const isMobile = variant === "mobile";

  // 보관되지 않은 항목만 표시
  const activeData = data.filter((item) => !item.isArchived);
  const isEmpty = activeData.length === 0;

  const handleHeartClick = (goalId: string) => {
    clickGoal.mutate(goalId);
  };

  // 스타일 분기 (min-h는 항목 1개 기준)
  const cardStyle = isMobile
    ? "bg-white px-6 py-6 rounded-[8.75px] w-full min-h-[133px]"
    : "bg-white p-6 rounded-[10px] border-[2.19px] border-[#E4E4E4] min-h-[134px]";

  const titleStyle = isMobile
    ? "text-[20px] font-bold leading-6 mb-4 text-black"
    : "text-xl font-bold mb-4 text-black";

  const emojiStyle = isMobile
    ? "w-9 h-9 text-[32px] flex items-center"
    : "w-9 h-9 text-[36px] flex items-center justify-center overflow-hidden";

  const listEmojiStyle = "w-9 h-9 text-[36px] flex items-center justify-center overflow-hidden";

  // 빈 상태 렌더링
  if (isEmpty) {
    return (
      <div className={cardStyle}>
        <h2 className={titleStyle}>{title}</h2>
        <div className="flex items-center justify-center py-[10.3px]">
          <p className="text-[#808080] text-[15px]">{emptyMessages[type]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardStyle}>
      <h2 className={titleStyle}>{title}</h2>
      {type === "vision" ? (
        // Vision은 단일 항목
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className={emojiStyle}>{emoji}</span>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-[18px] leading-[21px] text-black">
                {activeData[0].text}
              </p>
              <p className="text-[15px] leading-[18px] text-[#808080]">
                {activeData[0].clickCount.toLocaleString()}번째, 나를 위한 응원
              </p>
            </div>
          </div>
          <HeartButton onClick={() => handleHeartClick(activeData[0].id)} />
        </div>
      ) : (
        // Mission과 Mindset은 리스트
        <ul className="space-y-6">
          {activeData.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className={isMobile ? emojiStyle : listEmojiStyle}>
                  {emoji}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-[18px] leading-[21px] text-black">
                    {item.text}
                  </p>
                  <p className="text-[15px] leading-[18px] text-[#808080]">
                    {item.clickCount.toLocaleString()}번째, 나를 위한 응원
                  </p>
                </div>
              </div>
              <HeartButton onClick={() => handleHeartClick(item.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoalCard;
