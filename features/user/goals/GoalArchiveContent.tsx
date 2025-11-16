"use client";

import React, { useState, useRef, useEffect } from "react";
import useGoalStore from "@/store/GoalStore";
import { CaretRightIcon, ThreeDotsIcon } from "@/components/Icons";
import TwoElementsButton from "@/components/TwoElementsButton";
import type { GoalItem } from "@/types/Goal";

interface GoalArchiveContentProps {
  onClose: () => void;
  isMobile?: boolean;
}

const GoalArchiveContent: React.FC<GoalArchiveContentProps> = ({
  onClose,
  isMobile = false,
}) => {
  const { missions, mindsets, handleRestore, handlePermanentDelete } =
    useGoalStore();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const archivedMissions = missions.filter((m) => m.isArchived);
  const archivedMindsets = mindsets.filter((m) => m.isArchived);

  const allArchivedItems: Array<
    GoalItem & { type: "mission" | "mindset"; emoji: string }
  > = [
    ...archivedMissions.map((m) => ({
      ...m,
      type: "mission" as const,
      emoji: "🎯",
    })),
    ...archivedMindsets.map((m) => ({
      ...m,
      type: "mindset" as const,
      emoji: "🍀",
    })),
  ];

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
    e: React.MouseEvent<HTMLButtonElement>
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
        {allArchivedItems.length === 0 ? (
          <div className="text-center py-10 text-[#808080]">
            보관된 항목이 없습니다.
          </div>
        ) : (
          allArchivedItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="relative bg-white rounded-[8.75px] p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 text-[36px] leading-[44px] flex items-center">
                  {item.emoji}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-[18px] leading-[21px] text-black">
                    {item.text}
                  </p>
                  <p className="text-[15px] leading-[18px] text-[#808080]">
                    {item.count.toLocaleString()}번째, 나를 위한 응원
                  </p>
                </div>
              </div>

              <button
                ref={(el) => {
                  buttonRefs.current[`${item.type}-${item.id}`] = el;
                }}
                className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(`${item.type}-${item.id}`, e);
                }}
              >
                <ThreeDotsIcon />
              </button>

              {openDropdown === `${item.type}-${item.id}` && (
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
                    onFirstClick={() => {
                      handleRestore(item.id, item.type);
                      setOpenDropdown(null);
                    }}
                    onSecondClick={() => {
                      handlePermanentDelete(item.id, item.type);
                      setOpenDropdown(null);
                    }}
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
