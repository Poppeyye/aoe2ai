---
name: deploy-ec2
description: >-
  Deploy aoe2ai to AWS EC2 via GitHub Actions. Use when deploying, debugging
  deploys, checking CI/CD status, viewing deploy logs, or fixing Docker/EC2 issues.
---

# Deploy to EC2

## Quick Deploy

Push to `main` triggers automatic deployment:

```bash
git push origin main
```

## Monitoring Deploys

Check status via GitHub API:

```bash
curl -s -H "Authorization: token $GITHUB_PAT" \
  "https://api.github.com/repos/Poppeyye/aoe2ai/actions/runs?per_page=3" | \
  python3 -c "import sys,json; runs=json.load(sys.stdin)['workflow_runs']; [print(f'{r[\"status\"]:12} {r[\"conclusion\"] or \"\":10} {r[\"display_title\"][:60]}') for r in runs]"
```

Get logs from a failed run:

```bash
# Get run ID
RUN_ID=$(curl -s -H "Authorization: token $GITHUB_PAT" \
  "https://api.github.com/repos/Poppeyye/aoe2ai/actions/runs?per_page=1" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['workflow_runs'][0]['id'])")

# Download logs
curl -s -L -H "Authorization: token $GITHUB_PAT" \
  "https://api.github.com/repos/Poppeyye/aoe2ai/actions/runs/$RUN_ID/logs" \
  -o /tmp/logs.zip && unzip -o /tmp/logs.zip -d /tmp/logs

# Find errors
rg -i "error|failed" /tmp/logs/*.txt /tmp/logs/**/*.txt
```

## Infrastructure

- **EC2 instance**: `i-0208ce363c9ca15ba` (`aoe2-analyzer`) in `eu-west-1`, **t3.micro** (1 vCPU, 1 GB RAM)
- **Domain**: `aoe2.ai` via Cloudflare (DNS + CDN)
- **Nginx** reverse proxy on EC2 → `127.0.0.1:8000`
- **Docker container**: `aoe2` running `aoe2-next:latest`
- **Persistent volume**: `aoe2-data` mounted at `/app/data` (SQLite DB)
- **Port**: 8000 (internal), 80/443 (Nginx)

## Deploy Pipeline (`.github/workflows/deploy.yml`)

1. Checkout code
2. Write `.env` from GitHub Secrets
3. Create tarball (excludes `node_modules`, `.next`, `.git`, `client_secret_*`, `data`)
4. SCP to EC2
5. `docker build -t aoe2-next:new .`
6. Stop old container, start new with volume mount
7. Health check + site verification

## Required GitHub Secrets

`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `OPENAI_API_KEY`, `NEXTAUTH_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`

## Docker Notes

The Dockerfile is a two-stage build:
- **builder**: `node:20-alpine`, runs `npm ci` then `npm run build` (which includes `prisma generate`)
- **runner**: Copies standalone output + native modules (`better-sqlite3`, `@prisma/adapter-better-sqlite3`)

`better-sqlite3` is listed in `serverExternalPackages` in `next.config.js` — this prevents Next.js from bundling the native module and instead loads it from `node_modules/` at runtime.

## Common Issues

### Build fails: "Could not find Prisma Schema"
The `prisma` directory must be copied before `npm ci` in the Dockerfile. Check that `COPY prisma ./prisma` comes before `RUN npm ci`.

### Container starts but DB has no tables
The app auto-creates tables on first request via `src/lib/prisma.ts`. Visit the site or trigger any auth-related endpoint.

### Streaming not working in production
Ensure the response includes `X-Accel-Buffering: no` header (disables Nginx buffering). Check `src/app/api/agent/route.ts`.

### Checking container health from EC2

```bash
docker ps                     # running?
docker logs aoe2 --tail 30    # recent logs
docker exec aoe2 ls /app/data # data dir exists?
```

### Build fails: `ENOSPC: no space left on device`

The EC2 root volume is only 8G. Docker's BuildKit cache accumulates per build
and fills the disk after a handful of deploys. Signs in the CI log:

```
npm warn tar TAR_ENTRY_ERROR ENOSPC: no space left on device
ERROR: failed to solve: process "/bin/sh -c npm ci" did not complete successfully
```

The deploy workflow now auto-prunes cache older than 24h before building, and
does a full prune if free space drops under 2G. Manual fix if needed:

```bash
# Get a fresh temp key valid for 60s
aws ec2-instance-connect send-ssh-public-key \
  --instance-id i-0208ce363c9ca15ba --region eu-west-1 \
  --instance-os-user ec2-user \
  --ssh-public-key file:///tmp/aoe2-tmp-key.pub

ssh -i /tmp/aoe2-tmp-key ec2-user@52.212.188.247 \
  'docker builder prune -af && df -h /'
```
