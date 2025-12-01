import { NextStepButton } from "./Buttons";
import { useDebouncedCallback } from "use-debounce";
import { UserSchema } from "./schima";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSignupStepStore } from "@/store/SignupStore";

export default function NicknameForm() {
  const handleNextStep = useSignupStepStore.use.handleNextStep();

  const [nickname, setNickname] = useState("");
  const [error, setError] = useState(""); // 프론트 단 닉네임 검증
  const [isValidating, setIsValidating] = useState(false); // debounce 검증 상태
  const [checkedNickname, setCheckedNickname] = useState(""); // 중복 확인 통과한 닉네임

  const isAvilable = nickname && checkedNickname === nickname; // 중복 통과 여부

  const nicknameMutation = useMutation({
    mutationFn: async (nickname: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/check-nickname?nickname=${nickname}`
      );

      // 에러 코드 넘겨주기
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw {
          status: response.status,
          data: errorData,
        };
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      setCheckedNickname(variables);
    },
    onError: (err: any) => {
      if (err.status === 409) {
        setError("이미 사용 중인 닉네임입니다.");
      } else {
        alert(
          "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    },
  });

  const validateNickname = useDebouncedCallback((v: string) => {
    const schema = UserSchema.pick({ nickName: true });
    const result = schema.safeParse({ nickName: v });
    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError("");
    }

    setIsValidating(false);
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
            setIsValidating(true);
            validateNickname(value);
          }}
          placeholder="닉네임"
          type="text"
          className={`text-sm bg-[#f2f2f2] rounded-sm placeholder:text-[#b3b3b3] py-2 px-3 ${
            error
              ? "border border-theme-red outline-0"
              : isAvilable
              ? "border border-[#29CC52] outline-0"
              : ""
          }`}
        />
        <NextStepButton
          disabled={!!error || !nickname || isValidating}
          isLoading={nicknameMutation.isPending}
          className="w-20!"
          onClick={() => nicknameMutation.mutate(nickname)}
        >
          중복체크
        </NextStepButton>
      </div>
      {error && (
        <p className="text-theme-red text-xs font-light mt-2.5">{error}</p>
      )}
      {isAvilable && (
        <p className="text-[#29cc52] text-xs font-light mt-2.5">
          사용할 수 있는 닉네임입니다.
        </p>
      )}
      <p className="mt-2.5 mb-4.5 font-light text-sm text-theme-gray">
        2자 이상 15자 이하
        <br />
        한글, 영문자, 숫자, 밑줄(_) 사용 가능
      </p>
      <NextStepButton
        disabled={!!error || !isAvilable}
        onClick={handleNextStep}
      >
        다음
      </NextStepButton>
    </div>
  );
}
