"use client";

import {
  ThumbUpCheerIcon,
  FireCheerIcon,
  HeartCheerIcon,
  CloverCheerIcon,
} from "@/components/Icons";
import type { Cheering } from "@/types/responses";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { useAnimate } from "motion/react";

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

  const labels = useMemo(
    () => ["최고예요", "수고했어요", "응원해요", "동기부여"],
    []
  );
  const icons = [
    ThumbUpCheerIcon,
    FireCheerIcon,
    HeartCheerIcon,
    CloverCheerIcon,
  ];

  const initialCheeringsState = labels.reduce<
    Record<
      string,
      { active: boolean; id: number | undefined; isPending: boolean }
    >
  >((acc, label) => {
    acc[label] = {
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
    const newCheeringsState = labels.reduce<
      Record<
        string,
        { active: boolean; id: number | undefined; isPending: boolean }
      >
    >((acc, label) => {
      const cheering = cheerings.find(
        (cheering) =>
          cheering.cheeringCategory === label &&
          cheering.senderId === currentUserId
      );
      acc[label] = {
        active: !!cheering,
        id: cheering?.id ?? undefined,
        isPending: false,
      };
      return acc;
    }, {});
    setCheeringsState(newCheeringsState);
  }, [cheerings, currentUserId, labels]);

  // gap-1.5
  return (
    <div
      className="flex gap-1.5 sm:gap-2 items-center justify-center py-3.5"
      ref={scope}
    >
      {labels.map((label, idx) => {
        const active = cheeringsState[label].active;
        const pending = cheeringsState[label].isPending;
        const Icon = icons[idx];
        return (
          <button
            id={label}
            disabled={pending}
            onClick={async () => {
              setCheeringsState((prev) => ({
                ...prev,
                [label]: {
                  ...prev[label],
                  active: !prev[label].active,
                  isPending: true,
                },
              }));

              if (active) {
                // 이미 눌렀으면 취소
                await fetch(
                  `/api/cheerings?postId=${postId}&cheeringId=${cheeringsState[label].id}`,
                  {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                  }
                );
              } else {
                // 누르기
                animate(
                  `#${label}`,
                  { scale: [1, 1.07, 1.1, 1] },
                  { duration: 0.3 }
                );
                const res = await fetch("/api/cheerings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    postId,
                    cheeringType: label,
                  }),
                });
                const id = (await res.json()).data.id;
                setCheeringsState((prev) => ({
                  ...prev,
                  [label]: { ...prev[label], id },
                }));
              }
              setCheeringsState((prev) => ({
                ...prev,
                [label]: { ...prev[label], isPending: false },
              }));
            }}
            key={label}
            className={`text-[15px] sm:text-base flex items-center gap-[2px] sm:gap-1 rounded-full border border-theme px-1.5 sm:px-3 py-1 ${
              active ? "bg-theme text-white" : ""
            }`}
          >
            <p>{label}</p>
            {<Icon active={active} />}
          </button>
        );
      })}
    </div>
  );
}
