const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/auth');

router.post('/', auth, usersController.createUser);                   // POST /api/users

// Static routes first
router.get('/me', auth, usersController.getCurrentUser);              // GET /api/users/me
router.get('/doctors', auth, usersController.getDoctors);            // GET /api/users/doctors
router.get('/users', auth, usersController.getAllUsers);             // GET /api/users/users
router.put('/change-password', auth, usersController.changeOwnPassword);
router.put('/admin-change-password', auth, usersController.adminChangePassword);

// Dynamic routes last
router.get('/:id', auth, usersController.getUserById);               // GET /api/users/:id
router.put('/:id', auth, usersController.updateUser);                // PUT /api/users/:id
router.delete('/:id', auth, usersController.deleteUser);             // DELETE /api/users/:id


module.exports = router;
