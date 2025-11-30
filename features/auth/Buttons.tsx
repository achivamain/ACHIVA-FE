import { LoadingIcon } from "@/components/Icons";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = {
  isLoading?: boolean;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function NextStepButton({
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className="flex items-center justify-center w-full font-medium text-white bg-theme rounded-sm px-3 py-2 h-9 disabled:bg-[#e6e6e6] disabled:text-[#a6a6a6]"
    >
      {isLoading ? <LoadingIcon /> : children}
    </button>
  );
}
