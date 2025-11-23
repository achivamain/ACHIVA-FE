export default function getColorVariants(color: string) {
  const cleanHex = color.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const rgbcolor = [r, g, b];
  const shadecolor = `#${rgbcolor
    .map((i) =>
      Math.floor(i * 0.9)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
  const tintcolor = `#${rgbcolor
    .map((i) =>
      Math.floor(Math.min(i * 1.1, 255))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

  return { shadecolor, tintcolor };
}
