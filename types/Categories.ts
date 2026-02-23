import type { StaticImageData } from "next/image";
import imgWeightTraining from "@/public/images/categories/01_weightTraining.webp";
import imgBodyweight from "@/public/images/categories/01_bodyweight.webp";
import imgCrossfit from "@/public/images/categories/01_crossfit.webp";
import imgRunning from "@/public/images/categories/02_running.webp";
import imgWalking from "@/public/images/categories/02_walking.webp";
import imgCycle from "@/public/images/categories/02_cycle.webp";
import imgSoccer from "@/public/images/categories/03_soccer.webp";
import imgFutsal from "@/public/images/categories/03_futsal.webp";
import imgBasketball from "@/public/images/categories/03_basketball.webp";
import imgBaseball from "@/public/images/categories/03_baseball.webp";
import imgVolleyball from "@/public/images/categories/03_volleyball.webp";
import imgRugby from "@/public/images/categories/03_rugby.webp";
import imgTableTennis from "@/public/images/categories/04_tableTennis.webp";
import imgBadminton from "@/public/images/categories/04_badminton.webp";
import imgTennis from "@/public/images/categories/04_tennis.webp";
import imgHockey from "@/public/images/categories/04_hockey.webp";
import imgBowling from "@/public/images/categories/05_bowling.webp";
import imgGolf from "@/public/images/categories/05_golf.webp";
import imgBoxing from "@/public/images/categories/06_boxing.webp";
import imgMma from "@/public/images/categories/06_mma.webp";
import imgTaekwondo from "@/public/images/categories/06_taekwondo.webp";
import imgWrestling from "@/public/images/categories/06_wrestling.webp";
import imgJudo from "@/public/images/categories/06_judo.webp";
import imgJujitsu from "@/public/images/categories/06_jujitsu.webp";
import imgKendo from "@/public/images/categories/06_kendo.webp";
import imgSwimming from "@/public/images/categories/07_swimming.webp";
import imgSurfing from "@/public/images/categories/07_surfing.webp";
import imgRowing from "@/public/images/categories/07_rowing.webp";
import imgYoga from "@/public/images/categories/08_yoga.webp";
import imgPilates from "@/public/images/categories/08_pilates.webp";
import imgStretching from "@/public/images/categories/08_stretching.webp";
import imgClimbing from "@/public/images/categories/09_climbing.webp";
import imgHiking from "@/public/images/categories/09_hiking.webp";
import imgRoller from "@/public/images/categories/10_roller.webp";
import imgSkateboard from "@/public/images/categories/10_skateboard.webp";
import imgIceSkate from "@/public/images/categories/10_iceSkate.webp";
import imgSki from "@/public/images/categories/10_ski.webp";

export const categories = [
  // 01. 근력 / 트레이닝
  "헬스",
  "맨몸운동",
  "크로스핏",
  // 02. 유산소
  "러닝",
  "걷기",
  "사이클",
  // 03. 구기종목
  "축구",
  "풋살",
  "농구",
  "야구",
  "배구",
  "럭비",
  // 04. 라켓 / 스틱
  "탁구",
  "배드민턴",
  "테니스",
  "하키",
  // 05. 정밀 / 과녁
  "볼링",
  "골프",
  // 06. 격투 / 무술
  "복싱",
  "MMA",
  "태권도",
  "레슬링",
  "유도",
  "주짓수",
  "검도/펜싱",
  // 07. 수상
  "수영",
  "서핑",
  "조정",
  // 08. 자세
  "요가",
  "필라테스",
  "스트레칭",
  // 09. 등반
  "클라이밍",
  "등산",
  // 10. 스케이트 / 스키
  "롤러/인라인",
  "보드",
  "빙상",
  "스키/보드",
] as const;

export const categoryImages: Record<Category, StaticImageData> = {
  // 01. 근력 / 트레이닝
  "헬스": imgWeightTraining,
  "맨몸운동": imgBodyweight,
  "크로스핏": imgCrossfit,
  // 02. 유산소
  "러닝": imgRunning,
  "걷기": imgWalking,
  "사이클": imgCycle,
  // 03. 구기종목
  "축구": imgSoccer,
  "풋살": imgFutsal,
  "농구": imgBasketball,
  "야구": imgBaseball,
  "배구": imgVolleyball,
  "럭비": imgRugby,
  // 04. 라켓 / 스틱
  "탁구": imgTableTennis,
  "배드민턴": imgBadminton,
  "테니스": imgTennis,
  "하키": imgHockey,
  // 05. 정밀 / 과녁
  "볼링": imgBowling,
  "골프": imgGolf,
  // 06. 격투 / 무술
  "복싱": imgBoxing,
  "MMA": imgMma,
  "태권도": imgTaekwondo,
  "레슬링": imgWrestling,
  "유도": imgJudo,
  "주짓수": imgJujitsu,
  "검도/펜싱": imgKendo,
  // 07. 수상
  "수영": imgSwimming,
  "서핑": imgSurfing,
  "조정": imgRowing,
  // 08. 자세
  "요가": imgYoga,
  "필라테스": imgPilates,
  "스트레칭": imgStretching,
  // 09. 등반
  "클라이밍": imgClimbing,
  "등산": imgHiking,
  // 10. 스케이트 / 스키
  "롤러/인라인": imgRoller,
  "보드": imgSkateboard,
  "빙상": imgIceSkate,
  "스키/보드": imgSki,
};

// figma 기준 이미지 높이 px
export const categoryImageHeights: Record<Category, number> = {
  // 01. 근력 / 트레이닝
  "헬스": 40,
  "맨몸운동": 38,
  "크로스핏": 43,
  // 02. 유산소
  "러닝": 42,
  "걷기": 33,
  "사이클": 40,
  // 03. 구기종목
  "축구": 39,
  "풋살": 36,
  "농구": 43,
  "야구": 43,
  "배구": 37,
  "럭비": 32,
  // 04. 라켓 / 스틱
  "탁구": 49,
  "배드민턴": 51,
  "테니스": 46,
  "하키": 50,
  // 05. 정밀 / 과녁
  "볼링": 41,
  "골프": 45,
  // 06. 격투 / 무술
  "복싱": 40,
  "MMA": 42,
  "태권도": 40,
  "레슬링": 42,
  "유도": 42,
  "주짓수": 44,
  "검도/펜싱": 43,
  // 07. 수상
  "수영": 37,
  "서핑": 46,
  "조정": 42,
  // 08. 자세
  "요가": 62,
  "필라테스": 51,
  "스트레칭": 41,
  // 09. 등반
  "클라이밍": 46,
  "등산": 55,
  // 10. 스케이트 / 스키
  "롤러/인라인": 42,
  "보드": 40,
  "빙상": 42,
  "스키/보드": 42,
};

//소분류로 나눠진 버전
export const groupedCategorys: { groupName: string; categories: Category[] }[] =
  [
    {
      groupName: "근력 / 트레이닝",
      categories: ["헬스", "맨몸운동", "크로스핏"],
    },
    {
      groupName: "유산소",
      categories: ["러닝", "걷기", "사이클"],
    },
    {
      groupName: "구기종목",
      categories: [
        "축구",
        "풋살",
        "농구",
        "야구",
        "배구",
        "럭비",
      ],
    },
    {
      groupName: "라켓 / 스틱",
      categories: ["탁구", "배드민턴", "테니스", "하키"],
    },
    {
      groupName: "정밀 / 과녁",
      categories: ["볼링", "골프"],
    },
    {
      groupName: "격투 / 무술",
      categories: [
        "복싱",
        "MMA",
        "태권도",
        "레슬링",
        "유도",
        "주짓수",
        "검도/펜싱",
      ],
    },
    {
      groupName: "수상",
      categories: ["수영", "서핑", "조정"],
    },
    {
      groupName: "자세",
      categories: ["요가", "필라테스", "스트레칭"],
    },
    {
      groupName: "등반",
      categories: ["클라이밍", "등산"],
    },
    {
      groupName: "스케이트 / 스키",
      categories: ["롤러/인라인", "보드", "빙상", "스키/보드"],
    },
  ];

export type Category = (typeof categories)[number];
