"use client";

import React from "react";
import HeartButton from "@/components/HeartButton";
import useGoalStore from "@/store/GoalStore";

type GoalType = "vision" | "mission" | "mindset";

interface GoalCardProps {
  type: GoalType;
  title: string;
  emoji: string;
}

const GoalCard: React.FC<GoalCardProps> = ({ type, title, emoji }) => {
  const { vision, missions, mindsets, handleHeartClick } = useGoalStore();

  // 타입에 따라 데이터 가져오기
  const getData = () => {
    switch (type) {
      case "vision":
        return vision.isArchived ? null : [vision];
      case "mission":
        return missions.filter((item) => !item.isArchived);
      case "mindset":
        return mindsets.filter((item) => !item.isArchived);
    }
  };

  const data = getData();

  // 데이터가 없으면 렌더링하지 않음
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-[10px] border-[2.19px] border-[#E4E4E4]">
      <h2 className="text-xl font-bold mb-4 text-black">{title}</h2>
      {type === "vision" ? (
        // Vision은 단일 항목
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="w-9 h-9 text-[36px] flex items-center justify-center overflow-hidden">
              {emoji}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-[18px] leading-[21px] text-black">
                {data[0].text}
              </p>
              <p className="text-[15px] leading-[18px] text-[#808080]">
                {data[0].count.toLocaleString()}번째, 나를 위한 응원
              </p>
            </div>
          </div>
          <HeartButton onClick={() => handleHeartClick(data[0].id, type)} />
        </div>
      ) : (
        // Mission과 Mindset은 리스트
        <ul className="space-y-6">
          {data.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 text-[36px] flex items-center justify-center overflow-hidden">
                  {emoji}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-[18px] leading-[21px] text-black">
                    {item.text}
                  </p>
                  <p className="text-[15px] leading-[18px] text-[#808080]">
                    {item.count.toLocaleString()}번째, 나를 위한 응원
                  </p>
                </div>
              </div>
              <HeartButton onClick={() => handleHeartClick(item.id, type)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoalCard;
