const router = require('../middleware/asyncRouter')();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../db/log');
const { generateId } = require('../db/id');

// GET /comments  ?postId=&_limit=&_start=
router.get('/', async (req, res) => {
  const { postId, _limit, _start } = req.query;
  let query = 'SELECT id, post_id, user_id, body FROM comments WHERE 1=1';
  const params = [];
  if (postId) { query += ' AND post_id = ?'; params.push(postId); }
  query += ' ORDER BY id';
  if (_limit !== undefined) { query += ' LIMIT ?'; params.push(parseInt(_limit)); }
  if (_start !== undefined) { query += ' OFFSET ?'; params.push(parseInt(_start)); }
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

  const id = generateId();
  await pool.query(
    'INSERT INTO comments (id, post_id, user_id, body) VALUES (?,?,?,?)',
    [id, postId, req.user.id, body]
  );
  await logAction(req.user.id, `created comment #${id}`);
  res.status(201).json({ status: 'created', id });
});

// PUT /comments/:id — single query: update + ownership check combined
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { body } = req.body;
  if (!body) return res.status(400).json({ message: 'Body required' });

  const [result] = await pool.query(
    'UPDATE comments SET body = ? WHERE id = ? AND user_id = ?',
    [body, id, req.user.id]
  );
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM comments WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Comment not found' : 'Access denied' });
  }
  await logAction(req.user.id, `updated comment #${id}`);
  res.json({ status: 'updated' });
});

// DELETE /comments/:id — single query: delete + ownership check combined
router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const [result] = await pool.query('DELETE FROM comments WHERE id = ? AND user_id = ?', [id, req.user.id]);
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM comments WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Comment not found' : 'Access denied' });
  }
  await logAction(req.user.id, `deleted comment #${id}`);
  res.json({ status: 'deleted' });
});

module.exports = router;
