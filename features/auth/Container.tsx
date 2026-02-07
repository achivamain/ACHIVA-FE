"use client";
// 웹 signUp에서 글자 보이는 컨테이너, 현재는 모바일과 비슷한 크기 사용하도록 설정
// border + padding + 가운데 정렬 까지만!!

type Props = {
  classes?: string;
  children: React.ReactNode;
};
export default function Container({ classes = "", children }: Props) {
  return (
    <div
      className={`w-screen sm:w-108 ${classes} rounded-[15px] sm:border sm:border-theme px-7 py-7 flex flex-col`}
    >
      {children}
    </div>
  );
}
