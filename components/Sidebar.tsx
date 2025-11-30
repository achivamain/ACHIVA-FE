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

export default function Sidebar() {
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
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
  });

  // 사이드바에 drawer로 열리는 다른 것이 들어가지 않을 것 같아서
  // 변수명도 바꾸고, drawerContext도 뺐습니다
  const [isCheerDrawerOpen, setIsCheerDrawerOpen] = useState<boolean>(false);

  const pathname = decodeURIComponent(usePathname());

  let selected;
  if (isCheerDrawerOpen) {
    selected = "응원";
  } else if (pathname === `/${user?.nickName}/home`) {
    selected = "홈";
  } else if (pathname.startsWith(`/${user?.nickName}/goals`)) {
    selected = "목표";
  } else if (pathname === `/${user?.nickName}`) {
    selected = "MY";
    // 사이드바에서 설정 버튼 빠짐 -> 임시로 MY로 처리
  } else if (pathname.startsWith("/settings")) {
    selected = "MY";
    // 현재는 피드가 기본화면에 묶여 있어서 이렇게 처리했는데
    // 나중에 기능 추가되면 아마 다른 페이지로 분리될 거 같아서 그때 다시 수정해야할듯?
  } else {
    selected = "피드";
  }

  const navItems = [
    {
      label: "홈",
      href: `/${user?.nickName}/home`,
      icon: <HomeIcon fill={selected === "홈"} />,
    },
    {
      label: "목표",
      href: `/${user?.nickName}/goals`,
      icon: <GoalIcon fill={selected === "목표"} />,
    },
    {
      label: "피드",
      href: "/",
      icon: <FeedIcon fill={selected === "피드"} />,
    },
    {
      label: "응원",
      onClick: () => setIsCheerDrawerOpen(true),
      icon: <SideBarHeartIcon fill={selected === "응원"} />,
    },
    {
      label: "MY",
      href: `/${user?.nickName}`,
      icon: <MyPageIcon fill={selected === "MY"} />,
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
        <ul className="flex-1 flex flex-col w-full gap-5">
          {navItems.map((item) => {
            return item.href ? (
              <Link key={item.label} href={item.href}>
                <ListItem
                  isNavFolded={!!isCheerDrawerOpen}
                  label={item.label}
                  selected={selected === item.label}
                  icon={item.icon}
                />
              </Link>
            ) : (
              <button key={item.label} onClick={item.onClick}>
                <ListItem
                  isNavFolded={!!isCheerDrawerOpen}
                  label={item.label}
                  selected={selected === item.label}
                  icon={item.icon}
                />
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
  icon: React.ReactNode;
  selected: boolean;
};

function ListItem({ isNavFolded, label, icon, selected }: ListItemProps) {
  return (
    <li
      className={`relative flex items-center gap-3 px-6 py-1.5 cursor-pointer`}
    >
      {icon}

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
