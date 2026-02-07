import Link from "next/link";

export default function Banner() {
  return (
    <Link
      className="mt-45 sticky top-5 h-fit border border-[#d9d9d9] bg-white rounded-md"
      href="https://achivamain.notion.site/25df9799dbb8807291dee19394e1347b"
    >
      <section className="flex flex-col gap-7 px-5 py-10">
        <p className="font-bold text-xl">
          나/오/운
          <br />
          이벤트
        </p>
        <p className="font-bold">나만의 운동 미니북</p>
        <p className="text-sm">
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
      </section>
    </Link>
  );
}
