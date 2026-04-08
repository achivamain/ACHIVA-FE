import type { Moim } from "@/types/moim";
import { MemberCountIndicatorIcon } from "@/app/icons/moim";

type MoimCardProps = {
  moim: Moim;
  onClick: () => void;
};

/** score(누적 인증 횟수) 기반 온도 계산 - 상세 페이지와 동일한 공식 */
function calcTemp(moim: Moim): number {
  return Math.max(36.5, Math.min(100, 36.5 + 0.8 * (moim.score ?? 0)));
}

export function OfficialChallengeCard({ moim, onClick }: MoimCardProps) {
  const temp = calcTemp(moim);

  return (
    <div
      onClick={onClick}
      className="relative min-w-[280px] w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-md shrink-0 cursor-pointer group"
    >
      <img
        src="https://images.unsplash.com/photo-1606335543042-57c525922933?q=80&w=600&auto=format&fit=crop"
        alt={moim.name}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 p-5 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="bg-theme text-white text-[10px] font-bold px-2 py-1 rounded w-max">
            OFFICIAL
          </span>
          {moim.isPrivate && (
            <span className="text-white/90 text-sm drop-shadow-sm">🔒</span>
          )}
        </div>

        <h3 className="text-white font-bold text-lg leading-tight truncate drop-shadow-sm mb-1">
          {moim.name}
        </h3>

        <p className="text-gray-200 text-xs mb-2 drop-shadow-sm line-clamp-2">
          {moim.description}
        </p>

        <div className="mt-auto flex items-center justify-between text-white text-xs font-medium">
          <span className="flex items-center">
            <MemberCountIndicatorIcon />
            {moim.memberCount.toLocaleString()}명 참여 중
          </span>
          {/* 온도: 하단 우측, 기존 스타일과 동일한 반투명 pill */}
          <span className="bg-black/30 text-white/90 text-[11px] font-bold px-2 py-1 rounded-full border border-white/20 backdrop-blur-sm">
            🔥 {temp.toFixed(1)}°C
          </span>
        </div>
      </div>
    </div>
  );
}

export function MyCrewCard({ moim, onClick }: MoimCardProps) {
  const temp = calcTemp(moim);

  return (
    <div
      onClick={onClick}
      className="group relative h-[160px] w-[280px] min-w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#F2DDE1] bg-[#FFF7F8] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#FFF6F8_34%,#FFECEF_72%,#FFDADF_100%)] p-5">
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-lg font-bold leading-tight text-[#2F2A26]">
              {moim.name}
            </h3>
            {moim.isPrivate && (
              <span className="shrink-0 rounded-full bg-white/75 px-2 py-1 text-xs font-medium text-[#8F6B6B] ring-1 ring-[#F2DDE1]">
                🔒 비공개
              </span>
            )}
          </div>

          <p className="line-clamp-2 text-sm leading-5 text-[#8E95A9]">
            {moim.description || "모임 소개가 아직 없어요."}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="flex items-center rounded-md bg-[#FFF5F7] px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-[#F2DDE1]/80">
              <MemberCountIndicatorIcon />
              {moim.memberCount} / {moim.maxMember}
            </span>
            <span className="rounded-md bg-[#FFF2F4] px-2 py-1 text-xs font-bold text-gray-500 ring-1 ring-[#F3CDD5]/90">
              🔥 {temp.toFixed(1)}°C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
