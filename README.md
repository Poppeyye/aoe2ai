# AoE2.ai

AI-powered companion for Age of Empires II. Provides opponent scouting, replay analysis, tech tree exploration, tournament tracking, and an AI assistant — all with full English/Spanish localization.

**Live at [aoe2.ai](https://aoe2.ai)**

## Features

| Feature | Route | Description |
|---------|-------|-------------|
| AI Assistant | `/agent` | Chat with an AoE2-specialized AI that can search players, scout opponents, look up civilizations, and browse the web |
| Live Scout | `/live` | Search any player to get their ranked stats, civ/map tendencies, and an optional AI-generated scouting report |
| Replay Analyzer | `/replay` | Upload `.aoe2record` files for detailed stats, timelines, battle breakdowns, and AI-generated chronicles |
| Tech Tree | `/techtree` | Browse and compare civilizations — units, techs, buildings, and bonuses |
| Players | `/players` | Leaderboards and player profiles with match history from the official Relic/World's Edge API |
| Tournaments | `/tournaments` | Live and upcoming tournaments sourced from Liquipedia |
| Build Orders | `/learn` | Interactive build order library with step timers |

## Tech Stack

- **Framework**: Next.js 15 (App Router, standalone output)
- **AI**: OpenAI Responses API with tool calling and streaming (model configurable via `OPENAI_MODEL`)
- **Auth**: NextAuth.js with Google and Discord OAuth providers
- **Database**: SQLite via Prisma ORM + better-sqlite3 (auto-initializing)
- **Styling**: Tailwind CSS
- **i18n**: Custom middleware-based routing (`en`/`es`) with JSON dictionaries
- **Deployment**: Docker on AWS EC2, CI/CD via GitHub Actions, Cloudflare CDN/DNS

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (agent, auth, live, players, replay, techtree, tournaments)
│   ├── [locale]/         # Localized pages (en/es)
│   ├── robots.ts         # Dynamic robots.txt
│   └── sitemap.ts        # Dynamic sitemap.xml
├── components/
│   ├── ai/               # AssistantPanel, ToolActivityPanel, MarkdownMessage, streaming hooks
│   ├── auth/             # SessionProvider
│   ├── home/             # FavoritesSection
│   ├── layout/           # Navbar, Footer, LanguageSwitcher
│   ├── seo/              # JSON-LD structured data
│   └── ui/               # FavoriteButton, KofiHint
├── hooks/                # useRequireAuth, useFavorites
├── i18n/                 # Locale config, dictionaries (en.json, es.json), provider
├── lib/
│   ├── ai/               # OpenAI client, runtime (streaming/tools), agent, replay-analyzer
│   ├── api/              # External APIs (Relic, Liquipedia, tech tree)
│   ├── replay/           # .aoe2record parser and zlib decompression
│   ├── scout/            # Opponent scouting report builder
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client (auto-creates tables on first use)
│   ├── rate-limit.ts     # In-memory sliding window rate limiter
│   ├── seo.ts            # Shared metadata builder
│   └── utils.ts          # Utility functions
├── middleware.ts          # Locale routing, security headers, bot protection
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/Poppeyye/aoe2ai.git
cd aoe2ai
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#environment-variables) below), then:

```bash
npm install
npx prisma generate
npm run dev
```

The app will be running at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `OPENAI_MODEL` | No | Model to use (default: `gpt-5-mini`) |
| `RELIC_API_BASE` | Yes | Relic/World's Edge API base URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the app |
| `NEXT_PUBLIC_APP_NAME` | No | Display name (default: `AoE2.ai`) |
| `NEXTAUTH_URL` | Yes | NextAuth base URL (same as APP_URL) |
| `NEXTAUTH_SECRET` | Yes | NextAuth encryption secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `DISCORD_CLIENT_ID` | No | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | No | Discord OAuth client secret |
| `NEXT_PUBLIC_HAS_GOOGLE` | No | Set to `1` to show Google login button |
| `NEXT_PUBLIC_HAS_DISCORD` | No | Set to `1` to show Discord login button |
| `DATABASE_URL` | No | SQLite path (default: `file:./data/aoe2ai.db`) |

## Deployment

The app deploys automatically to AWS EC2 on every push to `main` via GitHub Actions.

### How it works

1. GitHub Actions builds a deployment tarball (excluding `node_modules`, `.next`, `.git`)
2. Uploads to EC2 via SCP
3. Builds a Docker image on the EC2 instance
4. Swaps the running container with zero-downtime (stop old → start new)
5. SQLite data persists across deploys via a Docker volume (`aoe2-data`)

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 instance public IP or hostname |
| `EC2_USER` | SSH user (typically `ec2-user`) |
| `EC2_SSH_KEY` | Private SSH key for EC2 access |
| `OPENAI_API_KEY` | OpenAI API key |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret |

### Manual deploy

```bash
git push origin main
```

Or trigger manually from the GitHub Actions tab (workflow_dispatch).

### Querying the database on EC2

```bash
docker exec aoe2 node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/aoe2ai.db');
console.table(db.prepare('SELECT id, name, email, createdAt FROM User').all());
db.close();
"
```

## Architecture Notes

### AI Layer

All AI features use the OpenAI Responses API with streaming via `TransformStream`. The runtime (`src/lib/ai/runtime.ts`) handles:
- Multi-turn conversations with tool calling
- Locale-aware system prompts (AoE2 glossary for Spanish)
- Surface-specific instructions (agent, live scout, replay analyzer)
- NDJSON streaming for real-time UI updates (text chunks + tool activity events)

Available tools: `search_player`, `scout_opponent`, `get_civ_info`, `get_tournaments`, `web_search_preview` (OpenAI built-in).

### Database

SQLite with Prisma ORM. The database auto-initializes on first request — no migration step needed in deployment. Schema covers NextAuth models (User, Account, Session, VerificationToken).

### Security

- API rate limiting (in-memory sliding window per IP)
- Bot detection via User-Agent patterns in middleware
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Auth required for all AI features
- OAuth secrets never exposed to client

## License

Private — All rights reserved.
