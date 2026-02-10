"use client";

import { Category } from "@/types/Categories";
import CategorySelector from "../category/CategorySelector";
import { useState } from "react";
import MobileHeader from "@/components/MobileHeader";
import ModalWithoutCloseBtn from "@/components/ModalWithoutCloseBtn";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export function HomeCategorySelector({
  user,
}: {
  user?: {
    nickName: string;
    profileImageUrl: string;
    birth: string;
    gender: string;
    region: string;
    categories: Category[];
    description: string;
  };
}) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategoies] = useState(user?.categories);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectCategory = (cat: Category) =>
    setSelectedCategoies((n) => (n ? [...n, cat] : [cat]));
  const disSelectCategory = (cat: Category) =>
    setSelectedCategoies((n) => (n ? n.filter((i) => i !== cat) : []));

  //현재 프로필의 관심 카테고리와 연결되어 있습니다.
  const setCategories = async (selectedCategories: Category[] | undefined) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth", {
        method: "PUT",
        body: JSON.stringify({
          user: {
            ...user,
            categories: selectedCategories,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("관심 카테고리 설정 중 에러");
      }
      router.push(`/${user?.nickName}/home`);
    } catch (err) {
      console.log(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
    setIsLoading(false);
  };

  return (
    <>
      <Modal
        onClose={() => user?.categories === selectedCategories? router.back() : setIsCloseModalOpen(true)}
        title={
          <h2 className="font-semibold py-3">
            기록하고 싶은 운동을 선택해주세요
          </h2>
        }
      >
        <div className="w-full h-200 max-h-[calc(90dvh-8rem)]">
          <div className="flex w-full h-full px-6 pt-8">
            <CategorySelector
              selectedCategories={selectedCategories}
              selectCategory={selectCategory}
              disSelectCategory={disSelectCategory}
            />
          </div>
          <button
            className="absolute top-10 right-20 z-50 font-semibold text-theme py-[2px] px-3 bg-white border border-[#D9D9D9] rounded-sm"
            onClick={() => setCategories(selectedCategories)}
          >
            저장
          </button>
        </div>
      </Modal>
      {isCloseModalOpen && (
        <ModalWithoutCloseBtn
          title={
            <p className="w-xs">
              저장하지 않으면
              <br />
              변경사항이 사라집니다
            </p>
          }
          onClose={() => setIsCloseModalOpen(false)}
        >
          <li
            className="py-2 cursor-pointer text-theme font-medium"
            onClick={() => setIsCloseModalOpen(false)}
          >
            계속 수정하기
          </li>
          <li
            className="py-2 cursor-pointer text-[#DF171B] font-semibold"
            onClick={router.back}
          >
            나가기
          </li>
        </ModalWithoutCloseBtn>
      )}
    </>
  );
}

export function MobileHomeCategorySelector({
  user,
}: {
  user?: {
    nickName: string;
    profileImageUrl: string;
    birth: string;
    gender: string;
    region: string;
    categories: Category[];
    description: string;
  };
}) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategoies] = useState(user?.categories);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectCategory = (cat: Category) =>
    setSelectedCategoies((n) => (n ? [...n, cat] : [cat]));
  const disSelectCategory = (cat: Category) =>
    setSelectedCategoies((n) => (n ? n.filter((i) => i !== cat) : []));

  //현재 프로필의 관심 카테고리와 연결되어 있습니다.
  const setCategories = async (selectedCategories: Category[] | undefined) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth", {
        method: "PUT",
        body: JSON.stringify({
          user: {
            ...user,
            categories: selectedCategories,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("관심 카테고리 설정 중 에러");
      }
      router.push(`/${user?.nickName}/home`);
    } catch (err) {
      console.log(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full bg-white">
      <MobileHeader onClick={() => user?.categories === selectedCategories? router.back() : setIsCloseModalOpen(true)}>
        <></>
      </MobileHeader>
      <h1 className="font-semibold text-[24px] px-4">
        기록하고 싶은 운동을 선택해주세요
      </h1>
      <div className="flex w-full h-full px-6 pt-8">
        <CategorySelector
          selectedCategories={selectedCategories}
          selectCategory={selectCategory}
          disSelectCategory={disSelectCategory}
        />
      </div>
      <div className="h-80">{/*하단 여백*/}</div>

      <button
        className="absolute top-3.5 right-5 z-50 font-semibold text-theme py-[2px] px-3 bg-white border border-[#D9D9D9] rounded-sm"
        onClick={() => setCategories(selectedCategories)}
      >
        저장
      </button>

      {isCloseModalOpen && (
        <ModalWithoutCloseBtn
          title={
            <p className="w-xs">
              저장하지 않으면
              <br />
              변경사항이 사라집니다
            </p>
          }
          onClose={() => setIsCloseModalOpen(false)}
        >
          <li
            className="py-2 cursor-pointer text-theme font-medium"
            onClick={() => setIsCloseModalOpen(false)}
          >
            계속 수정하기
          </li>
          <li
            className="py-2 cursor-pointer text-[#DF171B] font-semibold"
            onClick={router.back}
          >
            나가기
          </li>
        </ModalWithoutCloseBtn>
      )}
    </div>
  );
}
