"use client";

import { useRouter } from "next/navigation";
import GoalArchiveContent from "@/features/user/goals/GoalArchiveContent";

export default function MobileGoalArchivePage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#F9F9F9]">
      <GoalArchiveContent onClose={() => router.back()} isMobile={true} />
    </div>
  );
}
