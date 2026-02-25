import Link from "next/link";

export default function Banner() {
  return (
    <div
      className="sticky top-[135px] flex flex-col items-center gap-5 mt-[135px]"
      style={{ fontFamily: "var(--font-urbanist), sans-serif" }}
    >
      <Link
        href="https://achivamain.notion.site/25df9799dbb8807291dee19394e1347b"
        className="w-[256px] bg-white border border-[#D9D9D9] rounded-[10px] flex flex-col px-[27px] pt-[54px] pb-[41px]"
      >
        <p className="font-bold text-[22px] leading-[130%] tracking-[-0.01em] text-black">
          Achiva
          <br />
          이벤트
        </p>
        <p className="mt-[30px] font-bold text-[17px] leading-[130%] tracking-[-0.01em] text-black">
          나만의 성취 미니북
        </p>
        <p className="mt-[31px] font-normal text-[15px] leading-[130%] tracking-[-0.01em] text-black">
          작은 성취들이 모여
          <br />
          당신만의 소중한 책이 됩니다
          <br />
          <br />
          100번째 이야기,
          <br />
          그 소중한 기록을
          <br />
          <br />
          더욱 특별하게 바꿔보세요
        </p>
      </Link>

      <div
        className="flex flex-col items-start gap-2"
        style={{ fontFamily: "var(--font-pretendard), sans-serif" }}
      >
        <div className="flex flex-row items-center gap-[5px]">
          <span className="text-[13px] leading-[16px] text-[#412A2A] font-normal">
            이용약관
          </span>
          <div className="w-px h-[15px] bg-[rgba(65,42,42,0.5)]" />
          <span className="text-[13px] leading-[16px] text-[#412A2A] font-bold">
            개인정보 처리방침
          </span>
          <div className="w-px h-[15px] bg-[rgba(65,42,42,0.5)]" />
          <span className="text-[13px] leading-[16px] text-[#412A2A] font-normal">
            문의사항
          </span>
        </div>
        <p className="text-[13px] leading-[16px] text-[#412A2A] font-normal">
          © 나는오늘운동한다
        </p>
      </div>
    </div>
  );
}
