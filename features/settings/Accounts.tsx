"use client";

import {
  SettingPasswordIcon,
  SettingBirthdayIcon,
  SettingNextIcon,
} from "@/components/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ModalWithoutCloseBtn from "@/components/ModalWithoutCloseBtn";
import { handleLogout } from "./handleLogout";
// 생년월일 표시 안되게
export default function Accounts() {
  const pathname = usePathname();

  const icons = [SettingPasswordIcon, SettingBirthdayIcon];
  const labels = ["비밀번호 재설정", "생년월일"];
  const links = ["password", "birthday"];

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col text-theme">
      <ul className="flex flex-col gap-5">
        {labels.slice(0, 1).map((label, i) => {
          const Icon = icons[i];
          return (
            <Link key={label} href={`/settings/accounts/${links[i]}`}>
              <li
                className={`flex items-center gap-5 sm:px-2.5 py-1.5 rounded-md ${
                  pathname === "/settings/accounts/password"
                    ? "bg-[#E6E6E6]"
                    : ""
                }`}
              >
                <Icon />
                <p className="font-semibold text-lg">{label}</p>
                <div className="ml-auto">
                  <SettingNextIcon />
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
      <button
        onClick={() => setIsCloseModalOpen(true)}
        className="mt-auto font-semibold text-lg text-center text-[#DF171B]"
      >
        계정 삭제하기
      </button>
      {isCloseModalOpen && (
        <ModalWithoutCloseBtn
          title={<p className="w-xs">정말 계정을 삭제하시겠습니까?</p>}
          onClose={() => setIsCloseModalOpen(false)}
        >
          <li
            className="py-2 cursor-pointer text-[#DF171B] font-semibold"
            onClick={async () => {
              try {
                const res = await fetch("/api/auth", { method: "DELETE" });
                if (!res.ok) {
                  throw new Error("계정 삭제 실패");
                }
                await handleLogout();
                const domain =
                  "https://ap-northeast-2mmvclnrmp.auth.ap-northeast-2.amazoncognito.com";
                const clientId = "a3kaacto97fom3ved1bjivbiu";
                const logoutUri = `${window.location.origin}/`;
                window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
                  logoutUri,
                )}`;
              } catch (err) {
                console.log(err);
                alert("네트워크 또는 서버 오류가 발생했습니다.");
              }
            }}
          >
            삭제
          </li>
          <li
            className="py-2 cursor-pointer"
            onClick={() => setIsCloseModalOpen(false)}
          >
            취소
          </li>
        </ModalWithoutCloseBtn>
      )}
    </div>
  );
}
