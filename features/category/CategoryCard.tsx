import { Category, categoryImages } from "@/types/Categories";

type CategoryCardProps = {
  name: Category;
  image?: string;
  background: boolean;
};

export function CategoryCard({ name, image, background }: CategoryCardProps) {
  const imageSrc = image ?? categoryImages[name];

  return (
    <div className="flex flex-col justify-center item-center h-full ">
      <div
        className={`flex items-center justify-center h-18 w-18 ${background ? "bg-[#F3F3F3]" : "bg-white"} rounded-md`}
      >
        {imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={name} />
        )}
      </div>
      <span className="font-medium text-[15px] text-center mt-1">
        {name}
      </span>
    </div>
  );
}
