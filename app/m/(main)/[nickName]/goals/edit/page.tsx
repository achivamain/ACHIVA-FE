"use client";

import { useRouter } from "next/navigation";
import GoalEditContent from "@/features/user/goals/GoalEditContent";

export default function MobileGoalEditPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#F9F9F9]">
      <GoalEditContent
        onClose={() => router.back()}
        onSave={() => router.back()}
        isMobile={true}
      />
    </div>
  );
}
