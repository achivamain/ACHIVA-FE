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
  SideBarHeartIcon,
  MyPageIcon,
} from "./Icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Drawer from "./Drawer";
import Notifications from "@/features/user/Notifications";

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
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
  });

  // 사이드바에 drawer로 열리는 다른 것이 들어가지 않을 것 같아서
  // 변수명도 바꾸고, drawerContext도 뺐습니다
  const [isCheerDrawerOpen, setIsCheerDrawerOpen] = useState<boolean>(false);

  const pathname = decodeURIComponent(usePathname());

  let initialSelectedItem;
  if (isCheerDrawerOpen) {
    initialSelectedItem = "응원";
  } else if (pathname.endsWith("/home")) {
    initialSelectedItem = "홈";
  } else if (pathname.endsWith("/goals")) {
    initialSelectedItem = "목표";
  } else if (pathname === "/feed" || pathname.startsWith("/post")) {
    initialSelectedItem = "피드";
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
      label: "목표",
      href: `/${user?.nickName}/goals`,
      Icon: GoalIcon,
    },
    {
      label: "피드",
      href: "/",
      Icon: FeedIcon,
    },
    {
      label: "응원",
      onClick: () => setIsCheerDrawerOpen(true),
      Icon: SideBarHeartIcon,
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
        className={`text-theme z-10 h-dvh fixed bottom-0 top-0 flex flex-col items-center w-auto lg:w-[250px] ${
          isCheerDrawerOpen ? "!w-auto" : ""
        } py-8 border-r border-r-[#412A2A] bg-white`}
      >
        <div
          className={`mb-15 w-full h-[39.29px] flex px-6 justify-start lg:hidden ${
            isCheerDrawerOpen ? "!block" : ""
          }`}
        >
          <Link href="/" className="h-full flex items-end">
            <Logo />
          </Link>
        </div>
        <div
          className={`mb-15 w-full justify-start px-6 hidden lg:flex ${
            isCheerDrawerOpen ? "!hidden" : ""
          }`}
        >
          <Link href="/">
            <TextLogo />
          </Link>
        </div>
        {/* 유저 로딩 미완료 시 클릭 막음 */}
        <ul
          className={`flex-1 flex flex-col w-full gap-5 ${
            isUserLoading ? "opacity-75 pointer-events-none" : ""
          }`}
        >
          {navItems.map((item) => {
            const listItem = (
              <ListItem
                isNavFolded={!!isCheerDrawerOpen}
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
      <AnimatePresence>
        {isCheerDrawerOpen && (
          <Drawer title="응원" onClose={() => setIsCheerDrawerOpen(false)}>
            <Notifications />
          </Drawer>
        )}
      </AnimatePresence>
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
