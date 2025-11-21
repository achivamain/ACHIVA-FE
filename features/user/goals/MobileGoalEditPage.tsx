"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useGoalStore from "@/store/GoalStore";
import GoalEditContent from "./GoalEditContent";
import type { Mission, Mindset, Vision } from "@/types/Goal";

interface MobileGoalEditPageProps {
  initialData: {
    vision: Vision;
    missions: Mission[];
    mindsets: Mindset[];
  };
}

const MobileGoalEditPage: React.FC<MobileGoalEditPageProps> = ({
  initialData,
}) => {
  const router = useRouter();
  const { setInitialData } = useGoalStore();

  useEffect(() => {
    setInitialData(initialData);
  }, [initialData, setInitialData]);

  return (
    <div className="min-h-dvh bg-[#F9F9F9]">
      <GoalEditContent
        onClose={() => router.back()}
        onSave={() => router.back()}
        isMobile={true}
      />
    </div>
  );
};

export default MobileGoalEditPage;
