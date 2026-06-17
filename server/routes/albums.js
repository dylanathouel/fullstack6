const router = require('../middleware/asyncRouter')();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../db/log');
const { generateId } = require('../db/id');

// GET /albums  ?userId=&_limit=&_start=
router.get('/', async (req, res) => {
  const { userId, _limit, _start } = req.query;
  let query = 'SELECT id, user_id, title FROM albums WHERE 1=1';
  const params = [];
  if (userId) { query += ' AND user_id = ?'; params.push(userId); }
  query += ' ORDER BY id';
  if (_limit !== undefined) { query += ' LIMIT ?'; params.push(parseInt(_limit)); }
  if (_start !== undefined) { query += ' OFFSET ?'; params.push(parseInt(_start)); }
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

// GET /albums/:id/photos  ?_limit=&_start=
router.get('/:id/photos', async (req, res) => {
  const { _limit, _start } = req.query;
  let query = 'SELECT id, album_id, title, url, thumbnail_url FROM photos WHERE album_id = ? ORDER BY id';
  const params = [req.params.id];
  if (_limit !== undefined) { query += ' LIMIT ?'; params.push(parseInt(_limit)); }
  if (_start !== undefined) { query += ' OFFSET ?'; params.push(parseInt(_start)); }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// POST /albums/:id/photos — add a photo to an album (ownership check)
router.post('/:id/photos', requireAuth, async (req, res) => {
  const albumId = req.params.id;
  const [albums] = await pool.query('SELECT user_id FROM albums WHERE id = ?', [albumId]);
  if (albums.length === 0) return res.status(404).json({ message: 'Album not found' });
  if (albums[0].user_id !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  const { title, url, thumbnailUrl } = req.body;
  if (!title || !url || !thumbnailUrl) return res.status(400).json({ message: 'Missing fields' });

  const id = generateId();
  await pool.query(
    'INSERT INTO photos (id, album_id, title, url, thumbnail_url) VALUES (?,?,?,?,?)',
    [id, albumId, title, url, thumbnailUrl]
  );
  await logAction(req.user.id, `added photo #${id} to album #${albumId}`);
  res.status(201).json({ status: 'created', id });
});

// POST /albums
router.post('/', requireAuth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });

  const id = generateId();
  await pool.query(
    'INSERT INTO albums (id, user_id, title) VALUES (?,?,?)',
    [id, req.user.id, title]
  );
  await logAction(req.user.id, `created album #${id}`);
  res.status(201).json({ status: 'created', id });
});

// PUT /albums/:id — single query: update + ownership check combined
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { title } = req.body;
  const [result] = await pool.query(
    'UPDATE albums SET title = COALESCE(?,title) WHERE id = ? AND user_id = ?',
    [title ?? null, id, req.user.id]
  );
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM albums WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Album not found' : 'Access denied' });
  }
  await logAction(req.user.id, `updated album #${id}`);
  res.json({ status: 'updated' });
});

// DELETE /albums/:id — single query: delete + ownership check combined
router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const [result] = await pool.query('DELETE FROM albums WHERE id = ? AND user_id = ?', [id, req.user.id]);
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM albums WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Album not found' : 'Access denied' });
  }
  await logAction(req.user.id, `deleted album #${id}`);
  res.json({ status: 'deleted' });
});

module.exports = router;
