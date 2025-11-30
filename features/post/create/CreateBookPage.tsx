import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import { useState } from "react";
import { NextStepButton } from "./Buttons";
import { bookCoverColors } from "../bookCoverColors";
import { BookCoverImage as BookCoverImageType, bookCoverImages } from "@/types/BookCoverImages";
import Image from "next/image";
import getColorVariants from "@/lib/getColorVariants";
import { BookCoverImage } from "@/components/BookCoverImages";

export default function CreateBookPage() {
  const [coverColor, setCoverColor] = useState("#77B5C1");
  const [coverImage, setCoverImage] = useState<BookCoverImageType>("default");
  const [title, setTitle] = useState("");
  const draft = useDraftPostStore.use.post();
  const setPost = useDraftPostStore.use.setPost();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();
  const [currentStep, setCurrentStep] = useState("color");

  const { shadecolor, tintcolor } = getColorVariants(coverColor);

  const book = (
    <div className="flex gap-6 flex-col justify-center">
      <div className="flex justify-center items-center flex-col overflow-hidden w-full">
        <div
          className="aspect-[3/4] w-[211px] rounded-md relative shadow-sm"
          style={{
            background: `linear-gradient(to bottom right, ${tintcolor}, 10% ,${coverColor}, 90%, ${shadecolor})`,
          }}
        >
          <div
            className="h-full w-2 absolute left-[5%]"
            style={{
              background: `linear-gradient(to right, #00000000, ${shadecolor}, ${shadecolor}, #00000000)`,
            }}
          />
          <div className="absolute w-[90%] h-[90%] right-1 bottom-0">
            <BookCoverImage
              name={coverImage}
              color={coverColor}
              className="w-full h-full object-cover p-2"
            />
          </div>
          <div className="absolute top-2 right-2 text-xl px-[11px] py-[2px] gap-2 text-[#412A2A] bg-white border border-[#D9D9D9] rounded-md font-semibold">
            {draft.category}
          </div>
        </div>
        <div className="gap-1 w-[211px]">
          <input
            type="text"
            maxLength={10} //일단 임의로 제한함
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 작성해주세요"
            className="w-[200px] mt-4 font-semibold p-0 focus:outline-none text-[24px] overflow-hidden text-ellipsis whitespace-nowrap"
          />
          <p className="font-light text-[#808080A3] text-[20px]">
            첫번째 이야기
          </p>
        </div>
      </div>
    </div>
  );

  let content: React.ReactNode;
  let next: string;
  switch (currentStep) {
    case "color":
      content = (
        <div className=" h-100 w-lg h-[32rem] mt-8 flex justify-center items-center flex-col w-full">
          {book}
          <div className="mt-8 mb-8 flex flex-row gap-3 items-center">
            {bookCoverColors.map((color) => (
              <button
                key={color}
                onClick={() => setCoverColor(color)}
                className={`relative w-10 h-10 rounded-md cursor-pointer ${
                  color == "#F9F9F9" ? "border border-[#D4D4D4]" : " "
                }`}
                style={{ backgroundColor: color }}
              >
                {color === coverColor && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <path
                      d="M21.7949 7.54597L9.79492 19.546C9.6904 19.6509 9.56621 19.7341 9.42947 19.7909C9.29272 19.8476 9.14611 19.8769 8.99804 19.8769C8.84998 19.8769 8.70337 19.8476 8.56662 19.7909C8.42988 19.7341 8.30569 19.6509 8.20117 19.546L2.95117 14.296C2.84652 14.1913 2.76351 14.0671 2.70688 13.9304C2.65024 13.7936 2.62109 13.6471 2.62109 13.4991C2.62109 13.3511 2.65024 13.2046 2.70688 13.0678C2.76351 12.9311 2.84652 12.8069 2.95117 12.7022C3.05582 12.5976 3.18005 12.5146 3.31678 12.4579C3.45351 12.4013 3.60005 12.3721 3.74805 12.3721C3.89604 12.3721 4.04258 12.4013 4.17931 12.4579C4.31604 12.5146 4.44027 12.5976 4.54492 12.7022L8.99898 17.1563L20.203 5.9541C20.4144 5.74276 20.701 5.62402 20.9999 5.62402C21.2988 5.62402 21.5854 5.74276 21.7968 5.9541C22.0081 6.16544 22.1269 6.45209 22.1269 6.75098C22.1269 7.04986 22.0081 7.33651 21.7968 7.54785L21.7949 7.54597Z"
                      fill="white"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <NextStepButton
            onClick={() => setCurrentStep(next)}
            disabled={!title}
          >
            다음
          </NextStepButton>
        </div>
      );
      next = "image";
      break;

    case "image":
      content = (
        <div className="w-[50rem] h-[30rem] mt-8 flex justify-around flex-row overflow-hidden">
          <div className="w-sm flex-col h-full justify-between items-between flex-shrink-0">
            {book}
            <div className="mt-8">
              <NextStepButton
                onClick={() => {
                  const newBook = {
                    id: "",
                    title: title,
                    category: draft.category,
                    count: 0,
                    coverColor: coverColor,
                    coverImage: coverImage,
                  };
                  setPost({ book: newBook });
                  handleNextStep();
                  handleNextStep();
                }}
                disabled={!title}
              >
                완료
              </NextStepButton>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-3 gap-4">
              {bookCoverImages.map((img) => (
                <div
                  key={img}
                  className="relative aspect-[1/1] cursor-pointer"
                  onClick={() => setCoverImage(img)}
                >
                  <Image
                    src={`/images/${img}.svg`}
                    alt={img}
                    fill
                    className="object-contain"
                  ></Image>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      next = "fin";
      break;
  }

  return <>{content}</>;
}
