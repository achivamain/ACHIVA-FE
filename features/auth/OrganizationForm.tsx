"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CloseIcon, LoadingIcon, SearchIcon } from "@/components/Icons";
import { NextStepButton } from "./Buttons";
import { useSignupInfoStore } from "@/store/SignupStore";
import type {
  Organization,
  OrganizationListResponse,
} from "@/types/organization";

type SignupRequestBody = {
  nickName: string;
  birth: string;
  organizationId: number;
  profileImageUrl?: string;
  organizationPassword?: string;
};

type OrganizationDescriptionItem = {
  label: string;
  value: string;
};

function parseOrganizationDescription(
  description: string,
): OrganizationDescriptionItem[] | null {
  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmedDescription);

    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return null;
    }

    const items = Object.entries(parsed).flatMap(([label, value]) => {
      if (value === null || value === undefined || value === "") {
        return [];
      }

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return [{ label, value: String(value) }];
      }

      return [{ label, value: JSON.stringify(value) }];
    });

    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

function getOrganizationDescriptionSearchText(description: string) {
  const parsedDescription = parseOrganizationDescription(description);

  if (!parsedDescription) {
    return description;
  }

  return parsedDescription
    .map(({ label, value }) => `${label} ${value}`)
    .join(" ");
}

function OrganizationDescription({
  description,
}: {
  description: string;
}) {
  const parsedDescription = parseOrganizationDescription(description);

  if (!description.trim()) {
    return <p>설명이 아직 등록되지 않았어요.</p>;
  }

  if (!parsedDescription) {
    return <p>{description}</p>;
  }

  return (
    <div className="space-y-1">
      {parsedDescription.map(({ label, value }) => (
        <p key={`${label}-${value}`}>
          <span className="font-medium text-[#5F4B44]">{label}</span>
          {`: ${value}`}
        </p>
      ))}
    </div>
  );
}

export default function OrganizationForm() {
  const user = useSignupInfoStore.use.user();
  const setUser = useSignupInfoStore.use.setUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(
    user.organizationId ?? null,
  );
  const [organizationPassword, setOrganizationPassword] = useState(
    user.organizationPassword ?? "",
  );
  const [submitError, setSubmitError] = useState("");

  const {
    data: organizations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await fetch("/api/organizations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          errorBody.message || errorBody.error || "교회 목록을 불러오지 못했습니다.",
        );
      }

      const body = (await res.json()) as OrganizationListResponse;
      return body.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const keyword = searchQuery.trim().toLowerCase();
  const filteredOrganizations = organizations.filter((organization) => {
    if (!keyword) {
      return true;
    }

    return [
      organization.name,
      getOrganizationDescriptionSearchText(organization.description),
    ].some((value) => value.toLowerCase().includes(keyword));
  });

  const selectedOrganization =
    organizations.find((organization) => organization.id === selectedOrganizationId) ??
    null;
  const requiresPassword = !!selectedOrganization?.requiresPassword;

  useEffect(() => {
    if (!requiresPassword && organizationPassword) {
      setOrganizationPassword("");
      setUser({ organizationPassword: undefined });
    }
  }, [organizationPassword, requiresPassword, setUser]);

  const signupMutation = useMutation({
    mutationFn: async () => {
      if (!user.nickName || !user.birth) {
        throw new Error("회원가입 정보가 부족합니다. 처음부터 다시 진행해 주세요.");
      }

      if (!selectedOrganization) {
        throw new Error("교회를 선택해 주세요.");
      }

      if (selectedOrganization.requiresPassword && !organizationPassword.trim()) {
        throw new Error("비밀번호를 입력해 주세요.");
      }

      const payload: SignupRequestBody = {
        nickName: user.nickName,
        birth: format(user.birth, "yyyy-MM-dd"),
        organizationId: selectedOrganization.id,
      };

      if (user.profileImg) {
        payload.profileImageUrl = user.profileImg;
      }

      if (selectedOrganization.requiresPassword) {
        payload.organizationPassword = organizationPassword;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          errorBody.message || errorBody.error || "회원가입 중 오류가 발생했습니다.",
        );
      }
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error) => {
      console.error(error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.",
      );
    },
  });

  function handleSelectOrganization(organization: Organization) {
    setSubmitError("");
    setSelectedOrganizationId(organization.id);
    setUser({
      organizationId: organization.id,
      organizationPassword: undefined,
    });

    if (selectedOrganizationId !== organization.id) {
      setOrganizationPassword("");
    }
  }

  function handlePasswordChange(value: string) {
    setOrganizationPassword(value);
    setUser({
      organizationPassword: value || undefined,
    });
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-col text-[#412A2A]">
      <div className="w-full text-left mb-6">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          소속 교회를 선택해 주세요
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          placeholder="교회 이름으로 검색"
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

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {keyword ? "검색 결과" : "참여 가능한 교회"}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#8E7E76]">
          {isLoading ? "불러오는 중..." : `${filteredOrganizations.length}개`}
        </span>
      </div>

      <div className="-mx-1 mt-4 flex-1 overflow-y-auto px-1 pb-6">
        <div className="space-y-3">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-3xl bg-white">
            <LoadingIcon size="size-7" color="text-theme" />
          </div>
        ) : isError ? (
          <div className="rounded-3xl bg-white px-5 py-8 text-center shadow-[0_12px_30px_rgba(65,42,42,0.05)]">
            <p className="text-base font-semibold">교회 목록을 불러오지 못했어요</p>
            <p className="mt-2 text-sm leading-6 text-[#8E7E76]">
              잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#412A2A] px-5 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="rounded-3xl bg-white px-5 py-8 text-center shadow-[0_12px_30px_rgba(65,42,42,0.05)]">
            <p className="text-base font-semibold">검색 결과가 없어요</p>
            <p className="mt-2 text-sm leading-6 text-[#8E7E76]">
              다른 검색어를 입력하거나 검색어를 지우고 다시 확인해 주세요.
            </p>
          </div>
        ) : (
          filteredOrganizations.map((organization) => {
            const isSelected = selectedOrganizationId === organization.id;

            return (
              <button
                key={organization.id}
                type="button"
                onClick={() => handleSelectOrganization(organization)}
                className={`w-full rounded-[20px] border px-5 py-5 text-left shadow-sm ring-1 transition-all duration-200 ${
                  isSelected
                    ? "border-[#E8DCCF] bg-[#FFFCF8] ring-[#EED9C7] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                    : "border-gray-100 bg-white ring-[#F0EBE3]/70 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {organization.requiresPassword && (
                      <span className="inline-flex items-center rounded-full bg-[#F5F3F0] px-3 py-1 text-[12px] font-semibold text-[#4B5563]">
                        비밀번호 필요
                      </span>
                    )}
                    <h2 className="mt-3 text-[18px] font-bold leading-6 tracking-tight text-[#4A433D]">
                      {organization.name}
                    </h2>
                  </div>
                  <div
                    className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                      isSelected
                        ? "border-[#D96B2B] bg-[#FFF4EC]"
                        : "border-[#D8DDE3] bg-white"
                    }`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        isSelected ? "bg-[#D96B2B]" : "bg-transparent"
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-3 text-sm leading-6 text-[#8A817A]">
                  <OrganizationDescription
                    description={organization.description}
                  />
                </div>
              </button>
            );
          })
        )}
        </div>
      </div>

      <div className="space-y-3 border-t border-[#E8DED7] bg-white pt-4">
        {selectedOrganization && requiresPassword && (
          <div className="rounded-[20px] border border-gray-100 bg-white px-5 py-4 shadow-sm ring-1 ring-[#F0EBE3]/70">
            <label
              htmlFor="organization-password"
              className="text-sm font-medium text-[#4B5563]"
            >
              {selectedOrganization.name} 비밀번호
            </label>
            <input
              id="organization-password"
              type="password"
              value={organizationPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="교회 비밀번호를 입력해 주세요"
              className="mt-3 h-12 w-full rounded-2xl border border-[#E8DED7] bg-[#FCFBF7] px-4 text-[15px] outline-none placeholder:text-[#B7AAA2] focus:border-[#412A2A]"
            />
          </div>
        )}

        <div
          aria-live="polite"
          className="min-h-6 text-center text-sm font-light text-theme-red"
        >
          {submitError}
        </div>

        <NextStepButton
          type="button"
          onClick={() => {
            setSubmitError("");
            signupMutation.mutate();
          }}
          isLoading={signupMutation.isPending}
          disabled={
            signupMutation.isPending ||
            !selectedOrganization ||
            (requiresPassword && !organizationPassword.trim())
          }
        >
          회원가입 완료
        </NextStepButton>
      </div>
    </div>
  );
}
