"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { consumeQueuedToast } from "@/lib/queuedToast";

function SuccessToastIcon() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF7F0] text-[#2F6B47] ring-1 ring-[#D6E7DB]">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3.5 8.3L6.4 11.2L12.5 5.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function AppToaster() {
  const pathname = usePathname();

  useEffect(() => {
    const queuedToast = consumeQueuedToast();

    if (!queuedToast) {
      return;
    }

    const { message, description, type = "success" } = queuedToast;
    toast[type](message, description ? { description } : undefined);
  }, [pathname]);

  return (
    <Toaster
      theme="light"
      position="top-center"
      closeButton={false}
      visibleToasts={3}
      gap={10}
      duration={2400}
      offset={{ top: 24, left: 24, right: 24 }}
      mobileOffset={{
        top: "calc(env(safe-area-inset-top) + 1rem)",
        left: "1rem",
        right: "1rem",
      }}
      icons={{
        success: <SuccessToastIcon />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "font-[family:var(--font-pretendard)] rounded-[18px] border border-[#E9E2DA] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(251,247,242,0.98)_100%)] px-4 py-2 text-[#332B25] shadow-[0_14px_28px_rgba(65,42,42,0.12)] backdrop-blur-md",
          title: "text-[14px] font-semibold tracking-[-0.01em] text-[#332B25]",
          description: "text-[13px] leading-5 tracking-[-0.01em] text-[#7A6F65]",
          success:
            "border-[#D8E7DD] bg-[linear-gradient(180deg,rgba(251,255,252,0.98)_0%,rgba(244,250,245,0.98)_100%)] text-[#2F6B47]",
          content: "gap-1 pr-1",
          icon:
            "!h-8 !w-8 shrink-0 items-center justify-center !ml-0 !mr-3 self-start",
        },
      }}
    />
  );
}
