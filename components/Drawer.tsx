// 사이드바에서 열리는 drawer
"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
// import { createPortal } from "react-dom";

type ModalProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Drawer({
  title = null,
  children,
  onClose,
}: ModalProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 현재 스크롤바 너비 계산
    const sbw = window.innerWidth - document.documentElement.clientWidth;

    // 기존 스타일 백업
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    // 스크롤 잠금 + 우측 패딩 보정
    document.body.style.overflow = "hidden";
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

    function handleClickOutSide(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a") || !drawerRef.current?.contains(target)) {
        onClose();
      }
    }

    document.addEventListener("click", handleClickOutSide);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.removeEventListener("click", handleClickOutSide);
    };
  }, [onClose]);

  return (
    <div className="fixed left-0 lg:left-21 h-dvh top-0 w-screen lg:w-[calc(100vw-21)] z-50 flex justify-start bg-black/50 overflow-hidden">
      <motion.div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        initial={{ x: -448, opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -448, opacity: 0.5 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        style={{
          boxShadow:
            "111px 0 31px 0 rgba(0, 0, 0, 0.00), 71px 0 28px 0 rgba(0, 0, 0, 0.01), 40px 0 24px 0 rgba(0, 0, 0, 0.03), 18px 0 18px 0 rgba(0, 0, 0, 0.04), 4px 0 10px 0 rgba(0, 0, 0, 0.05)",
        }}
        className="rounded-r-lg bg-white overflow-hidden w-md"
      >
        <div className="flex flex-col h-full p-5 overflow-auto">
          <div className="font-bold text-2xl text-theme mb-5 w-full text-left">
            {title}
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
