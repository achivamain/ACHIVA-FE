// /home 경로에서 사용하는 Summary 컴포넌트 - 추후 위치 변경 예정

type GoalSummaryProps = {
  icon: string;
  value: number;
  title: string;
  description: string;
};

type ProfileSummaryProps = {
  summaryData: {
    letters: number;
    count: number;
    points: number;
  };
};

// 개별 정보 카드
const GoalSummaryCard: React.FC<GoalSummaryProps> = ({
  icon,
  value,
  title,
  description,
}) => {
  return (
    <div className="flex justify-center items-center w-full max-w-[844px] min-h-[88px] bg-white border rounded-lg md:rounded-[10px] py-4 px-4 md:px-4 md:sm:px-6 border-[#E6E6E6] md:border-[#E4E4E4]">
      <div className="flex justify-between items-center w-full gap-4">
        <div className="flex items-center gap-3 md:gap-3 md:sm:gap-6">
          <div className="w-11 h-14 text-[43px] flex items-center justify-center overflow-hidden">
            {icon}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-['Pretendard'] font-semibold text-[16px] md:text-base md:sm:text-lg text-black">
              {value.toLocaleString()} {title}
            </h3>
            <p className="font-['Pretendard'] font-light text-[13px] md:text-sm md:sm:text-[15px] text-[#808080]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 전체 영역
const GoalSummary: React.FC<ProfileSummaryProps> = ({ summaryData }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-3 md:gap-4 mb-auto px-5 md:px-4 md:sm:px-6">
      <GoalSummaryCard
        icon="📚"
        value={summaryData.letters}
        title="글자"
        description="올해 쌓아올린 성취 기록"
      />
      <GoalSummaryCard
        icon="🎯"
        value={summaryData.count}
        title="횟수"
        description="올해 나에게 건넨 응원"
      />
      <GoalSummaryCard
        icon="💖"
        value={summaryData.points}
        title="포인트"
        description="올해 사람들과 나눈 응원"
      />
    </div>
  );
};

export default GoalSummary;
