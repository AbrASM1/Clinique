const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { validateAppointmentCreation, validateAppointmentUpdate, validateStatusUpdate } = require('../middleware/validators/appointmentValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');


router.post('/', auth, validateAppointmentCreation, validate, appointmentsController.createAppointment);
router.put('/:id', auth, validateAppointmentUpdate, validate, appointmentsController.updateAppointment);
router.patch('/:id/status', auth, validateStatusUpdate, validate, appointmentsController.updateStatus);
router.delete('/:id', auth, appointmentsController.deleteAppointment);

// Queries
router.get('/', auth, appointmentsController.getAllAppointments); 
router.get('/patient/:patientId', auth, appointmentsController.getByPatient);
router.get('/doctor/:doctorId', auth, appointmentsController.getByDoctor);

module.exports = router;
