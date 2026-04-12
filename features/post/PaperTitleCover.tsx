import {
  DEFAULT_POST_PAGE_BACKGROUND,
  getPostPageTone,
} from "@/lib/postPageTheme";

type Props = {
  title: React.ReactNode;
  dateLabel?: string;
  metaLabel?: string;
  weeklyCount?: number | null;
  streakWeeks?: number | null;
};

export default function PaperTitleCover({
  title,
  dateLabel,
  metaLabel,
  weeklyCount,
  streakWeeks,
}: Props) {
  const tone = getPostPageTone(DEFAULT_POST_PAGE_BACKGROUND);
  const paperCoverSurface = {
    backgroundColor: "#F6EEE3",
    backgroundImage:
      "radial-gradient(circle at 18% 16%, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0) 32%), radial-gradient(circle at 84% 84%, rgba(233, 205, 178, 0.28) 0%, rgba(233,205,178,0) 30%), linear-gradient(160deg, #FBF6F0 0%, #F6EEE3 58%, #EEDDCC 100%)",
  };

  return (
    <div
      style={paperCoverSurface}
      className={`relative aspect-square w-[390px] h-[390px] overflow-hidden ${tone.shellTextClassName}`}
    >
      <div
        className="absolute -left-[30px] top-[18px] h-[130px] w-[130px] rounded-full blur-[42px]"
        style={{ background: "rgba(244, 223, 201, 0.38)" }}
      />
      <div
        className="absolute bottom-[30px] right-[6px] h-[150px] w-[150px] rounded-full blur-[52px]"
        style={{ background: "rgba(234, 202, 172, 0.32)", opacity: 0.9 }}
      />

      <div className="absolute inset-x-[20px] top-[34px] z-10">
        <div className="min-h-[54px]">{title}</div>
      </div>

      <div
        className="absolute left-[20px] right-[20px] top-[94px] h-px"
        style={{ background: "rgba(149, 118, 95, 0.13)" }}
      />

      {(weeklyCount && weeklyCount > 0) || (streakWeeks && streakWeeks >= 2) ? (
        <div className="absolute bottom-[72px] left-[20px] right-[20px] z-10 flex flex-wrap gap-[8px]">
          {weeklyCount && weeklyCount > 0 ? (
            <div
              className="flex items-center gap-[6px] rounded-full px-[11px] py-[5px]"
              style={{
                background: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(120,112,104,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="text-[13px] leading-none">
                {Array.from({ length: Math.min(weeklyCount, 7) }, (_, i) => (
                  <span key={i}>🔥</span>
                ))}
              </span>
              <span className="text-[12px] font-semibold text-[#6A625D]">
                이번 주 {weeklyCount}회
              </span>
            </div>
          ) : null}

          {streakWeeks && streakWeeks >= 2 ? (
            <div
              className="flex items-center gap-[5px] rounded-full px-[11px] py-[5px]"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(120,112,104,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="text-[13px] leading-none">⚡</span>
              <span className="text-[12px] font-bold text-[#6A625D]">
                {streakWeeks}주 연속 달성
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {(dateLabel || metaLabel) && (
        <div className="absolute bottom-[22px] left-[20px] right-[20px] z-10 flex items-end justify-between gap-4">
          <span className="text-[12px] font-medium tracking-[0.1em] text-[#8E837A]">
            {dateLabel}
          </span>
          <span className="text-right text-[13px] font-medium text-[#8E837A]">
            {metaLabel}
          </span>
        </div>
      )}
    </div>
  );
}
