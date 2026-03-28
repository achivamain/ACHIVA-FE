type PostCountBadgeProps = {
  articleCount?: number | null;
};

export default function PostCountBadge({
  articleCount,
}: PostCountBadgeProps) {
  if (!articleCount) return null;

  return (
    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-50 to-orange-100 px-2 py-0.5 rounded-full border border-orange-200 shadow-sm whitespace-nowrap">
      <span className="text-[10px] leading-none mb-[1px]">🔥</span>
      <span className="text-[10px] font-bold text-orange-600 leading-none">
        {articleCount.toLocaleString()}
      </span>
    </div>
  );
}
