# Remove Docker, Use Local MySQL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Docker from the project and connect the Node server to the developer's locally-installed MySQL instance.

**Architecture:** No application code changes. We delete `docker-compose.yml`, create a `server/.env` with local credentials, manually seed the database via the `mysql` CLI, then verify the existing Node server connects. A new README documents the workflow.

**Tech Stack:** Node.js (Express + mysql2), local MySQL 8.x server (already installed on macOS via the official installer), MySQL Workbench available for inspection.

**Spec reference:** `docs/superpowers/specs/2026-06-03-remove-docker-use-local-mysql-design.md`

---

## File Structure

| Action | Path | Purpose |
|---|---|---|
| Delete | `docker-compose.yml` | Stop using containerized MySQL |
| Create | `server/.env` | Hold local DB credentials (gitignored) |
| Create | `README.md` | Document new setup workflow |
| Unchanged | `server/db/connection.js` | Already reads from `.env` |
| Unchanged | `server/db/seed.sql` | Already creates DB + tables |

---

## Task 1: Remove Docker config

**Files:**
- Delete: `docker-compose.yml`

- [ ] **Step 1: Verify the file exists**

Run: `ls docker-compose.yml`
Expected: `docker-compose.yml` is listed.

- [ ] **Step 2: Delete the file**

Run: `rm docker-compose.yml`

- [ ] **Step 3: Verify deletion**

Run: `ls docker-compose.yml`
Expected: `ls: docker-compose.yml: No such file or directory`

- [ ] **Step 4: Commit**

```bash
git add -A docker-compose.yml
git commit -m "Remove docker-compose.yml — migrating to local MySQL"
```

Expected: 1 file changed, deletion recorded.

---

## Task 2: Create local `.env` for the server

**Files:**
- Create: `server/.env`

- [ ] **Step 1: Confirm `.env` is gitignored**

Run: `cat .gitignore`
Expected: output contains a line `.env`.

If not present, add `.env` to `.gitignore` and commit before proceeding.

- [ ] **Step 2: Create `server/.env` with the exact content below**

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=azertyuiop
DB_NAME=fullstack6
```

- [ ] **Step 3: Verify the file is ignored by git**

Run: `git status --short server/.env`
Expected: NO output (file is ignored). If you see `?? server/.env`, the `.gitignore` rule is wrong — fix it before continuing.

- [ ] **Step 4: No commit**

`.env` is intentionally not committed. Nothing to do.

---

## Task 3: Initialize the `fullstack6` database

**Files:** none (operates on the local MySQL server)

- [ ] **Step 1: Ensure MySQL server is running**

Try: `/usr/local/mysql/support-files/mysql.server status`
Expected: `SUCCESS! MySQL running`.

If not running: `sudo /usr/local/mysql/support-files/mysql.server start`

Alternative: open System Settings → MySQL → click "Start MySQL Server".

- [ ] **Step 2: Locate the `mysql` CLI**

Run: `which mysql`
Expected: a path (e.g. `/usr/local/mysql/bin/mysql`).

If `mysql not found`, use the full path `/usr/local/mysql/bin/mysql` in the next step.

- [ ] **Step 3: Run the seed script**

From the project root:

```bash
mysql -u root -p < server/db/seed.sql
```

Or with full path:

```bash
/usr/local/mysql/bin/mysql -u root -p < server/db/seed.sql
```

When prompted, enter password: `azertyuiop`.

Expected: command returns silently with exit code 0 (no errors).

- [ ] **Step 4: Verify database and tables exist**

```bash
mysql -u root -p -e "USE fullstack6; SHOW TABLES;"
```

Enter password when prompted.

Expected output includes (order may vary):
```
+-----------------------+
| Tables_in_fullstack6  |
+-----------------------+
| albums                |
| comments              |
| posts                 |
| todos                 |
| user_passwords        |
| users                 |
+-----------------------+
```

If the tables are missing or you see "Unknown database 'fullstack6'", re-run Step 3 and check for errors.

- [ ] **Step 5: No commit**

This is local state only. Nothing to commit.

---

## Task 4: Verify the Node server connects to local MySQL

**Files:** none (smoke-tests the existing server code)

- [ ] **Step 1: Install dependencies**

```bash
cd server && npm install
```

Expected: completes without errors, `node_modules/` is created.

- [ ] **Step 2: Start the server**

```bash
npm run dev
```

Expected: nodemon starts; server logs indicate it's listening (e.g. `Server running on port 3000` or similar from `server/index.js`).

If you see a connection error like `ECONNREFUSED 127.0.0.1:3306`, MySQL is not running — return to Task 3 Step 1.
If you see `ER_ACCESS_DENIED_ERROR`, the password in `server/.env` is wrong — re-check Task 2 Step 2.

- [ ] **Step 3: Hit an endpoint to confirm data flows**

In a second terminal:

```bash
curl http://localhost:3000/users
```

(Replace port if `server/index.js` uses a different one — check the file.)

Expected: a JSON array of users (matches the seed data). Empty array `[]` means the seed did not load — return to Task 3.

- [ ] **Step 4: Stop the server**

Press `Ctrl+C` in the nodemon terminal.

- [ ] **Step 5: No commit**

This task only verifies behaviour; no files changed.

---

## Task 5: Write the README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md` at the repo root with this exact content**

```markdown
# fullstack6

JSONPlaceholder-style fullstack app: Express + MySQL backend, Vite client.

## Prerequisites

- Node.js (any recent LTS)
- MySQL 8.x installed locally (e.g. via the official macOS installer), with a root password configured
- (Optional) MySQL Workbench for inspecting the database

## Setup

### 1. Start the MySQL server

macOS, one of:

- System Settings → MySQL → **Start MySQL Server**
- Or in a terminal: `sudo /usr/local/mysql/support-files/mysql.server start`

### 2. Make the `mysql` CLI available

The installer places `mysql` at `/usr/local/mysql/bin/mysql` and does NOT add it to your PATH by default.

Either use the full path in commands below, or add it to your PATH once:

```bash
echo 'export PATH="/usr/local/mysql/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Create `server/.env`

Create a file at `server/.env` with:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=fullstack6
```

Replace `your_mysql_root_password` with the password you set when installing MySQL.

### 4. Seed the database (one-time)

From the project root:

```bash
mysql -u root -p < server/db/seed.sql
```

Enter your MySQL root password when prompted. This creates the `fullstack6` database and all tables with seed data.

### 5. Install dependencies and run

In two terminals:

```bash
cd server && npm install && npm run dev
```

```bash
cd client && npm install && npm run dev
```

The API runs on the port configured in `server/index.js`; the client runs on Vite's default port.
```

- [ ] **Step 2: Verify it renders correctly**

Run: `cat README.md | head -20`
Expected: the first 20 lines of the README are shown, starting with `# fullstack6`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Add README with local MySQL setup instructions"
```

Expected: 1 file changed, README.md created.

---

## Task 6: Final verification

**Files:** none

- [ ] **Step 1: Confirm Docker is fully gone**

Run: `git ls-files | grep -i docker`
Expected: NO output (no Docker-related files tracked).

- [ ] **Step 2: Confirm `server/.env` exists locally but is not tracked**

Run: `ls server/.env && git ls-files server/.env`
Expected: `server/.env` is listed by `ls` but `git ls-files` returns nothing.

- [ ] **Step 3: Run the server one more time end-to-end**

```bash
cd server && npm run dev
```

In a second terminal:

```bash
curl http://localhost:3000/users
```

Expected: JSON array of users.

Press Ctrl+C in the server terminal to stop.

- [ ] **Step 4: Confirm git log shows the migration**

Run: `git log --oneline -5`
Expected: recent commits include "Remove docker-compose.yml..." and "Add README with local MySQL setup instructions".

---

## Self-Review Notes

- **Spec coverage:** All spec items are covered — delete docker-compose.yml (Task 1), create server/.env (Task 2), seed via `mysql` CLI (Task 3), README with macOS PATH note + setup section (Task 5). Daily startup workflow is verified in Task 4 and documented in the README.
- **No placeholders:** Every step has concrete commands and expected output.
- **Out-of-scope confirmed:** No code changes, no new npm scripts, no `.env.example`, no fallback Docker config.
