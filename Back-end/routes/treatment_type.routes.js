const express = require('express');
const router = express.Router();
const controller = require('../controllers/treatment_type.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

router.post('/', auth, checkRole('doctor','admin'), controller.createTreatmentName);
router.get('/', auth, checkRole('doctor','admin'), controller.getAllTreatmentNames);
router.get('/search', auth, checkRole('doctor','admin'), controller.searchTreatmentNames);
router.get('/:id', auth, checkRole('doctor','admin'), controller.getTreatmentNameById);
router.put('/:id', auth, checkRole('doctor','admin'), controller.updateTreatmentName);
router.delete('/:id', auth, checkRole('doctor','admin'), controller.deleteTreatmentName);

module.exports = router;
