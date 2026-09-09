export function hexToRgba(hex: string, alpha: number) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(196, 184, 165, ${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function partySurface(color: string, selected = false) {
  return {
    borderColor: color,
    background: hexToRgba(color, selected ? 0.22 : 0.1),
  };
}
