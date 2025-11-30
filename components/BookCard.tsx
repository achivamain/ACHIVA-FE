import { Book } from "@/types/Book";
import { BookCoverImage } from "./BookCoverImages";
import getColorVariants from "@/lib/getColorVariants";

//디자인은 수정 예정
export function BookCard({ book, width }: { book: Book; width?: number }) {
  const { shadecolor, tintcolor } = getColorVariants(book.coverColor);

  return (
    <div className="h-full flex-1 flex flex-col">
      <div
        className={`aspect-[3/4] rounded-md relative shadow-sm`}
        style={{
          background: `linear-gradient(to bottom right, ${tintcolor}, 10% ,${book.coverColor}, 90%, ${shadecolor})`,
          width: width,
        }}
      >
        <div
          className="h-full w-2 absolute left-[5%]"
          style={{
            background: `linear-gradient(to right, #00000000, ${shadecolor}, ${shadecolor}, #00000000)`,
          }}
        ></div>
        <div className="absolute w-[90%] h-[90%] right-1 bottom-0">
          <BookCoverImage
            name={book.coverImage}
            color={book.coverColor}
            className="w-full h-full object-cover p-2"
          />
        </div>
        <div className="absolute top-2 right-[3px] px-[11px] py-[2px] gap-2 text-[#412A2A] bg-white border border-[#D9D9D9] rounded-md font-semibold">
          {book.category}
        </div>
      </div>
      <div className="px-4 h-full flex-1 flex flex-col">
        <p className="font-semibold text-lg mt-3 overflow-hidden text-ellipsis whitespace-nowrap">
          {book.title}
        </p>
        <p className="font-light text-[#808080] text-sm mt-0">
          {book.count === 0 ? "첫번째" : `${book.count}번째`} 이야기
        </p>
      </div>
    </div>
  );
}

export function BookCardSkeleton({ width }: { width?: number }) {
  return (
    <div className="h-full flex-1 flex flex-col">
      <div
        className={`aspect-[3/4] rounded-md relative animate-pulse bg-gray-200`}
        style={{
          width: width,
        }}
      ></div>
      <div className="pl-4 pr-4 h-full flex-1 flex flex-col">
        <div className="animate-pulse bg-gray-200 h-6 mt-3" />
        <div className="animate-pulse bg-gray-200 h-4 mt-0" />
      </div>
    </div>
  );
}
