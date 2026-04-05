// 회원가입 단계에서 위에 점 6개 처리하는 컴포넌트

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps?: number;
  startStep?: number;
};

export default function ProgressIndicator({
  currentStep,
  totalSteps = 6,
  startStep = 1,
}: ProgressIndicatorProps) {
  const normalizedCurrentStep = currentStep - startStep + 1;

  return (
    <div className="flex h-3 items-center justify-center gap-3">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === normalizedCurrentStep;

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
