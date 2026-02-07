import { useState, useRef } from "react";
import { NextStepButton } from "./Buttons";
import { CheckIcon } from "@/components/Icons";
import { useSignupStepStore } from "@/store/SignupStore";

export default function Terms() {
  const handleNextStep = useSignupStepStore.use.handleNextStep();
  const [agreements, setAgreements] = useState(Array(5).fill(false));
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const titles = [
    "(필수) 서비스 이용약관 동의",
    "(필수) 개인정보 수집 및 이용 동의",
    "(필수) 커뮤니티 가이드라인 동의",
    "(필수) 개인정보 처리 위탁 동의",
    "(선택) 마케팅 정보 수신 동의",
  ];
  const contents = [
    `제1조 (목적)
이 약관은 나는오늘운동한다(이하 ‘회사’라 합니다)가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 회사의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.
2. "회원"이란 회사에 개인정보를 제공하고 이용계약을 체결한 자를 말합니다.

제3조 (약관의 효력 및 변경)
1. 회사는 본 약관의 내용을 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력을 발생합니다.
2. 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있습니다.
...

※ 전체 약관은 [홈페이지 약관 링크]에서 확인하실 수 있습니다.
`,
    `[개인정보 수집 및 이용에 대한 동의]

회사는 회원가입, 상담, 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.

1. 수집 항목  
- 필수 항목: 이름, 이메일, 비밀번호  
- 선택 항목: 프로필 사진, 관심 카테고리 등

2. 수집 목적  
- 서비스 이용에 따른 본인 식별 및 인증  
- 회원관리 및 고객문의 대응  
- 맞춤형 콘텐츠 제공

3. 보유 및 이용 기간  
- 회원 탈퇴 후 즉시 파기  
- 단, 관계 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관

※ 위의 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 필수 항목 미동의 시 서비스 이용이 제한될 수 있습니다.
`,
    `[커뮤니티 가이드라인 동의]

본 서비스는 이용자 간의 건전한 소통과 정보 공유를 위한 커뮤니티를 운영하고 있으며, 다음의 가이드라인에 따라야 합니다.

1. 금지 행위
- 욕설, 비방, 혐오 표현 등 타인을 불쾌하게 하는 언행
- 허위 정보 유포 및 광고성 게시물 작성
- 타인의 개인정보 도용 또는 무단 공유
- 반복적인 스팸 게시물 또는 커뮤니티 질서 저해 행위

2. 운영 방침
- 위반 내용에 따라 게시물 삭제, 이용 제한, 계정 정지 등의 조치가 이루어질 수 있습니다.
- 신고된 게시물은 운영팀 검토 후 처리됩니다.

3. 동의 안내
- 본 가이드라인에 동의하지 않을 경우 커뮤니티 기능 이용이 제한됩니다.

※ 커뮤니티는 모두가 함께 만들어가는 공간입니다. 서로를 존중하며 사용해 주세요.
`,
    `[개인정보 처리 위탁 동의]

회사는 서비스 제공 및 운영을 위해 개인정보 처리 업무의 일부를 외부 업체에 위탁하고 있습니다.

1. 위탁 대상 업무 및 수탁자  
- 고객센터 운영: ㈜OOO  
- 결제 처리: ㈜OO페이  
- 문자/이메일 발송: ㈜OO커뮤니케이션

2. 위탁 목적  
- 고객 문의 응대, 결제 처리, 알림 서비스 제공 등

3. 보유 및 이용 기간  
- 위탁 계약 종료 시 또는 회원 탈퇴 시까지

※ 수탁자는 위탁 목적 외로 개인정보를 처리할 수 없으며, 관계 법령에 따라 기술적·관리적 보호조치를 이행하고 있습니다.

※ 본 동의는 서비스 이용에 필수적이며, 동의하지 않으실 경우 회원가입이 제한될 수 있습니다.
`,
    `[마케팅 정보 수신 동의 안내]

회사는 이용자에게 보다 나은 서비스 및 혜택 정보를 제공하기 위해, 마케팅 목적의 정보를 전송할 수 있습니다.

1. 수신 항목
- 이벤트, 프로모션, 할인 혜택, 신규 서비스 안내 등

2. 수신 방법
- 이메일, 문자(SMS), 앱 푸시 등

3. 보유 및 이용 기간
- 동의일로부터 회원 탈퇴 또는 동의 철회 시까지

4. 동의 철회
- 언제든지 마케팅 정보 수신을 거부하거나 설정에서 변경하실 수 있습니다.

※ 본 동의는 선택사항이며, 동의하지 않으셔도 서비스 이용은 가능합니다.
`,
  ];
  const isAllAgreed =
    agreements[0] && agreements[1] && agreements[2] && agreements[3];

  function handleScroll() {
    const isMobile = window.innerWidth < 640;
    if (!isMobile) {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight, // 문서 전체 높이
        left: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="w-full text-left">
        <p className="font-semibold text-lg">아래 약관에 동의해주세요</p>
        <p className="font-light text-sm text-theme-gray">
          가입을 위해 약관에 동의가 필요합니다
        </p>
      </div>
      <div className="w-full">
        <button
          className={`w-full font-medium ${
            isAllAgreed ? "bg-theme text-white" : "bg-[#e6e6e6] text-[#a6a6a6]"
          } rounded-sm px-3 py-1.5`}
          onClick={() => {
            setAgreements(Array(5).fill(true));
            handleScroll();
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 -translate-y-1/2 left-1 scale-90">
              <CheckIcon fill="white" />
            </div>
            <p>전체 약관에 동의합니다</p>
          </div>
        </button>
        <div
          ref={scrollContainerRef}
          className="flex flex-col gap-4 sm:h-80 overflow-y-scroll mt-6 [&::-webkit-scrollbar]:hidden"
        >
          {/* 이 영역 스크롤 */}
          {contents.map((content, idx) => (
            <Term
              key={idx}
              title={titles[idx]}
              content={content}
              isAgreed={agreements[idx]}
              handleAgreement={() =>
                setAgreements((prev) =>
                  prev.map((agreement, i) => {
                    if (i === idx) {
                      return !agreement;
                    } else {
                      return agreement;
                    }
                  })
                )
              }
            />
          ))}

          <NextStepButton disabled={!isAllAgreed} onClick={handleNextStep}>
            다음
          </NextStepButton>
        </div>
      </div>
    </div>
  );
}

type TermProps = {
  title: string;
  content: string;
  isAgreed: boolean;
  handleAgreement: () => void;
};

function Term({ title, content, isAgreed, handleAgreement }: TermProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex gap-1.5 items-center cursor-pointer"
        onClick={handleAgreement}
      >
        <div className="scale-80">
          <CheckIcon fill={isAgreed ? "var(--theme)" : "#b3b3b3"} />
        </div>
        <p className="font-medium text-sm">{title}</p>
      </div>
      <pre
        className="font-[inherit] text-xs text-theme/50
        rounded-sm border border-theme w-full h-25 p-2 whitespace-pre-wrap
        overflow-auto
        [&::-webkit-scrollbar]:w-0.5
        [&::-webkit-scrollbar]:h-auto
        [&::-webkit-scrollbar-thumb]:bg-theme/85
        [&::-webkit-scrollbar-thumb]:rounded
        [&::-webkit-scrollbar-thumb]:[background-clip:content-box]
        "
      >
        {content}
      </pre>
    </div>
  );
}
