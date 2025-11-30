import { NextStepButton } from "./Buttons";
import { useDebouncedCallback } from "use-debounce";
import { UserSchema } from "./schima";
import { useState } from "react";

export default function NicknameForm() {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState(""); // 프론트 단 닉네임 검증

  const validateNickname = useDebouncedCallback((v: string) => {
    const schema = UserSchema.pick({ nickName: true });
    const result = schema.safeParse({ nickName: v });
    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError("");
    }
  }, 300); // 일정 시간 지나고 검증

  return (
    <div>
      <p className="font-semibold text-lg mb-6">
        사용하실 닉네임을 입력해주세요
      </p>
      <div className="flex gap-1.5">
        <input
          value={nickname}
          onChange={(e) => {
            const value = e.target.value;
            setNickname(value);
            setError(""); // 입력 중 에러 문구 X
            validateNickname(value);
          }}
          placeholder="닉네임"
          type="text"
          className={`text-sm bg-[#f2f2f2] rounded-sm placeholder:text-[#b3b3b3] py-2 px-3 ${
            error ? "border border-theme-red outline-0" : ""
          }`}
        />
        <button
          disabled={!!error || !nickname}
          className="whitespace-nowrap bg-theme text-white font-medium py-2 px-3 rounded-sm disabled:bg-[#e6e6e6] disabled:text-[#a6a6a6]"
        >
          중복체크
        </button>
      </div>
      {error && (
        <p className="text-theme-red text-xs font-light mt-2.5">{error}</p>
      )}
      {/* {isAvailable && (
        <p className="text-[#29cc52] text-xs font-light">{isAvailable}</p>
      )} */}
      <p className="mt-2.5 mb-4.5 font-light text-sm text-theme-gray">
        2자 이상 15자 이하
        <br />
        한글, 영문자, 숫자, 밑줄(_) 사용 가능
      </p>
      <NextStepButton disabled={!!error || !nickname}>다음</NextStepButton>
    </div>
  );
}
