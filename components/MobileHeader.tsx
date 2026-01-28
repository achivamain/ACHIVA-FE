"use client";
// 모바일용 헤더 - 모바일에서만 보임

import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/Icons";

type Props = {
  children: React.ReactNode;
  onClick?: () => void | undefined;
};

export default function MobileHeader({ children, onClick = undefined }: Props) {
  const router = useRouter();

  return (
    <div className="relative bg-white w-full h-14 mb-5 flex items-center justify-center border-b border-b-[#cccccc] z-50">
      <div
        className="absolute top left-4 scale-80 hover:cursor-pointer"
        onClick={onClick ?? router.back}
      >
        <BackIcon />
      </div>
      <div className="font-semibold flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
