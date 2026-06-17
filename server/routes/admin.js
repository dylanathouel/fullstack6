const router = require('../middleware/asyncRouter')();
const pool = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');
const { logAction } = require('../db/log');

// GET /admin/users — list all users
router.get('/users', requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, username, name, email, phone, role, blocked FROM users ORDER BY id'
  );
  res.json(rows);
});

// PUT /admin/users/:id/block — block/unblock
router.put('/users/:id/block', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { blocked } = req.body;
  if (blocked === undefined) return res.status(400).json({ message: 'Missing blocked field' });
  if (id === req.user.id) return res.status(400).json({ message: 'You cannot block yourself' });

  await pool.query('UPDATE users SET blocked = ? WHERE id = ?', [blocked ? 1 : 0, id]);
  await logAction(req.user.id, `${blocked ? 'blocked' : 'unblocked'} user #${id}`);
  res.json({ status: 'updated' });
});

// GET /admin/logs
router.get('/logs', requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT l.id, l.user_id, u.username, l.action, l.created_at
     FROM activity_logs l
     LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC
     LIMIT 200`
  );
  res.json(rows);
});

module.exports = router;
