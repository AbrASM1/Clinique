const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patients.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPatientValidator, updatePatientValidator } = require('../middleware/validators/patients.validator');

// Example usage in routes
router.post('/', auth, createPatientValidator, validate, patientsController.createPatient);
router.put('/:id', auth, updatePatientValidator, validate, patientsController.updatePatient);
router.get('/', auth, patientsController.getAllPatients);
router.get('/:id', auth, patientsController.getPatientById);

module.exports = router;
