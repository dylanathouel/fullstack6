const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// GET /comments  ?postId=
router.get('/', async (req, res) => {
  const { postId } = req.query;
  let query = 'SELECT id, post_id, user_id, body FROM comments WHERE 1=1';
  const params = [];
  if (postId) { query += ' AND post_id = ?'; params.push(parseInt(postId)); }
  query += ' ORDER BY id';
  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// GET /comments/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, post_id, user_id, body FROM comments WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
  res.json(rows[0]);
});

// POST /comments  — payload : { postId, body }
router.post('/', requireAuth, async (req, res) => {
  const { postId, body } = req.body;
  if (!postId || !body) return res.status(400).json({ message: 'Missing fields' });

  const [result] = await pool.query(
    'INSERT INTO comments (post_id, user_id, body) VALUES (?,?,?)',
    [postId, req.user.id, body]
  );
  res.status(201).json({ status: 'created', id: result.insertId });
});

// PUT /comments/:id
router.put('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  const { body } = req.body;
  if (!body) return res.status(400).json({ message: 'Body required' });
  await pool.query('UPDATE comments SET body = ? WHERE id = ?', [body, id]);
  res.json({ status: 'updated' });
});

// DELETE /comments/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  await pool.query('DELETE FROM comments WHERE id = ?', [id]);
  res.json({ status: 'deleted' });
});

module.exports = router;
