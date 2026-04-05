"use client";

import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { NextStepButton } from "./Buttons";
import { UserSchema } from "./schima";
import { useSignupInfoStore } from "@/store/SignupStore";

export default function NicknameForm() {
  const user = useSignupInfoStore.use.user();
  const setUser = useSignupInfoStore.use.setUser();

  const [nickName, setNickName] = useState(user.nickName);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isChecking || isSubmitting) return;

    const trimmedNickName = nickName.trim();
    const result = UserSchema.pick({ nickName: true }).safeParse({
      nickName: trimmedNickName,
    });

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setError(fieldErrors.nickName?.[0] || "");
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const response = await fetch(
        `/api/auth/checkNickname?nickname=${encodeURIComponent(trimmedNickName)}`,
      );

      if (response.ok) {
        const { data } = await response.json();
        if (!data.available) {
          setError("이미 사용 중인 닉네임입니다.");
          return;
        }

        setUser({ nickName: trimmedNickName });
        setIsSubmitting(true);

        const signupResponse = await fetch(`/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickName: trimmedNickName,
            birth: format(user.birth!, "yyyy-MM-dd"),
          }),
        });

        if (!signupResponse.ok) {
          throw new Error("회원가입 중 서버 에러");
        }

        window.location.href = "/signup/moim";
        return;
      }

      if (response.status === 409) {
        setError("이미 사용 중인 닉네임입니다.");
        return;
      }

      throw new Error("닉네임 확인 중 서버 에러");
    } catch (err) {
      console.error(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsChecking(false);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full text-left">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          사용할 닉네임을 입력해주세요
        </p>
        <p className="font-light text-[15px] leading-[20px] text-[#808080] mt-2.5 break-keep">
          나중에 설정에서 다시 바꿀 수 있어요.
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
              placeholder="닉네임을 입력해주세요"
              onChange={(e) => {
                setNickName(e.target.value);
                setError("");
              }}
              className="mt-3 w-full border-0 bg-transparent p-0 text-[24px] font-semibold tracking-[-0.02em] text-[#412A2A] outline-none placeholder:text-[#D0C7C1]"
            />
          </div>

          <div className="rounded-2xl bg-[#F5F1ED] px-4 py-3 text-sm leading-6 text-[#7B6D6D]">
            영문, 숫자, 한글, 밑줄(_)만 사용할 수 있어요. <br/>
            2자 이상 15자 이하로 입력해주세요.
          </div>
        </div>

        <div className="space-y-3">
          <div
            aria-live="polite"
            className={`min-h-6 text-center text-sm font-light ${
              isChecking || isSubmitting ? "text-[#7B6D6D]" : "text-theme-red"
            }`}
          >
            {isChecking
              ? "닉네임 중복 체크 중입니다.."
              : isSubmitting
                ? "회원가입 처리 중입니다.."
                : error}
          </div>
          <NextStepButton
            type="submit"
            isLoading={isChecking || isSubmitting}
            disabled={!nickName.trim() || isChecking || isSubmitting}
          >
            가입하기
          </NextStepButton>
        </div>
      </form>
    </div>
  );
}
