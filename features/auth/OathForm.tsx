import { NextStepButton } from "./Buttons";
import { useSignupInfoStore } from "@/store/SignupStore";
import { format } from "date-fns";
import { useState } from "react";
import Post from "../post/Post";

export default function OathForm() {
  const user = useSignupInfoStore.use.user();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const post = {
    backgroundColor: "#A6736F",
    question: [
      {
        question: `우리의 공간`,
        content: `성취를 나누고, 서로를 응원하는 새로운 공간

당신의 작은 도전과 큰 성취가 모두 빛나는 곳

이곳에서 우리는 함께 성장합니다`,
      },
      {
        question: "성취를 공유해요",
        content: `나의 성취를 기록하고 공유하세요

결과뿐 아니라 과정도 소중합니다

작은 걸음 하나도 우리는 박수를 받을 자격이 있습니다`,
      },
      {
        question: "서로를 응원해요",
        content: `응원은 Achiva의 언어입니다

차가운 시선보다, 따뜻한 눈빛을  
차가운 침묵보다, 따뜻한 응원을 남겨주세요

응원의 힘이 성취를 완성시킵니다`,
      },
      {
        question: "함께 만들어요",
        content: `성취를 쌓아갑니다
서로를 응원합니다

아래 버튼을 눌러 Achiva의 문화에 참여하세요`,
      },
    ],
  };

  async function handleSignUp() {
    setIsLoading(true);
    const payload = {
      profileImageUrl: null,
      birth: format(user.birth!, "yyyy-MM-dd"),
      categories: user.categories,
    };

    try {
      const response = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("회원가입 중 서버 에러");
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
    setIsLoading(false);
  }
  return (
    <div className="w-full flex flex-col">
      <div className="w-full text-left">
        <p className="font-semibold text-lg">Achiva 문화에 참여해요</p>
        <p className="font-light text-sm text-theme-gray">
          게시물을 오른쪽으로 넘겨 다음 내용을 볼 수 있어요
        </p>
      </div>

      <div className="mt-2 mb-5">
        {/* @ts-ignore */}
        <Post post={post} handleSlideChange={(idx) => setCurrentPage(idx)} />
      </div>

      <NextStepButton
        disabled={currentPage !== 3}
        isLoading={isLoading}
        onClick={handleSignUp}
      >
        동의하고 시작하기
      </NextStepButton>
    </div>
  );
}
