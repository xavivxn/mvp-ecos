import { ImageResponse } from "next/og";
import { recapShare } from "@/lib/recap";
import { getBoard } from "@/lib/results";

export const alt = recapShare.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OpenGraphImage() {
  let closed = false;
  let city = "Yaguarón";
  try {
    const board = await getBoard();
    if (board) {
      closed = !board.election.isOpen;
      city = board.election.city;
    }
  } catch {
    closed = false;
  }

  const title = closed ? `Así cerró Ecos en ${city}` : `Encuesta de Ecos ${city}`;
  const subtitle = closed
    ? "Encuesta ciudadana · muestra autoseleccionada · no es el TSJE"
    : "Intención de voto · Municipales 2026 · no es un cómputo del TSJE";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b1f17",
          color: "#eaf5ee",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#6ee7a2",
          }}
        >
          Ecos
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#9db5a8", lineHeight: 1.35 }}>{subtitle}</div>
        </div>
        {closed ? (
          <div style={{ display: "flex", fontSize: 24, color: "#6ee7a2" }}>
            El 4 de octubre es el que vale
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 24, color: "#9db5a8" }}>Yaguarón</div>
        )}
      </div>
    ),
    { ...size },
  );
}
