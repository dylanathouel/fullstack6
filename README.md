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
