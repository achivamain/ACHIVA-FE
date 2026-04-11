export type Testament = "old" | "new";

export type ScriptureId = string;

export type ScriptureMeta = {
  id: ScriptureId;
  name: string;
  testament: Testament;
  totalChapters: number;
  displayOrder: number;
};

export type ReadingRange = {
  startChapter: number;
  endChapter: number;
  label: string;
};

export const scriptures: ScriptureMeta[] = [
  { id: "창세기", name: "창세기", testament: "old", totalChapters: 50, displayOrder: 1 },
  { id: "출애굽기", name: "출애굽기", testament: "old", totalChapters: 40, displayOrder: 2 },
  { id: "레위기", name: "레위기", testament: "old", totalChapters: 27, displayOrder: 3 },
  { id: "민수기", name: "민수기", testament: "old", totalChapters: 36, displayOrder: 4 },
  { id: "신명기", name: "신명기", testament: "old", totalChapters: 34, displayOrder: 5 },
  { id: "여호수아", name: "여호수아", testament: "old", totalChapters: 24, displayOrder: 6 },
  { id: "사사기", name: "사사기", testament: "old", totalChapters: 21, displayOrder: 7 },
  { id: "룻기", name: "룻기", testament: "old", totalChapters: 4, displayOrder: 8 },
  { id: "사무엘상", name: "사무엘상", testament: "old", totalChapters: 31, displayOrder: 9 },
  { id: "사무엘하", name: "사무엘하", testament: "old", totalChapters: 24, displayOrder: 10 },
  { id: "열왕기상", name: "열왕기상", testament: "old", totalChapters: 22, displayOrder: 11 },
  { id: "열왕기하", name: "열왕기하", testament: "old", totalChapters: 25, displayOrder: 12 },
  { id: "역대상", name: "역대상", testament: "old", totalChapters: 29, displayOrder: 13 },
  { id: "역대하", name: "역대하", testament: "old", totalChapters: 36, displayOrder: 14 },
  { id: "에스라", name: "에스라", testament: "old", totalChapters: 10, displayOrder: 15 },
  { id: "느헤미야", name: "느헤미야", testament: "old", totalChapters: 13, displayOrder: 16 },
  { id: "에스더", name: "에스더", testament: "old", totalChapters: 10, displayOrder: 17 },
  { id: "욥기", name: "욥기", testament: "old", totalChapters: 42, displayOrder: 18 },
  { id: "시편", name: "시편", testament: "old", totalChapters: 150, displayOrder: 19 },
  { id: "잠언", name: "잠언", testament: "old", totalChapters: 31, displayOrder: 20 },
  { id: "전도서", name: "전도서", testament: "old", totalChapters: 12, displayOrder: 21 },
  { id: "아가", name: "아가", testament: "old", totalChapters: 8, displayOrder: 22 },
  { id: "이사야", name: "이사야", testament: "old", totalChapters: 66, displayOrder: 23 },
  { id: "예레미야", name: "예레미야", testament: "old", totalChapters: 52, displayOrder: 24 },
  { id: "예레미야애가", name: "예레미야애가", testament: "old", totalChapters: 5, displayOrder: 25 },
  { id: "에스겔", name: "에스겔", testament: "old", totalChapters: 48, displayOrder: 26 },
  { id: "다니엘", name: "다니엘", testament: "old", totalChapters: 12, displayOrder: 27 },
  { id: "호세아", name: "호세아", testament: "old", totalChapters: 14, displayOrder: 28 },
  { id: "요엘", name: "요엘", testament: "old", totalChapters: 3, displayOrder: 29 },
  { id: "아모스", name: "아모스", testament: "old", totalChapters: 9, displayOrder: 30 },
  { id: "오바댜", name: "오바댜", testament: "old", totalChapters: 1, displayOrder: 31 },
  { id: "요나", name: "요나", testament: "old", totalChapters: 4, displayOrder: 32 },
  { id: "미가", name: "미가", testament: "old", totalChapters: 7, displayOrder: 33 },
  { id: "나훔", name: "나훔", testament: "old", totalChapters: 3, displayOrder: 34 },
  { id: "하박국", name: "하박국", testament: "old", totalChapters: 3, displayOrder: 35 },
  { id: "스바냐", name: "스바냐", testament: "old", totalChapters: 3, displayOrder: 36 },
  { id: "학개", name: "학개", testament: "old", totalChapters: 2, displayOrder: 37 },
  { id: "스가랴", name: "스가랴", testament: "old", totalChapters: 14, displayOrder: 38 },
  { id: "말라기", name: "말라기", testament: "old", totalChapters: 4, displayOrder: 39 },
  { id: "마태복음", name: "마태복음", testament: "new", totalChapters: 28, displayOrder: 40 },
  { id: "마가복음", name: "마가복음", testament: "new", totalChapters: 16, displayOrder: 41 },
  { id: "누가복음", name: "누가복음", testament: "new", totalChapters: 24, displayOrder: 42 },
  { id: "요한복음", name: "요한복음", testament: "new", totalChapters: 21, displayOrder: 43 },
  { id: "사도행전", name: "사도행전", testament: "new", totalChapters: 28, displayOrder: 44 },
  { id: "로마서", name: "로마서", testament: "new", totalChapters: 16, displayOrder: 45 },
  { id: "고린도전서", name: "고린도전서", testament: "new", totalChapters: 16, displayOrder: 46 },
  { id: "고린도후서", name: "고린도후서", testament: "new", totalChapters: 13, displayOrder: 47 },
  { id: "갈라디아서", name: "갈라디아서", testament: "new", totalChapters: 6, displayOrder: 48 },
  { id: "에베소서", name: "에베소서", testament: "new", totalChapters: 6, displayOrder: 49 },
  { id: "빌립보서", name: "빌립보서", testament: "new", totalChapters: 4, displayOrder: 50 },
  { id: "골로새서", name: "골로새서", testament: "new", totalChapters: 4, displayOrder: 51 },
  { id: "데살로니가전서", name: "데살로니가전서", testament: "new", totalChapters: 5, displayOrder: 52 },
  { id: "데살로니가후서", name: "데살로니가후서", testament: "new", totalChapters: 3, displayOrder: 53 },
  { id: "디모데전서", name: "디모데전서", testament: "new", totalChapters: 6, displayOrder: 54 },
  { id: "디모데후서", name: "디모데후서", testament: "new", totalChapters: 4, displayOrder: 55 },
  { id: "디도서", name: "디도서", testament: "new", totalChapters: 3, displayOrder: 56 },
  { id: "빌레몬서", name: "빌레몬서", testament: "new", totalChapters: 1, displayOrder: 57 },
  { id: "히브리서", name: "히브리서", testament: "new", totalChapters: 13, displayOrder: 58 },
  { id: "야고보서", name: "야고보서", testament: "new", totalChapters: 5, displayOrder: 59 },
  { id: "베드로전서", name: "베드로전서", testament: "new", totalChapters: 5, displayOrder: 60 },
  { id: "베드로후서", name: "베드로후서", testament: "new", totalChapters: 3, displayOrder: 61 },
  { id: "요한일서", name: "요한일서", testament: "new", totalChapters: 5, displayOrder: 62 },
  { id: "요한이서", name: "요한이서", testament: "new", totalChapters: 1, displayOrder: 63 },
  { id: "요한삼서", name: "요한삼서", testament: "new", totalChapters: 1, displayOrder: 64 },
  { id: "유다서", name: "유다서", testament: "new", totalChapters: 1, displayOrder: 65 },
  { id: "요한계시록", name: "요한계시록", testament: "new", totalChapters: 22, displayOrder: 66 },
];

export const scriptureById = Object.fromEntries(
  scriptures.map((scripture) => [scripture.id, scripture]),
) as Record<ScriptureId, ScriptureMeta>;

export const initialReadingRangesByScriptureId: Record<ScriptureId, ReadingRange[]> = {
  요한복음: [{ startChapter: 1, endChapter: 3, label: "이번 주 시작" }],
  시편: [
    { startChapter: 1, endChapter: 5, label: "이번 주 말씀" },
    { startChapter: 6, endChapter: 8, label: "오늘의 묵상" },
  ],
  로마서: [{ startChapter: 1, endChapter: 2, label: "첫 기록" }],
};

export const featuredScriptureIds: ScriptureId[] = [
  "요한복음",
  "마태복음",
  "시편",
  "창세기",
  "로마서",
  "사도행전",
];

export const bibleBooks = scriptures;
export const featuredBookIds = featuredScriptureIds;
export const initialReadingRangesByBookId = initialReadingRangesByScriptureId;

export function getScriptureMeta(scriptureId: ScriptureId) {
  return scriptureById[scriptureId];
}
