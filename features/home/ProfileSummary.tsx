// 프로필 요약 정보 컴포넌트
// TODO: API 연결 아직 안 되었음

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
    <div className="flex items-center gap-3 w-full min-h-[88px] bg-white border border-[#E6E6E6] rounded-lg py-4 px-4">
      <div className="w-11 h-14 text-[43px] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-[18px] text-black">
          {value.toLocaleString()} {title}
        </h3>
        <p className="font-light text-[15px] text-[#808080]">{description}</p>
      </div>
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
    <div className="flex items-center gap-6 w-full max-w-[844px] min-h-[88px] bg-white border-0 border-[#E4E4E4] rounded-[10px] py-4 px-6 sm:border">
      <div className="w-11 h-14 text-[43px] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-['Pretendard'] font-semibold text-[18px] text-black">
          {value.toLocaleString()} {title}
        </h3>
        <p className="font-['Pretendard'] font-light text-[15px] text-[#808080]">
          {description}
        </p>
      </div>
    </div>
  );
};

// 모바일 전체 영역
export const MobileProfileSummary: React.FC<ProfileSummaryProps> = ({
  summaryData,
}) => {
  return (
    <div className="flex flex-col gap-3 px-5">
      <MobileSummaryCard
        icon="📚"
        value={summaryData.letters}
        title="글자"
        description="올해 쌓아올린 성취 기록"
      />
      <MobileSummaryCard
        icon="🎯"
        value={summaryData.count}
        title="횟수"
        description="올해 나에게 건넨 응원"
      />
      <MobileSummaryCard
        icon="💖"
        value={summaryData.points}
        title="포인트"
        description="올해 사람들과 나눈 응원"
      />
    </div>
  );
};

// 웹 전체 영역
export const WebProfileSummary: React.FC<ProfileSummaryProps> = ({
  summaryData,
}) => {
  return (
    <div className="flex flex-col gap-2 px-5 sm:gap-4">
      <WebSummaryCard
        icon="📚"
        value={summaryData.letters}
        title="글자"
        description="올해 쌓아올린 성취 기록"
      />
      <WebSummaryCard
        icon="🎯"
        value={summaryData.count}
        title="횟수"
        description="올해 나에게 건넨 응원"
      />
      <WebSummaryCard
        icon="💖"
        value={summaryData.points}
        title="포인트"
        description="올해 사람들과 나눈 응원"
      />
    </div>
  );
};

// 하위 호환성을 위한 별칭 (기존 import 유지)
export const MobileGoalSummary = MobileProfileSummary;
export const WebGoalSummary = WebProfileSummary;

// 기본 export는 웹용으로 유지
export default WebProfileSummary;

