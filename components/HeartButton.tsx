"use client";

import React from "react";
import { motion, useAnimationControls } from "motion/react";
import { HeartIcon } from "@/components/Icons";

interface HeartButtonProps {
  onClick: () => void;
}

// 목표 페이지의 하트 버튼
const HeartButton: React.FC<HeartButtonProps> = ({ onClick }) => {
  const controls = useAnimationControls();

  const handleClick = async () => {
    onClick();
    await controls.start({
      scale: [1, 1.25, 1],
      transition: {
        duration: 0.2,
        times: [0, 0.5, 1],
        ease: "easeInOut",
      },
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      className="w-8 h-8 flex items-center justify-center flex-shrink-0"
      animate={controls}
    >
      <HeartIcon />
    </motion.button>
  );
};

export default HeartButton;
