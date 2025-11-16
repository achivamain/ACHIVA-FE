import { Book } from "@/types/Book";

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }
  return Math.round(hue * 60);
}

//디자인은 수정 예정
export default function BookCard({
  book,
  width,
}: {
  book: Book;
  width?: number;
}) {
  const cleanHex = book.coverColor.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const color = [r, g, b];
  const shadecolor = `#${color
    .map((i) =>
      Math.floor(i * 0.9)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
  const tintcolor = `#${color
    .map((i) =>
      Math.floor(Math.min(i * 1.1, 255))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

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
          className="h-full w-2 absolute left-2"
          style={{
            background: `linear-gradient(to right, #00000000, ${shadecolor}, ${shadecolor}, #00000000)`,
          }}
        ></div>
        <div className="absolute w-[90%] h-[90%] right-1 bottom-0">
          <img
            src={`/images/${book.coverImage}.png`}
            alt={book.coverImage}
            className="w-full h-full object-cover p-2"
            style={{
              filter: `
                  hue-rotate(${hexToHue(book.coverColor)}deg)
                  `,
            }}
          />
        </div>
        <div className="absolute top-2 right-[3px] px-[11px] py-[2px] gap-2 text-[#412A2A] bg-white border border-[#D9D9D9] rounded-md font-semibold">
          {book.category}
        </div>
      </div>
      <div className="pl-4 pr-4 h-full flex-1 flex flex-col">
        <p className="font-semibold text-lg mt-3">{book.title}</p>
        <p className="font-light text-[#808080] text-sm mt-0">
          {book.count === 0 ? "첫번째" : `${book.count + 1}번째`} 이야기
        </p>
      </div>
    </div>
  );
}
