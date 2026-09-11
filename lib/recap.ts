import { z } from "zod";

export const recapShare = {
  title: "Así cerró Ecos en Yaguarón",
  description:
    "Resultado final de la encuesta ciudadana. Muestra autoseleccionada, no es un cómputo del TSJE. Las Elecciones Municipales 2026 son el 4 de octubre.",
  text: "Así cerró Ecos en Yaguarón. Encuesta ciudadana, muestra autoseleccionada: no es el TSJE. El 4 de octubre es el que vale.",
} as const;

export const recapEventSchema = z.enum([
  "recap_view",
  "share_click",
  "share_native",
  "share_copy",
  "invite_share_click",
  "invite_share_native",
  "invite_share_copy",
]);

export type RecapEvent = z.infer<typeof recapEventSchema>;

export function recordRecapEvent(event: RecapEvent) {
  void fetch("/api/recap-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  });
}
