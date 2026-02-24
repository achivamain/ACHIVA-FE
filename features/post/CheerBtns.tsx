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
      className="flex gap-1.5 sm:gap-2 items-center justify-center py-3.5"
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
            disabled={pending}
            onClick={async () => {
              try {
                setCheeringsState((prev) => ({
                  ...prev,
                  [type]: {
                    ...prev[type],
                    isPending: true,
                  },
                }));
                if (active) {
                  // 이미 눌렀으면 취소
                  const res = await fetch(
                    `/api/cheerings?postId=${postId}&cheeringId=${cheeringsState[type].id}`,
                    {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                    },
                  );
                  if (!res.ok) {
                    throw new Error("응원 취소 실패");
                  }
                  setCheeringsState((prev) => ({
                    ...prev,
                    [type]: {
                      ...prev[type],
                      active: !prev[type].active,
                      isPending: false,
                    },
                  }));
                } else {
                  // 누르기
                  animate(
                    `#${type}`,
                    { scale: [1, 1.07, 1.1, 1] },
                    { duration: 0.3 },
                  );
                  const res = await fetch("/api/cheerings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      postId,
                      cheeringType: type,
                    }),
                  });
                  if (!res.ok) {
                    throw new Error("응원 실패");
                  }
                  const id = (await res.json()).data.id;
                  setCheeringsState((prev) => ({
                    ...prev,
                    [type]: {
                      ...prev[type],
                      active: !prev[type].active,
                      id,
                      isPending: false,
                    },
                  }));
                }
              } catch (err) {
                console.error(err);
                alert("네트워크 또는 서버 오류가 발생했습니다.");
              }
            }}
            key={type}
            style={active ? { backgroundColor: color, borderColor: color } : {}}
            className={`text-[15px] sm:text-base flex items-center gap-[2px] sm:gap-1 rounded-full border px-1.5 sm:px-3 py-1 ${
              active ? "text-white" : "border-theme"
            }`}
          >
            <p className="line-clamp-1">{type}</p>
            {<Icon active={active} />}
          </button>
        );
      })}
    </div>
  );
}
