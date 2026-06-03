# Remove Docker, Use Local MySQL — Design

**Date:** 2026-06-03
**Status:** Approved

## Goal

Stop using Docker to host the MySQL database. Connect the Node server directly to the MySQL instance installed locally on the developer's machine (installed with MySQL Workbench).

## Context

- The project currently uses `docker-compose.yml` to start MySQL 8.0 in a container on port 3306, with database `fullstack6`, root password `root`, and auto-loads `server/db/seed.sql` via the `docker-entrypoint-initdb.d` volume.
- The server (`server/db/connection.js`) already uses `mysql2/promise` with env vars (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), so no driver changes are needed.
- No `.env` file currently exists in the repo (it is gitignored).
- The developer's local MySQL is installed and has a root password set, but the `fullstack6` database does not exist yet.

## Changes

### Files to delete

- `docker-compose.yml` — entire file is removed from the repo.

### Files to create

- `server/.env` — gitignored, contains local DB credentials. Content:

  ```
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=azertyuiop
  DB_NAME=fullstack6
  ```

- `README.md` (root of repo) — does not currently exist. Create a new minimal README containing the Setup section described below.

### Files unchanged

- `server/db/seed.sql` — already contains `CREATE DATABASE IF NOT EXISTS fullstack6; USE fullstack6;`, so it works as-is when piped to the `mysql` CLI.
- `server/db/connection.js` — already reads from env vars, no change required.
- `server/package.json` — no new scripts required.

## Database initialization workflow

A one-time CLI command, documented in the README:

```bash
mysql -u root -p < server/db/seed.sql
```

The user is prompted for the MySQL root password, then `seed.sql` creates the database and all tables.

### macOS PATH note

On macOS, the MySQL installer places the `mysql` binary at `/usr/local/mysql/bin/mysql` and does NOT add it to the PATH automatically. The README must mention this with two options:

1. Use the full path: `/usr/local/mysql/bin/mysql -u root -p < server/db/seed.sql`
2. Add MySQL to PATH by appending `export PATH="/usr/local/mysql/bin:$PATH"` to `~/.zshrc`, then `source ~/.zshrc`.

## Daily startup workflow

1. Start MySQL service (System Settings → MySQL preference pane, or `sudo /usr/local/mysql/support-files/mysql.server start`).
2. `cd server && npm run dev` — Node server connects to MySQL via `.env`.

## README structure (Setup section)

The README's Setup section should contain:

1. **Prerequisites:** Node.js, MySQL installed locally (with a root password set).
2. **Start MySQL service** (one-time per session, see above).
3. **Create `server/.env`** with the variables listed in the "Files to create" section above.
4. **Seed the database** (one-time):
   ```bash
   mysql -u root -p < server/db/seed.sql
   ```
5. **Install dependencies and run:**
   ```bash
   cd server && npm install && npm run dev
   cd client && npm install && npm run dev
   ```

## Out of scope

- No changes to application code (routes, middleware, client).
- No changes to the schema in `seed.sql`.
- No new npm scripts.
- No `.env.example` file (user opted to write `.env` directly).
- No fallback Docker config kept.

## Success criteria

- `docker-compose.yml` no longer exists in the repo.
- `server/.env` exists locally with the correct credentials.
- Running `mysql -u root -p < server/db/seed.sql` once creates the `fullstack6` database with all tables and seed data.
- `npm run dev` in `server/` starts the API and successfully serves data from the local MySQL.
- README accurately documents the new setup.
