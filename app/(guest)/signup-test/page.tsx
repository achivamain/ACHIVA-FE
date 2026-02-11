"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignupStepStore, useSignupInfoStore } from "@/store/SignupStore";

// 회원가입 테스트용 Entry Point, 정식 배포 전 제거할 것

export default function SignupTestPage() {
  const router = useRouter();
  const resetStep = useSignupStepStore.use.resetStep();
  const resetUser = useSignupInfoStore.use.resetUser();

  useEffect(() => {
    resetUser();
  }, [resetUser]);

  const handleStartTest = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme/10 to-theme/5 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-theme mb-2">
          🧪 회원가입 테스트
        </h1>
        <p className="text-gray-500 mb-6">
          인증 없이 회원가입 플로우를 테스트합니다
        </p>

        <div className="space-y-4">

          <button
            onClick={handleStartTest}
            className="w-full bg-theme text-white font-semibold py-3 px-6 rounded-lg 
                       hover:bg-theme/90 transition-colors duration-200"
          >
            Step 2부터 테스트 시작
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Test Page 
          </p>
        </div>
      </div>
    </div>
  );
}

