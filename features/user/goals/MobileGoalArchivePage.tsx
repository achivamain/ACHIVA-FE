"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useGoalStore from "@/store/GoalStore";
import GoalArchiveContent from "./GoalArchiveContent";
import type { Mission, Mindset, Vision } from "@/types/Goal";

interface MobileGoalArchivePageProps {
  initialData: {
    vision: Vision;
    missions: Mission[];
    mindsets: Mindset[];
  };
}

const MobileGoalArchivePage: React.FC<MobileGoalArchivePageProps> = ({
  initialData,
}) => {
  const router = useRouter();
  const { setInitialData } = useGoalStore();

  useEffect(() => {
    setInitialData(initialData);
  }, [initialData, setInitialData]);

  return (
    <div className="min-h-dvh bg-[#F9F9F9]">
      <GoalArchiveContent onClose={() => router.back()} isMobile={true} />
    </div>
  );
};

export default MobileGoalArchivePage;
