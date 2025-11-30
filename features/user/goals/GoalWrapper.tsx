"use client";

import React, { useEffect } from "react";
import GoalCard from "@/features/user/goals/GoalCard";
import Footer from "@/components/Footer";
import GoalEditModal from "@/features/user/goals/GoalEditModal";
import GoalArchiveModal from "@/features/user/goals/GoalArchiveModal";
import { GoalEditIcon, GoalArchiveIcon } from "@/components/Icons";
import useGoalStore from "@/store/GoalStore";
import type { Mission, Mindset, Vision } from "@/types/Goal";

interface GoalWrapperProps {
  initialData: {
    vision: Vision;
    missions: Mission[];
    mindsets: Mindset[];
  };
}

const GoalWrapper: React.FC<GoalWrapperProps> = ({ initialData }) => {
  const { setInitialData, toggleModal, toggleArchiveModal } = useGoalStore();

  useEffect(() => {
    setInitialData(initialData);
  }, [initialData, setInitialData]);

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4 flex-1">
        <div className="flex justify-end items-center gap-4">
          <button
            onClick={() => toggleArchiveModal(true)}
            className="w-6 h-6 flex items-center justify-center text-[#412A2A] hover:opacity-70"
          >
            <GoalArchiveIcon />
          </button>
          <button
            onClick={() => toggleModal(true)}
            className="w-6 h-6 flex items-center justify-center text-[#412A2A] hover:opacity-70"
          >
            <GoalEditIcon />
          </button>
        </div>

        <GoalCard type="vision" title="나의 꿈" emoji="💫" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <GoalCard type="mission" title="나의 미션" emoji="🎯" />
          <GoalCard type="mindset" title="마음가짐" emoji="🍀" />
        </div>
      </div>
      <Footer />
      <GoalEditModal />
      <GoalArchiveModal />
    </div>
  );
};

export default GoalWrapper;
