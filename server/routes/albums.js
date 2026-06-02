const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// GET /albums  ?userId=
router.get('/', async (req, res) => {
  const { userId } = req.query;
  let query = 'SELECT id, user_id, title FROM albums WHERE 1=1';
  const params = [];
  if (userId) { query += ' AND user_id = ?'; params.push(parseInt(userId)); }
  query += ' ORDER BY id';
  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// GET /albums/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, title FROM albums WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Album not found' });
  res.json(rows[0]);
});

// GET /albums/:id/photos
router.get('/:id/photos', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, album_id, title, url, thumbnail_url FROM photos WHERE album_id = ? ORDER BY id',
    [req.params.id]
  );
  res.json(rows);
});

// POST /albums
router.post('/', requireAuth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });

  const [result] = await pool.query(
    'INSERT INTO albums (user_id, title) VALUES (?,?)',
    [req.user.id, title]
  );
  res.status(201).json({ status: 'created', id: result.insertId });
});

// PUT /albums/:id
router.put('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM albums WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Album not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  const { title } = req.body;
  await pool.query('UPDATE albums SET title = COALESCE(?,title) WHERE id = ?', [title ?? null, id]);
  res.json({ status: 'updated' });
});

// DELETE /albums/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [rows] = await pool.query('SELECT user_id FROM albums WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Album not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  await pool.query('DELETE FROM albums WHERE id = ?', [id]);
  res.json({ status: 'deleted' });
});

module.exports = router;
