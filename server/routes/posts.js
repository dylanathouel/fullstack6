const router = require('../middleware/asyncRouter')();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../db/log');
const { generateId } = require('../db/id');

// GET /posts  ?userId=&_limit=&_start=
router.get('/', async (req, res) => {
  const { userId, _limit, _start } = req.query;
  let query = 'SELECT id, user_id, title, body FROM posts WHERE 1=1';
  const params = [];

  if (userId) { query += ' AND user_id = ?'; params.push(userId); }
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

// GET /posts/:id/comments  ?_limit=&_start=
router.get('/:id/comments', async (req, res) => {
  const { _limit, _start } = req.query;
  let query = 'SELECT id, post_id, user_id, body FROM comments WHERE post_id = ? ORDER BY id';
  const params = [req.params.id];
  if (_limit !== undefined) { query += ' LIMIT ?'; params.push(parseInt(_limit)); }
  if (_start !== undefined) { query += ' OFFSET ?'; params.push(parseInt(_start)); }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// POST /posts
router.post('/', requireAuth, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'Missing fields' });

  const id = generateId();
  await pool.query(
    'INSERT INTO posts (id, user_id, title, body) VALUES (?,?,?,?)',
    [id, req.user.id, title, body]
  );
  await logAction(req.user.id, `created post #${id}`);
  res.status(201).json({ status: 'created', id });
});

// PUT /posts/:id — single query: update + ownership check combined
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { title, body } = req.body;
  const [result] = await pool.query(
    'UPDATE posts SET title=COALESCE(?,title), body=COALESCE(?,body) WHERE id=? AND user_id=?',
    [title ?? null, body ?? null, id, req.user.id]
  );
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM posts WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Post not found' : 'Access denied' });
  }
  await logAction(req.user.id, `updated post #${id}`);
  res.json({ status: 'updated' });
});

// DELETE /posts/:id — single query: delete + ownership check combined
router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const [result] = await pool.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id]);
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM posts WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Post not found' : 'Access denied' });
  }
  await logAction(req.user.id, `deleted post #${id}`);
  res.json({ status: 'deleted' });
});

module.exports = router;
