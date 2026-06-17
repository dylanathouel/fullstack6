const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../db/log');

// GET /users — public fields only (no email/phone)
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, username, name, role FROM users WHERE blocked = FALSE'
  );
  res.json(rows);
});

// GET /users/:id — sensitive info restricted to the owner or an admin
router.get('/:id', requireAuth, async (req, res) => {
  const targetId = req.params.id;
  const isSelf  = req.user.id === targetId;
  const isAdmin = req.user.role === 'admin';

  const fields = (isSelf || isAdmin)
    ? 'id, username, name, email, phone, website, role'
    : 'id, username, name, role';

  const [rows] = await pool.query(
    `SELECT ${fields} FROM users WHERE id = ?`,
    [targetId]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
});

// PUT /users/:id — update profile
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  if (req.user.id !== id) return res.status(403).json({ message: 'Access denied' });

  const { name, email, phone, website } = req.body;
  await pool.query(
    'UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone), website=COALESCE(?,website) WHERE id=?',
    [name ?? null, email ?? null, phone ?? null, website ?? null, id]
  );
  await logAction(id, 'updated profile');
  res.json({ status: 'updated' });
});

// PUT /users/:id/password
router.put('/:id/password', requireAuth, async (req, res) => {
  const id = req.params.id;
  if (req.user.id !== id) return res.status(403).json({ message: 'Access denied' });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  const [rows] = await pool.query(
    'SELECT password_hash FROM user_passwords WHERE user_id = ?', [id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

  const valid = await bcrypt.compare(oldPassword, rows[0].password_hash);
  if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE user_passwords SET password_hash = ? WHERE user_id = ?', [hash, id]);
  await logAction(id, 'changed password');
  res.json({ status: 'updated' });
});

// GET /users/:id/todos — restricted to the owner or an admin
router.get('/:id/todos', requireAuth, async (req, res) => {
  const targetId = req.params.id;
  if (req.user.id !== targetId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { completed, _limit, _start } = req.query;
  let query = 'SELECT id, user_id, title, completed FROM todos WHERE user_id = ?';
  const params = [targetId];

  if (completed !== undefined) {
    query += ' AND completed = ?';
    params.push(completed === 'true' ? 1 : 0);
  }
  query += ' ORDER BY id';
  if (_limit !== undefined) { query += ' LIMIT ?'; params.push(parseInt(_limit)); }
  if (_start !== undefined) { query += ' OFFSET ?'; params.push(parseInt(_start)); }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// GET /users/:id/posts — authentication required
router.get('/:id/posts', requireAuth, async (req, res) => {
  const { _limit, _start } = req.query;
  let query = 'SELECT id, user_id, title, body FROM posts WHERE user_id = ? ORDER BY id';
  const params = [req.params.id];

  if (_limit !== undefined) { query += ' LIMIT ?'; params.push(parseInt(_limit)); }
  if (_start !== undefined) { query += ' OFFSET ?'; params.push(parseInt(_start)); }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// GET /users/:id/albums — authentication required
router.get('/:id/albums', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, title FROM albums WHERE user_id = ? ORDER BY id',
    [req.params.id]
  );
  res.json(rows);
});

module.exports = router;
