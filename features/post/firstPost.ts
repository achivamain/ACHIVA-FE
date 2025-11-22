import type { PostRes } from "@/types/Post";
import { defaultProfileImg } from "../user/defaultProfileImg";

// 하... 이거 손좀보자
export function getFirstPage(): PostRes {
  return {
    id: "5",
    photoUrl: "",
    title: "",
    category: "",
    question: [
      {
        question: "나를 응원해준 사람들의 이야기",
        content: `어치바의 홈 피드는 
단순한 추천 피드가 아닙니다

당신의 성취를 함께 기뻐하며,
힘껏 응원해준 사람들의 게시물이 모이는 공간입니다`,
      },
      {
        question: "당신의 성취를 남겨보세요",
        content: `작은 성취라도 괜찮습니다

어치바와 함께 하는 사람들이
따뜻한 응원으로 답할 거예요

그리고 그들의 이야기가 이 공간을 채워갈 것입니다
`,
      },
      {
        question: "응원을 건네주세요",
        content: `응원은 나눌수록 돌아오고, 더 커집니다

받은 만큼, 주고 싶은 만큼,

아끼지 말고 응원을 되돌려주세요`,
      },
      {
        question: "먼저 다가가세요",
        content: `홈을 내려 관심 있는 카테고리의 게시글을 살펴보세요

마음에 드는 글을 발견했다면,
먼저 다가가 응원을 건네보세요

그 마음은 분명,
당신의 성취에도 응원으로 돌아올 것입니다`,
      },
      {
        question: "어치바에서 이뤄보세요",
        content: `오늘의 작은 발걸임이
내일의 큰 성취가 됩니다

지금 시작해보세요`,
      },
    ],
    memberId: "string", // 임시
    memberNickName: "Achiva",
    memberProfileUrl: defaultProfileImg,
    backgroundColor: "#f9f9f9",
    authorCategorySeq: 0,
    createdAt: "", // 계정 생성 시각
    updatedAt: "",
    cheerings: [],
    bookTitle: false,
  };
}
