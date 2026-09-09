import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(here, "..", "supabase", "reset_survey.sql");
const sql = readFileSync(sqlPath, "utf8");

async function main() {
  if (process.env.RESET_SURVEY !== "yes") {
    console.error("Confirmá el reset con RESET_SURVEY=yes");
    console.error("Ejemplo: RESET_SURVEY=yes npm run reset:survey");
    process.exit(1);
  }

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error("Falta SUPABASE_DB_URL. Pegá este SQL en el editor de Supabase o agregá la URL en .env.local:\n");
    console.log(sql.trim());
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    const counts = await client.query<{ votes: number; registry: number; visits: number }>(`
      select
        (select count(*)::int from public.votes) as votes,
        (select count(*)::int from public.voter_registry) as registry,
        (select count(*)::int from public.visits) as visits
    `);
    const row = counts.rows[0];
    console.log(
      `Reset listo. votes=${row.votes} voter_registry=${row.registry} visits=${row.visits}`,
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
