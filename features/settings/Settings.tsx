"use client";

import {
  SettingAccountIcon,
  SettingNotificationIcon,
  SettingPrivateIcon,
  SettingInfoIcon,
  SettingNoticeIcon,
  SettingInquiryIcon,
  SettingNextIcon,
} from "@/components/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { handleLogout } from "./handleLogout";

export default function Settings() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 640);
  }, []);

  const icons = [
    SettingAccountIcon,
    SettingNotificationIcon,
    SettingPrivateIcon,
    SettingInfoIcon,
    SettingNoticeIcon,
    SettingInquiryIcon,
  ];
  const labels = ["계정 관리", "알림", "개인정보 보호", "정보", "공지", "문의"];
  const links = [
    isMobile ? "accounts" : "accounts/password",
    "notification",
    "private",
    "info",
    "notice",
    "inquiry",
  ];
  return (
    <div className="flex-1 flex flex-col text-theme">
      <ul className="flex flex-col gap-5">
        {labels.map((label, i) => {
          const Icon = icons[i];
          return (
            <Link key={label} href={`/settings/${links[i]}`}>
              <li
                className={`flex items-center gap-5 sm:px-2.5 h-11 rounded-md ${
                  pathname.startsWith(`/settings/${links[i]}`)
                    ? "bg-[#e6e6e6]"
                    : ""
                }`}
              >
                <div className="w-9 flex justify-center">
                  <Icon />
                </div>

                <p className="font-semibold text-lg">{label}</p>
                <div className="ml-auto">
                  <SettingNextIcon />
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
      <div className="mt-auto flex flex-col gap-4 items-start sm:px-2.5">
        <div className="w-full flex justify-between">
          <span className="font-semibold text-lg">버전</span>
          <span>1.0.0</span>
        </div>
        <button
          className="font-semibold text-lg"
          onClick={async () => {
            await handleLogout();
            const domain =
              "https://ap-northeast-2mmvclnrmp.auth.ap-northeast-2.amazoncognito.com";
            const clientId = "a3kaacto97fom3ved1bjivbiu";
            const logoutUri = `${window.location.origin}/`;
            window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
              logoutUri,
            )}`;
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
