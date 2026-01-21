"use client";

import type { Cheering } from "@/types/responses";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { useAnimate } from "motion/react";
import { cheeringMeta } from "./cheeringMeta";
import { sendCheerNotification } from "@/lib/pushNotification";

export default function CheerBtns({
  postId,
  cheerings = [],
  authorId,
  authorNickName,
}: {
  postId: string;
  cheerings?: Cheering[];
  authorId: string; 
  authorNickName?: string;
}) {
  const [scope, animate] = useAnimate();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // useMemo 안쓰면 랜더링 오류 나서 넣음
  const types = useMemo(
    () => Object.keys(cheeringMeta) as (keyof typeof cheeringMeta)[],
    []
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
          cheering.senderId === currentUserId
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
              setCheeringsState((prev) => ({
                ...prev,
                [type]: {
                  ...prev[type],
                  active: !prev[type].active,
                  isPending: true,
                },
              }));

              if (active) {
                // 이미 눌렀으면 취소
                await fetch(
                  `/api/cheerings?postId=${postId}&cheeringId=${cheeringsState[type].id}`,
                  {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                  }
                );
              } else {
                // 누르기
                animate(
                  `#${type}`,
                  { scale: [1, 1.07, 1.1, 1] },
                  { duration: 0.3 }
                );
                const res = await fetch("/api/cheerings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    postId,
                    cheeringType: type,
                  }),
                });
                const id = (await res.json()).data.id;
                setCheeringsState((prev) => ({
                  ...prev,
                  [type]: { ...prev[type], id },
                }));

                // 앱에 응원 알림 전송 (postMessage)
                if (session?.access_token && currentUserId) {
                  sendCheerNotification(session.access_token, {
                    postId,
                    cheeringType: type,
                    senderId: currentUserId,
                    senderNickName: session.user?.nickName,
                    receiverId: authorId,
                    receiverNickName: authorNickName,
                  });
                }
              }
              setCheeringsState((prev) => ({
                ...prev,
                [type]: { ...prev[type], isPending: false },
              }));
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
