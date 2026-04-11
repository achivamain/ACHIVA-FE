import { TextLogo } from "@/components/Logo";

export default function Loading() {
  return (
    <div className="relative flex h-dvh w-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#FFFFFF_0%,#FFF7F8_32%,#FFECEF_68%,#FFDADF_100%)]">
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
      <div className="pointer-events-none absolute right-[-60px] top-[110px] h-[220px] w-[220px] rounded-full bg-[#FFB8C4]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-90px] left-[-50px] h-[220px] w-[220px] rounded-full bg-[#FFD1D8]/45 blur-3xl" />
      <div className="relative">
        <TextLogo width={158} />
      </div>
    </div>
  );
}
