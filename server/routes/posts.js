const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// GET /posts  ?userId=&_limit=&_start=
router.get('/', async (req, res) => {
  const { userId, _limit, _start } = req.query;
  let query = 'SELECT id, user_id, title, body FROM posts WHERE 1=1';
  const params = [];

  if (userId) { query += ' AND user_id = ?'; params.push(parseInt(userId)); }
  query += ' ORDER BY id';
  if (_limit !== undefined) { query += ' LIMIT ?'; params.push(parseInt(_limit)); }
  if (_start !== undefined) { query += ' OFFSET ?'; params.push(parseInt(_start)); }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// GET /posts/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, title, body FROM posts WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });
  res.json(rows[0]);
});

// GET /posts/:id/comments
router.get('/:id/comments', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, post_id, user_id, body FROM comments WHERE post_id = ? ORDER BY id',
    [req.params.id]
  );
  res.json(rows);
});

// POST /posts
router.post('/', requireAuth, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'Missing fields' });

  const [result] = await pool.query(
    'INSERT INTO posts (user_id, title, body) VALUES (?,?,?)',
    [req.user.id, title, body]
  );
  res.status(201).json({ status: 'created', id: result.insertId });
});

// PUT /posts/:id
router.put('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  const { title, body } = req.body;
  await pool.query(
    'UPDATE posts SET title=COALESCE(?,title), body=COALESCE(?,body) WHERE id=?',
    [title ?? null, body ?? null, id]
  );
  res.json({ status: 'updated' });
});

// DELETE /posts/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  await pool.query('DELETE FROM posts WHERE id = ?', [id]);
  res.json({ status: 'deleted' });
});

module.exports = router;
