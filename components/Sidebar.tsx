"use client";
import Link from "next/link";
import type { User } from "@/types/User";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { TextLogo, Logo } from "./Logo";
import {
  HomeIcon,
  GoalIcon,
  FeedIcon,
  MyPageIcon,
  RankingIcon,
} from "./Icons";
import { motion } from "motion/react";
import { useState } from "react";

type NavItem =
  | {
      label: string;
      href: string;
      Icon: React.ComponentType<{ fill: boolean }>;
    }
  | {
      label: string;
      onClick: () => void;
      Icon: React.ComponentType<{ fill: boolean }>;
    };

export default function Sidebar() {
  // 닉네임이 로그인된 중간에 바뀔 수 있기 때문에
  // static한 세션 정보를 사용하지 않고 api 호출해서 사용
  // tanstack query 사용해서 캐싱되게 하여서 체감 로딩 속도 문제 최소화
  const { data: user, isLoading: isUserLoading } = useQuery({
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
  } else if (pathname.startsWith("/moim")) {
    initialSelectedItem = "모임";
  } else if (pathname === "/feed" || pathname.startsWith("/post")) {
    initialSelectedItem = "피드";
  } else if (pathname.startsWith("/ranking")) {
    initialSelectedItem = "랭킹";
  } else {
    initialSelectedItem = "MY";
  }

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  const navItems: NavItem[] = [
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
      label: "랭킹",
      href: `/ranking`,
      Icon: RankingIcon,
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
        className="text-theme z-10 h-dvh fixed bottom-0 top-0 flex flex-col items-center w-auto lg:w-[250px] py-8 border-r border-r-[#412A2A] bg-white"
      >
        <div className="mb-15 w-full h-[39.29px] flex px-6 justify-start lg:hidden">
          <Link href="/" className="h-full flex items-end">
            <Logo />
          </Link>
        </div>
        <div className="mb-15 w-full justify-start px-6 hidden lg:flex">
          <Link href="/">
            <TextLogo />
          </Link>
        </div>
        {/* 유저 로딩 미완료 시 클릭 막음 */}
        <ul
          className={`flex-1 flex flex-col w-full gap-5 ${
            isUserLoading || !user ? "opacity-75 pointer-events-none" : ""
          }`}
        >
          {navItems.map((item) => {
            const listItem = (
              <ListItem
                isNavFolded={false}
                label={item.label}
                selected={selectedItem === item.label}
                Icon={item.Icon}
              />
            );
            return "href" in item ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSelectedItem(item.label)}
              >
                {listItem}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => {
                  setSelectedItem(item.label);
                  item.onClick();
                }}
              >
                {listItem}
              </button>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}

type ListItemProps = {
  isNavFolded: boolean;
  label: string;
  Icon: React.ComponentType<{ fill: boolean }>;
  selected: boolean;
};

function ListItem({ isNavFolded, label, Icon, selected }: ListItemProps) {
  return (
    <li
      className={`relative flex items-center gap-3 px-6 py-1.5 cursor-pointer`}
    >
      <Icon fill={selected} />

      <span
        className={`hidden lg:inline ${isNavFolded ? "!hidden" : ""} text-lg ${
          selected ? "font-bold" : ""
        }`}
      >
        {label}
      </span>
      {selected && (
        <motion.div
          layoutId="navBar"
          className="absolute inset-0 top-0 right-0 border-r-3 border-r-theme"
        />
      )}
    </li>
  );
}
