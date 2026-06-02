const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Une seule requête : on récupère hash + infos user ensemble
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.role, u.blocked,
              p.password_hash
       FROM users u
       JOIN user_passwords p ON p.user_id = u.id
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      // Délai constant pour éviter l'énumération des usernames
      await bcrypt.compare(password, '$2b$10$invalidsaltinvalidsaltinvalidsa');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.blocked) {
      return res.status(403).json({ success: false, message: 'Account blocked' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // On ne renvoie jamais le hash
    return res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, name, email, password, phone, website } = req.body;
  if (!username || !name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or email already taken' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, name, email, phone, website) VALUES (?,?,?,?,?)',
      [username, name, email, phone || null, website || null]
    );
    const userId = result.insertId;

    await pool.query(
      'INSERT INTO user_passwords (user_id, password_hash) VALUES (?,?)',
      [userId, hash]
    );

    return res.status(201).json({ success: true, id: userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
