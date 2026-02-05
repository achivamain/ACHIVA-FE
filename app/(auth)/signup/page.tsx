"use client";

import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { useSignupStepStore } from "@/store/SignupStore";
import Footer from "@/components/Footer";
import Container from "@/features/auth/Container";
import { TextLogo } from "@/components/Logo";
import Terms from "@/features/auth/Terms";
import CategoryForm from "@/features/auth/CategoryForm";
import ProfileImageForm from "@/features/auth/ProfileImageForm";
import BirthdayForm from "@/features/auth/BirthdayForm";
import OathForm from "@/features/auth/OathForm";

export default function Page() {
  const currentStep = useSignupStepStore.use.currentStep();
  let containerHeight = "h-151";
  let content;
  switch (currentStep) {
    case 2: // 약관
      containerHeight = "h-auto";
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
                className="w-full h-full flex flex-col items-center sm:justify-center"
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
}
