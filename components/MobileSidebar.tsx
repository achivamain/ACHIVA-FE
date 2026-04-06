"use client";
import Link from "next/link";
import type { User } from "@/types/User";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HomeIcon,
  GoalIcon,
  FeedIcon,
  MyPageIcon,
  TemperatureIcon,
} from "./Icons";
import { motion } from "motion/react";
import { useState } from "react";

export default function Sidebar() {
  // 닉네임이 로그인된 중간에 바뀔 수 있기 때문에
  // static한 세션 정보를 사용하지 않고 api 호출해서 사용
  // tanstack query 사용해서 캐싱되게 하여서 체감 로딩 속도 문제 최소화
  const { data: user, isPending: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // 인증 실패시 로그아웃
      if (res.status === 428 || res.status === 401) {
        window.location.href = "/api/auth/logout";
      }
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
    // 잦은 중복 호출 방지
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
  });

  const pathname = decodeURIComponent(usePathname());

  let initialSelectedItem;
  if (pathname.endsWith("/home") || pathname.endsWith("/categories")) {
    initialSelectedItem = "홈";
  } else if (pathname.startsWith("/moim") || pathname.startsWith("/m/moim")) {
    initialSelectedItem = "모임";
  } else if (pathname === "/feed" || pathname.startsWith("/post")) {
    initialSelectedItem = "피드";
  } else if (pathname.startsWith("/ranking") || pathname.startsWith("/m/ranking")) {
    initialSelectedItem = "온도";
  } else {
    initialSelectedItem = "MY";
  }

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  const isInvisible =
    /^\/[^/]+\/achievements$/.test(pathname) || // /[nickName]/achievements
    /^\/[^/]+\/friends$/.test(pathname) || // /[nickName]/friends
    /^\/[^/]+\/achievements\/detail$/.test(pathname) || // /[nickName]/achievements/detail
    /^\/[^/]+\/supports$/.test(pathname) || // /[nickName]/supports
    /^\/[^/]+\/supports\/detail$/.test(pathname) || // /[nickName]/supports/detail
    /^\/[^/]+\/goals\/edit$/.test(pathname) || // /[nickName]/goals/edit
    /^\/[^/]+\/goals\/archive$/.test(pathname) || // /[nickName]/goals/archive
    pathname === "/post/create" ||
    pathname.startsWith("/settings") ||
    pathname === "/accounts/edit" ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/moim/create") ||
    pathname.startsWith("/m/moim/create");

  if (isInvisible) {
    return null; // 렌더링 안 함
  }

  const navItems = [
    {
      label: "홈",
      href: `/${user?.nickName}/home`,
      Icon: HomeIcon,
    },
    {
      label: "모임",
      href: `/moim`,
      Icon: GoalIcon,
    },
    {
      label: "피드",
      href: "/feed",
      Icon: FeedIcon,
    },
    {
      label: "온도",
      href: `/ranking`,
      Icon: TemperatureIcon,
    },
    {
      label: "MY",
      href: `/${user?.nickName}`,
      Icon: MyPageIcon,
    },
  ];

  return (
    <>
      <motion.nav
        layoutScroll
        className="text-theme fixed inset-x-0 bottom-0 z-50 h-auto w-full items-center border-t border-[#ECE7E2] bg-white"
      >
        <ul
          className={`flex w-full justify-around px-[7px] py-[19px] ${
            isUserLoading || !user ? "opacity-75 pointer-events-none" : ""
          }`}
        >
          {navItems.map((item) => {
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSelectedItem(item.label)}
              >
                <ListItem
                  key={item.label}
                  label={item.label}
                  Icon={item.Icon}
                  selected={selectedItem === item.label}
                />
              </Link>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}

type ListItemProps = {
  label: string;
  Icon: React.ComponentType<{ fill: boolean }>;
  selected: boolean;
};

function ListItem({ label, Icon, selected }: ListItemProps) {
  return (
    <li className="relative flex flex-col items-center gap-1 cursor-pointer w-8">
      {selected && (
        <motion.div
          layoutId="mobileNavBar"
          className="absolute -top-[19px] left-0 right-0 h-[3px] bg-theme rounded-b-sm"
        />
      )}
      <div className="w-8 h-8 flex items-center justify-center">
        <Icon fill={selected} />
      </div>
      <span
        className={`text-[15px] leading-[18px] whitespace-nowrap ${
          selected ? "font-semibold" : "font-light"
        }`}
      >
        {label}
      </span>
    </li>
  );
}
