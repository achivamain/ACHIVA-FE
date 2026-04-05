"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CloseIcon, LoadingIcon, SearchIcon } from "@/components/Icons";
import { NextStepButton } from "./Buttons";
import type { User } from "@/types/User";
import type { Moim } from "@/types/moim";

export default function SignupMoimStep() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pendingMoimId, setPendingMoimId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/members/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      return (await res.json()).data as User;
    },
  });

  const { data: myMoims = [] } = useQuery({
    queryKey: ["myMoims"],
    queryFn: async () => {
      const res = await fetch("/api/moim/my");

      if (!res.ok) {
        throw new Error("Failed to fetch my moims");
      }

      return (await res.json()).data as Moim[];
    },
    enabled: !!user,
  });

  const { data: moims = [], isLoading: isMoimsLoading } = useQuery({
    queryKey: ["signupMoims", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("size", "20");

      if (debouncedSearch) {
        params.append("keyword", debouncedSearch);
      }

      const res = await fetch(`/api/moim?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Failed to fetch moims");
      }

      return (await res.json()).data.content as Moim[];
    },
    enabled: !!user,
  });

  const joinedMoimIds = myMoims.map((moim) => moim.id);

  const { mutate: joinMoim } = useMutation({
    mutationFn: async (moimId: number) => {
      const res = await fetch(`/api/moim/${moimId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "모임 가입 중 오류가 발생했습니다.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myMoims"] });
      queryClient.invalidateQueries({ queryKey: ["moims"] });
      goHome();
    },
    onError: (error) => {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "모임 가입 중 오류가 발생했습니다.",
      );
    },
    onSettled: () => {
      setPendingMoimId(null);
    },
  });

  function goHome() {
    if (user?.nickName) {
      router.replace(`/${encodeURIComponent(user.nickName)}/home`);
      return;
    }

    router.replace("/processing");
  }

  function getActionState(moim: Moim) {
    if (joinedMoimIds.includes(moim.id)) {
      return {
        disabled: true,
        label: "가입됨",
        className: "bg-[#EFEAE5] text-[#9B8E8E]",
      };
    }

    if (moim.isPrivate) {
      return {
        disabled: true,
        label: "비공개 모임",
        className: "bg-[#EFEAE5] text-[#9B8E8E]",
      };
    }

    if (!moim.isOfficial && moim.memberCount >= moim.maxMember) {
      return {
        disabled: true,
        label: "정원 마감",
        className: "bg-[#EFEAE5] text-[#9B8E8E]",
      };
    }

    return {
      disabled: false,
      label: "가입하기",
      className: "bg-[#412A2A] text-white",
    };
  }

  if (isUserLoading) {
    return (
      <div className="min-h-dvh bg-[#FCFBF7] flex items-center justify-center">
        <LoadingIcon size="size-8" color="text-theme" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FCFBF7] text-[#412A2A]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 pb-8 pt-6">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#FFF8F1_0%,#F4E8DE_100%)] px-5 py-6 shadow-[0_18px_50px_rgba(65,42,42,0.08)]">
          <div className="inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[#8C6F63]">
            선택 단계
          </div>
          <h1 className="mt-3 text-[28px] font-semibold leading-9 tracking-[-0.03em]">
            마음에 드는 모임이 있다면
            <br />
            지금 바로 들어가보세요
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#7E6A63]">
            지금은 건너뛰어도 괜찮아요. 홈에 들어간 뒤에도 언제든 모임 탭에서
            가입할 수 있어요.
          </p>
        </div>

        <div className="relative mt-6">
          <input
            type="text"
            value={searchQuery}
            placeholder="러닝, 헬스, 클라이밍 모임 검색"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border border-[#E8DED7] bg-white pl-12 pr-11 text-[15px] outline-none placeholder:text-[#B7AAA2] focus:border-[#412A2A]"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9F8E86]">
            <SearchIcon />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#F1ECE8] p-1 text-[#8E7E76]"
              aria-label="검색어 지우기"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">
              {debouncedSearch ? "검색 결과" : "추천 모임"}
            </p>
            <p className="mt-1 text-xs text-[#8E7E76]">
              {debouncedSearch
                ? "검색한 키워드와 맞는 모임이에요."
                : "지금 둘러볼 만한 모임을 먼저 보여드릴게요."}
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#8E7E76]">
            {isMoimsLoading ? "불러오는 중" : `${moims.length}개`}
          </span>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pb-6">
          {isMoimsLoading ? (
            <div className="flex h-40 items-center justify-center rounded-3xl bg-white">
              <LoadingIcon size="size-7" color="text-theme" />
            </div>
          ) : moims.length === 0 ? (
            <div className="rounded-3xl bg-white px-5 py-8 text-center shadow-[0_12px_30px_rgba(65,42,42,0.05)]">
              <p className="text-base font-semibold">딱 맞는 모임을 아직 못 찾았어요</p>
              <p className="mt-2 text-sm leading-6 text-[#8E7E76]">
                다른 키워드로 검색해보거나, 지금은 건너뛰고 홈에서 이어서
                둘러보세요.
              </p>
            </div>
          ) : (
            moims.map((moim) => {
              const action = getActionState(moim);
              const isPending = pendingMoimId === moim.id;

              return (
                <article
                  key={moim.id}
                  className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(65,42,42,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {moim.isOfficial && (
                          <span className="rounded-full bg-[#412A2A] px-2.5 py-1 text-[10px] font-semibold text-white">
                            OFFICIAL
                          </span>
                        )}
                        {moim.isPrivate && (
                          <span className="rounded-full bg-[#F4EEEA] px-2.5 py-1 text-[10px] font-semibold text-[#8E7E76]">
                            비공개
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold leading-6">
                        {moim.name}
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-[#F7F2EE] px-3 py-2 text-right">
                      <p className="text-[11px] text-[#9C8F88]">멤버</p>
                      <p className="mt-1 text-sm font-semibold">
                        {moim.memberCount}
                        {!moim.isOfficial && ` / ${moim.maxMember}`}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#7E6A63]">
                    {moim.description || "같은 목표를 가진 사람들과 함께 운동해요."}
                  </p>
                  <button
                    type="button"
                    disabled={action.disabled || isPending}
                    onClick={() => {
                      setPendingMoimId(moim.id);
                      joinMoim(moim.id);
                    }}
                    className={`mt-5 flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-colors disabled:cursor-not-allowed ${action.className}`}
                  >
                    {isPending ? <LoadingIcon /> : action.label}
                  </button>
                </article>
              );
            })
          )}
        </div>

        <div className="space-y-3 border-t border-[#E8DED7] bg-[#FCFBF7] pt-4">
          <NextStepButton type="button" onClick={goHome}>
            모임 없이 시작하기
          </NextStepButton>
        </div>
      </div>
    </div>
  );
}
