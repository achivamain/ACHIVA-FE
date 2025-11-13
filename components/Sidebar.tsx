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
    queryKey: ["currentUser", "token"],
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

  const [openedDrawer, setOpenedDrawer] = useState<"응원" | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // flickering 제거 위한 코드
  // 근데도 간헐적으로 발생하긴하네요.. 나중에 더 수정해볼게요
  const handleCloseDrawer = () => {
    setIsClosing(true);
    setOpenedDrawer(null);
  };

  const handleExitComplete = () => {
    setIsClosing(false);
  };

  // 현재 drawer 관련해서 어색한 UI가 조금 보입니다..만
  // 나중에 전체적으로 응원탭을 변경하게 되지 않을까 싶어서 일단 그대로 두겠습니다
  const drawerContent = (
    <Drawer title="응원" onClose={handleCloseDrawer}>
      <Notifications />
    </Drawer>
  );

  const pathname = decodeURIComponent(usePathname());

  let selected;
  if (openedDrawer === "응원" || isClosing) {
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

  return (
    <>
      <motion.nav
        layoutScroll
        className={`text-theme z-10 h-dvh fixed bottom-0 top-0 flex flex-col items-center w-auto lg:w-[250px] ${
          openedDrawer ? "!w-auto" : ""
        } py-8 border-r border-r-[#412A2A] bg-white`}
      >
        <div
          className={`mb-15 w-full h-[39.29px] flex px-6 justify-start lg:hidden ${
            openedDrawer ? "!block" : ""
          }`}
        >
          <Link href="/" className="h-full flex items-end">
            <Logo />
          </Link>
        </div>
        <div
          className={`mb-15 w-full justify-start px-6 hidden lg:flex ${
            openedDrawer ? "!hidden" : ""
          }`}
        >
          <Link href="/">
            <TextLogo />
          </Link>
        </div>
        <ul className="flex-1 flex flex-col w-full justify-around gap-5">
          <Link href={`/${user?.nickName}/home`}>
            <ListItem
              isNavFolded={!!openedDrawer}
              label="홈"
              icon={<HomeIcon fill={selected === "홈"} />}
              selected={selected === "홈"}
            />
          </Link>
          <Link href={`/${user?.nickName}/goals`}>
            <ListItem
              isNavFolded={!!openedDrawer}
              label="목표"
              icon={<GoalIcon fill={selected === "목표"} />}
              selected={selected === "목표"}
            />
          </Link>
          <Link href="/">
            <ListItem
              isNavFolded={!!openedDrawer}
              label="피드"
              icon={<FeedIcon fill={selected === "피드"} />}
              selected={selected === "피드"}
            />
          </Link>
          <button onClick={() => setOpenedDrawer("응원")}>
            <ListItem
              isNavFolded={!!openedDrawer}
              label="응원"
              icon={<SideBarHeartIcon fill={selected === "응원"} />}
              selected={selected === "응원"}
            />
          </button>
          <Link href={`/${user?.nickName}`} className="mb-auto">
            <ListItem
              isNavFolded={!!openedDrawer}
              label="MY"
              icon={<MyPageIcon fill={selected === "MY"} />}
              selected={selected === "MY"}
            />
          </Link>
        </ul>
      </motion.nav>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {openedDrawer && drawerContent}
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
      key={label}
      className={`relative flex items-center gap-3 px-6 py-1.5 cursor-pointer`}
    >
      <div
        className={`${label === "글쓰기" ? "bg-theme/15 rounded-full" : ""}`}
      >
        {icon}
      </div>

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
