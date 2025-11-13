"use client";
// 나중에 백엔드 연동필요!!
import { z } from "zod";
import { UserSchema } from "../auth/schima";
import { User } from "@/types/User";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { NextStepButton } from "../post/create/Buttons";

export default function ResetPassword() {
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
  });
  const email = currentUser?.email;
  const [currentStep, setCurrentStep] = useState(0);

  const [enteredValues, setEnteredValues] = useState({
    prevPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    prevPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function handleNewPasswordBlur() {
    const schema = UserSchema.pick({ ["password"]: true });
    const payload = { ["password"]: enteredValues.newPassword };
    const result = schema.safeParse(payload);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        ...errors,
        newPassword: fieldErrors.password?.[0] || "",
      });
    } else {
      setErrors({
        ...errors,
        newPassword: "",
      });
    }
    setIsEditing(false);
  }

  function handleConfirmPasswordBlur() {
    if (enteredValues.newPassword !== enteredValues.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: "비밀번호가 일치하지 않습니다.",
      });
    } else {
      setErrors({
        ...errors,
        confirmPassword: "",
      });
    }
    setIsEditing(false);
  }

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full flex flex-col">
      {currentStep === 0 && (
        <>
          <h2 className="font-semibold text-xl mb-7">
            기존 비밀번호를 입력해주세요
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const res = await fetch(`/api/auth/verifyPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  password: enteredValues.prevPassword,
                }),
              });
              setIsLoading(false);
              if (res.ok) {
                setCurrentStep(1);
              } else {
                setErrors((prev) => ({
                  ...prev,
                  prevPassword: "비밀번호가 일치하지 않습니다.",
                }));
              }
            }}
            className="flex flex-col gap-4"
          >
            <Input
              value={enteredValues.prevPassword}
              onChange={(e) => {
                setIsEditing(true);
                setErrors((prev) => ({ ...prev, prevPassword: "" }));
                setEnteredValues((prev) => ({
                  ...prev,
                  prevPassword: e.target.value,
                }));
              }}
              onBlur={() => setIsEditing(false)}
              placeholder="기존 비밀번호 입력"
              error={!isEditing ? errors.prevPassword : ""}
            />
            <NextStepButton
              disabled={!enteredValues.prevPassword || !!errors.prevPassword}
              isLoading={isLoading}
            >
              다음
            </NextStepButton>
          </form>
        </>
      )}
      {currentStep === 1 && (
        <>
          <h2 className="font-semibold text-xl mb-7">
            새 비밀번호를 설정해주세요
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const res = await fetch(`/api/auth/resetPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  newPassword: enteredValues.newPassword,
                  confirmPassword: enteredValues.confirmPassword,
                }),
              });
              setIsLoading(false);
              if (res.ok) {
                alert("비밀번호가 변경되었습니다!");
              } else {
                setErrors((prev) => ({
                  ...prev,
                  prevPassword: "비밀번호가 일치하지 않습니다.",
                }));
              }
            }}
            className="flex flex-col gap-2"
          >
            <Input
              value={enteredValues.newPassword}
              onChange={(e) => {
                setIsEditing(true);
                setErrors((prev) => ({ ...prev, newPassword: "" }));
                setEnteredValues((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }));
              }}
              onBlur={handleNewPasswordBlur}
              placeholder="새 비밀번호 입력"
              error={!isEditing ? errors.newPassword : ""}
            />
            <Input
              value={enteredValues.confirmPassword}
              onChange={(e) => {
                setIsEditing(true);
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                setEnteredValues((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }));
              }}
              onBlur={handleConfirmPasswordBlur}
              error={!isEditing ? errors.confirmPassword : ""}
              placeholder="새 비밀번호 재확인"
            />
            <p className="font-light text-xs text-[#808080]">
              8~20자/ 영문, 숫자, 특수문자 포함
            </p>
            <NextStepButton
              isLoading={isLoading}
              disabled={
                !enteredValues.newPassword ||
                !enteredValues.confirmPassword ||
                !!errors.newPassword ||
                !!errors.confirmPassword ||
                isEditing
              }
            >
              저장
            </NextStepButton>
          </form>
        </>
      )}
    </div>
  );
}

type InputProps = {
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Input({ error = "", ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col">
      <input
        className="placeholder:text-[#b3b3b3] bg-[#f2f2f2] rounded-sm px-3 py-2.5"
        {...props}
        type="password"
      />
      {error && (
        <p className="text-theme-red font-light text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
