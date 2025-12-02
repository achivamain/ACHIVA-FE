"use client";

type TwoElementsButtonProps = {
  firstButtonText: string;
  secondButtonText: string;
  onFirstClick?: () => void;
  onSecondClick?: () => void;
  className?: string;
};

export default function TwoElementsButton({
  firstButtonText,
  secondButtonText,
  onFirstClick,
  onSecondClick,
  className = "",
}: TwoElementsButtonProps) {
  return (
    <div
      className={`w-[152px] h-[70px] bg-white rounded-[5px] shadow-[0px_0px_14.3px_rgba(0,0,0,0.05),0px_4px_4px_rgba(0,0,0,0.25)] flex flex-col ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onFirstClick}
        className="flex-1 flex items-center justify-center text-[16px] leading-[19px] font-medium text-[#412A2A] hover:bg-gray-50 rounded-t-[5px]"
      >
        {firstButtonText}
      </button>
      <div className="w-full h-[0.9px] bg-[#E6E6E6]" />
      <button
        onClick={onSecondClick}
        className="flex-1 flex items-center justify-center text-[16px] leading-[19px] font-semibold text-[#DF171B] hover:bg-gray-50 rounded-b-[5px]"
      >
        {secondButtonText}
      </button>
    </div>
  );
}

