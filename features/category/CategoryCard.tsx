type CategoryCardProps = {
  name: string;
  image?: string;
};

export function CategoryCard({ name, image = "" }: CategoryCardProps) {
  return (
    <div className="flex flex-col h-full justify-center item-center">
      <div className="h-18 w-18 bg-[#D9D9D9] rounded-md">
        {/*Image*/}
      </div>
      <span className="font-semibold text-[15px] text-center pt-0.5">{name}</span>
    </div>
  );
}
