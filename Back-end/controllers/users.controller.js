const db = require('../models/db');

// Create a new user (staff only, admin access required)
exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Only admin can create users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())',
    [username, hashedPassword, role]
  );

  res.status(201).json({ message: 'User created successfully' });
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const [users] = await db.query(
    'SELECT id, username, role, created_at FROM users'
  );
  res.json(users);
};

// Get current logged-in user info
exports.getCurrentUser = async (req, res) => {
  const { id, username, role } = req.user;
  res.json({ id, username, role });
};


// Admin changes any user's password
exports.adminChangePassword = async (req, res) => {
    const { userId, newPassword } = req.body;
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'Missing fields' });
    }
  
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  
    res.json({ message: 'Password updated successfully' });
  };

  
  // User changes their own password
exports.changeOwnPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
  
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing fields' });
    }
  
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];
  
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Current password incorrect' });
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  
    res.json({ message: 'Password updated successfully' });
  };

  exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    await db.query('UPDATE users SET username = ?, role = ? WHERE id = ?', [
      username,
      role,
      id
    ]);
  
    res.json({ message: 'User updated successfully' });
  };

  exports.deleteUser = async (req, res) => {
    const { id } = req.params;
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  };

  exports.getUserById = async (req, res) => {
    const { id } = req.params;
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    const [users] = await db.query(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [id]
    );
  
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
  
    res.json(users[0]);
  };
  
  exports.getDoctors = async (req, res) => {
    try {
      const [doctors] = await db.query(
        'SELECT id, username FROM users WHERE role = "doctor"'
      );
      res.json(doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };