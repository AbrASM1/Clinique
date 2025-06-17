const express = require('express');
const router = express.Router();
const controller = require('../controllers/consumables.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

// All routes protected
router.get('/', auth, checkRole('admin', 'doctor'), controller.getAllConsumables);
router.get('/:id', auth, checkRole('admin', 'doctor'), controller.getConsumableById);
router.post('/', auth, checkRole('admin'), controller.createConsumable);
router.put('/:id', auth, checkRole('admin'), controller.updateConsumable);
router.delete('/:id', auth, checkRole('admin'), controller.deleteConsumable);

module.exports = router;
