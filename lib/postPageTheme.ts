import type { CSSProperties } from "react";

export const DEFAULT_POST_PAGE_BACKGROUND = "#F0E8E0" as const;

export function isAlbumCategory(category?: string | null) {
  return category === "교회 앨범";
}

function getEffectivePostBackground(backgroundColor?: string | null) {
  return backgroundColor ?? DEFAULT_POST_PAGE_BACKGROUND;
}

export function getPostPageSurface(
  backgroundColor?: string | null,
): CSSProperties {
  const effectiveBackground = getEffectivePostBackground(backgroundColor);
  const isPaperBackground =
    effectiveBackground === DEFAULT_POST_PAGE_BACKGROUND ||
    effectiveBackground === "#F7F7F5";

  if (isPaperBackground) {
    return {
      backgroundColor: "#F7F7F5",
      backgroundImage:
        "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 82% 84%, rgba(212,212,206,0.18) 0%, rgba(212,212,206,0) 28%), linear-gradient(160deg, #FCFCFB 0%, #F7F7F5 58%, #EFEFEA 100%)",
    };
  }

  return {
    backgroundColor: effectiveBackground,
  };
}

export function getPostPageTone(backgroundColor?: string | null) {
  const effectiveBackground = getEffectivePostBackground(backgroundColor);
  const isPaperBackground =
    effectiveBackground === DEFAULT_POST_PAGE_BACKGROUND ||
    effectiveBackground === "#F7F7F5";

  if (isPaperBackground) {
    return {
      shellTextClassName: "text-[#4A312B]",
      subtitleClassName: "text-[#4A312B]",
      contentClassName: "text-[#6A625D]",
      accentLineColor: "rgba(120, 112, 104, 0.14)",
      ornamentColor: "rgba(214, 214, 209, 0.24)",
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
