const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())',
    [username, hashedPassword, role]
  );

  res.status(201).json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
  
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];
  
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
  
    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod with HTTPS
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
  
    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } });
  };
  
  exports.logout = (res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  };
  