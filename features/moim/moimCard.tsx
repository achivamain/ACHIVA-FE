import type { Moim } from "@/types/moim";
import { MemberCountIndicatorIcon } from "@/app/icons/moim";

type MoimCardProps = {
  moim: Moim;
  onClick: () => void;
};

export function OfficialChallengeCard({ moim, onClick }: MoimCardProps) {
  return (
    <div
      onClick={onClick}
      className="snap-center relative min-w-[280px] w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-md shrink-0 cursor-pointer group"
    >
      <img
        src="https://images.unsplash.com/photo-1606335543042-57c525922933?q=80&w=600&auto=format&fit=crop"
        alt={moim.name}
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

        <div className="mt-auto flex items-center text-white text-xs font-medium">
          <MemberCountIndicatorIcon />
          {moim.memberCount.toLocaleString()}명 참여 중
        </div>
      </div>
    </div>
  );
}

export function MyCrewCard({ moim, onClick }: MoimCardProps) {
  return (
    <div
      onClick={onClick}
      className="snap-center relative min-w-[280px] w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-md shrink-0 cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 p-5 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="bg-orange-800 text-white text-[10px] font-bold px-2 py-1 rounded w-max shadow-sm">
            MY CREW
          </span>
          {moim.isPrivate && (
            <span className="text-orange-900 text-sm drop-shadow-sm">🔒</span>
          )}
        </div>

        <h3 className="text-white font-bold text-lg leading-tight truncate drop-shadow-sm mb-1">
          {moim.name}
        </h3>

        <p className="text-white/90 text-xs mb-2 drop-shadow-sm line-clamp-2">
          {moim.description}
        </p>

        <div className="mt-auto flex justify-between items-center text-white text-xs font-medium">
          <span className="flex items-center bg-orange-700/40 px-2 py-1 -my-1 rounded-full border border-white/20 drop-shadow-sm">
            <MemberCountIndicatorIcon />
            {moim.memberCount} / {moim.maxMember}
          </span>
          {!moim.isOfficial && (
            <span className="bg-orange-700/40 px-2 py-1 -my-1 rounded-full border border-white/20 drop-shadow-sm">
              👑 {moim.leaderName || "방장없음"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
