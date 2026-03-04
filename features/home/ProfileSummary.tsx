// 프로필 요약 정보 컴포넌트

type SummaryCardProps = {
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

// 모바일용 개별 정보 카드
const MobileSummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  value,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col flex-1 items-center gap-3 min-h-[120px] min-w-[120px] bg-white rounded-[16px] py-4 px-4 shadow-[4px_4px_10px_0px_rgba(51,38,174,0.04)]">
      <div className="w-11 h-14 text-[43px] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-row flex-wrap items-end justify-center gap-1">
        <h3 className="font-semibold text-[18px] text-black">
          {value.toLocaleString()}
        </h3>
        <span className="text-[#727E8F] whitespace-nowrap">{title}</span>
      </div>
      <p className="font-semibold text-[11px] text-[#9A9C9F]">{description}</p>
    </div>
  );
};

// 웹용 개별 정보 카드
const WebSummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  value,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col flex-1 items-center gap-3 w-full max-w-[844px] min-h-[120px] min-w-[120px] bg-white rounded-[16px] py-4 px-6 shadow-[4px_4px_10px_0px_rgba(51,38,174,0.04)]">
      <div className="w-11 h-14 text-[43px] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-row items-end justify-center gap-1">
        <h3 className="font-semibold text-[18px] text-black">
          {value.toLocaleString()}
        </h3>
        <span className="text-[#727E8F] ">{title}</span>
      </div>
      <p className="font-semibold text-[11px] text-[#9A9C9F]">{description}</p>
    </div>
  );
};

// 모바일 전체 영역
export const MobileProfileSummary: React.FC<ProfileSummaryProps> = ({
  summaryData,
}) => {
  return (
    <div
      className="flex flex-row gap-[15px] overflow-x-auto"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <MobileSummaryCard
        icon="📚"
        value={summaryData.letters}
        title="글자"
        description="쌓아올린 운동 기록"
      />
      <MobileSummaryCard
        icon="🎯"
        value={summaryData.count}
        title="횟수"
        description="목표를 향한 열정"
      />
      <MobileSummaryCard
        icon="💖"
        value={summaryData.points}
        title="포인트"
        description="사람들과 나눈 응원"
      />
    </div>
  );
};

// 웹 전체 영역
export const WebProfileSummary: React.FC<ProfileSummaryProps> = ({
  summaryData,
}) => {
  return (
    <div className="flex flex-row gap-[15px] px-5">
      <WebSummaryCard
        icon="📚"
        value={summaryData.letters}
        title="글자"
        description="쌓아올린 운동 기록"
      />
      <WebSummaryCard
        icon="🎯"
        value={summaryData.count}
        title="횟수"
        description="목표를 향한 열정"
      />
      <WebSummaryCard
        icon="💖"
        value={summaryData.points}
        title="포인트"
        description="사람들과 나눈 응원"
      />
    </div>
  );
};

// 하위 호환성을 위한 별칭 (기존 import 유지)
export const MobileGoalSummary = MobileProfileSummary;
export const WebGoalSummary = WebProfileSummary;

// 기본 export는 웹용으로 유지
export default WebProfileSummary;
