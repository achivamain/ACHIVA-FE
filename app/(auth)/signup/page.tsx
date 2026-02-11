"use client";

import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { useSignupStepStore } from "@/store/SignupStore";
import Footer from "@/components/Footer";
import Container from "@/features/auth/Container";
import Terms from "@/features/auth/Terms";
import CategoryForm, { CategoryNextButton } from "@/features/auth/CategoryForm";
import ProgressIndicator from "@/features/auth/ProgressIndicator";
import ProfileImageForm from "@/features/auth/ProfileImageForm";
import BirthdayForm from "@/features/auth/BirthdayForm";
import OathForm from "@/features/auth/OathForm";
import { BackIcon } from "@/components/Icons";

export default function Page() {
  const currentStep = useSignupStepStore.use.currentStep();
  const handlePrevStep = useSignupStepStore.use.handlePrevStep();
  let containerHeight = "h-170";
  let content;
  switch (currentStep) {
    case 2: // 약관
      containerHeight = "min-h-170 h-auto";
      content = (
        <>
          <Terms />
        </>
      );
      break;
    case 3: // 생일
      content = (
        <>
          <BirthdayForm />
        </>
      );
      break;
    case 4: // 프로필사진
      content = (
        <>
          <ProfileImageForm />
        </>
      );
      break;
    case 5: // 카테고리
      content = (
        <>
          <CategoryForm />
        </>
      );
      break;
    case 6: // 서약서
      content = (
        <>
          <OathForm />
        </>
      );
  }

  return (
    <>
      <div className="min-h-dvh flex items-center justify-center">
        <div className="overflow-x-hidden w-full min-h-dvh flex flex-col gap-3 items-center pt-15 sm:pt-0 justify-start sm:justify-center">
          <Container classes={containerHeight}>
            {/* 상단 헤더 */}
            <div className="w-full flex items-center justify-between mb-4 relative">
              <button
                onClick={currentStep !== 2 ? handlePrevStep : undefined}
                className={`p-2 -ml-2 rounded-full transition-colors ${
                  currentStep !== 2 ? "hover:bg-gray-100" : "invisible"
                }`}
              >
                <BackIcon />
              </button>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <ProgressIndicator currentStep={currentStep} />
              </div>
              <div className="min-w-10 flex justify-end">
                {currentStep === 5 && <CategoryNextButton />}
              </div>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={
                  currentStep !== 0
                    ? {
                        opacity: 0,
                      }
                    : false
                }
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="w-full flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </Container>
        </div>
      </div>
    </>
  );
}
