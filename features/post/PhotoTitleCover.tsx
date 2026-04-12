import PostImg from "@/components/PostImg";

type Props = {
  photoUrl?: string | null;
  title: React.ReactNode;
  dateLabel?: string;
  metaLabel?: string;
};

export default function PhotoTitleCover({
  photoUrl,
  title,
  dateLabel,
  metaLabel,
}: Props) {
  return (
    <div className="relative aspect-square w-[390px] h-[390px] overflow-hidden">
      <PostImg url={photoUrl ?? null} />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,22,16,0.4) 0%, rgba(30,22,16,0.3) 34%, rgba(30,22,16,0.4) 100%)",
        }}
      />

      <div className="absolute inset-x-[20px] top-[34px] z-10">
        <div className="min-h-[54px]">{title}</div>
      </div>

      <div
        className="absolute left-[20px] right-[20px] top-[94px] h-px"
        style={{ background: "rgba(255,255,255,0.26)" }}
      />

      {(dateLabel || metaLabel) && (
        <div className="absolute bottom-[22px] left-[20px] right-[20px] z-10 flex items-end justify-between gap-4">
          <span className="text-[12px] font-medium tracking-[0.1em] text-white/78">
            {dateLabel}
          </span>
          <span className="text-right text-[13px] font-medium text-white/78">
            {metaLabel}
          </span>
        </div>
      )}
    </div>
  );
}
