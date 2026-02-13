import { Category, categoryImages, categoryImageHeights } from "@/types/Categories";

type CategoryCardProps = {
  name: Category;
  image?: string;
  background: boolean;
};

export function CategoryCard({ name, image, background }: CategoryCardProps) {
  const imageSrc = image ?? categoryImages[name];
  const imageHeight = categoryImageHeights[name];

  return (
    <div className="flex flex-col h-full justify-center item-center">
      <div className={`h-18 w-18 ${background ? "bg-[#F3F3F3]" : "bg-white"} rounded-md flex items-center justify-center`}>
        {imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={name}
            style={{ height: imageHeight }}
            className="w-auto object-contain"
          />
        )}
      </div>
      <span className="font-semibold text-[15px] text-center pt-0.5">{name}</span>
    </div>
  );
}
