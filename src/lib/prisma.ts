import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const url = process.env.DATABASE_URL || "file:./data/aoe2ai.db";
const dbPath = url.replace("file:", "");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  dbInitialized: boolean;
};

function ensureDatabase() {
  if (globalForPrisma.dbInitialized) return;

  const dir = dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const db = new Database(dbPath);
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='User'")
    .get();

  if (!tableExists) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT,
        "emailVerified" DATETIME,
        "image" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        "aoe2ProfileId" INTEGER,
        "aoe2Name" TEXT
      );
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" DATETIME NOT NULL,
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" DATETIME NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
      CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
    `);
  }

  const hasProfileCol = db
    .prepare("SELECT COUNT(*) as cnt FROM pragma_table_info('User') WHERE name='aoe2ProfileId'")
    .get() as { cnt: number };

  if (hasProfileCol.cnt === 0) {
    db.exec(`
      ALTER TABLE "User" ADD COLUMN "aoe2ProfileId" INTEGER;
      ALTER TABLE "User" ADD COLUMN "aoe2Name" TEXT;
    `);
  }

  db.close();
  globalForPrisma.dbInitialized = true;
}

function createPrismaClient() {
  ensureDatabase();
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
