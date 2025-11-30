import { useEffect, useState } from "react";
import { type BookCoverImage, bookCoverImages } from "@/types/BookCoverImages";
import { useBookCoverImageStore } from "@/store/BookCoverImageStore";

function svgEdit(name: string, svg: string, color = "#FFFFFF") {
  let modifiedSvg = svg;
  modifiedSvg = modifiedSvg.replace(/cls-/g, `cls-${name}-`); //스타일 충돌 방지
  modifiedSvg = modifiedSvg.replace(/#7f7373/g, `transparent`); //배경투명화
  /*if (color) {
          //특정 색상으로 변경시
        } else {
          //이미지 목록에 뜰 때
        }*/
  return modifiedSvg;
}

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
  const [isError, setIsError] = useState(false);
  const { getCache, setCache } = useBookCoverImageStore();

  useEffect(() => {
    let filename: string;
    //없는 이미지 방지
    if (bookCoverImages.includes(name as BookCoverImage)) {
      filename = name;
    } else {
      filename = "default";
    }

    // 캐시 확인
    const cacheKey = `${filename}`;

    const cached = getCache(cacheKey);
    if (cached) {
      setSvgContent(svgEdit(filename, cached, color));
      return;
    }

    //로딩
    fetch(`/images/${filename}.svg`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`이미지 로딩 실패`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("svg")) {
          throw new Error(`잘못된 이미지`);
        }
        return res.text();
      })
      .then((svg) => {
        setCache(filename, svg);
        setSvgContent(svgEdit(filename, svg, color));
      })
      .catch((err) => {
        console.error(`이미지 로딩 실패: ${filename}`, err);
        setIsError(true);
      });
  }, [name, isError, color]);

  if (isError) {
    return <div className={className} />; //에러 시에는 아무 이미지도 안 뜹니다.
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgContent }}
      className={className}
    />
  );
}
