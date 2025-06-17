const db = require('../models/db');

// Utils
const validStatuses = ['unscheduled', 'scheduled', 'completed', 'cancelled'];
const { convertFrenchDateToISO } = require('../helpers/dateHelpers');
// Create new appointment
exports.createAppointment = async (req, res) => {
  const { patient_id, doctor_id, status, date, start_time, end_time } = req.body;
  const created_by = req.user?.id;

  if (!patient_id || !status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing required fields' });
  }

  // Validate that patient exists
  const [patient] = await db.query('SELECT id FROM patients WHERE id = ?', [patient_id]);
  if (patient.length === 0) return res.status(404).json({ error: 'Patient not found' });

  // If doctor is assigned, validate doctor exists
  if (doctor_id) {
    const [doctor] = await db.query('SELECT id FROM users WHERE id = ? AND role = "doctor"', [doctor_id]);
    if (doctor.length === 0) return res.status(400).json({ error: 'Doctor not found or invalid' });
  }
  let isoAppointmentDate = null;
  if (date) {
    isoAppointmentDate = convertFrenchDateToISO(date);
    if (!isoAppointmentDate) {
      return res.status(400).json({ error: 'Invalid date format. Use DD-MM-YYYY.' });
    }
  }

  // Insert
  await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, status, date, start_time, end_time, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [patient_id, doctor_id || null, status, isoAppointmentDate || null, start_time || null, end_time || null, created_by]
  );

  res.status(201).json({ message: 'Appointment created successfully' });
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { doctor_id, status, date, start_time, end_time } = req.body;

  const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  let isoAppointmentDate = null;
  if (date) {
    isoAppointmentDate = convertFrenchDateToISO(date);
    if (!isoAppointmentDate) {
      return res.status(400).json({ error: 'Invalid date format. Use DD-MM-YYYY.' });
    }
  }
  await db.query(
    `UPDATE appointments 
     SET doctor_id = ?, status = ?, date = ?, start_time = ?, end_time = ?
     WHERE id = ?`,
    [doctor_id || null, status, isoAppointmentDate || null, start_time || null, end_time || null, id]
  );

  res.json({ message: 'Appointment updated' });
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query('SELECT id FROM appointments WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

  await db.query('DELETE FROM appointments WHERE id = ?', [id]);
  res.json({ message: 'Appointment deleted' });
};

// Update only the status
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const [rows] = await db.query('SELECT id FROM appointments WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

  await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  res.json({ message: 'Status updated' });
};

// List appointments with optional filters (status/date)
exports.getAllAppointments = async (req, res) => {
  const { status, from, to } = req.query;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (from) {
    conditions.push('date >= ?');
    params.push(from);
  }
  if (to) {
    conditions.push('date <= ?');
    params.push(to);
  }

  let query = 'SELECT * FROM appointments';
  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY date, start_time';

  const [appointments] = await db.query(query, params);
  res.json(appointments);
};

// Get appointments by patient
exports.getByPatient = async (req, res) => {
  const { patientId } = req.params;
  const [appointments] = await db.query(
    'SELECT * FROM appointments WHERE patient_id = ? ORDER BY date, start_time',
    [patientId]
  );
  res.json(appointments);
};

// Get appointments by doctor
exports.getByDoctor = async (req, res) => {
  const { doctorId } = req.params;
  const [appointments] = await db.query(
    'SELECT * FROM appointments WHERE doctor_id = ? ORDER BY date, start_time',
    [doctorId]
  );
  res.json(appointments);
};
