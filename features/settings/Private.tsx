export default function Private() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-theme">
        사용자 또는 게시글 신고
      </h2>
      <p className="font-light text-[#808080]">
        나는오늘운동한다 이용 중 부적절한 행위나 게시글을 발견하신 경우,{" "}
        <br className="sm:hidden" />
        아래를 통해 신고해 주시면 신속히 처리하겠습니다.
      </p>
      <p className="font-light text-[#808080] underline">contact@achiva.kr</p>
    </div>
  );
}
