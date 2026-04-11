"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import type { User } from "@/types/User";
import ProfileImg from "@/components/ProfileImg";
import { useState } from "react";
import { UserSchema } from "../auth/schima";
import ImageUploader from "./ImageUploader";
import { LoadingIcon, PencilIcon } from "@/components/Icons";

export default function EditProfile() {
  const queryClient = useQueryClient();
  // 닉네임이 로그인된 중간에 바뀔 수 있기 때문에
  // static한 세션 정보를 사용하지 않고 api 호출해서 사용
  // tanstack query 사용해서 캐싱되게 하여서 체감 로딩 속도 문제 최소화
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("server error");
      }
      return (await res.json()).data as User;
    },
  });

  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl);
  const [nickName, setNickName] = useState(user?.nickName);
  const [isNickNameOk, setIsNickNameOk] = useState(true);
  const [isNickNameCheckLoading, setIsNickNameCheckLoding] = useState(false);
  const [nickNameError, setNickNameError] = useState("");
  const [isEditing, setIsEditing] = useState({
    nickName: false,
    bio: false,
  });

  const [bio, setBio] = useState(user?.description);

  function useUpdateProfile() {
    return useMutation({
      mutationFn: async ({
        user,
        nickName,
        profileImageUrl,
        bio,
      }: {
        user?: User;
        nickName?: string;
        profileImageUrl?: string;
        bio?: string;
      }) => {
        const res = await fetch("/api/auth", {
          method: "PUT",
          body: JSON.stringify({
            user: {
              ...user,
              nickName,
              profileImageUrl,
              description: bio,
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("프로필 수정 중 에러");
        }
      },

      onSuccess: () => {
        // "user" 키를 invalidate해서 refetch 유도
        queryClient.invalidateQueries({ queryKey: ["user"] });
        window.location.href = `/${nickName}`;
      },

      onError: (err) => {
        console.error(err);
        alert(
          "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
      },
    });
  }
  const { mutate, isPending } = useUpdateProfile();

  async function handleCheckNickName() {
    if (!nickName) return;
    setIsNickNameCheckLoding(true);
    try {
      const response = await fetch(
        `/api/auth/checkNickname?nickname=${nickName}`,
      );
      if (response.ok) {
        const { data } = await response.json();
        const isAvailable = data.available;
        if (isAvailable) {
          setIsNickNameOk(true);
        } else {
          setNickNameError("이미 사용 중인 이름입니다.");
        }
      } else if (response.status === 409) {
        setNickNameError("이미 사용 중인 이름입니다.");
      } else {
        throw new Error("이름 중복 체크 중 서버 에러");
      }
    } catch (err) {
      console.error(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsNickNameCheckLoding(false);
    }
  }

  function handleNickNameBlur() {
    const schema = UserSchema.pick({ nickName: true });
    const payload = { nickName };
    const result = schema.safeParse(payload);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setNickNameError(fieldErrors.nickName?.[0] || "");
    } else {
      setNickNameError("");
    }
  }

  return (
    <form
      className="w-sm flex flex-col items-center gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        mutate({ user, nickName, profileImageUrl, bio });
      }}
    >
      <div className="relative w-auto h-auto">
        <ProfileImg url={profileImageUrl} size={120} />
        <ImageUploader setProfileImageUrl={setProfileImageUrl} />
      </div>

      <div tabIndex={-1}></div>
      <div className="w-full flex flex-col gap-3">
        <InputSection label="이름">
          <div
            className={`absolute right-5 top-4 cursor-pointer ${
              isEditing.nickName ? "hidden" : ""
            }`}
          >
            <PencilIcon />
          </div>
          <input
            className="py-2 px-4 w-full h-12"
            type="text"
            value={nickName}
            onClick={() =>
              setIsEditing((prev) => ({ ...prev, nickName: true }))
            }
            onChange={(e) => {
              setNickNameError("");
              setIsNickNameOk(false);
              setNickName(e.target.value);
            }}
            onBlur={() => {
              setIsEditing((prev) => ({ ...prev, nickName: false }));
              handleNickNameBlur();
              if (nickName !== user?.nickName && !nickNameError) {
                handleCheckNickName();
              }
            }}
          />
        </InputSection>
        {!isEditing.nickName && nickNameError && (
          <p className="font-light text-theme-red">{nickNameError}</p>
        )}
        <InputSection label="나를 소개하는 한 줄">
          <div
            className={`absolute right-5 top-4 cursor-pointer ${
              isEditing.bio ? "hidden" : ""
            }`}
          >
            <PencilIcon />
          </div>
          <input
            maxLength={30}
            className="py-2 px-4 w-full h-12"
            type="text"
            value={bio || ""}
            onClick={() => setIsEditing((prev) => ({ ...prev, bio: true }))}
            onChange={(e) => {
              setBio(e.target.value);
            }}
            onBlur={() => setIsEditing((prev) => ({ ...prev, bio: false }))}
          />
        </InputSection>
      </div>
      <button
        className="bg-theme rounded-md w-full h-10 flex items-center justify-center font-bold text-white disabled:bg-[#e6e6e6] disabled:text-[#a6a6a6]"
        disabled={
          isEditing.nickName ||
          isEditing.bio ||
          !!nickNameError ||
          !isNickNameOk ||
          isNickNameCheckLoading
        }
      >
        {isPending ? <LoadingIcon /> : "제출"}
      </button>
    </form>
  );
}

function InputSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="font-bold text-theme mb-1">{label}</div>
      <div className="bg-[#f2f2f2] rounded-sm min-h-12 relative flex items-center">
        {children}
      </div>
    </div>
  );
}
