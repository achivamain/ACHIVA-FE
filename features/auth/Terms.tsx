"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSignupStepStore } from "@/store/SignupStore";
import {
  CheckSquareIcon,
  CaretRight25pxIcon,
  CheckAllIcon,
} from "@/components/Icons";

// 약관 데이터 Type 
type TermItem = {
  id: number;
  title: string;
  content: string;
  required: boolean;
};

// 필수 약관
const requiredTerms: TermItem[] = [
  {
    id: 1,
    title: "서비스 이용약관 동의",
    required: true,
    content: `제1조 (목적)
이 약관은 ACHIVA(이하 '회사'라 합니다)가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 회사의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.
2. "회원"이란 회사에 개인정보를 제공하고 이용계약을 체결한 자를 말합니다.

제3조 (약관의 효력 및 변경)
1. 회사는 본 약관의 내용을 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력을 발생합니다.
2. 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있습니다.

※ 전체 약관은 [홈페이지 약관 링크]에서 확인하실 수 있습니다.`,
  },
  {
    id: 2,
    title: "개인정보 수집 및 이용 동의",
    required: true,
    content: `[개인정보 수집 및 이용에 대한 동의]

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

※ 위의 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 필수 항목 미동의 시 서비스 이용이 제한될 수 있습니다.`,
  },
  {
    id: 3,
    title: "커뮤니티 가이드라인 동의",
    required: true,
    content: `[커뮤니티 가이드라인 동의]

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

※ 커뮤니티는 모두가 함께 만들어가는 공간입니다. 서로를 존중하며 사용해 주세요.`,
  },
  {
    id: 4,
    title: "개인정보 처리 위탁 동의",
    required: true,
    content: `[개인정보 처리 위탁 동의]

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

※ 본 동의는 서비스 이용에 필수적이며, 동의하지 않으실 경우 회원가입이 제한될 수 있습니다.`,
  },
];

// 선택 약관
const optionalTerms: TermItem[] = [
  {
    id: 100,
    title: "마케팅 정보 수신 동의",
    required: false,
    content: `[마케팅 정보 수신 동의 안내]

회사는 이용자에게 보다 나은 서비스 및 혜택 정보를 제공하기 위해, 마케팅 목적의 정보를 전송할 수 있습니다.

1. 수신 항목
- 이벤트, 프로모션, 할인 혜택, 신규 서비스 안내 등

2. 수신 방법
- 이메일, 문자(SMS), 앱 푸시 등

3. 보유 및 이용 기간
- 동의일로부터 회원 탈퇴 또는 동의 철회 시까지

4. 동의 철회
- 언제든지 마케팅 정보 수신을 거부하거나 설정에서 변경하실 수 있습니다.

※ 본 동의는 선택사항이며, 동의하지 않으셔도 서비스 이용은 가능합니다.`,
  },
];

export default function Terms() {
  const handleNextStep = useSignupStepStore.use.handleNextStep();

  // 동의 상태 관리
  const [agreements, setAgreements] = useState<Record<string, boolean>>({
    service: false,
    privacy: false,
    community: false,
    delegation: false,
    marketing: false,
  });

  // 약관 상세 보기 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<TermItem | null>(null);

  // 필수 약관 모두 동의 여부
  const allRequiredAgreed = requiredTerms.every((term) => agreements[term.id]);

  // 전체 동의 여부
  const allAgreed = [...requiredTerms, ...optionalTerms].every(
    (term) => agreements[term.id]
  );

  // 전체 동의 토글
  const handleAllAgree = () => {
    const newValue = !allAgreed;
    const newAgreements: Record<string, boolean> = {};
    [...requiredTerms, ...optionalTerms].forEach((term) => {
      newAgreements[term.id] = newValue;
    });
    setAgreements(newAgreements);
  };

  // 개별 동의 토글
  const handleToggle = (id: string) => {
    setAgreements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 약관 상세 보기 열기
  const handleOpenDetail = (term: TermItem) => {
    setSelectedTerm(term);
    setModalOpen(true);
  };

  // 약관 상세 보기 닫기
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTerm(null);
  };

  return (
    <div className="flex flex-col w-full bg-white">

      {/* 헤더 섹션 */}
      <div className="flex flex-col gap-2.5 mb-8">
        <h1 className="text-2xl font-semibold text-black leading-[29px]">
          아래 약관에 동의해주세요
        </h1>
        <p className="text-[15px] font-light text-[#808080] leading-[18px]">
          가입을 위해 약관에 동의가 필요합니다
        </p>
      </div>

      {/* 전체 동의 버튼 */}
      <button
        onClick={handleAllAgree}
        className={`relative flex items-center justify-center w-full h-[50px] px-[15px] py-3 rounded-[5px] transition-colors duration-200 ${
          allAgreed ? "bg-[#412A2A]" : "bg-[#F2F2F2]"
        }`}
      >
        <div className="absolute left-[15px]">
          <CheckAllIcon checked={allAgreed} />
        </div>
        <span
          className={`text-base font-medium ${
            allAgreed ? "text-white" : "text-[#B3B3B3]"
          }`}
        >
          전체 약관에 동의합니다
        </span>
      </button>

      {/* 필수 약관 */}
      <div className="flex flex-col gap-2.5 mt-10">
        <h2 className="text-base font-semibold text-black leading-[19px]">
          필수 약관
        </h2>
        <div className="flex flex-col gap-[15px]">
          {requiredTerms.map((term) => (
            <TermRow
              key={term.id}
              term={term}
              checked={agreements[term.id]}
              onToggle={() => handleToggle(term.id.toString())}
              onDetail={() => handleOpenDetail(term)}
            />
          ))}
        </div>
      </div>

      {/* 선택 약관 */}
      <div className="flex flex-col gap-2.5 mt-10">
        <h2 className="text-base font-semibold text-black leading-[19px]">
          선택 약관
        </h2>
        <div className="flex flex-col gap-[15px]">
          {optionalTerms.map((term) => (
            <TermRow
              key={term.id}
              term={term}
              checked={agreements[term.id]}
              onToggle={() => handleToggle(term.id.toString())}
              onDetail={() => handleOpenDetail(term)}
            />
          ))}
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNextStep}
        disabled={!allRequiredAgreed}
        className={`w-full h-[50px] mt-16 rounded-[5px] text-base font-medium transition-colors duration-200 ${
          allRequiredAgreed
            ? "bg-[#412A2A] text-white"
            : "bg-[#F2F2F2] text-[#B3B3B3]"
        }`}
      >
        다음
      </button>

      {/* 약관 상세보기 처리하는 모달 */}
      <AnimatePresence>
        {modalOpen && selectedTerm && (
          <TermDetailModal term={selectedTerm} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

// 한 줄을 처리하는 컴포넌트 
type TermRowProps = {
  term: TermItem;
  checked: boolean;
  onToggle: () => void;
  onDetail: () => void;
};

function TermRow({ term, checked, onToggle, onDetail }: TermRowProps) {
  return (
    <div className="flex items-center justify-between h-[35px]">
      <button
        onClick={onToggle}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <CheckSquareIcon checked={checked} />
        <span className="text-base font-medium text-black leading-[19px]">
          {term.title}
        </span>
      </button>
      <button
        onClick={onDetail}
        className="flex items-center justify-center w-[25px] h-[25px] cursor-pointer"
      >
        <CaretRight25pxIcon />
      </button>
    </div>
  );
}

// 약관 상세 모달 컴포넌트
type TermDetailModalProps = {
  term: TermItem;
  onClose: () => void;
};

function TermDetailModal({ term, onClose }: TermDetailModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-black">{term.title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#808080] hover:text-black transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 모달 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <pre className="whitespace-pre-wrap font-[inherit] text-sm text-[#333] leading-relaxed">
            {term.content}
          </pre>
        </div>

        {/* 모달 푸터 */}
        <div className="px-5 py-4 border-t border-[#E5E5E5]">
          <button
            onClick={onClose}
            className="w-full h-[50px] bg-[#412A2A] text-white rounded-[5px] text-base font-medium"
          >
            확인
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
