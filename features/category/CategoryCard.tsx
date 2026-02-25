import Image from "next/image";
import { Category, categoryImages, categoryImageHeights } from "@/types/Categories";

type CategoryCardProps = {
  name: Category;
  background: boolean;
};

export function CategoryCard({ name, background }: CategoryCardProps) {
  const imageSrc = categoryImages[name];
  const imageHeight = categoryImageHeights[name];

  return (
    <div className="flex flex-col justify-center item-center h-full ">
      <div
        className={`flex items-center justify-center h-18 w-18 ${background ? "bg-[#F3F3F3]" : "bg-white"} rounded-md`}
      >
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={name}
            height={imageHeight}
            className="w-auto object-contain"
            style={{ height: imageHeight }}
          />
        )}
      </div>
      <span className="font-medium text-[15px] text-center mt-1">
        {name}
      </span>
    </div>
  );
}
