"use client";

import type { Cheering } from "@/types/responses";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { useAnimate } from "motion/react";
import { cheeringMeta } from "./cheeringMeta";

export default function CheerBtns({
  postId,
  cheerings = [],
}: {
  postId: string;
  cheerings?: Cheering[];
}) {
  const [scope, animate] = useAnimate();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // useMemo 안쓰면 랜더링 오류 나서 넣음
  const types = useMemo(
    () => Object.keys(cheeringMeta) as (keyof typeof cheeringMeta)[],
    [],
  );
  const initialCheeringsState = types.reduce<
    Record<
      string,
      { active: boolean; id: number | undefined; isPending: boolean }
    >
  >((acc, type) => {
    acc[type] = {
      active: false,
      id: undefined,
      isPending: true,
    };
    return acc;
  }, {});

  const [cheeringsState, setCheeringsState] = useState(initialCheeringsState);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }
    const newCheeringsState = types.reduce<
      Record<
        string,
        { active: boolean; id: number | undefined; isPending: boolean }
      >
    >((acc, type) => {
      const cheering = cheerings.find(
        (cheering) =>
          cheering.cheeringCategory === type &&
          cheering.senderId === currentUserId,
      );
      acc[type] = {
        active: !!cheering,
        id: cheering?.id ?? undefined,
        isPending: false,
      };
      return acc;
    }, {});
    setCheeringsState(newCheeringsState);
  }, [cheerings, currentUserId, types]);

  return (
    <div
      className="flex flex-nowrap w-full gap-[2px] sm:gap-2 items-center justify-center py-1 sm:py-3.5 overflow-hidden"
      ref={scope}
    >
      {types.map((type) => {
        const active = cheeringsState[type].active;
        const pending = cheeringsState[type].isPending;
        const Icon = cheeringMeta[type].icon;
        const color = cheeringMeta[type].color;
        return (
          <button
            id={type}
            onClick={async () => {
              if (pending) return;

              const prevState = cheeringsState[type];

              if (active) {
                // 낙관적 업데이트: 즉시 비활성화
                setCheeringsState((prev) => ({
                  ...prev,
                  [type]: { active: false, id: undefined, isPending: true },
                }));
                try {
                  const res = await fetch(
                    `/api/cheerings?postId=${postId}&cheeringId=${prevState.id}`,
                    {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                    },
                  );
                  if (!res.ok) throw new Error("응원 취소 실패");
                  setCheeringsState((prev) => ({
                    ...prev,
                    [type]: { ...prev[type], isPending: false },
                  }));
                } catch (err) {
                  console.error(err);
                  setCheeringsState((prev) => ({
                    ...prev,
                    [type]: { ...prevState, isPending: false },
                  }));
                }
              } else {
                // 낙관적 업데이트: 즉시 활성화
                animate(
                  `#${type}`,
                  { scale: [1, 1.07, 1.1, 1] },
                  { duration: 0.3 },
                );
                setCheeringsState((prev) => ({
                  ...prev,
                  [type]: { active: true, id: undefined, isPending: true },
                }));
                try {
                  const res = await fetch("/api/cheerings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      postId,
                      cheeringType: type,
                    }),
                  });
                  if (!res.ok) throw new Error("응원 실패");
                  const id = (await res.json()).data.id;
                  setCheeringsState((prev) => ({
                    ...prev,
                    [type]: { active: true, id, isPending: false },
                  }));
                } catch (err) {
                  console.error(err);
                  setCheeringsState((prev) => ({
                    ...prev,
                    [type]: { ...prevState, isPending: false },
                  }));
                }
              }
            }}
            key={type}
            style={
              active
                ? {
                    backgroundColor: color,
                    borderColor: color,
                    color: "#fff",
                    boxShadow: `0 4px 12px ${color}40`,
                  }
                : { color: "#6B7280" }
            }
            className={`group flex-1 flex justify-center items-center gap-1 sm:gap-1.5 rounded-full border py-1.5 sm:py-2 px-1 min-[400px]:px-2 text-[11px] min-[375px]:text-[12px] min-[430px]:text-[14px] sm:text-[16px] font-medium transition-all duration-300 ${
              active
                ? "border-transparent text-white"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
            } cursor-pointer`}
          >
            <div
              className={`transition-transform duration-300 shrink-0 ${active ? "scale-110" : "group-hover:scale-110 grayscale opacity-70"}`}
            >
              <Icon active={active} />
            </div>
            <p className="whitespace-nowrap truncate">{type}</p>
          </button>
        );
      })}
    </div>
  );
}
