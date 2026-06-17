const router = require('../middleware/asyncRouter')();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../db/log');

// GET /photos/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, album_id, title, url, thumbnail_url FROM photos WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Photo not found' });
  res.json(rows[0]);
});

// PUT /photos/:id — single query: update + ownership check (via parent album) combined
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { title, url, thumbnailUrl } = req.body;
  const [result] = await pool.query(
    `UPDATE photos p JOIN albums a ON a.id = p.album_id
     SET p.title=COALESCE(?,p.title), p.url=COALESCE(?,p.url), p.thumbnail_url=COALESCE(?,p.thumbnail_url)
     WHERE p.id = ? AND a.user_id = ?`,
    [title ?? null, url ?? null, thumbnailUrl ?? null, id, req.user.id]
  );
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM photos WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Photo not found' : 'Access denied' });
  }
  await logAction(req.user.id, `updated photo #${id}`);
  res.json({ status: 'updated' });
});

// DELETE /photos/:id — single query: delete + ownership check combined.
// Deleting the last photo of an album just leaves it empty (no cascade on the album).
router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const [result] = await pool.query(
    `DELETE p FROM photos p JOIN albums a ON a.id = p.album_id
     WHERE p.id = ? AND a.user_id = ?`,
    [id, req.user.id]
  );
  if (result.affectedRows === 0) {
    const [rows] = await pool.query('SELECT id FROM photos WHERE id = ?', [id]);
    return res.status(rows.length === 0 ? 404 : 403)
      .json({ message: rows.length === 0 ? 'Photo not found' : 'Access denied' });
  }
  await logAction(req.user.id, `deleted photo #${id}`);
  res.json({ status: 'deleted' });
});

module.exports = router;
