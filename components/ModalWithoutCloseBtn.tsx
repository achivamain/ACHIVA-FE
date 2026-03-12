// 패딩 없음
// 모달 바깥 누르면 닫힘
"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
// import { createPortal } from "react-dom";

type ModalProps = {
  title?: React.ReactNode;
  children: React.ReactNode; // 버튼 목록을 받음
  onClose: () => void; // 모달 닫기
};

export default function ModalWithoutCloseBtn({
  title = null,
  children,
  onClose,
}: ModalProps) {
  // useEffect(() => {
  //   // 현재 스크롤바 너비 계산
  //   const sbw = window.innerWidth - document.documentElement.clientWidth;

  //   // 기존 스타일 백업
  //   const prevOverflow = document.body.style.overflow;
  //   const prevPaddingRight = document.body.style.paddingRight;

  //   // 스크롤 잠금 + 우측 패딩 보정
  //   document.body.style.overflow = "hidden";
  //   if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

  //   return () => {
  //     document.body.style.overflow = prevOverflow;
  //     document.body.style.paddingRight = prevPaddingRight;
  //   };
  // }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{
          type: "spring",
          stiffness: 170,
          damping: 15,
          mass: 0.8,
        }}
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-lg bg-white flex flex-col text-lg text-center text-theme"
      >
        {title && (
          <div className="flex items-center justify-center relative w-full border-b border-b-[#e6e6e6]">
            <div className="py-8 font-bold w-full">{title}</div>
          </div>
        )}
        <ul className="flex-1 overflow-auto divide-y divide-[#e6e6e6]">
          {children}
        </ul>
      </motion.div>
    </div>
  );
}
