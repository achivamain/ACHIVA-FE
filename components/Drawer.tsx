// 사이드바에서 열리는 drawer
"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BackIcon } from "./Icons";
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
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  );

  useEffect(() => {
    // 현재 스크롤바 너비 계산
    const sbw = window.innerWidth - document.documentElement.clientWidth;

    // 기존 스타일 백업
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    // 스크롤 잠금 + 우측 패딩 보정
    document.body.style.overflow = "hidden";
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncViewport = () => setIsMobile(mediaQuery.matches);
    syncViewport();

    function handleClickOutSide(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a") || !drawerRef.current?.contains(target)) {
        onClose();
      }
    }

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
    } else {
      mediaQuery.addListener(syncViewport);
    }
    document.addEventListener("click", handleClickOutSide);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", syncViewport);
      } else {
        mediaQuery.removeListener(syncViewport);
      }
      document.removeEventListener("click", handleClickOutSide);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-white lg:inset-y-0 lg:left-20 lg:right-0 lg:bg-black/50">
      <motion.div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        initial={isMobile ? { x: 56, opacity: 0.96 } : { x: -448, opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={isMobile ? { x: 56, opacity: 0.96 } : { x: -448, opacity: 0.5 }}
        transition={{
          duration: isMobile ? 0.22 : 0.3,
          ease: "easeOut",
        }}
        style={{
          boxShadow: isMobile
            ? "none"
            : "111px 0 31px 0 rgba(0, 0, 0, 0.00), 71px 0 28px 0 rgba(0, 0, 0, 0.01), 40px 0 24px 0 rgba(0, 0, 0, 0.03), 18px 0 18px 0 rgba(0, 0, 0, 0.04), 4px 0 10px 0 rgba(0, 0, 0, 0.05)",
        }}
        className="flex h-full w-full flex-col bg-white overflow-hidden lg:h-dvh lg:w-md lg:rounded-r-[28px]"
      >
        <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
          <div className="relative flex items-center px-3 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] lg:px-5 lg:py-5">
            <button
              type="button"
              onClick={onClose}
              aria-label="뒤로가기"
              className="flex size-11 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <BackIcon />
            </button>
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-semibold tracking-[-0.03em] text-theme lg:static lg:pointer-events-auto lg:translate-x-0 lg:text-2xl lg:font-bold">
              {title}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col px-5 pb-8 pt-4 lg:px-5 lg:pb-5 lg:pt-0">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
