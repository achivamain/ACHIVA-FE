"use client";
import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";
import { ButtonHTMLAttributes } from "react";
import { NextStepButton } from "./Buttons";
import { motion } from "motion/react";
import { categories } from "@/types/Categories";

export default function CategoryForm() {
  const handleNextStep = useSignupStepStore.use.handleNextStep();
  const user = useSignupInfoStore.use.user();
  const setUser = useSignupInfoStore.use.setUser();

  return (
    <div className="flex flex-col gap-5">
      <div className="w-full text-left">
        <p className="font-semibold text-lg">
          원하는 성취 카테고리를 선택해주세요
        </p>
      </div>
      <div className="flex h-60 flex-col justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              isSelected={user.categories.includes(category)}
              onClick={() => {
                if (user.categories.includes(category)) {
                  setUser({
                    categories: user.categories.filter((c) => c !== category),
                  });
                } else {
                  setUser({ categories: [...user.categories, category] });
                }
              }}
            >
              {category}
            </Button>
          ))}
        </div>
        <NextStepButton
          onClick={handleNextStep}
          disabled={user.categories.length === 0}
        >
          다음
        </NextStepButton>
      </div>
    </div>
  );
}

type ButtonProps = {
  isSelected: boolean;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ isSelected, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`relative px-3 py-2 rounded-sm font-semibold overflow-hidden border ${
        isSelected
          ? "border-transparent text-white"
          : "text-theme border-[#d9d9d9]"
      }`}
    >
      <span className="relative z-10">{children}</span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 border text-white bg-theme border-theme"
        ></motion.div>
      )}
    </button>
  );
}
