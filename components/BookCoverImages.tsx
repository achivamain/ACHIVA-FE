import { useEffect, useState } from "react";
import { type BookCoverImage, bookCoverImages } from "@/types/BookCoverImages";

export function BookCoverImage({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    let filename: string;
    if (bookCoverImages.includes(name as BookCoverImage)) {
      filename = name;
    } else {
      filename = "default"; //없는 이미지 방지
    }

    fetch(`/images/${filename}.svg`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`이미지 로딩 실패`);
        }
        // Content-Type 확인
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("svg")) {
          throw new Error(`잘못된 이미지`);
        }
        return res.text();
      })
      .then((svg) => {
        let modifiedSvg = svg;
        modifiedSvg = modifiedSvg.replace(/cls-/g, `cls-${filename}-`); //스타일 충돌 방지
        modifiedSvg = modifiedSvg.replace(/#7f7373/g, `transparent`); //배경투명화
        /*if (color) {
          //특정 색상으로 변경시
        } else {
          //이미지 목록에 뜰 때
        }*/
        setSvgContent(modifiedSvg);
      })
      .catch((err) => {
        console.error(`이미지 로딩 실패: ${filename}.svg`, err);
      });
  }, [name /*color*/]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgContent }}
      className={className}
    />
  );
}
