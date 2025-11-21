export default function CheersTitle({ nickname }: { nickname: string }) {
  return (
    <h1 className="text-lg text-[#808080] flex items-center gap-1.5">
      <span className="font-semibold text-2xl text-black">
        {decodeURIComponent(nickname)}
      </span>
      <span className="font-normal">님의 응원기록</span>
    </h1>
  );
}
