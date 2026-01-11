import { PostRes } from "@/types/Post";
import type { Question } from "@/types/Post";
import PostImg from "@/components/PostImg";
import { format } from "date-fns";

type Props = {
  size: number;
  post: PostRes;
};

export function TitlePage({ size, post }: Props) {
  const date = new Date(post.createdAt);


  return (
    <div
      style={{
        height: size,
        width: size,
      }}
    >
      <div
        style={{
          transform: `scale(${size / 390})`,
          transformOrigin: "top left",
        }}
        className="aspect-square w-[390px] h-[390px] relative"
      >
         <PostImg url={post.photoUrl} filtered />
        <div className="absolute top-[90px] left-[23px]">
          <div className="font-light text-[16px] text-white/70">
            {format(date, "yyyy.MM.dd")}
          </div>
          <h1 className="font-semibold text-[45px] text-white/80 mb-[24px] leading-[50px]">
            {post.title}
          </h1>
          <div className="text-[32px] font-light text-white leading-[40px]">
            <div>
              <span className="font-bold">{post.category}</span> 기록
            </div>
            <div>
              <span className="font-bold">{post.authorCategorySeq}번째</span>{" "}이야기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentPage({
  size,
  page,
  backgroundColor,
}: {
  size: number;
  page: Question;
  backgroundColor: string;
}) {
  return (
    <div
      style={{
        height: size,
        width: size,
      }}
    >
      <div
        style={{
          transform: `scale(${size / 430})`,
          transformOrigin: "top left",
          backgroundColor: backgroundColor,
        }}
        className={`aspect-square w-[430px] h-[430px] py-[95px] px-[20px] ${
          backgroundColor === "#f9f9f9" ? "text-black" : "text-white"
        }`}
      >
        <div>
          {page.question && (
            <h2 className="font-semibold text-[32px] mb-[24px] leading-[50px]">
              {page.question}
            </h2>
          )}

          <div className="whitespace-pre-wrap">{page.content}</div>
        </div>
      </div>
    </div>
  );
}
