const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../db/log');

// GET /todos  ?userId=&completed=&_limit=&_start=
router.get('/', async (req, res) => {
  const { userId, completed, _limit, _start } = req.query;
  let query = 'SELECT id, user_id, title, completed FROM todos WHERE 1=1';
  const params = [];

  if (userId) { query += ' AND user_id = ?'; params.push(parseInt(userId)); }
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

// GET /todos/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, title, completed FROM todos WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Todo not found' });
  res.json(rows[0]);
});

// POST /todos
router.post('/', requireAuth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });

  const [result] = await pool.query(
    'INSERT INTO todos (user_id, title, completed) VALUES (?,?,FALSE)',
    [req.user.id, title]
  );
  await logAction(req.user.id, `created todo #${result.insertId}`);
  res.status(201).json({ status: 'created', id: result.insertId });
});

// PUT /todos/:id
router.put('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM todos WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Todo not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  const { title, completed } = req.body;
  await pool.query(
    'UPDATE todos SET title=COALESCE(?,title), completed=COALESCE(?,completed) WHERE id=?',
    [title ?? null, completed ?? null, id]
  );
  await logAction(req.user.id, `updated todo #${id}`);
  res.json({ status: 'updated' });
});

// DELETE /todos/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM todos WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Todo not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  await pool.query('DELETE FROM todos WHERE id = ?', [id]);
  await logAction(req.user.id, `deleted todo #${id}`);
  res.json({ status: 'deleted' });
});

module.exports = router;
