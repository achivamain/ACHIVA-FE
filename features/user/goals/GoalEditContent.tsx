"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { CaretRightIcon, ThreeDotsIcon } from "@/components/Icons";
import TwoElementsButton from "@/components/TwoElementsButton";
import {
  useActiveGoals,
  categorizeGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useToggleArchive,
} from "@/hooks/useGoals";
import type {
  EditableGoal,
  EditModalData,
  PendingAction,
  GoalCategory,
  Goal,
} from "@/types/Goal";

interface GoalEditContentProps {
  onClose: () => void;
  onSave?: () => void;
  isMobile?: boolean;
}

// Goal을 EditableGoal로 변환
const toEditable = (goal: Goal): EditableGoal => ({
  id: goal.id,
  text: goal.text,
  isNew: false,
  originalText: goal.text,
});

// 임시 ID 생성 (새 항목용)
const generateTempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const GoalEditContent: React.FC<GoalEditContentProps> = ({
  onClose,
  onSave,
  isMobile = false,
}) => {
  const { data: goals, refetch } = useActiveGoals();

  // useMemo로 분류 결과 메모이제이션 (무한 루프 방지)
  const { vision, missions, mindsets } = useMemo(
    () => categorizeGoals(goals),
    [goals]
  );

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const toggleArchive = useToggleArchive();

  // 편집용 로컬 상태
  const [data, setData] = useState<EditModalData>({
    vision: null,
    missions: [],
    mindsets: [],
  });

  // 초기화 여부 추적 (한 번만 초기화)
  const isInitialized = useRef(false);

  // 대기 중인 액션 (보관/삭제)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 버튼 위치 처리 관련
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // 서버 데이터로 로컬 상태 초기화 (goals가 로드되면 한 번만)
  useEffect(() => {
    if (goals && !isInitialized.current) {
      setData({
        vision: vision ? toEditable(vision) : null,
        missions: missions.map(toEditable),
        mindsets: mindsets.map(toEditable),
      });
      isInitialized.current = true;
    }
  }, [goals, vision, missions, mindsets]);

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

  // 비전 입력
  const handleVisionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setData((prev) => ({
      ...prev,
      vision: prev.vision
        ? { ...prev.vision, text: newText }
        : { id: generateTempId(), text: newText, isNew: true },
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
    const newItem: EditableGoal = {
      id: generateTempId(),
      text: "",
      isNew: true,
    };
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
  const queueArchive = (type: "missions" | "mindsets", id: string) => {
    const item = data[type].find((item) => item.id === id);
    if (!item) return;

    // UI에서 제거
    const newList = data[type].filter((i) => i.id !== id);
    setData((prev) => ({ ...prev, [type]: newList }));

    // 새로 추가된 항목이 아니면 보관 대기열에 추가
    if (!item.isNew) {
      setPendingActions((prev) => [...prev, { type: "archive", id }]);
    }
    setOpenDropdown(null);
  };

  // 삭제
  const queueDelete = (type: "missions" | "mindsets", id: string) => {
    const item = data[type].find((item) => item.id === id);
    if (!item) return;

    // UI에서 제거
    const newList = data[type].filter((i) => i.id !== id);
    setData((prev) => ({ ...prev, [type]: newList }));

    // 새로 추가된 항목이 아니면 삭제 대기열에 추가
    if (!item.isNew) {
      setPendingActions((prev) => [...prev, { type: "delete", id }]);
    }
    setOpenDropdown(null);
  };

  // 저장
  const handleSaveClick = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const promises: Promise<unknown>[] = [];

      // 1. 대기 중인 액션 처리 (보관/삭제)
      for (const action of pendingActions) {
        if (action.type === "archive") {
          promises.push(toggleArchive.mutateAsync(action.id));
        } else if (action.type === "delete") {
          promises.push(deleteGoal.mutateAsync(action.id));
        }
      }

      // 2. 비전 처리
      if (data.vision) {
        const trimmedText = data.vision.text.trim();
        if (trimmedText) {
          if (data.vision.isNew) {
            // 새 비전 생성
            promises.push(
              createGoal.mutateAsync({
                category: "VISION" as GoalCategory,
                text: trimmedText,
              })
            );
          } else if (trimmedText !== data.vision.originalText) {
            // 기존 비전 수정 (변경된 경우만)
            promises.push(
              updateGoal.mutateAsync({
                goalId: data.vision.id,
                data: { category: "VISION", text: trimmedText },
              })
            );
          }
        }
      }

      // 3. 미션 처리
      for (const mission of data.missions) {
        const trimmedText = mission.text.trim();
        if (!trimmedText) continue; // 빈 텍스트는 무시

        if (mission.isNew) {
          promises.push(
            createGoal.mutateAsync({
              category: "MISSION" as GoalCategory,
              text: trimmedText,
            })
          );
        } else if (trimmedText !== mission.originalText) {
          // 변경된 경우만 업데이트
          promises.push(
            updateGoal.mutateAsync({
              goalId: mission.id,
              data: { category: "MISSION", text: trimmedText },
            })
          );
        }
      }

      // 4. 마음가짐 처리
      for (const mindset of data.mindsets) {
        const trimmedText = mindset.text.trim();
        if (!trimmedText) continue; // 빈 텍스트는 무시

        if (mindset.isNew) {
          promises.push(
            createGoal.mutateAsync({
              category: "MINDSET" as GoalCategory,
              text: trimmedText,
            })
          );
        } else if (trimmedText !== mindset.originalText) {
          // 변경된 경우만 업데이트
          promises.push(
            updateGoal.mutateAsync({
              goalId: mindset.id,
              data: { category: "MINDSET", text: trimmedText },
            })
          );
        }
      }

      // 모든 요청 실행
      await Promise.all(promises);

      // 최신 데이터 refetch
      await refetch();

      // 성공 시 모달 닫기
      if (onSave) {
        onSave();
      } else {
        onClose();
      }
    } catch (err) {
      console.error("목표 저장 실패:", err);
      setError("저장에 실패했습니다. 다시 시도해주세요.");
      // 실패해도 최신 데이터로 동기화
      await refetch();
    } finally {
      setIsSaving(false);
    }
  };

  // 취소 (변경 사항 폐기)
  const handleCancelClick = () => {
    onClose();
  };

  // 미션, 마음가짐 공통
  const listTypeSection = (
    type: "missions" | "mindsets",
    label: string,
    addButtonText: string
  ) => {
    const items = data[type];

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
                placeholder={item.isNew ? "내용을 입력하세요" : ""}
              />
              <button
                ref={(el) => {
                  buttonRefs.current[`${type}-${item.id}`] = el;
                }}
                className="absolute right-4"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(`${type}-${item.id}`, e);
                }}
              >
                <ThreeDotsIcon />
              </button>
              {openDropdown === `${type}-${item.id}` && (
                <div
                  className="dropdown-menu fixed z-[100]"
                  style={{
                    top: dropdownPosition.top,
                    bottom: dropdownPosition.bottom,
                    right: dropdownPosition.right,
                  }}
                >
                  <TwoElementsButton
                    firstButtonText={item.isNew ? "취소" : "보관함으로 이동"}
                    secondButtonText="지우기"
                    onFirstClick={() =>
                      item.isNew
                        ? queueDelete(type, item.id)
                        : queueArchive(type, item.id)
                    }
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
        <button
          onClick={handleCancelClick}
          disabled={isSaving}
          className="w-8 h-8 disabled:opacity-50"
        >
          <CaretRightIcon />
        </button>
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="bg-[#412A2A] text-white font-semibold px-[15px] py-[10px] rounded-[5px] text-[18px] leading-[21px] h-[41px] w-20 flex items-center justify-center disabled:opacity-50"
        >
          {isSaving ? "저장중..." : "저장"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-5 mb-4 p-3 bg-red-100 text-red-600 rounded-[5px] text-sm">
          {error}
        </div>
      )}

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
              value={data.vision?.text ?? ""}
              onChange={handleVisionChange}
              placeholder="나의 비전을 입력하세요"
              className="w-full bg-transparent outline-none text-[15px] leading-[18px] font-medium text-black placeholder:text-[#B3B3B3]"
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
