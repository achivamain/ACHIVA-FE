"use client";

import React, { useEffect, useRef, useState } from "react";

type UseDragScrollOptions = {
  dragThreshold?: number;
};

export default function useDragScroll<T extends HTMLElement>({
  dragThreshold = 4,
}: UseDragScrollOptions = {}) {
  const scrollRef = useRef<T | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const container = scrollRef.current;
      const dragState = dragStateRef.current;

      if (!container || !dragState.isDragging) return;

      const deltaX = event.clientX - dragState.startX;

      if (Math.abs(deltaX) > dragThreshold) {
        suppressClickRef.current = true;
      }

      container.scrollLeft = dragState.scrollLeft - deltaX;
    };

    const stopDragging = () => {
      if (!dragStateRef.current.isDragging) return;

      dragStateRef.current.isDragging = false;
      setIsDragging(false);

      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [dragThreshold]);

  const handleMouseDown = (event: React.MouseEvent<T>) => {
    if (event.button !== 0 || !scrollRef.current) return;

    dragStateRef.current = {
      isDragging: true,
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
    onMouseDown: handleMouseDown,
    shouldSuppressClick,
  };
}
