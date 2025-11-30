"use client";

import useGoalStore from "@/store/GoalStore";
import GoalArchiveContent from "./GoalArchiveContent";

const GoalArchiveModal = () => {
  const { isArchiveModalOpen, toggleArchiveModal } = useGoalStore();

  if (!isArchiveModalOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 
                  before:absolute before:inset-0 before:bg-black before:opacity-50"
    >
      <div className="bg-[#F9F9F9] rounded-[10px] w-full max-w-[440px] mx-4 shadow-xl relative px-6 py-8 flex flex-col gap-8">
        <GoalArchiveContent onClose={() => toggleArchiveModal(false)} />
      </div>
    </div>
  );
};

export default GoalArchiveModal;
