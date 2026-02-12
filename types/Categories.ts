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

export const categoryImages: Record<Category, string> = {
  // 01. 근력 / 트레이닝
  "헬스": "/images/categories/01_weightTraining.webp",
  "맨몸운동": "/images/categories/01_bodyweight.webp",
  "크로스핏": "/images/categories/01_crossfit.webp",
  // 02. 유산소
  "러닝": "/images/categories/02_running.webp",
  "걷기": "/images/categories/02_walking.webp",
  "사이클": "/images/categories/02_cycle.webp",
  // 03. 구기종목
  "축구": "/images/categories/03_soccer.webp",
  "풋살": "/images/categories/03_futsal.webp",
  "농구": "/images/categories/03_basketball.webp",
  "야구": "/images/categories/03_baseball.webp",
  "배구": "/images/categories/03_volleyball.webp",
  "럭비": "/images/categories/03_rugby.webp",
  // 04. 라켓 / 스틱
  "탁구": "/images/categories/04_tableTennis.webp",
  "배드민턴": "/images/categories/04_badminton.webp",
  "테니스": "/images/categories/04_tennis.webp",
  "하키": "/images/categories/04_hockey.webp",
  // 05. 정밀 / 과녁
  "볼링": "/images/categories/05_bowling.webp",
  "골프": "/images/categories/05_golf.webp",
  // 06. 격투 / 무술
  "복싱": "/images/categories/06_boxing.webp",
  "MMA": "/images/categories/06_mma.webp",
  "태권도": "/images/categories/06_taekwondo.webp",
  "레슬링": "/images/categories/06_wrestling.webp",
  "유도": "/images/categories/06_judo.webp",
  "주짓수": "/images/categories/06_jujitsu.webp",
  "검도/펜싱": "/images/categories/06_kendo.webp",
  // 07. 수상
  "수영": "/images/categories/07_swimming.webp",
  "서핑": "/images/categories/07_surfing.webp",
  "조정": "/images/categories/07_rowing.webp",
  // 08. 자세
  "요가": "/images/categories/08_yoga.webp",
  "필라테스": "/images/categories/08_pilates.webp",
  "스트레칭": "/images/categories/08_stretching.webp",
  // 09. 등반
  "클라이밍": "/images/categories/09_climbing.webp",
  "등산": "/images/categories/09_hiking.webp",
  // 10. 스케이트 / 스키
  "롤러/인라인": "/images/categories/10_roller.webp",
  "보드": "/images/categories/10_skateboard.webp",
  "빙상": "/images/categories/10_iceSkate.webp",
  "스키/보드": "/images/categories/10_ski.webp",
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
