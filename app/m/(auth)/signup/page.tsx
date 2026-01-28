"use client";

import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { useSignupStepStore } from "@/store/SignupStore";
import Footer from "@/components/Footer";
import MobileHeader from "@/components/MobileHeader";
import Container from "@/features/auth/Container";
import { TextLogo } from "@/components/Logo";
import Terms from "@/features/auth/Terms";
import CategoryForm from "@/features/auth/CategoryForm";
import BirthdayForm from "@/features/auth/BirthdayForm";
import OathForm from "@/features/auth/OathForm";
import ProgressIndicator from "@/features/auth/ProgressIndicator";

export default function Page() {
  const currentStep = useSignupStepStore.use.currentStep();
  const handlePrevStep = useSignupStepStore.use.handlePrevStep();
  let containerHeight = "h-151";
  let content;
  switch (currentStep) {
    case 2: // 약관
      containerHeight = "h-auto";
      content = (
        <>
          <div className="hidden sm:block mb-10">
            <TextLogo />
          </div>
          <Terms />
        </>
      );
      break;
    case 3: // 카테고리
      content = (
        <>
          <div className="hidden sm:block mb-10">
            <TextLogo />
          </div>
          <CategoryForm />
        </>
      );
      break;
    case 4: // 생일
      content = (
        <>
          <div className="hidden sm:block mb-10">
            <TextLogo />
          </div>
          <BirthdayForm />
        </>
      );
      break;
    case 5: // 서약서
      content = (
        <>
          <div className="hidden sm:block">
            <TextLogo />
          </div>
          <OathForm />
        </>
      );
  }

  return (
    <>
      <div className="min-h-dvh flex items-center justify-center">
        <div className="overflow-x-hidden w-full min-h-dvh flex flex-col gap-3 items-center pt-15 sm:pt-0 justify-start sm:justify-center">
          <div className="w-full fixed top-0 left-0">
            <MobileHeader
              onClick={currentStep !== 0 ? handlePrevStep : undefined}
            >
              <ProgressIndicator currentStep={3} />
            </MobileHeader>
          </div>
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
