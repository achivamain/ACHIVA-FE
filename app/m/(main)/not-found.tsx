import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-5">페이지가 존재하지 않습니다 :(</h2>
      <p>클릭하신 링크가 잘못되었거나 페이지가 삭제되었습니다.</p>
      <Link href="/" className="text-theme hover:underline">
        메인으로 돌아가기
      </Link>
    </div>
  );
}
