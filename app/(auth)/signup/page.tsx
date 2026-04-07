"use client";

import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { useSignupStepStore } from "@/store/SignupStore";
import Container from "@/features/auth/Container";
import Terms from "@/features/auth/Terms";
import ProgressIndicator from "@/features/auth/ProgressIndicator";
import BirthdayForm from "@/features/auth/BirthdayForm";
import NicknameForm from "@/features/auth/NicknameForm";
import OrganizationForm from "@/features/auth/OrganizationForm";
import { BackIcon } from "@/components/Icons";

export default function Page() {
  const currentStep = useSignupStepStore.use.currentStep();
  const handlePrevStep = useSignupStepStore.use.handlePrevStep();

  let containerHeight = "h-170";
  let content;

  switch (currentStep) {
    case 2:
      containerHeight = "min-h-170 h-auto";
      content = <Terms />;
      break;
    case 3:
      content = <BirthdayForm />;
      break;
    case 4:
      content = <NicknameForm />;
      break;
    case 5:
      containerHeight = "min-h-170 h-auto";
      content = <OrganizationForm />;
      break;
    default:
      containerHeight = "min-h-170 h-auto";
      content = <Terms />;
      break;
  }

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="overflow-x-hidden w-full min-h-dvh flex flex-col gap-3 items-center pt-15 sm:pt-0 justify-start sm:justify-center">
        <Container classes={containerHeight}>
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
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={4}
                startStep={2}
              />
            </div>
            <div className="min-w-10 flex justify-end" />
          </div>

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
  );
}
