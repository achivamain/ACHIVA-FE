"use client";

import { z } from "zod";
import { useState } from "react";
import { NextStepButton } from "./Buttons";
import { UserSchema } from "./schima";
import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";

export default function NicknameForm() {
  const user = useSignupInfoStore.use.user();
  const setUser = useSignupInfoStore.use.setUser();
  const handleNextStep = useSignupStepStore.use.handleNextStep();

  const [nickName, setNickName] = useState(user.nickName);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedNickName = nickName.trim();
    const result = UserSchema.pick({ nickName: true }).safeParse({
      nickName: trimmedNickName,
    });

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setError(fieldErrors.nickName?.[0] || "");
      return;
    }

    setError("");
    setUser({ nickName: trimmedNickName });
    handleNextStep();
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full text-left">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          사용할 닉네임을 입력해 주세요
        </p>
        <p className="font-light text-[15px] leading-[20px] text-[#808080] mt-2.5 break-keep">
          닉네임은 설정에서 나중에 변경할 수 있어요.
        </p>
      </div>

      <form
        className="flex flex-1 flex-col justify-between pt-8"
        onSubmit={handleSubmit}
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#E7E1DC] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(65,42,42,0.06)]">
            <label
              htmlFor="signup-nickname"
              className="text-sm font-medium text-[#7B6D6D]"
            >
              닉네임
            </label>
            <input
              id="signup-nickname"
              type="text"
              value={nickName}
              maxLength={15}
              autoComplete="nickname"
              placeholder="닉네임을 입력해 주세요"
              onChange={(e) => {
                setNickName(e.target.value);
                setError("");
              }}
              className="mt-3 w-full border-0 bg-transparent p-0 text-[24px] font-semibold tracking-[-0.02em] text-[#412A2A] outline-none placeholder:text-[#D0C7C1]"
            />
          </div>

          <div className="rounded-2xl bg-[#F5F1ED] px-4 py-3 text-sm leading-6 text-[#7B6D6D]">
            영문, 숫자, 한글, 밑줄(_)을 사용할 수 있어요.
            <br />
            2자 이상 15자 이하로 입력해 주세요.
          </div>
        </div>

        <div className="space-y-3">
        <div
          aria-live="polite"
          className="min-h-6 text-center text-sm font-light text-theme-red"
        >
          {error}
        </div>
          <NextStepButton
            type="submit"
            disabled={!nickName.trim()}
          >
            다음
          </NextStepButton>
        </div>
      </form>
    </div>
  );
}
