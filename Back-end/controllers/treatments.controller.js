const db = require('../models/db');

exports.createTreatment = async (req, res) => {
  const { treatment_name_id, patient_id, doctor_id, appointment_id } = req.body;

  if (!treatment_name_id || !patient_id || !doctor_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Optional: Validate treatment_name exists
    const [treatmentNames] = await db.query(
      'SELECT id FROM treatment_names WHERE id = ?', [treatment_name_id]
    );
    if (treatmentNames.length === 0) {
      return res.status(404).json({ error: 'Treatment name not found' });
    }

    // Optional: Validate patient
    const [patients] = await db.query(
      'SELECT id FROM patients WHERE id = ?', [patient_id]
    );
    if (patients.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Optional: Validate doctor
    const [doctors] = await db.query(
      'SELECT id FROM users WHERE id = ? AND role = "doctor"', [doctor_id]
    );
    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Optional: Validate appointment if provided
    if (appointment_id) {
      const [appointments] = await db.query(
        'SELECT id FROM appointments WHERE id = ?', [appointment_id]
      );
      if (appointments.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    }

    // Insert treatment
    await db.query(
      `INSERT INTO treatments (treatment_name_id, patient_id, doctor_id, appointment_id)
        VALUES (?, ?, ?, ?)`,
      [treatment_name_id, patient_id, doctor_id, appointment_id || null]
    );

    res.status(201).json({ message: 'Treatment recorded successfully' });

  } catch (err) {
    console.error('Error creating treatment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
  
exports.getAllTreatments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
try {
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM treatments`);
  const [rows] = await db.query(`
  SELECT 
      t.id,
      t.appointment_id,
      tn.name AS treatment_name,
      p.full_name AS patient_name,
      u.username AS doctor_name
  FROM treatments t
  JOIN treatment_names tn ON t.treatment_name_id = tn.id
  JOIN patients p ON t.patient_id = p.id
  JOIN users u ON t.doctor_id = u.id
  ORDER BY t.id DESC
  `, [limit, offset]);

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: rows
  });
} catch (err) {
    console.error('Error fetching treatments:', err);
    res.status(500).json({ error: 'Server error' });
}
};

exports.getTreatmentsGroupedByAppointment = async (req, res) => {
try {
    const [rows] = await db.query(`
    SELECT 
        t.id AS treatment_id,
        t.appointment_id,
        tn.name AS treatment_name,
        p.full_name AS patient_name,
        u.username AS doctor_name
    FROM treatments t
    JOIN treatment_names tn ON t.treatment_name_id = tn.id
    JOIN patients p ON t.patient_id = p.id
    JOIN users u ON t.doctor_id = u.id
    ORDER BY t.appointment_id DESC
    `);

    // Group by appointment_id
    const grouped = {};
    for (const row of rows) {
    if (!grouped[row.appointment_id]) {
        grouped[row.appointment_id] = {
        appointment_id: row.appointment_id,
        patient_name: row.patient_name,
        doctor_name: row.doctor_name,
        treatments: []
        };
    }
    grouped[row.appointment_id].treatments.push({
        id: row.treatment_id,
        name: row.treatment_name,
        performed_at: row.performed_at
    });
    }

    res.json(Object.values(grouped));
} catch (err) {
    console.error('Error fetching grouped treatments:', err);
    res.status(500).json({ error: 'Server error' });
}
};

exports.getTreatmentsByAppointment = async (req, res) => {
const { appointmentId } = req.params;

try {
    const [rows] = await db.query(`
    SELECT 
        t.id AS treatment_id,
        tn.name AS treatment_name,
        p.full_name AS patient_name,
        u.username AS doctor_name
    FROM treatments t
    JOIN treatment_names tn ON t.treatment_name_id = tn.id
    JOIN patients p ON t.patient_id = p.id
    JOIN users u ON t.doctor_id = u.id
    WHERE t.appointment_id = ?
    ORDER BY t.id DESC
    `, [appointmentId]);

    if (rows.length === 0) {
    return res.status(404).json({ error: 'No treatments found for this appointment' });
    }

    res.json({
    appointment_id: appointmentId,
    patient_name: rows[0].patient_name,
    doctor_name: rows[0].doctor_name,
    treatments: rows.map(row => ({
        id: row.treatment_id,
        name: row.treatment_name,
        performed_at: row.performed_at
    }))
    });
} catch (err) {
    console.error('Error fetching treatments:', err);
    res.status(500).json({ error: 'Server error' });
}
};

exports.getByPatient = async (req, res) => {
const { patientId } = req.params;
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;
try {
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM treatments`);
  const [rows] = await db.query(`
  SELECT 
      t.id AS treatment_id,
      t.appointment_id,
      tn.name AS treatment_name,
      u.username AS doctor_name
  FROM treatments t
  JOIN treatment_names tn ON t.treatment_name_id = tn.id
  JOIN users u ON t.doctor_id = u.id
  WHERE t.patient_id = ?
  ORDER BY tn.id DESC
  LIMIT ? OFFSET ?
  `, [patientId, limit, offset]);

  res.json({
    currentPage: page,
    perPage: limit,
    totalRecords: total,
    totalPages: Math.ceil(total / limit),
    treatments: rows
  });
} catch (err) {
    console.error('Error fetching patient treatments:', err);
    res.status(500).json({ error: 'Server error' });
}
};

exports.getTreatmentById = async (req, res) => {
const { id } = req.params;

try {
    const [rows] = await db.query(`
    SELECT t.id, tn.name AS treatment_name, p.full_name AS patient_name,
            u.username AS doctor_name, t.appointment_id
    FROM treatments t
    JOIN treatment_names tn ON t.treatment_name_id = tn.id
    JOIN patients p ON t.patient_id = p.id
    JOIN users u ON t.doctor_id = u.id
    WHERE t.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Treatment not found' });

    res.json(rows[0]);
} catch (err) {
    console.error('Error fetching treatment:', err);
    res.status(500).json({ error: 'Server error' });
}
};

exports.updateTreatment = async (req, res) => {
const { id } = req.params;
const { treatment_name_id, patient_id, doctor_id, appointment_id } = req.body;

try {
    const [rows] = await db.query('SELECT id FROM treatments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Treatment not found' });

    await db.query(`
    UPDATE treatments
    SET treatment_name_id = ?, patient_id = ?, doctor_id = ?, appointment_id = ?
    WHERE id = ?
    `, [treatment_name_id, patient_id, doctor_id, appointment_id, id]);

    res.json({ message: 'Treatment updated successfully' });
} catch (err) {
    console.error('Error updating treatment:', err);
    res.status(500).json({ error: 'Server error' });
}
};

exports.deleteTreatment = async (req, res) => {
const { id } = req.params;

try {
    const [rows] = await db.query('SELECT id FROM treatments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Treatment not found' });

    await db.query('DELETE FROM treatments WHERE id = ?', [id]);
    res.json({ message: 'Treatment deleted successfully' });
} catch (err) {
    console.error('Error deleting treatment:', err);
    res.status(500).json({ error: 'Server error' });
}
};

exports.getTreatmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM treatments`);
    const [rows] = await db.query(`
      SELECT t.id, tn.name AS treatment_name, p.full_name AS patient_name,
              u.username AS doctor_name, t.appointment_id
      FROM treatments t
      JOIN treatment_names tn ON t.treatment_name_id = tn.id
      JOIN patients p ON t.patient_id = p.id
      JOIN users u ON t.doctor_id = u.id
      WHERE t.doctor_id = ?
      ORDER BY t.id DESC
      LIMIT ? OFFSET ?
    `, [doctorId, limit, offset]);

    res.json(rows);
    } catch (err) {
      console.error('Error fetching doctor treatments:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };

exports.searchTreatmentsByName = async (req, res) => {
    const { name } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    if (!name) return res.status(400).json({ error: 'Search query is required' });
  
    try {
      const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM treatments`);
      const [rows] = await db.query(`
        SELECT t.id, tn.name AS treatment_name, p.full_name AS patient_name,
               u.username AS doctor_name, t.appointment_id
        FROM treatments t
        JOIN treatment_names tn ON t.treatment_name_id = tn.id
        JOIN patients p ON t.patient_id = p.id
        JOIN users u ON t.doctor_id = u.id
        WHERE tn.name LIKE ?
        ORDER BY t.id DESC
        LIMIT ? OFFSET ?
      `, [`%${name}%`,limit,offset]);
  
      res.json({
        currentPage: page,
        perPage: limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        treatments: rows
      });
    } catch (err) {
      console.error('Error searching treatments:', err);
      res.status(500).json({ error: 'Server error' });
    }
};

exports.bulkCreateTreatments = async (req, res) => {
  const { appointment_id, doctor_id, patient_id, treatments } = req.body;

  // treatments should be an array of treatment_name_id
  if (!Array.isArray(treatments) || treatments.length === 0) {
    return res.status(400).json({ error: 'Treatments must be a non-empty array' });
  }

  try {
    // Validate appointment, patient, and doctor
    const [[appointment]] = await db.query(`SELECT id FROM appointments WHERE id = ?`, [appointment_id]);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const [[patient]] = await db.query(`SELECT id FROM patients WHERE id = ?`, [patient_id]);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const [[doctor]] = await db.query(`SELECT id FROM users WHERE id = ? AND role = 'doctor'`, [doctor_id]);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    // Build values for bulk insert
    const values = treatments.map(treatment_name_id => [treatment_name_id, patient_id, doctor_id, appointment_id]);

    await db.query(`
      INSERT INTO treatments (treatment_name_id, patient_id, doctor_id, appointment_id)
      VALUES ?
    `, [values]);

    res.status(201).json({ message: 'All treatments recorded successfully' });

  } catch (err) {
    console.error('Error inserting bulk treatments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
