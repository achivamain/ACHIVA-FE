// 회원가입 단계에서 위에 점 6개 처리하는 컴포넌트

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps?: number;
};

export default function ProgressIndicator({
  currentStep,
  totalSteps = 6,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 w-[132px] h-3">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;

        return (
          <div
            key={stepNumber}
            className={`w-3 h-3 rounded-full border border-[#412A2A] transition-colors duration-200 ${
              isActive ? "bg-[#412A2A]" : "bg-transparent"
            }`}
          />
        );
      })}
    </div>
  );
}


