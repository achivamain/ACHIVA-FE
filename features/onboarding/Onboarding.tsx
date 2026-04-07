"use client";

import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";
import { handleSignIn } from "./handleSignIn";
import { TextLogo } from "@/components/Logo";

export default function Onboarding() {
  const resetStep = useSignupStepStore.use.resetStep();
  const resetUser = useSignupInfoStore.use.resetUser();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,#FFFFFF_0%,#FFF7F8_32%,#FFECEF_68%,#FFDADF_100%)]">
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
      <div className="pointer-events-none absolute right-[-60px] top-[110px] h-[220px] w-[220px] rounded-full bg-[#FFB8C4]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-90px] left-[-50px] h-[220px] w-[220px] rounded-full bg-[#FFD1D8]/45 blur-3xl" />

      <div className="relative flex min-h-dvh flex-col items-center px-7 py-10">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-[390px] px-4 py-6">
            <div className="mb-7 flex justify-center">
              <TextLogo width={158} />
            </div>

            <div className="text-center">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-[#FF6666]">
                TODAY&apos;S GRACE
              </p>
              <h1 className="text-[24px] font-semibold leading-[1.55] tracking-[-0.035em] text-[#4B3131] break-keep">
                우리 교회 안에서
                <br />
                이어지는 은혜의 이야기
              </h1>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex w-full max-w-[359px] flex-col items-center gap-4 pb-2">
          <form action={handleSignIn} className="w-full">
            <button
              onClick={async () => {
                resetStep();
                resetUser();
              }}
              className="h-[54px] w-full rounded-[18px] bg-[#4F3131] shadow-[0_18px_34px_rgba(255,102,102,0.22)] transition-transform active:scale-[0.99]"
            >
              <div className="flex h-full items-center justify-center rounded-[18px] border border-[#654242]/30 bg-[linear-gradient(180deg,#5A3A3A_0%,#4B2F2F_100%)] px-6">
                <p className="text-lg font-semibold tracking-[-0.02em] text-white">
                  회원가입
                </p>
              </div>
            </button>
          </form>

          <div className="flex items-center gap-2 text-center">
            <span className="text-sm text-[#8F6B6B]">이미 계정이 있나요?</span>
            <form action={handleSignIn}>
              <button className="rounded-full px-1 py-0.5">
                <span className="text-sm font-semibold text-[#FF6666]">
                  로그인
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
