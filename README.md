# Ecos

Plataforma web de intención de voto para las municipales 2026. Mobile-first, un voto por cédula, resultados en vivo.

## Qué hace

- Valida al votante con cédula (y fecha de nacimiento) antes de permitir el voto.
- En el MVP (`PADRON_MODE=mock`) la consulta al padrón está simulada para poder desplegar y probar el flujo.
- En producción (`PADRON_MODE=live`) consulta `https://padron.tsje.gov.py`. Ese sitio está detrás de Sucuri: un `fetch` directo desde servidor responde 403. La app reutiliza una cookie WAF y, si hace falta, abre Chromium local (`PADRON_BROWSER=1`).
- Política estricta: si el padrón no responde, no hay voto.
- Concejalía por lista. Intendencia por candidato. Opciones de blanco y nulo.
- El voto es secreto: el hash de cédula vive en `voter_registry`, separado de `votes`.

## Stack

Next.js 16 · Tailwind v4 · Motion · Supabase (Postgres + RLS deny-all + RPCs) · Vercel.

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run dev
```

Cédula de prueba: cualquier número de 5 a 10 dígitos, excepto `9999999` (rechazada a propósito). Fecha de nacimiento cualquiera.

```bash
npm run spike:padron   # parser + conectividad TSJE
npm run build
```

## Variables importantes

- `PADRON_MODE=mock|live`
- `APP_RPC_SECRET` debe coincidir con el hash guardado en `private.app_config`
- Turnstile es opcional en mock. En live conviene activarlo.

## Deploy a Vercel

En el dashboard del proyecto: **Settings → Environment Variables**. Cargá estas claves para Production y Preview (los valores están en `.env.local`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `APP_RPC_SECRET`
- `CEDULA_HMAC_SECRET`
- `VOTE_TOKEN_SECRET`
- `PADRON_MODE` (`mock` para el MVP)
- `PADRON_MOCK_DISTRICT` (`YAGUARON`)
- `PADRON_MOCK_REJECT` (`9999999`)

Después:

```bash
npx vercel login
npx vercel --prod
```

Sin esas variables el build llega a “Collecting page data” y las API routes no pueden hablar con Supabase.

## Lanzamiento con candidatos reales

1. Reemplazar filas en `public.candidates` y `public.elections`.
2. Setear `district_code` de la elección y `PADRON_ALLOWED_DISTRICT`.
3. Pasar `PADRON_MODE=live`, configurar Turnstile y probar Chromium/cookie WAF.
4. Desplegar en Vercel con las env vars de producción.
