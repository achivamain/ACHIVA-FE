import type { CheerPoint } from "@/types/responses";
import { cheeringMeta } from "../post/cheeringMeta";

export default function Cheers({
  type,
  cheers,
}: {
  type: "받은" | "보낸";
  cheers: CheerPoint[];
}) {
  const totalPoints = cheers.reduce((acc, cheer) => cheer.points + acc, 0);
  const types = Object.keys(cheeringMeta) as (keyof typeof cheeringMeta)[];
  return (
    <div className="w-full flex flex-col gap-15 sm:gap-10">
      <div>
        <h2 className="font-semibold text-2xl text-theme/70">
          {type} 응원 포인트
        </h2>
        <p className="mt-1 text-theme font-extrabold text-4xl">{totalPoints}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xl font-bold">{type} 응원 버튼</p>

        <ul className="flex flex-col gap-4 p-6 border border-gray-200 rounded-lg">
          {types.map((type) => {
            return (
              <li key={type} className="flex justify-between py-2">
                <p className="font-bold text-lg text-theme">
                  {cheeringMeta[type].label}
                </p>
                <p className="text-theme font-semibold">
                  {cheers.find((cheer) => {
                    return cheer.cheeringCategory === type;
                  })?.points ?? 0}{" "}
                  points
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
