const pool = require('./connection');

// Records a user action in activity_logs for the admin audit panel.
// Fire-and-forget: a logging failure must never break the actual request.
async function logAction(userId, action) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
      [userId ?? null, action]
    );
  } catch (err) {
    console.error('logAction failed:', err.message);
  }
}

module.exports = { logAction };
