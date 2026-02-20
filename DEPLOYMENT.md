# NexusBank — Deployment Guide

## Quick Start (Local Development)

```bash
# Terminal 1 — Backend
cd server
npm install
npx prisma migrate dev --name init
node src/index.js

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

Open http://localhost:5173

---

## Docker Deployment

### Prerequisites
- Docker 20+ and Docker Compose v2

### Deploy

```bash
# Set production secrets
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
export CSRF_SECRET=$(openssl rand -base64 32)
export COOKIE_SECRET=$(openssl rand -base64 32)

# Build and start
docker compose up -d --build

# Run database migration
docker exec nexusbank-server npx prisma migrate deploy

# Check health
curl http://localhost/api/health
```

- **Frontend**: http://localhost (port 80)
- **Backend**: http://localhost:5000 (or proxied through nginx)

### Logs

```bash
# View server logs
docker logs nexusbank-server -f

# View log files
docker exec nexusbank-server cat logs/combined.log
```

### Stop

```bash
docker compose down       # Stop containers
docker compose down -v    # Stop + remove volumes
```

---

## Deploy to Render

### Backend (Web Service)

1. Create a **Web Service** in Render
2. Link your GitHub repo, set **Root Directory** = `server`
3. **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
4. **Start Command**: `node src/index.js`
5. Set **Environment Variables**:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = your PostgreSQL connection string
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET`, `COOKIE_SECRET` (random strings)
   - `CLIENT_URL` = your frontend Render URL
   - `ACCESS_TOKEN_EXPIRY` = `15m`
   - `REFRESH_TOKEN_EXPIRY` = `7d`

> **Note**: For PostgreSQL on Render, update `schema.prisma` provider from `sqlite` to `postgresql`

### Frontend (Static Site)

1. Create a **Static Site** in Render
2. Link your GitHub repo, set **Root Directory** = `client`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. Add **Rewrite Rule**: `/*` → `/index.html` (for SPA routing)
6. Set environment variable: `VITE_API_URL` = your backend Render URL

---

## Deploy to AWS

### Option A: EC2 + Docker

1. Launch an EC2 instance (Ubuntu 22.04, t2.micro for testing)
2. Install Docker: `sudo apt update && sudo apt install docker.io docker-compose-v2 -y`
3. Clone repo, set env vars, run `docker compose up -d --build`
4. Open security group inbound rules for ports 80 and 443

### Option B: ECS + Fargate

1. Push Docker images to ECR
2. Create ECS cluster with Fargate launch type
3. Define task definitions for server + client containers
4. Create Application Load Balancer
5. Set up RDS PostgreSQL for production database

### Option C: AWS Amplify (Frontend) + Elastic Beanstalk (Backend)

1. **Amplify**: Connect GitHub repo → build frontend
2. **Elastic Beanstalk**: Deploy Node.js backend
3. **RDS**: PostgreSQL database

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./dev.db` | Database connection string |
| `JWT_SECRET` | Yes | — | Access token signing key |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token signing key |
| `ACCESS_TOKEN_EXPIRY` | No | `15m` | Access token TTL |
| `REFRESH_TOKEN_EXPIRY` | No | `7d` | Refresh token TTL |
| `PORT` | No | `5000` | Server port |
| `CLIENT_URL` | Yes | — | Frontend URL for CORS |
| `CSRF_SECRET` | Yes | — | CSRF token signing key |
| `COOKIE_SECRET` | Yes | — | Cookie signing key |
| `NODE_ENV` | No | `development` | Environment mode |
| `LOG_LEVEL` | No | `info` | Winston log level |
