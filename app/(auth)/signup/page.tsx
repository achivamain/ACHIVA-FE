"use client";

import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { useSignupStepStore } from "@/store/SignupStore";
import Footer from "@/components/Footer";
import Container from "@/features/auth/Container";
import { TextLogo } from "@/components/Logo";
import Terms from "@/features/auth/Terms";
import CategoryForm from "@/features/auth/CategoryForm";
import BirthdayForm from "@/features/auth/BirthdayForm";
import OathForm from "@/features/auth/OathForm";
import NicknameForm from "@/features/auth/NicknameForm";

export default function Page() {
  const currentStep = useSignupStepStore.use.currentStep();
  let content;
  switch (currentStep) {
    case 1: // 닉네임
      console.log("!!");
      content = (
        <>
          <div className="hidden sm:block mb-10">
            <TextLogo />
          </div>
          <NicknameForm />
        </>
      );
      break;
    case 2: // 약관
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
          <div className="hidden sm:block mb-10">
            <TextLogo />
          </div>
          <OathForm />
        </>
      );
  }

  return (
    <>
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-full min-h-dvh flex flex-col gap-3 items-center pt-15 sm:pt-0 justify-start sm:justify-center">
          <Container classes="h-151">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={
                  currentStep !== 1
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
