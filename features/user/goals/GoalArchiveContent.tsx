"use client";

import React, { useState, useRef, useEffect } from "react";
import { CaretRightIcon, ThreeDotsIcon } from "@/components/Icons";
import TwoElementsButton from "@/components/TwoElementsButton";
import {
  useArchivedGoals,
  useToggleArchive,
  useDeleteGoal,
} from "@/hooks/useGoals";
import type { Goal } from "@/types/Goal";

interface GoalArchiveContentProps {
  onClose: () => void;
  isMobile?: boolean;
}

const GoalArchiveContent: React.FC<GoalArchiveContentProps> = ({
  onClose,
  isMobile = false,
}) => {
  const { data: archivedGoals, isLoading } = useArchivedGoals();
  const toggleArchive = useToggleArchive();
  const deleteGoal = useDeleteGoal();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // 카테고리별 이모지
  const getEmoji = (category: string) => {
    switch (category) {
      case "VISION":
        return "💫";
      case "MISSION":
        return "🎯";
      case "MINDSET":
        return "🍀";
      default:
        return "";
    }
  };

  // 카테고리 정렬 순서 정의
  const categoryOrder: { [key: string]: number } = {
    VISION: 1,
    MISSION: 2,
    MINDSET: 3,
  };

  // 999 - Undefined 처리
  const sortedArchivedGoals = archivedGoals
    ? [...archivedGoals].sort((a, b) => {
        const orderA = categoryOrder[a.category] ?? 999;
        const orderB = categoryOrder[b.category] ?? 999;
        return orderA - orderB;
      })
    : [];

  // 외부 클릭 감지 - 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        openDropdown &&
        !target.closest(".dropdown-menu") &&
        !target.closest("button")
      ) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openDropdown]);

  const toggleDropdown = (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const dropdownHeight = 70;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < dropdownHeight + 10) {
      setDropdownPosition({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    } else {
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpenDropdown(id);
  };

  const handleRestore = async (goalId: string) => {
    try {
      await toggleArchive.mutateAsync(goalId);
      setOpenDropdown(null);
    } catch (error) {
      console.error("복구 실패:", error);
    }
  };

  const handlePermanentDelete = async (goalId: string) => {
    try {
      await deleteGoal.mutateAsync(goalId);
      setOpenDropdown(null);
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div
          className={`flex items-center gap-4 mb-8 ${
            isMobile ? "px-5 pt-[20px] pb-4" : "h-8"
          }`}
        >
          <button onClick={onClose} className="w-8 h-8">
            <CaretRightIcon />
          </button>
          <h2 className="text-[20px] leading-6 font-bold text-black">
            나를 위한 응원 보관함
          </h2>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-[#808080]">불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setOpenDropdown(null)} className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`flex items-center gap-4 mb-8 ${
          isMobile ? "px-5 pt-[20px] pb-4" : "h-8"
        }`}
      >
        <button onClick={onClose} className="w-8 h-8">
          <CaretRightIcon />
        </button>
        <h2 className="text-[20px] leading-6 font-bold text-black">
          나를 위한 응원 보관함
        </h2>
      </div>

      {/* Content */}
      <div
        className={`flex flex-col gap-4 ${
          isMobile
            ? "px-4 pb-8"
            : "max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        }`}
        style={
          isMobile ? {} : { scrollbarWidth: "none", msOverflowStyle: "none" }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {sortedArchivedGoals.length === 0 ? (
          <div className="text-center py-10 text-[#808080]">
            보관된 항목이 없습니다.
          </div>
        ) : (
          sortedArchivedGoals.map((item: Goal) => (
            <div
              key={item.id}
              className="relative bg-white rounded-[8.75px] p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 text-[36px] leading-[44px] flex items-center">
                  {getEmoji(item.category)}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-[18px] leading-[21px] text-black">
                    {item.text}
                  </p>
                  <p className="text-[15px] leading-[18px] text-[#808080]">
                    {item.clickCount.toLocaleString()}번째, 나를 위한 응원
                  </p>
                </div>
              </div>

              <button
                ref={(el) => {
                  buttonRefs.current[item.id] = el;
                }}
                className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(item.id, e);
                }}
              >
                <ThreeDotsIcon />
              </button>

              {openDropdown === item.id && (
                <div
                  className="dropdown-menu fixed z-[100]"
                  style={{
                    top: dropdownPosition.top,
                    bottom: dropdownPosition.bottom,
                    right: dropdownPosition.right,
                  }}
                >
                  <TwoElementsButton
                    firstButtonText="이어하기"
                    secondButtonText="지우기"
                    onFirstClick={() => handleRestore(item.id)}
                    onSecondClick={() => handlePermanentDelete(item.id)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalArchiveContent;
