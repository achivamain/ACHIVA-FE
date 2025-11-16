"use client";

// API 완성되면 전반적인 수정 필요

import React, { useState, useEffect, useRef } from "react";
import useGoalStore from "@/store/GoalStore";
import { CaretRightIcon, ThreeDotsIcon } from "@/components/Icons";
import TwoElementsButton from "@/components/TwoElementsButton";
import type { ModalData } from "@/types/Goal";

type PendingAction = {
  type: "archive" | "delete";
  itemType: "mission" | "mindset";
  id: number;
};

interface GoalEditContentProps {
  onClose: () => void;
  onSave?: () => void;
  isMobile?: boolean;
}

const GoalEditContent: React.FC<GoalEditContentProps> = ({
  onClose,
  onSave,
  isMobile = false,
}) => {
  const { vision, missions, mindsets, handleSaveChanges, handleArchive } =
    useGoalStore();

  // 렌더 방지용 임시저장
  const [data, setData] = useState<ModalData>({
    vision,
    missions: missions.filter((m) => !m.isArchived),
    mindsets: mindsets.filter((m) => !m.isArchived),
  });

  // 백엔드 연결 대비 Queue
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  // 버튼 위치 처리 관련
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // 데이터 갱신
  useEffect(() => {
    setData({
      vision,
      missions: missions.filter((m) => !m.isArchived),
      mindsets: mindsets.filter((m) => !m.isArchived),
    });
    setPendingActions([]);
    setOpenDropdown(null);
  }, [vision, missions, mindsets]);

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

  // 일반 입력 계열 - 비전: 1개만 가질 수 있음
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({
      ...prev,
      vision: { ...prev.vision, text: e.target.value },
    }));
  };

  // 리스트 입력 계열 - 미션, 마음가짐
  const handleListItemChange = (
    index: number,
    value: string,
    type: "missions" | "mindsets"
  ) => {
    const newList = [...data[type]];
    newList[index] = { ...newList[index], text: value };
    setData((prev) => ({ ...prev, [type]: newList }));
  };

  // 추가 관련
  const addNewItem = (type: "missions" | "mindsets") => {
    const newItem = { id: Date.now(), text: "", count: 0, isArchived: false };
    setData((prev) => ({ ...prev, [type]: [...prev[type], newItem] }));
  };

  // 드롭다운 토글
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

  // 보관함 이동
  const queueArchive = (type: "missions" | "mindsets", id: number) => {
    const newList = data[type].filter((item) => item.id !== id);
    setData((prev) => ({ ...prev, [type]: newList }));

    setPendingActions((prev) => [
      ...prev,
      {
        type: "archive",
        itemType: type === "missions" ? "mission" : "mindset",
        id,
      },
    ]);
    setOpenDropdown(null);
  };

  // 삭제
  const queueDelete = (type: "missions" | "mindsets", id: number) => {
    const newList = data[type].filter((item) => item.id !== id);
    setData((prev) => ({ ...prev, [type]: newList }));
    setPendingActions((prev) => [
      ...prev,
      {
        type: "delete",
        itemType: type === "missions" ? "mission" : "mindset",
        id,
      },
    ]);
    setOpenDropdown(null);
  };

  const handleSaveClick = () => {
    pendingActions.forEach((action) => {
      if (action.type === "archive") {
        handleArchive(action.id, action.itemType);
      }
    });

    const cleanedData = { ...data };
    cleanedData.missions = data.missions.filter(
      (mission) => mission.text.trim() !== ""
    );
    cleanedData.mindsets = data.mindsets.filter(
      (mindset) => mindset.text.trim() !== ""
    );
    handleSaveChanges(cleanedData);

    if (onSave) {
      onSave();
    } else {
      onClose();
    }
  };

  // 미션, 마음가짐 공통
  const listTypeSection = (
    type: "missions" | "mindsets",
    label: string,
    addButtonText: string
  ) => {
    const items = data[type];
    const singularType = type === "missions" ? "mission" : "mindset";

    return (
      <div className="flex flex-col gap-2">
        <label className="text-[14px] leading-[17px] font-semibold text-[#808080]">
          {label}
        </label>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative bg-white rounded-[5px] h-[52px] flex items-center px-4"
            >
              <input
                type="text"
                value={item.text}
                onChange={(e) =>
                  handleListItemChange(index, e.target.value, type)
                }
                className="w-full bg-transparent outline-none text-[15px] leading-[18px] font-medium text-black pr-8"
              />
              <button
                ref={(el) => {
                  buttonRefs.current[`${singularType}-${item.id}`] = el;
                }}
                className="absolute right-4"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(`${singularType}-${item.id}`, e);
                }}
              >
                <ThreeDotsIcon />
              </button>
              {openDropdown === `${singularType}-${item.id}` && (
                <div
                  className="dropdown-menu fixed z-[100]"
                  style={{
                    top: dropdownPosition.top,
                    bottom: dropdownPosition.bottom,
                    right: dropdownPosition.right,
                  }}
                >
                  <TwoElementsButton
                    firstButtonText="보관함으로 이동"
                    secondButtonText="지우기"
                    onFirstClick={() => queueArchive(type, item.id)}
                    onSecondClick={() => queueDelete(type, item.id)}
                  />
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addNewItem(type)}
            className="bg-white rounded-[5px] h-[52px] flex items-center px-4 text-[15px] leading-[18px] font-medium text-[#B3B3B3]"
          >
            {addButtonText}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div onClick={() => setOpenDropdown(null)} className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`flex justify-between items-center ${
          isMobile ? "px-5 pt-[20px] pb-4 mb-8" : "h-[41px] mb-8"
        }`}
      >
        <button onClick={onClose} className="w-8 h-8">
          <CaretRightIcon />
        </button>
        <button
          onClick={handleSaveClick}
          className="bg-[#412A2A] text-white font-semibold px-[15px] py-[10px] rounded-[5px] text-[18px] leading-[21px] h-[41px] w-20 flex items-center justify-center"
        >
          저장
        </button>
      </div>

      {/* Content */}
      <div
        className={`flex flex-col gap-6 ${
          isMobile
            ? "px-5 pb-8"
            : "max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        }`}
        style={
          isMobile ? {} : { scrollbarWidth: "none", msOverflowStyle: "none" }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* 나의 꿈 */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] leading-[17px] font-semibold text-[#808080]">
            나의 꿈
          </label>
          <div className="bg-white rounded-[5px] h-[52px] flex items-center px-4">
            <input
              type="text"
              value={data.vision.text}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-[15px] leading-[18px] font-medium text-black"
            />
          </div>
        </div>

        {/* 나의 미션 */}
        {listTypeSection("missions", "나의 미션", "+ 새로운 미션 추가하기")}

        {/* 마음가짐 */}
        {listTypeSection("mindsets", "마음가짐", "+ 새로운 마음가짐 추가하기")}
      </div>
    </div>
  );
};

export default GoalEditContent;
