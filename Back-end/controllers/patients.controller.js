const db = require('../models/db');
const { convertFrenchDateToISO } = require('../helpers/dateHelpers');

// Create new patient
exports.createPatient = async (req, res) => {
  const { full_name, birth_date, phone, email, address, gender } = req.body;

  const created_by = req.user?.id;

  if (!created_by) {
    return res.status(401).json({ error: 'Unauthorized: missing creator info' });
  }

  const [existing] = await db.query(
    `SELECT id FROM patients WHERE full_name = ? AND birth_date = ? AND phone = ?`,
    [full_name, birth_date, phone]
  );

  if (existing.length > 0) {
    return res.status(400).json({ error: 'Patient already exists' });
  }
  let isoBirthDate = null;
  if (birth_date) {
    isoBirthDate = convertFrenchDateToISO(birth_date);
    if (!isoBirthDate) {
      return res.status(400).json({ error: 'Invalid birth_date format. Use DD-MM-YYYY.' });
    }
  }

  await db.query(
    `INSERT INTO patients 
    (full_name, birth_date, phone, email, address, gender, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [full_name, isoBirthDate, phone, email, address, gender, created_by]
  );

  res.status(201).json({ message: 'Patient registered successfully' });
};


// Get all patients (with optional search)
exports.getAllPatients = async (req, res) => {
  const search = req.query.search;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM patients';
  let countQuery = 'SELECT COUNT(*) as total FROM patients';
  let params = [];

  if (search) {
    query += ' WHERE full_name LIKE ? OR phone LIKE ?';
    countQuery += ' WHERE full_name LIKE ? OR phone LIKE ?';
    const s = `%${search}%`;
    params = [s, s];
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);


  const [patients] = await db.query(query, params);
  res.json(patients);
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  const { id } = req.params;

  const [patients] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);

  if (patients.length === 0)
    return res.status(404).json({ error: 'Patient not found' });

  res.json(patients[0]);
};

// Update patient by ID
exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const { full_name, birth_date, phone, email, address, gender } = req.body;
  let isoBirthDate = null;
  if (birth_date) {
    isoBirthDate = convertFrenchDateToISO(birth_date);
    if (!isoBirthDate) {
      return res.status(400).json({ error: 'Invalid birth_date format. Use DD-MM-YYYY.' });
    }
  }
  await db.query(
    `UPDATE patients SET full_name = ?, birth_date = ?, phone = ?, email = ?, 
     address = ?, gender = ? WHERE id = ?`,
    [full_name, isoBirthDate, phone, email, address, gender, id]
  );

  res.json({ message: 'Patient updated successfully' });
};
