# Deploy

## Opción A: Vercel (recomendada)
1. Crear proyecto en Vercel y conectar repo.
2. Configurar variables de entorno (ver `.env.example`).
3. Crear DB Postgres managed (Neon/Supabase/Render/Fly) y setear `DATABASE_URL`.
4. Ejecutar migraciones (GitHub Actions o manual):
   - `npx prisma migrate deploy`
   - `npx prisma generate`
5. Deploy.

## Opción B: Render/Fly
1. Crear servicio web Node.
2. Build command: `npm install && npm run build`.
3. Start command: `npm run start`.
4. Configurar env vars.
5. Provisionar Postgres y setear `DATABASE_URL`.

## Storage S3
- Completar `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`.
- `/api/uploads` retorna signed PUT + `fileUrl`.

## Variables clave
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `S3_*`
- `UPSTASH_*` (si se habilita rate limit real)
