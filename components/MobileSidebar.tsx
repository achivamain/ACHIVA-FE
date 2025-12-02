"use client";
import Link from "next/link";
import type { User } from "@/types/User";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HomeIcon,
  GoalIcon,
  FeedIcon,
  SideBarHeartIcon,
  MyPageIcon,
} from "./Icons";
import { motion } from "motion/react";

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

  const pathname = decodeURIComponent(usePathname());

  let selected;
  if (pathname === `/accounts/notifications`) {
    selected = "응원";
  } else if (pathname.endsWith("/home")) {
    selected = "홈";
  } else if (pathname.endsWith("/goals")) {
    selected = "목표";
  } else if (pathname === "/" || pathname.startsWith("/post")) {
    selected = "피드";
  } else {
    selected = "MY";
  }

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
    pathname.startsWith("/post");

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
      href: "/accounts/notifications",
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
        className="text-theme w-full shadow-[0px_-5px_15px_0_rgba(0,0,0,0.05)] h-auto fixed bottom-0 items-center bg-white z-50"
      >
        <ul className="flex w-full justify-around px-[7px] py-[19px]">
          {navItems.map((item) => {
            return (
              <Link key={item.label} href={item.href}>
                <ListItem
                  key={item.label}
                  label={item.label}
                  Icon={item.Icon}
                  selected={selected === item.label}
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
