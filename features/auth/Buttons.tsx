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
      className="flex items-center justify-center w-full font-medium text-base text-white bg-theme rounded-[5px] px-3 h-[50px] disabled:bg-[#e6e6e6] disabled:text-[#a6a6a6]"
    >
      {isLoading ? <LoadingIcon /> : children}
    </button>
  );
}
