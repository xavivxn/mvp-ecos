import Image from "next/image";

function initials(name: string) {
  return name
    .split(" ")
    .filter((part) => part && !part.endsWith("."))
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CandidatePhoto({
  src,
  name,
  color,
  size = 64,
  className = "",
}: {
  src?: string | null;
  name: string;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl text-sm font-semibold text-white ${className}`}
      style={{ width: size, height: size, maxWidth: "100%", background: color }}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
