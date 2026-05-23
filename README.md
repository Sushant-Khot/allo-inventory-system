# Allo Inventory System

A Next.js inventory reservation platform for multi-warehouse retail. Customers can reserve stock during checkout, confirm after payment, or release the hold on cancellation — with automatic expiry to prevent inventory lock-up.

---

## Running locally

### 1. Prerequisites

- Node.js 20+
- A hosted Postgres instance (Supabase, Neon, or Railway)

### 2. Clone and install

```bash
git clone <repo-url>
cd allo-inventory-system
npm install
```

### 3. Environment variables

Create a `.env` file in the project root:

```env
# Pooled connection (used at runtime by Prisma Client via PgBouncer)
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/<db>?pgbouncer=true"

# Direct connection (used by Prisma CLI for migrations and db push/pull)
DIRECT_URL="postgresql://<user>:<password>@<host>:5432/<db>"

# Secret for the cron endpoint — any long random string
CRON_SECRET="your-secret-here"
```

### 4. Push schema and seed

```bash
# Push schema to database
npx prisma db push

# Seed with products, warehouses, and inventory
npx prisma db seed
```

### 5. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How reservation expiry works in production

Expired reservations (those past their `expiresAt` timestamp) are released via a cron job configured in `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/release-expired", "schedule": "* * * * *" }]
}
```

This calls `GET /api/cron/release-expired` every minute. The handler finds all `PENDING` reservations where `expiresAt <= now`, increments their inventory back, and marks them `EXPIRED`.

The endpoint is protected by a `CRON_SECRET` environment variable — requests must include `Authorization: Bearer <secret>`. Vercel injects this header automatically when calling cron routes if the env var is set.

There is also eager expiry at confirm time: if a user tries to confirm a reservation that has already expired, `confirmReservation` immediately restores stock and marks the reservation `EXPIRED` inside the same Postgres transaction before returning `410 Gone`. This ensures units are never left in limbo while waiting for the next cron tick.

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | List products with available stock per warehouse |
| `GET` | `/api/warehouses` | List warehouses |
| `POST` | `/api/reservations` | Reserve units — returns `409` if insufficient stock |
| `POST` | `/api/reservations/:id/confirm` | Confirm reservation — returns `410` if expired |
| `POST` | `/api/reservations/:id/release` | Release reservation early |

### Concurrency safety

The `POST /api/reservations` handler runs inside a Postgres transaction that atomically decrements inventory only if `quantity >= requested`:

```sql
UPDATE inventory
SET quantity = quantity - :requested
WHERE product_id = :pid AND warehouse_id = :wid AND quantity >= :requested
```

If two requests race for the last unit, exactly one gets `count = 1` and succeeds; the other gets `count = 0` and receives a `409`. No advisory locks or Redis required — the database enforces it.

The `POST /api/reservations/:id/confirm` handler checks expiry inside a transaction and, if the reservation has expired, restores inventory and marks it `EXPIRED` atomically before throwing `410`. This closes the window where a user could race between the countdown reaching zero and the cron job running.

---

## Trade-offs and what I'd do differently

**Concurrency approach** — Using a conditional `updateMany` in a transaction is simple and correct for this scale. Under very high write throughput, advisory locks or `SELECT ... FOR UPDATE` would give finer control, but they add complexity that isn't warranted here.

**Expiry mechanism** — A per-minute Vercel Cron is good enough for a 15-minute TTL (worst case a reservation lingers 1 minute past expiry). A tighter requirement would call for a background worker with a priority queue (e.g. BullMQ + Redis) to fire exactly at `expiresAt`. The lazy restore on confirm means that even if the cron is delayed, a user attempting to confirm an expired hold will still return their units to stock immediately.

**Idempotency** — The bonus idempotency feature (re-using a response for duplicate `Idempotency-Key` requests) is not implemented. With more time I'd store request hashes in Redis with a short TTL and short-circuit repeat requests before they hit the database.

**Reserved vs available stock** — The schema tracks `quantity` as available stock (reserved units are immediately decremented). An alternative is to keep `total` and `reserved` as separate columns and compute `available = total - reserved`, which makes inventory history easier to audit. I chose the simpler approach since the spec didn't require an audit log.

**Auth** — There is no user authentication. In a real system the `customerName`/`customerEmail` would come from a session, not a form field.

**Tests** — No automated tests are included. Key things to test would be the concurrent reservation path (two simultaneous requests for the last unit), and the confirm/release state machine.
