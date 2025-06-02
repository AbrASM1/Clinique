const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const authMiddleware =  require('../middleware/auth')
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/me', authMiddleware, (req, res) => {
    res.json({ message: 'Hello', user: req.user });
  });
  
module.exports = router;
