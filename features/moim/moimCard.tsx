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
      className="group relative h-[158px] w-[272px] min-w-[272px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#EDE5DA] bg-white shadow-[0_4px_20px_rgba(160,120,80,0.09)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(160,120,80,0.16)]"
    >
      {/* 상단 오렌지 accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F4A86B] via-[#E87848] to-[#D96030] opacity-80" />

      {/* 배경 ambient orb */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#FDE8D0]/50 blur-2xl" />

      <div className="flex h-[calc(100%-4px)] flex-col p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[17px] font-extrabold leading-tight tracking-tight text-[#3A2418]">
            {moim.isPrivate && <span className="mr-1 text-sm text-[#C8A080]">🔒</span>}
            {moim.name}
          </h3>
        </div>

        <p className="flex-1 line-clamp-2 text-[12px] leading-relaxed text-[#9A8272]">
          {moim.description || "함께 은혜를 나누는 공동체"}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] text-[#A89078]">
            <MemberCountIndicatorIcon />
            <span className="font-semibold">{moim.memberCount}명</span>
          </span>
          <span className="rounded-full bg-[#FFF5EC] px-2.5 py-1 text-[12px] font-bold text-[#D06530] ring-1 ring-[#F2C89A]/60">
            🔥 {temp.toFixed(1)}°C
          </span>
        </div>
      </div>
    </div>
  );
}
