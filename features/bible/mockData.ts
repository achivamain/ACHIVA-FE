export type Testament = "old" | "new";

export type BibleBook = {
  id: string;
  name: string;
  testament: Testament;
  totalChapters: number;
};

export type ReadingRange = {
  startChapter: number;
  endChapter: number;
  label: string;
};

export const bibleBooks: BibleBook[] = [
  { id: "genesis", name: "창세기", testament: "old", totalChapters: 50 },
  { id: "exodus", name: "출애굽기", testament: "old", totalChapters: 40 },
  { id: "leviticus", name: "레위기", testament: "old", totalChapters: 27 },
  { id: "numbers", name: "민수기", testament: "old", totalChapters: 36 },
  { id: "deuteronomy", name: "신명기", testament: "old", totalChapters: 34 },
  { id: "joshua", name: "여호수아", testament: "old", totalChapters: 24 },
  { id: "judges", name: "사사기", testament: "old", totalChapters: 21 },
  { id: "ruth", name: "룻기", testament: "old", totalChapters: 4 },
  { id: "1samuel", name: "사무엘상", testament: "old", totalChapters: 31 },
  { id: "2samuel", name: "사무엘하", testament: "old", totalChapters: 24 },
  { id: "1kings", name: "열왕기상", testament: "old", totalChapters: 22 },
  { id: "2kings", name: "열왕기하", testament: "old", totalChapters: 25 },
  { id: "1chronicles", name: "역대상", testament: "old", totalChapters: 29 },
  { id: "2chronicles", name: "역대하", testament: "old", totalChapters: 36 },
  { id: "ezra", name: "에스라", testament: "old", totalChapters: 10 },
  { id: "nehemiah", name: "느헤미야", testament: "old", totalChapters: 13 },
  { id: "esther", name: "에스더", testament: "old", totalChapters: 10 },
  { id: "job", name: "욥기", testament: "old", totalChapters: 42 },
  { id: "psalms", name: "시편", testament: "old", totalChapters: 150 },
  { id: "proverbs", name: "잠언", testament: "old", totalChapters: 31 },
  { id: "ecclesiastes", name: "전도서", testament: "old", totalChapters: 12 },
  { id: "songofsongs", name: "아가", testament: "old", totalChapters: 8 },
  { id: "isaiah", name: "이사야", testament: "old", totalChapters: 66 },
  { id: "jeremiah", name: "예레미야", testament: "old", totalChapters: 52 },
  { id: "lamentations", name: "예레미야애가", testament: "old", totalChapters: 5 },
  { id: "ezekiel", name: "에스겔", testament: "old", totalChapters: 48 },
  { id: "daniel", name: "다니엘", testament: "old", totalChapters: 12 },
  { id: "hosea", name: "호세아", testament: "old", totalChapters: 14 },
  { id: "joel", name: "요엘", testament: "old", totalChapters: 3 },
  { id: "amos", name: "아모스", testament: "old", totalChapters: 9 },
  { id: "obadiah", name: "오바댜", testament: "old", totalChapters: 1 },
  { id: "jonah", name: "요나", testament: "old", totalChapters: 4 },
  { id: "micah", name: "미가", testament: "old", totalChapters: 7 },
  { id: "nahum", name: "나훔", testament: "old", totalChapters: 3 },
  { id: "habakkuk", name: "하박국", testament: "old", totalChapters: 3 },
  { id: "zephaniah", name: "스바냐", testament: "old", totalChapters: 3 },
  { id: "haggai", name: "학개", testament: "old", totalChapters: 2 },
  { id: "zechariah", name: "스가랴", testament: "old", totalChapters: 14 },
  { id: "malachi", name: "말라기", testament: "old", totalChapters: 4 },
  { id: "matthew", name: "마태복음", testament: "new", totalChapters: 28 },
  { id: "mark", name: "마가복음", testament: "new", totalChapters: 16 },
  { id: "luke", name: "누가복음", testament: "new", totalChapters: 24 },
  { id: "john", name: "요한복음", testament: "new", totalChapters: 21 },
  { id: "acts", name: "사도행전", testament: "new", totalChapters: 28 },
  { id: "romans", name: "로마서", testament: "new", totalChapters: 16 },
  { id: "1corinthians", name: "고린도전서", testament: "new", totalChapters: 16 },
  { id: "2corinthians", name: "고린도후서", testament: "new", totalChapters: 13 },
  { id: "galatians", name: "갈라디아서", testament: "new", totalChapters: 6 },
  { id: "ephesians", name: "에베소서", testament: "new", totalChapters: 6 },
  { id: "philippians", name: "빌립보서", testament: "new", totalChapters: 4 },
  { id: "colossians", name: "골로새서", testament: "new", totalChapters: 4 },
  { id: "1thessalonians", name: "데살로니가전서", testament: "new", totalChapters: 5 },
  { id: "2thessalonians", name: "데살로니가후서", testament: "new", totalChapters: 3 },
  { id: "1timothy", name: "디모데전서", testament: "new", totalChapters: 6 },
  { id: "2timothy", name: "디모데후서", testament: "new", totalChapters: 4 },
  { id: "titus", name: "디도서", testament: "new", totalChapters: 3 },
  { id: "philemon", name: "빌레몬서", testament: "new", totalChapters: 1 },
  { id: "hebrews", name: "히브리서", testament: "new", totalChapters: 13 },
  { id: "james", name: "야고보서", testament: "new", totalChapters: 5 },
  { id: "1peter", name: "베드로전서", testament: "new", totalChapters: 5 },
  { id: "2peter", name: "베드로후서", testament: "new", totalChapters: 3 },
  { id: "1john", name: "요한일서", testament: "new", totalChapters: 5 },
  { id: "2john", name: "요한이서", testament: "new", totalChapters: 1 },
  { id: "3john", name: "요한삼서", testament: "new", totalChapters: 1 },
  { id: "jude", name: "유다서", testament: "new", totalChapters: 1 },
  { id: "revelation", name: "요한계시록", testament: "new", totalChapters: 22 },
];

export const initialReadingRangesByBookId: Record<string, ReadingRange[]> = {
  john: [
    { startChapter: 1, endChapter: 3, label: "어제 기록" },
  ],
  psalms: [
    { startChapter: 1, endChapter: 5, label: "이번 주" },
    { startChapter: 6, endChapter: 8, label: "오늘 아침" },
  ],
  romans: [
    { startChapter: 1, endChapter: 2, label: "첫 기록" },
  ],
};

export const featuredBookIds = [
  "john",
  "matthew",
  "psalms",
  "genesis",
  "romans",
  "acts",
];
