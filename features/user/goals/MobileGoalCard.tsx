"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { HeartIcon } from "@/components/Icons";
import useGoalStore from "@/store/GoalStore";

type GoalType = "vision" | "mission" | "mindset";

interface MobileGoalCardProps {
  type: GoalType;
  title: string;
  emoji: string;
}

const MobileGoalCard: React.FC<MobileGoalCardProps> = ({
  type,
  title,
  emoji,
}) => {
  const { vision, missions, mindsets, handleHeartClick } = useGoalStore();
  const [animationKey, setAnimationKey] = useState(0);
  const [animatingIds, setAnimatingIds] = useState<Record<number, number>>({});

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
    <div className="bg-white px-6 py-6 rounded-[8.75px] w-full">
      <h2 className="text-[20px] font-bold leading-6 mb-4 text-black">
        {title}
      </h2>
      {type === "vision" ? (
        // Vision은 단일 항목
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="w-9 h-9 text-[32px] flex items-center">
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
          <motion.button
            onClick={() => {
              handleHeartClick(data[0].id, type);
              setAnimationKey((prev) => prev + 1);
            }}
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            key={`vision-${animationKey}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{
              duration: 0.3,
              times: [0, 0.5, 1],
              ease: "easeInOut",
            }}
          >
            <HeartIcon />
          </motion.button>
        </div>
      ) : (
        // Mission과 Mindset은 리스트
        <ul className="space-y-6">
          {data.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 text-[36px] flex items-center">
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
              <motion.button
                onClick={() => {
                  handleHeartClick(item.id, type);
                  setAnimatingIds((prev) => ({
                    ...prev,
                    [item.id]: (prev[item.id] || 0) + 1,
                  }));
                }}
                className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                key={`${item.id}-${animatingIds[item.id] || 0}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{
                  duration: 0.3,
                  times: [0, 0.5, 1],
                  ease: "easeInOut",
                }}
              >
                <HeartIcon />
              </motion.button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MobileGoalCard;
