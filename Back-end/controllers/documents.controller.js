const db = require('../models/db');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  const { type, note, patient_id } = req.body;
  const file = req.file;

  if (!file || !patient_id) return res.status(400).json({ error: 'Missing file or patient ID' });

  try {
    const file_path = file.path;
    const file_name = file.originalname;
    const file_type = file.mimetype;

    await db.query(`
      INSERT INTO patient_document (type, note, patient_id, file_name, file_type, file_path, uploaded_at, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [type, note, patient_id, file_name, file_type, file_path, req.user.id]
    );

    res.status(201).json({ message: 'Document uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDocumentsByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT id, type, note, file_name, file_type, file_path, uploaded_at, uploaded_by
      FROM patient_document
      WHERE patient_id = ?
      ORDER BY uploaded_at DESC
    `, [patientId]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const [[doc]] = await db.query('SELECT file_path FROM documents WHERE id = ?', [id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Delete from filesystem
    fs.unlinkSync(doc.file_path);

    // Delete from DB
    await db.query('DELETE FROM patient_document WHERE id = ?', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.downloadDocument = async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/documents/', filename);
    res.download(filePath); // or res.sendFile(filePath) to just view
  };
  