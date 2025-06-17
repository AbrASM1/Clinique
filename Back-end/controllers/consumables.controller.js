const db = require('../models/db');

exports.createConsumable = async (req, res) => {
  const { name, quantity, unit, provider_name, provider_phone } = req.body;

  if (!name || !quantity || !unit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query(
      `INSERT INTO consumable_items (name, quantity, unit, provider_name, provider_phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, quantity, unit, provider_name || null, provider_phone || null]
    );

    res.status(201).json({ message: 'Consumable added successfully' });
  } catch (err) {
    console.error('Error adding consumable:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllConsumables = async (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
  
    const offset = (page - 1) * limit;
  
    try {
      const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM consumable_items');
  
      const [rows] = await db.query(`
        SELECT * FROM consumable_items
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
  
      res.json({
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: rows
      });
    } catch (err) {
      console.error('Error fetching consumables:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

exports.getConsumableById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`SELECT * FROM consumable_items WHERE id = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Consumable not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching consumable:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateConsumable = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, provider_name, provider_phone } = req.body;

  try {
    const [existing] = await db.query(`SELECT id FROM consumable_items WHERE id = ?`, [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Consumable not found' });

    await db.query(
      `UPDATE consumable_items
       SET name = ?, quantity = ?, unit = ?, provider_name = ?, provider_phone = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, quantity, unit, provider_name, provider_phone, id]
    );

    res.json({ message: 'Consumable updated successfully' });
  } catch (err) {
    console.error('Error updating consumable:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteConsumable = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query(`SELECT id FROM consumable_items WHERE id = ?`, [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Consumable not found' });

    await db.query(`DELETE FROM consumable_items WHERE id = ?`, [id]);
    res.json({ message: 'Consumable deleted successfully' });
  } catch (err) {
    console.error('Error deleting consumable:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
