import type { CSSProperties } from "react";

export const DEFAULT_POST_PAGE_BACKGROUND = "#F0E8E0" as const;
export const TODAY_GRACE_POST_PAGE_BACKGROUND = "#F7F7F5" as const;

function getEffectivePostBackground(backgroundColor?: string | null) {
  return backgroundColor ?? TODAY_GRACE_POST_PAGE_BACKGROUND;
}

export function isWarmPaperTheme(backgroundColor?: string | null) {
  const effectiveBackground = getEffectivePostBackground(backgroundColor);
  return (
    effectiveBackground === DEFAULT_POST_PAGE_BACKGROUND ||
    effectiveBackground === TODAY_GRACE_POST_PAGE_BACKGROUND
  );
}

export function getPostPageSurface(
  backgroundColor?: string | null,
): CSSProperties {
  const effectiveBackground = getEffectivePostBackground(backgroundColor);

  if (isWarmPaperTheme(effectiveBackground)) {
    if (effectiveBackground === TODAY_GRACE_POST_PAGE_BACKGROUND) {
      return {
        backgroundColor: TODAY_GRACE_POST_PAGE_BACKGROUND,
        backgroundImage:
          "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 82% 84%, rgba(212,212,206,0.18) 0%, rgba(212,212,206,0) 28%), linear-gradient(160deg, #FCFCFB 0%, #F7F7F5 58%, #EFEFEA 100%)",
      };
    }

    return {
      backgroundColor: DEFAULT_POST_PAGE_BACKGROUND,
      backgroundImage:
        "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 82% 84%, rgba(208,164,139,0.2) 0%, rgba(208,164,139,0) 28%), linear-gradient(160deg, #FBF5EF 0%, #F3E7DA 58%, #E9D8C8 100%)",
    };
  }

  return {
    backgroundColor: effectiveBackground,
  };
}

export function getPostPageTone(backgroundColor?: string | null) {
  const effectiveBackground = getEffectivePostBackground(backgroundColor);

  if (effectiveBackground === TODAY_GRACE_POST_PAGE_BACKGROUND) {
    return {
      shellTextClassName: "text-[#4A312B]",
      subtitleClassName: "text-[#4A312B]",
      contentClassName: "text-[#6A625D]",
      accentLineColor: "rgba(120, 112, 104, 0.14)",
      ornamentColor: "rgba(214, 214, 209, 0.24)",
    };
  }

  if (isWarmPaperTheme(effectiveBackground)) {
    return {
      shellTextClassName: "text-[#4A312B]",
      subtitleClassName: "text-[#4A312B]",
      contentClassName: "text-[#6E4D43]",
      accentLineColor: "rgba(122, 80, 64, 0.18)",
      ornamentColor: "rgba(232, 201, 176, 0.4)",
    };
  }

  if (effectiveBackground === "#f9f9f9") {
    return {
      shellTextClassName: "text-black",
      subtitleClassName: "text-black",
      contentClassName: "text-theme",
      accentLineColor: "rgba(0, 0, 0, 0.08)",
      ornamentColor: "rgba(0, 0, 0, 0.04)",
    };
  }

  return {
    shellTextClassName: "text-white",
    subtitleClassName: "text-white",
    contentClassName: "text-white",
    accentLineColor: "rgba(255, 255, 255, 0.18)",
    ornamentColor: "rgba(255, 255, 255, 0.08)",
  };
}
