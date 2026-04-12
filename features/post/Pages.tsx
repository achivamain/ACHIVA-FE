import { PostRes } from "@/types/Post";
import type { Question } from "@/types/Post";
import { format } from "date-fns";
import {
  getPostPageSurface,
  getPostPageTone,
  isAlbumCategory,
} from "@/lib/postPageTheme";
import PaperTitleCover from "./PaperTitleCover";
import PhotoTitleCover from "./PhotoTitleCover";

type Props = {
  size: number;
  post: PostRes;
};

export function TitlePage({ size, post }: Props) {
  const date = new Date(post.createdAt);
  const weeklyCount = post.weeklyWorkoutCount ?? null;
  const streakWeeks = post.continuousGoalWeeks ?? null;
  const coverPhotoUrl = post.photoUrls?.[0] || null;
  const usePhotoCover = isAlbumCategory(post.category) && !!coverPhotoUrl;

  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 390})`,
          transformOrigin: "top left",
        }}
        className="aspect-square w-[390px] h-[390px] relative overflow-hidden"
      >
        {usePhotoCover ? (
          <PhotoTitleCover
            photoUrl={coverPhotoUrl}
            dateLabel={format(date, "yyyy · MM · dd")}
            metaLabel={`${post.category} · ${post.authorCategorySeq}번째 이야기`}
            title={
              <h1
                className="font-bold leading-[1.15] text-white/[0.97]"
                style={{
                  fontSize: "38px",
                  letterSpacing: "-0.01em",
                  textShadow: "0 4px 18px rgba(0,0,0,0.22)",
                }}
              >
                {post.title}
              </h1>
            }
          />
        ) : (
          <PaperTitleCover
            dateLabel={format(date, "yyyy · MM · dd")}
            metaLabel={`${post.category} · ${post.authorCategorySeq}번째 이야기`}
            weeklyCount={weeklyCount}
            streakWeeks={streakWeeks}
            title={
              <h1
                className="font-bold leading-[1.15] text-[#4A312B]"
                style={{
                  fontSize: "38px",
                  letterSpacing: "-0.01em",
                }}
              >
                {post.title}
              </h1>
            }
          />
        )}
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
  backgroundColor: string | null;
}) {
  const tone = getPostPageTone(backgroundColor);

  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 430})`,
          transformOrigin: "top left",
          ...getPostPageSurface(backgroundColor),
        }}
        className={`relative overflow-hidden aspect-square w-[430px] h-[430px] px-[20px] pt-[92px] pb-[30px] ${tone.shellTextClassName}`}
      >
        <div
          className="absolute left-[20px] right-[20px] top-[70px] h-px"
          style={{ background: tone.accentLineColor }}
        />
        <div
          className="absolute w-[160px] h-[160px] rounded-full blur-[42px] -top-[48px] -left-[20px]"
          style={{ background: tone.ornamentColor }}
        />
        {page.question && (
          <div className="absolute left-[20px] right-[20px] top-[20px] z-10">
            <h2
              className={`w-full overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-[24px] leading-[34px] font-medium tracking-[-0.01em] ${tone.subtitleClassName}`}
            >
              {page.question}
            </h2>
          </div>
        )}
        <div className="relative z-10 h-full">
          <div
            className={`w-full bg-transparent text-[15px] leading-[24px] font-[inherit] whitespace-pre-wrap ${tone.contentClassName}`}
          >
            {page.content}
          </div>
        </div>
      </div>
    </div>
  );
}
