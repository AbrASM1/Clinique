const express = require('express');
const router = express.Router();
const controller = require('../controllers/documents.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');
const upload = require('../middleware/upload'); // multer config

// Upload a document
router.post('/', auth, checkRole('admin', 'doctor'), upload.single('file'), controller.uploadDocument);

// Get all documents of a patient
router.get('/patient/:patientId', auth, controller.getDocumentsByPatient);

// Delete a document
router.delete('/:id', auth, checkRole('admin', 'doctor'), controller.deleteDocument);

// Get file
router.get('/download/:filename', controller.downloadDocument);
module.exports = router;
