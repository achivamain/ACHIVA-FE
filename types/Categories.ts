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
  "헬스": "/images/categories/01_weightTraining.svg",
  "맨몸운동": "/images/categories/01_bodyweight.svg",
  "크로스핏": "/images/categories/01_crossfit.svg",
  // 02. 유산소
  "러닝": "/images/categories/02_running.svg",
  "걷기": "/images/categories/02_walking.svg",
  "사이클": "/images/categories/02_cycle.svg",
  // 03. 구기종목
  "축구": "/images/categories/03_soccer.svg",
  "풋살": "/images/categories/03_futsal.svg",
  "농구": "/images/categories/03_basketball.svg",
  "야구": "/images/categories/03_baseball.svg",
  "배구": "/images/categories/03_volleyball.svg",
  "럭비": "/images/categories/03_rugby.svg",
  // 04. 라켓 / 스틱
  /*
  "탁구": "/images/categories/04_tableTennis.svg",
  "배드민턴": "/images/categories/04_badminton.svg",
  "테니스": "/images/categories/04_tennis.svg",
  "하키": "/images/categories/04_hockey.svg",
  // 05. 정밀 / 과녁
  "볼링": "/images/categories/05_bowling.svg",
  "골프": "/images/categories/05_golf.svg", */
  


  "탁구": "images/categories/13.png",
  "배드민턴": "images/categories/14.png",
  "테니스": "images/categories/15.png",
  "하키": "images/categories/16.png",
  "볼링": "images/categories/17.png",
  "골프": "images/categories/18.png", 
  // 06. 격투 / 무술
  "복싱": "/images/categories/06_boxing.svg",
  "MMA": "/images/categories/06_mma.svg",
  "태권도": "/images/categories/06_taekwondo.svg",
  "레슬링": "/images/categories/06_wrestling.svg",
  "유도": "/images/categories/06_judo.svg",
  "주짓수": "/images/categories/06_jujitsu.svg",
  "검도/펜싱": "/images/categories/06_kendo.svg",
  // 07. 수상
  "수영": "/images/categories/07_swimming.svg",
  "서핑": "/images/categories/07_surfing.svg",
  "조정": "/images/categories/07_rowing.svg",
  // 08. 자세
  "요가": "/images/categories/08_yoga.svg",
  "필라테스": "/images/categories/08_pilates.svg",
  "스트레칭": "/images/categories/08_stretching.svg",
  // 09. 등반
  "클라이밍": "/images/categories/09_climbing.svg",
  "등산": "/images/categories/09_hiking.svg",
  // 10. 스케이트 / 스키
  "롤러/인라인": "/images/categories/10_roller.svg",
  "보드": "/images/categories/10_skateboard.svg",
  "빙상": "/images/categories/10_iceSkate.svg",
  "스키/보드": "/images/categories/10_ski.svg",
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
