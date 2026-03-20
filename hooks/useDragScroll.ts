"use client";

import React, { useEffect, useRef, useState } from "react";

type UseDragScrollOptions = {
  dragThreshold?: number;
};

export default function useDragScroll<T extends HTMLElement>({
  dragThreshold = 4,
}: UseDragScrollOptions = {}) {
  const scrollRef = useRef<T | null>(null);
  const dragStateRef = useRef<{
    startX: number;
    scrollLeft: number;
  }>({
    startX: 0,
    scrollLeft: 0,
  });
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = scrollRef.current;
      if (!container) return;

      const deltaX = event.clientX - dragStateRef.current.startX;

      if (Math.abs(deltaX) > dragThreshold) {
        suppressClickRef.current = true;
      }

      container.scrollLeft = dragStateRef.current.scrollLeft - deltaX;
    };

    const stopDragging = () => {
      setIsDragging(false);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
    };
  }, [dragThreshold, isDragging]);

  const handleMouseDown = (event: React.MouseEvent<T>) => {
    if (event.button !== 0 || !scrollRef.current) return;

    dragStateRef.current = {
      startX: event.clientX,
      scrollLeft: scrollRef.current.scrollLeft,
    };
    suppressClickRef.current = false;
    setIsDragging(true);
  };

  // True이면 이후의 Onclick 무시됨
  const shouldSuppressClick = () => suppressClickRef.current;

  return {
    scrollRef,
    isDragging,
    dragProps: {
      onMouseDown: handleMouseDown,
    },
    shouldSuppressClick,
  };
}
