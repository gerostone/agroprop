# AgroProp

Marketplace MVP para compra/venta de campos en Paraguay.

## Estado actual
Se creó el esqueleto del repo con:
- Next.js App Router + TypeScript + Tailwind.
- Prisma con modelos y enums base.
- Auth con NextAuth (credentials).
- API routes para listings, imágenes, leads, favoritos y admin.
- Seed inicial con usuarios y un listing.

## Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind.
- Backend: Next API Routes.
- DB: PostgreSQL + Prisma.
- Auth: NextAuth Credentials (email + password).
- Storage: S3 compatible (pendiente implementar signed uploads).
- Rate limit: in-memory (pendiente Upstash).

## Estructura del repo (MVP)
```
/agroprop
  /src
    /app
      /(public)
      /(auth)
      /(dashboard)
      /(admin)
      /api
    /components
    /lib
  /prisma
  /public
  /styles
```

## Setup
1. Copiar `.env.example` a `.env` y completar valores.
2. Instalar deps: `npm install`
3. Generar Prisma client: `npx prisma generate`
4. Migrar DB: `npx prisma migrate dev`
5. Correr seed: `npm run seed`
6. Levantar: `npm run dev`

## Variables de entorno
Ver `.env.example`.

Claves mínimas:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `S3_*` (pendiente uso real)
- `UPSTASH_*` (pendiente uso real)

## Prisma
Modelos:
- `User`
- `Listing`
- `ListingImage`
- `Lead`
- `Favorite`

Enums:
- `Role` (USER/AGENT/ADMIN)
- `ListingStatus` (DRAFT/PUBLISHED/PAUSED/REJECTED)
- `ListingType` (GANADERO/AGRO/MIXTO)
- `AccessType` (RUTA/CAMINO/MIXTO)

Índices principales:
- `Listing.status + createdAt`
- `Listing.priceUsd`
- `Listing.hectares`
- `Listing.department + district`
- `Listing.type`

## Seed
Usuarios generados:
- Admin: `admin@agroprop.local` / `Admin123!`
- User: `user@agroprop.local` / `User123!`

Listing de ejemplo publicado con 2 imágenes dummy.

## API Endpoints (implementados)

### Auth
- `POST /api/auth/register`
  - Body: `{ name, email, password }`

### Listings
- `GET /api/listings`
  - Query params:
    - `page`, `pageSize`
    - `minPrice`, `maxPrice`
    - `minHectares`, `maxHectares`
    - `department`, `district`
    - `type`
    - `hasWater`, `hasTitle`
    - `accessType`
    - `sort` (`newest`, `price_asc`, `price_desc`, `hectares_asc`, `hectares_desc`)
- `POST /api/listings` (auth)
- `GET /api/listings/{id|slug}`
- `PATCH /api/listings/{id}` (owner/admin)
- `DELETE /api/listings/{id}` (owner/admin)

### Listing images
- `POST /api/listings/{id}/images` (owner/admin)
- `DELETE /api/listings/{id}/images` (owner/admin)

### Leads
- `POST /api/leads`
  - Rate limit básico in-memory: 5 req/h por IP.

### Favoritos
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites`

### Admin
- `GET /api/admin/listings`
- `PATCH /api/admin/listings`
- `GET /api/admin/users`
- `PATCH /api/admin/users`

## Notas importantes
- El rate limit es temporal (in-memory). En producción usar Upstash.
- Upload a S3 todavía no está implementado; sólo se guardan URLs.
- El listado público devuelve sólo `PUBLISHED`.
- El detalle permite acceder a drafts solo con sesión válida (dueño/admin).

## Scripts
- `npm run dev` - desarrollo
- `npm run build` - build
- `npm run start` - producción
- `npm run lint` - lint
- `npm run prisma:migrate` - migraciones
- `npm run prisma:studio` - Prisma Studio
- `npm run seed` - seed base
