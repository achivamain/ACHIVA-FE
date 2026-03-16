import type { Moim } from "@/types/moim";

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
        src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop"
        alt={moim.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 flex flex-col justify-end">
        <span className="bg-theme text-white text-[10px] font-bold px-2 py-1 rounded w-max mb-2">
          OFFICIAL
        </span>
        <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">
          {moim.name}
        </h3>
        <p className="text-gray-200 text-xs line-clamp-2 mb-2">
          {moim.description}
        </p>
        <div className="flex items-center text-white text-xs font-medium">
          <span className="mr-1">👤</span>
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
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700 p-5 flex flex-col justify-end">
        <span className="bg-theme text-white text-[10px] font-bold px-2 py-1 rounded w-max mb-2">
          MY CREW
        </span>
        <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">
          {moim.name}
        </h3>
        <p className="text-gray-200 text-xs line-clamp-2 mb-2">
          {moim.description}
        </p>
        <div className="flex justify-between items-center text-white text-xs font-medium">
          <span className="flex items-center bg-gray-800/80 px-2 py-1 -my-1 rounded-full">
            <span className="mr-1">👤</span> {moim.memberCount} /{" "}
            {moim.maxMember}
          </span>
          <span className="bg-gray-800/80 px-2 py-1 -my-1 rounded-full border border-gray-700">
            👑 {moim.leaderName}
          </span>
        </div>
      </div>
    </div>
  );
}
