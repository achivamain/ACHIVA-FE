import { FormEvent, useEffect, useState, useRef, useCallback } from "react";
import { getYear, differenceInYears } from "date-fns";
import { NextStepButton } from "./Buttons";
import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";

const ITEM_HEIGHT = 39;
const VISIBLE_ITEMS = 5; // 보여지는 항목 수

interface WheelColumnProps {
  items: number[];
  selected: number;
  onChange: (value: number) => void;
  suffix: string;
}

function WheelColumn({ items, selected, onChange, suffix }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const scrollToSelected = useCallback(() => {
    if (containerRef.current && !isScrolling.current) {
      const index = items.indexOf(selected);
      if (index !== -1) {
        containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [items, selected]);

  useEffect(() => {
    scrollToSelected();
  }, [scrollToSelected]);

  const handleScroll = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    isScrolling.current = true;

    scrollTimeout.current = setTimeout(() => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

        containerRef.current.scrollTo({
          top: clampedIndex * ITEM_HEIGHT,
          behavior: "smooth",
        });

        if (items[clampedIndex] !== selected) {
          onChange(items[clampedIndex]);
        }
      }
      isScrolling.current = false;
    }, 100);
  };

  // Opacity 이용해서 조정하면 픽셀이 깨져서 색상으로 사용 
  const getColor = (index: number): string => {
    const selectedIndex = items.indexOf(selected);
    const distance = Math.abs(index - selectedIndex);

    if (distance === 0) return "#412A2A"; // opacity = 1
    if (distance === 1) return "#9F9494"; // opacity = 0.5
    return "#DAD5D5"; // Opacity = 0.15
  };


  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative overflow-y-scroll scrollbar-hide"
      style={{
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        scrollSnapType: "y mandatory",
      }}
    >
      {/* padding */}
      <div style={{ height: ITEM_HEIGHT * 2 }} />

      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-center justify-center cursor-pointer"
          style={{
            height: ITEM_HEIGHT,
            scrollSnapAlign: "center",
            color: getColor(index),
            fontWeight: 400,
            fontSize: "24px",
            lineHeight: "29px",
            transition: "color 0.15s ease",
          }}
          onClick={() => {
            onChange(item);
            if (containerRef.current) {
              containerRef.current.scrollTo({
                top: index * ITEM_HEIGHT,
                behavior: "smooth",
              });
            }
          }}
        >
          <span className="text-right whitespace-nowrap">
            {String(item).padStart(suffix === "년" ? 4 : 2, "0")}
            {suffix}
          </span>
        </div>
      ))}

      {/* padding */}
      <div style={{ height: ITEM_HEIGHT * 2 }} />
    </div>
  );
}

export default function BirthdayForm() {
  const setUser = useSignupInfoStore.use.setUser();
  const handleNextStep = useSignupStepStore.use.handleNextStep();
  const today = new Date();
  const [year, setYear] = useState(getYear(today) - 20);
  const [month, setMonth] = useState(9);
  const [day, setDay] = useState(1);
  const [error, setError] = useState("");
  const [isEdited, setIsEdited] = useState(true);

  const years = Array.from(
    { length: getYear(today) - 1899 },
    (_, i) => 1900 + i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const [days, setDays] = useState<number[]>([]);

  useEffect(() => {
    const lastDay = new Date(year, month, 0).getDate();
    setDays(Array.from({ length: lastDay }, (_, i) => i + 1));
    if (day > lastDay) {
      setDay(lastDay);
    }

    const birthday = new Date(year, month - 1, day);
    const age = differenceInYears(new Date(), birthday);
    if (age < 13 && isEdited) {
      setError("만 14세 이상만 회원 가입이 가능합니다.");
    } else {
      setError("");
    }
  }, [day, year, month, isEdited]);

  const handleYearChange = (value: number) => {
    setIsEdited(true);
    setYear(value);
  };

  const handleMonthChange = (value: number) => {
    setIsEdited(true);
    setMonth(value);
  };

  const handleDayChange = (value: number) => {
    setIsEdited(true);
    setDay(value);
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUser({ birth: new Date(year, month - 1, day) });
    handleNextStep();
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 제목 및 설명 */}
      <div className="w-full text-left">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          생일을 입력해주세요
        </p>
        <p className="font-light text-[15px] leading-[18px] text-[#808080] mt-2.5 break-keep">
          연령 확인은 계정 보호 및 서비스 이용을 위한 절차이며, 입력하신
          생년월일은 다른 사용자에게 공개되지 않습니다.
        </p>
      </div>

      <form
        className="flex flex-col items-center flex-1 justify-between"
        onSubmit={handleSubmit}
      >
        <div className="relative flex justify-center items-center gap-[30px] flex-1">
          <div
            className="absolute left-0 right-0 pointer-events-none border-y border-theme"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              height: ITEM_HEIGHT,
            }}
          />

          <WheelColumn
            items={years}
            selected={year}
            onChange={handleYearChange}
            suffix="년"
          />

          <WheelColumn
            items={months}
            selected={month}
            onChange={handleMonthChange}
            suffix="월"
          />

          {days.length > 0 && (
            <WheelColumn
              items={days}
              selected={day}
              onChange={handleDayChange}
              suffix="일"
            />
          )}
        </div>

        {/* 에러 메시지 */}
        <div className="h-10 flex items-center justify-center">
          {error && (
            <p className="text-sm font-light text-theme-red">{error}</p>
          )}
        </div>

        {/* 다음 버튼 */}
        <div className="w-full">
          <NextStepButton disabled={!!error}>다음</NextStepButton>
        </div>
      </form>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
