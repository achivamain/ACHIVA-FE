// 프로필 요약 정보 컴포넌트
// Deprecated?

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
    <div className="flex flex-col items-center justify-between min-h-[110px] bg-[#fafafa] border border-gray-100 rounded-[16px] py-3 px-2 w-full overflow-hidden">
      <div className="w-9 h-10 text-[32px] sm:text-[43px] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-0 sm:gap-1 w-full">
        <h3 className="font-semibold text-[15px] sm:text-[18px] text-black leading-tight">
          {value.toLocaleString()}
        </h3>
        <span className="text-[#727E8F] text-[11px] sm:text-[13px] whitespace-nowrap">
          {title}
        </span>
      </div>
      <p className="font-medium text-[9px] sm:text-[11px] text-[#9A9C9F] text-center leading-tight truncate w-full">
        {description}
      </p>
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
    <div className="flex flex-col flex-1 items-center gap-3 w-full max-w-[844px] min-h-[120px] min-w-[120px] bg-[#fafafa] border border-gray-100 rounded-[16px] py-4 px-6">
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

export const MobileProfileSummary: React.FC<ProfileSummaryProps> = ({
  summaryData,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-[15px] w-full">
      <MobileSummaryCard
        icon="📚"
        value={summaryData.letters}
        title="글자"
        description="쌓아올린 은혜 기록"
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
        description="쌓아올린 은혜 기록"
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
