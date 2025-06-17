const express = require('express');
const router = express.Router();
const controller = require('../controllers/treatments.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

// Create
router.post('/', controller.createTreatment);
router.post('/bulk', auth, checkRole('admin', 'doctor'), controller.bulkCreateTreatments);

// Read
router.get('/', auth, checkRole('admin','doctor'), controller.getAllTreatments);
router.get('/grouped-by-appointment', auth, checkRole('admin','doctor'), controller.getTreatmentsGroupedByAppointment);
router.get('/by-appointment/:appointmentId', auth, checkRole('admin','doctor'), controller.getTreatmentsByAppointment);
router.get('/by-patient/:patientId', auth, checkRole('admin','doctor'), controller.getByPatient);
router.get('/by-doctor/:doctorId', auth, checkRole('admin','doctor'), controller.getTreatmentsByDoctor);
router.get('/search', auth, checkRole('admin','doctor'), controller.searchTreatmentsByName);
router.get('/:id', auth, checkRole('admin','doctor'), controller.getTreatmentById);

// Update
router.put('/:id', auth, checkRole('admin','doctor'), controller.updateTreatment);

// Delete
router.delete('/:id', auth, checkRole('admin','doctor'), controller.deleteTreatment);

module.exports = router;
