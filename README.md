# Ecos

Plataforma web de intención de voto para las municipales 2026. Mobile-first, un voto por cédula, resultados en vivo.

## Qué hace

- Valida al votante con cédula y fecha de nacimiento contra el padrón local de Yaguarón (cargado en la base, hasheado).
- En desarrollo (`PADRON_MODE=mock`) la consulta al padrón está simulada para poder desplegar y probar el flujo.
- En producción (`PADRON_MODE=db`) busca en `private.padron_electores`. No consulta `padron.tsje.gov.py`.
- Una cédula, un voto. Si no figura en el padrón o la fecha no coincide, no hay voto.
- Concejalía por lista. Intendencia por candidato. También se puede votar en blanco.
- El voto es secreto: el hash de cédula vive en `voter_registry`, separado de `votes`. El padrón tampoco guarda cédula, nombre ni partido.

## Stack

Next.js 16 · Tailwind v4 · Motion · Supabase (Postgres + RLS deny-all + RPCs) · Vercel.

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run dev
```

Cédula de prueba en mock: cualquier número de 5 a 10 dígitos, excepto `9999999` (rechazada a propósito). Fecha de nacimiento cualquiera.

```bash
npm run spike:padron   # parsea data/padron/*.md y verifica 24.643 electores
npm run seed:padron    # hashea y carga el padrón en Supabase
PADRON_MODE=db npm run check:padron  # lookup real / fecha mala / cédula inexistente
npm run build
```

Los markdown del padrón van en `data/padron/` y **no se commitean**. Si rotás `CEDULA_HMAC_SECRET`, hay que volver a correr el seed.

## Variables importantes

- `PADRON_MODE=mock|db`
- `APP_RPC_SECRET` debe coincidir con el hash guardado en `private.app_config`
- Turnstile es opcional en mock. En db conviene activarlo.

## Deploy a Vercel

En el dashboard del proyecto: **Settings → Environment Variables**. Cargá estas claves para Production y Preview (los valores están en `.env.local`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `APP_RPC_SECRET`
- `CEDULA_HMAC_SECRET`
- `VOTE_TOKEN_SECRET`
- `PADRON_MODE` (`db` en producción, `mock` para previews sin seed)
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
3. Copiar los markdown a `data/padron/`, correr `npm run seed:padron`, setear `PADRON_MODE=db` y activar Turnstile.
4. Desplegar en Vercel con las env vars de producción.
