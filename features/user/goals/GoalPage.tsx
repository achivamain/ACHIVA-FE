"use client";

import React, { useState } from "react";
import GoalCard from "@/features/user/goals/GoalCard";
import GoalEditContent from "@/features/user/goals/GoalEditContent";
import GoalArchiveContent from "@/features/user/goals/GoalArchiveContent";
import Footer from "@/components/Footer";
import { GoalEditIcon, GoalArchiveIcon } from "@/components/Icons";
import { useActiveGoals, categorizeGoals } from "@/hooks/useGoals";

const GoalPage: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const { data: goals, isLoading, error } = useActiveGoals();
  const { vision, missions, mindsets } = categorizeGoals(goals);

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <div className="text-[#808080]">목표를 불러오는 중</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <div className="text-red-500">목표를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4 flex-1">
        <div className="flex justify-end items-center gap-4">
          <button
            onClick={() => setIsArchiveModalOpen(true)}
            className="w-6 h-6 flex items-center justify-center text-[#412A2A] hover:opacity-70"
          >
            <GoalArchiveIcon />
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-6 h-6 flex items-center justify-center text-[#412A2A] hover:opacity-70"
          >
            <GoalEditIcon />
          </button>
        </div>

        <GoalCard
          type="vision"
          title="나의 꿈"
          emoji="💫"
          data={vision ? [vision] : []}
          variant="web"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <GoalCard
            type="mission"
            title="나의 미션"
            emoji="🎯"
            data={missions}
            variant="web"
          />
          <GoalCard
            type="mindset"
            title="마음가짐"
            emoji="🍀"
            data={mindsets}
            variant="web"
          />
        </div>
      </div>
      <Footer />

      {/* 수정 처리하는 Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 
                      before:absolute before:inset-0 before:bg-black before:opacity-50"
        >
          <div className="bg-[#F9F9F9] rounded-[10px] w-full max-w-[440px] mx-4 shadow-xl relative px-6 py-8 flex flex-col gap-8">
            <GoalEditContent onClose={() => setIsEditModalOpen(false)} />
          </div>
        </div>
      )}

      {/* 보관 처리하는 Modal */}
      {isArchiveModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 
                      before:absolute before:inset-0 before:bg-black before:opacity-50"
        >
          <div className="bg-[#F9F9F9] rounded-[10px] w-full max-w-[440px] mx-4 shadow-xl relative px-6 py-8 flex flex-col gap-8">
            <GoalArchiveContent onClose={() => setIsArchiveModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalPage;
