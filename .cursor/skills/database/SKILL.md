---
name: database
description: >-
  Manage the SQLite database: Prisma schema, migrations, querying users, adding
  models. Use when working with the database, user data, Prisma, SQLite, or
  adding new database tables.
---

# Database (SQLite + Prisma)

## Setup

- **ORM**: Prisma 7 with `@prisma/adapter-better-sqlite3`
- **DB file**: `./data/aoe2ai.db` (local dev) or Docker volume `aoe2-data` (production)
- **Auto-init**: `src/lib/prisma.ts` creates tables on first request if they don't exist

## Key Files

| File | Role |
|------|------|
| `prisma/schema.prisma` | Schema definition (models, relations, indexes) |
| `prisma.config.ts` | Prisma 7 config (schema path, datasource URL) |
| `src/lib/prisma.ts` | Client singleton + auto-initialization logic |
| `src/lib/auth.ts` | NextAuth uses `PrismaAdapter(prisma)` |

## Current Schema

Models: `User`, `Account`, `Session`, `VerificationToken` — standard NextAuth adapter schema.

## Adding a New Model

1. Add the model to `prisma/schema.prisma`:

```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  type      String
  targetId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, targetId])
}
```

2. Add the relation to `User`:

```prisma
model User {
  // ... existing fields
  favorites Favorite[]
}
```

3. Generate the client and create a migration:

```bash
npx prisma generate
npx prisma migrate dev --name add-favorites
```

4. **Important**: Also add the `CREATE TABLE` SQL to the `ensureDatabase()` function in `src/lib/prisma.ts` — this is what auto-creates tables in production on first deploy.

5. Use it in code:

```typescript
import { prisma } from "@/lib/prisma";

const favs = await prisma.favorite.findMany({
  where: { userId: session.user.id },
});
```

## Querying Production DB (via EC2 SSH)

```bash
docker exec aoe2 node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/aoe2ai.db');
console.table(db.prepare('SELECT id, name, email, createdAt FROM User').all());
db.close();
"
```

Run any SQL:

```bash
docker exec aoe2 node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/aoe2ai.db');
console.table(db.prepare('SELECT COUNT(*) as total FROM User').all());
db.close();
"
```

## Local Development

```bash
npx prisma studio    # Visual DB browser at localhost:5555
npx prisma generate  # Regenerate client after schema changes
npx prisma migrate dev --name description  # Create migration
```

## Prisma 7 Specifics

- No `url` in `datasource` block of `schema.prisma` — URL comes from `prisma.config.ts`
- Client generated to `src/generated/prisma/` (import as `@/generated/prisma/client`)
- Uses adapter pattern: `new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })`
- Docker must copy native `better-sqlite3` and `@prisma/adapter-better-sqlite3` to standalone output
