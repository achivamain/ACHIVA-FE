"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileGoalCard from "@/features/user/goals/MobileGoalCard";
import { GoalEditIcon, GoalArchiveIcon } from "@/components/Icons";
import useGoalStore from "@/store/GoalStore";
import type { Mission, Mindset, Vision } from "@/types/Goal";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/User";

interface MobileGoalWrapperProps {
  initialData: {
    vision: Vision;
    missions: Mission[];
    mindsets: Mindset[];
  };
}

const MobileGoalWrapper: React.FC<MobileGoalWrapperProps> = ({
  initialData,
}) => {
  const router = useRouter();
  const { setInitialData } = useGoalStore();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
  });

  useEffect(() => {
    setInitialData(initialData);
  }, [initialData, setInitialData]);

  const handleEditClick = () => {
    router.push(`/${user?.nickName}/goals/edit`);
  };

  const handleArchiveClick = () => {
    router.push(`/${user?.nickName}/goals/archive`);
  };

  return (
    <div className="min-h-dvh bg-[#F9F9F9] pb-[104px]">
      {/* Header */}
      <div className="px-[20px] pt-[20px] pb-[16px] flex justify-between items-center">
        <h1 className="text-[34px] font-bold leading-[41px] text-[#412A2A]">
          ACHIVA
        </h1>
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
        <MobileGoalCard type="vision" title="나의 꿈" emoji="💫" />
        <MobileGoalCard type="mission" title="나의 미션" emoji="🎯" />
        <MobileGoalCard type="mindset" title="마음가짐" emoji="🍀" />
      </div>
    </div>
  );
};

export default MobileGoalWrapper;
