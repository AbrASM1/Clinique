const db = require('../models/db');

// Create a new treatment name
exports.createTreatmentName = async (req, res) => {
  const { name, price } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  try {
    await db.query(
      'INSERT INTO treatment_names (name, price) VALUES (?, ?)',
      [name, price]
    );
    res.status(201).json({ message: 'Treatment name created successfully.' });
  } catch (err) {
    console.error('Error creating treatment name:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all treatment names
exports.getAllTreatmentNames = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM treatment_names ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching treatment names:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get a treatment name by ID
exports.getTreatmentNameById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM treatment_names WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Treatment not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching treatment name:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update a treatment name
exports.updateTreatmentName = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM treatment_names WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Treatment not found.' });
    }

    await db.query(
      'UPDATE treatment_names SET name = ?, price = ? WHERE id = ?',
      [name, price, id]
    );
    res.json({ message: 'Treatment name updated successfully.' });
  } catch (err) {
    console.error('Error updating treatment name:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete a treatment name
exports.deleteTreatmentName = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query('SELECT id FROM treatment_names WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Treatment not found.' });
    }

    await db.query('DELETE FROM treatment_names WHERE id = ?', [id]);
    res.json({ message: 'Treatment name deleted successfully.' });
  } catch (err) {
    console.error('Error deleting treatment name:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Search treatment names by name (partial match)
exports.searchTreatmentNames = async (req, res) => {
    const { search } = req.query;
  
    if (!search) {
      return res.status(400).json({ error: 'Search term is required.' });
    }
  
    try {
      const [results] = await db.query(
        'SELECT * FROM treatment_names WHERE name LIKE ? ORDER BY name ASC',
        [`%${search}%`]
      );
      res.json(results);
    } catch (err) {
      console.error('Error searching treatment names:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
  