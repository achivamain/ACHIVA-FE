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
  } else if (pathname === `/${user?.nickName}/home`) {
    selected = "홈";
  } else if (pathname.startsWith(`/${user?.nickName}/goals`)) {
    selected = "목표";
  } else if (pathname === `/${user?.nickName}`) {
    selected = "MY";
  } else if (pathname.startsWith("/settings")) {
    selected = "MY";
  } else {
    selected = "피드";
    selected = "피드";
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

  return (
    <>
      <motion.nav
        layoutScroll
        className="text-theme w-full shadow-[0px_-5px_15px_0_rgba(0,0,0,0.05)] h-auto fixed bottom-0 items-center bg-white z-50"
      >
        <ul className="flex w-full justify-around px-[7px] py-[19px]">
          <Link href={`/${user?.nickName}/home`}>
            <ListItem
              label="홈"
              icon={<HomeIcon fill={selected === "홈"} />}
              selected={selected === "홈"}
            />
          </Link>
          <Link href={`/${user?.nickName}/goals`}>
            <ListItem
              label="목표"
              icon={<GoalIcon fill={selected === "목표"} />}
              selected={selected === "목표"}
            />
          </Link>
          <Link href="/">
            <ListItem
              label="피드"
              icon={<FeedIcon fill={selected === "피드"} />}
              selected={selected === "피드"}
            />
          </Link>
          <Link href={`/accounts/notifications`}>
            <ListItem
              label="응원"
              icon={<SideBarHeartIcon fill={selected === "응원"} />}
              selected={selected === "응원"}
            />
          </Link>
          <Link href={`/${user?.nickName}`}>
            <ListItem
              label="MY"
              icon={<MyPageIcon fill={selected === "MY"} />}
              selected={selected === "MY"}
            />
          </Link>
        </ul>
      </motion.nav>
    </>
  );
}

type ListItemProps = {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
};

function ListItem({ label, icon, selected }: ListItemProps) {
  return (
    <li
      key={label}
      className="relative flex flex-col items-center gap-1 cursor-pointer w-8"
    >
      {selected && (
        <motion.div
          layoutId="mobileNavBar"
          className="absolute -top-[19px] left-0 right-0 h-[3px] bg-theme rounded-b-sm"
        />
      )}
      <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
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
