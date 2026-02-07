import Link from "next/link";

export default function Footer() {
  return (
    <footer className="shrink-0 h-30 hidden sm:flex justify-center items-center text-theme text-sm">
      <div className="flex divide-x divide-theme/50">
        <Link
          href="https://achivamain.notion.site/247f9799dbb880859f08f64d81bc6335"
          className="px-3"
        >
          이용약관
        </Link>
        <Link
          href="https://achivamain.notion.site/247f9799dbb880b4bc53cdd088cd06db?v=247f9799dbb88051bde7000cd649a398&p=247f9799dbb8800b8057d9fe46809e08&pm=c
"
          className="font-bold px-3"
        >
          개인정보 처리방침
        </Link>
        <Link
          href="https://achivamain.notion.site/247f9799dbb88095952cfe594b0f3ac5"
          className="px-3"
        >
          문의사항
        </Link>
      </div>
      <p className="px-3">© iworkouttoday</p>
    </footer>
  );
}
