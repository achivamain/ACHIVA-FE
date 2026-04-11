"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GoalCard from "@/features/user/goals/GoalCard";
import { GoalEditIcon, GoalArchiveIcon } from "@/components/Icons";
import { useActiveGoals, categorizeGoals } from "@/hooks/useGoals";
import { TextLogo } from "@/components/Logo";
import { buildUserPath } from "@/lib/nickname";

interface MobileGoalPageProps {
  nickName: string;
}

const MobileGoalPage: React.FC<MobileGoalPageProps> = ({ nickName }) => {
  const router = useRouter();
  const { data: goals, isLoading, error } = useActiveGoals();
  const { vision, missions, mindsets } = categorizeGoals(goals);

  const handleEditClick = () => {
    router.push(buildUserPath(nickName, "/goals/edit"));
  };

  const handleArchiveClick = () => {
    router.push(buildUserPath(nickName, "/goals/archive"));
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-[#808080]">목표를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-red-500">목표를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F9F9F9] pb-[104px]">
      {/* Header */}
      <div className="px-[24px] pt-[20px] pb-[24px] flex justify-between items-center">
        <TextLogo />
        <div className="flex items-center gap-4">
          <button
            onClick={handleArchiveClick}
            className="w-6 h-6 flex items-center justify-center text-[#412A2A] hover:opacity-70"
          >
            <GoalArchiveIcon />
          </button>
          <button
            onClick={handleEditClick}
            className="w-6 h-6 flex items-center justify-center text-[#412A2A] hover:opacity-70"
          >
            <GoalEditIcon />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-[19px] space-y-4">
        <GoalCard
          type="vision"
          title="나의 꿈"
          emoji="💫"
          data={vision ? [vision] : []}
          variant="mobile"
        />
        <GoalCard
          type="mission"
          title="나의 미션"
          emoji="🎯"
          data={missions}
          variant="mobile"
        />
        <GoalCard
          type="mindset"
          title="마음가짐"
          emoji="🍀"
          data={mindsets}
          variant="mobile"
        />
      </div>
    </div>
  );
};

export default MobileGoalPage;
