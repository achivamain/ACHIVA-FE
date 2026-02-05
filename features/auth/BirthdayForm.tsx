import { FormEvent, useEffect, useState, useRef, useCallback } from "react";
import { getYear, differenceInYears } from "date-fns";
import { NextStepButton } from "./Buttons";
import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";

// 웹의 경우에 호환되는 휠 관련 라이브러리가 없어서 직접 구현하였습니다.
// 괜찮은 라이브러리 있거나 하면 수정해주세요.. 코드가 너무 기네요

const ITEM_HEIGHT = 39;
const VISIBLE_ITEMS = 5;
const FRICTION = 0.93; // 숫자가 크면 휠이 빨리 돌아가요 
const MIN_VELOCITY = 0.5;
const VELOCITY_THRESHOLD = 2;

interface WheelColumnProps {
  items: number[];
  selected: number;
  onChange: (value: number) => void;
  suffix: string;
}

function WheelColumn({ items, selected, onChange, suffix }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const scrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);

  const maxScroll = (items.length - 1) * ITEM_HEIGHT;

  // 애니메이션 취소 헬퍼 함수
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // 인덱스 클램핑 헬퍼 함수 
  const clampIndex = useCallback(
    (index: number) => Math.max(0, Math.min(index, items.length - 1)),
    [items.length]
  );

  // 스크롤 위치 업데이트
  const updateScrollTop = useCallback((value: number) => {
    scrollTopRef.current = value;
    setScrollTop(value);
  }, []);

  // 렌더링 충돌 방지용
  const notifyChange = useCallback(
    (index: number) => {
      const clampedIndex = clampIndex(index);
      if (items[clampedIndex] !== selected) {
        queueMicrotask(() => onChange(items[clampedIndex]));
      }
    },
    [items, selected, onChange, clampIndex]
  );

  const animateToPosition = useCallback(
    (targetPosition: number, shouldNotify = false) => {
      cancelAnimation();

      const animate = () => {
        const current = scrollTopRef.current;
        const distance = targetPosition - current;

        if (Math.abs(distance) < 0.5) {
          updateScrollTop(targetPosition);
          animationRef.current = null;
          if (shouldNotify) notifyChange(Math.round(targetPosition / ITEM_HEIGHT));
          return;
        }

        updateScrollTop(current + distance * 0.15);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [cancelAnimation, updateScrollTop, notifyChange]
  );

  // 가장 가까운 항목으로 보내기
  const snapToNearest = useCallback(
    (scroll: number, notify = true) => {
      const index = clampIndex(Math.round(scroll / ITEM_HEIGHT));
      animateToPosition(index * ITEM_HEIGHT, notify);
    },
    [clampIndex, animateToPosition]
  );

  // 관성 스크롤
  const startInertiaScroll = useCallback(() => {
    cancelAnimation();

    const animate = () => {
      velocityRef.current *= FRICTION;

      if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
        snapToNearest(scrollTopRef.current);
        return;
      }

      const newScroll = scrollTopRef.current + velocityRef.current;

      if (newScroll < 0 || newScroll > maxScroll) {
        velocityRef.current = 0;
        animateToPosition(newScroll < 0 ? 0 : maxScroll, true);
        return;
      }

      updateScrollTop(newScroll);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [cancelAnimation, snapToNearest, animateToPosition, maxScroll, updateScrollTop]);

  // 포인터 이벤트 핸들러
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    cancelAnimation();

    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startScrollRef.current = scrollTopRef.current;
    lastYRef.current = e.clientY;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    pointerIdRef.current = e.pointerId;

    containerRef.current?.setPointerCapture(e.pointerId);
  }, [cancelAnimation]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const currentY = e.clientY;
    const deltaTime = Date.now() - lastTimeRef.current;

    if (deltaTime > 0) {
      const instantVelocity = ((lastYRef.current - currentY) / deltaTime) * 16;
      velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6;
    }

    const delta = startYRef.current - currentY;
    let newScroll = startScrollRef.current + delta;

    // 경계에서 저항감 추가하기 위한 부분
    if (newScroll < 0) newScroll *= 0.3;
    else if (newScroll > maxScroll) newScroll = maxScroll + (newScroll - maxScroll) * 0.3;

    updateScrollTop(newScroll);
    lastYRef.current = currentY;
    lastTimeRef.current = Date.now();
  }, [maxScroll, updateScrollTop]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pointerIdRef.current !== null) {
      containerRef.current?.releasePointerCapture(pointerIdRef.current);
      pointerIdRef.current = null;
    }

    const current = scrollTopRef.current;

    // 경계 밖이면 복귀
    if (current < 0 || current > maxScroll) {
      animateToPosition(current < 0 ? 0 : maxScroll, true);
      return;
    }

    if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
      startInertiaScroll();
    } else {
      snapToNearest(current);
    }
  }, [maxScroll, animateToPosition, startInertiaScroll, snapToNearest]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    cancelAnimation();
    velocityRef.current = e.deltaY * 0.12;
    startInertiaScroll();
  }, [cancelAnimation, startInertiaScroll]);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const index = items.indexOf(selected);
    if (index !== -1) {
      const initial = index * ITEM_HEIGHT;
      scrollTopRef.current = initial;
      setScrollTop(initial);
    }
  }, []);

  // 외부에서 selected 변경 시 스크롤
  useEffect(() => {
    if (!isDraggingRef.current && !animationRef.current) {
      const index = items.indexOf(selected);
      if (index !== -1 && Math.round(scrollTop / ITEM_HEIGHT) !== index) {
        animateToPosition(index * ITEM_HEIGHT);
      }
    }
  }, [selected, items, animateToPosition, scrollTop]);

  // 클린업
  useEffect(() => () => cancelAnimation(), [cancelAnimation]);

  const handleItemClick = useCallback((item: number, index: number) => {
    if (isDraggingRef.current) return;
    cancelAnimation();
    onChange(item);
    animateToPosition(index * ITEM_HEIGHT);
  }, [cancelAnimation, onChange, animateToPosition]);

  const getColor = (index: number): string => {
    const distance = Math.abs(index - scrollTop / ITEM_HEIGHT);
    if (distance < 0.5) return "#412A2A";
    if (distance < 1.5) return "#9F9494";
    return "#DAD5D5";
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      onWheel={handleWheel}
      className="relative overflow-hidden select-none touch-none"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, cursor: "grab" }}
    >
      <div style={{ transform: `translateY(${-scrollTop}px)`, willChange: "transform" }}>
        <div style={{ height: ITEM_HEIGHT * 2 }} />
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-center justify-center"
            style={{
              height: ITEM_HEIGHT,
              color: getColor(index),
              fontWeight: 400,
              fontSize: "24px",
              lineHeight: "29px",
            }}
            onClick={() => handleItemClick(item, index)}
          >
            <span className="whitespace-nowrap">
              {String(item).padStart(suffix === "년" ? 4 : 2, "0")}{suffix}
            </span>
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>
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
  const [days, setDays] = useState<number[]>([]);
  const [error, setError] = useState("");

  const years = Array.from({ length: getYear(today) - 1899 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    const lastDay = new Date(year, month, 0).getDate();
    setDays(Array.from({ length: lastDay }, (_, i) => i + 1));
    if (day > lastDay) setDay(lastDay);

    const birthday = new Date(year, month - 1, day);
    const age = differenceInYears(new Date(), birthday);
    setError(age < 13 ? "만 14세 이상만 회원 가입이 가능합니다." : "");
  }, [day, year, month]);

  const handleChange = (setter: (v: number) => void) => (value: number) => setter(value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUser({ birth: new Date(year, month - 1, day) });
    handleNextStep();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full text-left">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          생일을 입력해주세요
        </p>
        <p className="font-light text-[15px] leading-[18px] text-[#808080] mt-2.5 break-keep">
          연령 확인은 계정 보호 및 서비스 이용을 위한 절차이며, 입력하신
          생년월일은 다른 사용자에게 공개되지 않습니다.
        </p>
      </div>

      <form className="flex flex-col items-center flex-1 justify-between" onSubmit={handleSubmit}>
        <div className="relative flex justify-center items-center gap-[30px] flex-1">
          <div
            className="absolute left-0 right-0 pointer-events-none border-y border-theme"
            style={{ top: "50%", transform: "translateY(-50%)", height: ITEM_HEIGHT }}
          />
          <WheelColumn items={years} selected={year} onChange={handleChange(setYear)} suffix="년" />
          <WheelColumn items={months} selected={month} onChange={handleChange(setMonth)} suffix="월" />
          {days.length > 0 && (
            <WheelColumn items={days} selected={day} onChange={handleChange(setDay)} suffix="일" />
          )}
        </div>

        <div className="h-10 flex items-center justify-center">
          {error && <p className="text-sm font-light text-theme-red">{error}</p>}
        </div>

        <div className="w-full">
          <NextStepButton disabled={!!error}>다음</NextStepButton>
        </div>
      </form>
    </div>
  );
}
