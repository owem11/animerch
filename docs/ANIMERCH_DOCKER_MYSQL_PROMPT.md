# ANIMERCH – FULL-STACK E-COMMERCE PROJECT (REBUILD PROMPT, DOCKER MYSQL)

This file is a Docker-based variant of the original Animerch rebuild prompt. The key change: **MySQL runs in Docker** (local or on any server), instead of being installed directly on an AWS EC2 instance.  
Source adapted from the previous prompt. fileciteturn0file0

---

## PROJECT OVERVIEW
Build a full-stack anime merchandise (T-shirts) web application named **Animerch**.

System components:
- **MySQL database (Docker container)**
- Node.js + Express REST API
- Nginx reverse proxy (optional for local; recommended for production)
- Next.js frontend
- Process management (PM2 optional; Docker restart policies are acceptable too)
- Frontend deployment (Netlify recommended)

The project must be clean, production-ready, and suitable for a portfolio.

---

## SYSTEM ARCHITECTURE

Frontend (Netlify / Local)
→ HTTP requests
→ (Optional) Nginx reverse proxy
→ Node.js Express API
→ MySQL (Docker)

---

## BACKEND REQUIREMENTS (PROMPT 1)

### Tech Stack
- Node.js (LTS)
- Express.js
- mysql2 (or equivalent MySQL client)
- dotenv
- (Optional) PM2 for production
- (Optional) Nginx reverse proxy

### Database (Docker)
- Database name: `anime`
- Table name: `anime_tshirts`

Example schema fields:
- id (INT, PK)
- title (VARCHAR)
- anime (VARCHAR)
- category (VARCHAR)
- price (INT)
- stock (INT)
- size (VARCHAR)
- color (VARCHAR)
- material (VARCHAR)
- rating (DECIMAL)

### API Endpoints
Implement REST endpoints:

- `GET /health`
  - Returns `{ ok: true, db: 1 }` when DB connection succeeds

- `GET /api/tshirts`
  - Supports query params:
    - `limit`
    - `offset`
  - Returns JSON:
    ```json
    {
      "limit": 3,
      "offset": 0,
      "count": 3,
      "data": [ ... ]
    }
    ```

### Environment Variables (.env) for API
Use Docker-friendly hostnames.

**If Node runs on your host machine (not in Docker):**
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`

**If Node also runs in Docker Compose:**
- `DB_HOST=mysql` (the service name)
- `DB_PORT=3306`

Suggested `.env`:
```
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_USER=apiuser
DB_PASS=STRONG_PASSWORD
DB_NAME=anime
```

### Requirements
- Use MySQL connection pooling
- Handle errors gracefully
- Enable CORS for your frontend domain(s)
- Do NOT expose DB credentials in the repo
- API must be testable with curl

---

## DOCKER REQUIREMENTS (PROMPT 2)

### Goal
Run MySQL via Docker with persistent storage and create:
- database `anime`
- user `apiuser`
- privileges on `anime.*`
- optional initial import of your CSV/SQL

### Option A: Docker Compose (recommended)
Create a `docker-compose.yml` that includes:
- `mysql` service using an official MySQL image
- a named volume for persistence
- environment variables for root password + initial DB
- port mapping `3306:3306` (only if you need to connect from host tools like TablePlus)

**Must include:**
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE=anime`
- plus a method to create `apiuser` and grant privileges:
  - either via init SQL mounted into `/docker-entrypoint-initdb.d/`
  - or via a one-time setup script/command

### Option B: Docker run (simple)
Provide commands that:
- run MySQL container with volume
- expose 3306 if needed
- then execute SQL to create user + grants

### Init SQL (recommended)
Create an `init.sql` (mounted into container init directory) that:
- creates `apiuser`
- grants privileges
- (optional) creates table schema
- (optional) imports data if you convert CSV → SQL beforehand

---

## LOCAL DEV WORKFLOW (PROMPT 2, continued)

### Start DB
- `docker compose up -d` (or `docker run ...`)

### Verify DB
- `docker exec -it <mysql_container> mysql -uroot -p`
- Confirm `SHOW DATABASES;`
- Confirm `SELECT COUNT(*) FROM anime.anime_tshirts;`

### Start API
- `npm install`
- `npm run dev` (or `node server.js`)
- Verify:
  - `curl http://127.0.0.1:3000/health`
  - `curl "http://127.0.0.1:3000/api/tshirts?limit=3"`

---

## PRODUCTION DEPLOYMENT (PROMPT 2, production)

You have two good production options:

### Option 1 (simple): Host API + MySQL together on a VPS using Docker Compose
- Run both Node API and MySQL in a single `docker-compose.yml`
- Put Nginx in front (either host Nginx or Nginx container)
- Use restart policies
- Restrict MySQL port exposure (do NOT expose 3306 publicly)

### Option 2: Managed DB + host API separately
- Use a managed MySQL (RDS, etc.) and keep Docker only for local dev
- Still valid, but **this prompt assumes Docker MySQL is acceptable in production**.

### Nginx reverse proxy (recommended)
Routes:
- `/health` → `http://127.0.0.1:3000/health`
- `/api/*` → `http://127.0.0.1:3000/*`

---

## FRONTEND REQUIREMENTS (PROMPT 3)

### Tech Stack
- Next.js (App Router)
- Clean centered layout, white background, black text
- Brand: **Animerch**
- Top title centered; navbar below with:
  - search bar
  - category filter
  - color filter
  - sort

### Homepage behavior
- Static homepage section that recommends/featured items (e.g., Top Rated, Best Deals)
- Search switches into a search-results view and fetches from the API

### Frontend Environment Variables
`.env.local`:
```
NEXT_PUBLIC_API_BASE=http://YOUR_API_DOMAIN_OR_IP
```

---

## GITHUB REQUIREMENTS

- Monorepo or separate repos allowed
- Include:
  - README.md (architecture + setup)
  - `docker-compose.yml` (or docker run instructions)
  - `/backend` and `/frontend` folders if monorepo
- No secrets committed:
  - `.env`, `.env.local` in `.gitignore`
  - Provide `.env.example`

---

## GOAL
Rebuild **Animerch** end-to-end in 2–3 prompts using an AI IDE, with **MySQL running in Docker**, and a deployable setup that can run locally and in production.
