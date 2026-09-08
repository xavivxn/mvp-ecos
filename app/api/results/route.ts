import { getBoard } from "@/lib/results";

export const runtime = "nodejs";

export async function GET() {
  const board = await getBoard();
  if (!board) {
    return Response.json({ ok: false, error: "Sin elección activa." }, { status: 503 });
  }

  return Response.json(
    { ok: true, ...board },
    {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
      },
    },
  );
}
