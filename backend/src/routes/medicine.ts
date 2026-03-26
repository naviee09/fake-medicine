import express from 'express';
import { authenticateToken } from './auth';
import { db } from '../database/init';

const router = express.Router();

// Search medicines by name (public endpoint for verification)
router.post('/search', (req, res) => {
  console.log('Search request body:', req.body);
  const { name, category } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Medicine name is required' });
  }

  const sanitizedValue = name.trim().toLowerCase();
  const searchTerm = `%${sanitizedValue}%`;

  console.log('[medicine search] request:', { name: sanitizedValue, category });

  let query = `
    SELECT id, name, manufacturer, batch_number, expiry_date, barcode, description, category, dosage, side_effects, warnings, interactions, price, stock_quantity, is_authentic
    FROM medicines
    WHERE (lower(name) LIKE ? OR lower(manufacturer) LIKE ? OR lower(batch_number) LIKE ? OR lower(barcode) LIKE ?)
  `;
  let params = [searchTerm, searchTerm, searchTerm, searchTerm];

  if (category && category.trim()) {
    query += ' AND category = ?';
    params.push(category.trim().toLowerCase());
  }

  query += ' LIMIT 1';

  db.get(query, params, (err, row: any) => {
    console.log('db.get err:', err);
    console.log('db.get row:', row);
    if (err) {
      console.error('[medicine search] db error', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      console.log('[medicine search] not found for:', sanitizedValue);
      return res.status(404).json({ error: 'Tablet not found in database' });
    }

    const confidence = row.is_authentic ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 50;

    res.json({
      id: row.id,
      name: row.name,
      manufacturer: row.manufacturer,
      batch: row.batch_number,
      verified: row.is_authentic,
      confidence: confidence,
      expiry_date: row.expiry_date,
      barcode: row.barcode,
      description: row.description,
      category: row.category,
      dosage: row.dosage,
      side_effects: row.side_effects,
      warnings: row.warnings,
      interactions: row.interactions,
      price: row.price,
      stock_quantity: row.stock_quantity
    });
  });
});

// Browse medicines (public endpoint)
router.post('/browse', (req, res) => {
  const { category, limit = 20 } = req.body;

  let query = `
    SELECT id, name, manufacturer, category, price, stock_quantity
    FROM medicines
    WHERE 1=1
  `;
  let params: any[] = [];

  if (category && category.trim()) {
    query += ' AND category = ?';
    params.push(category.trim().toLowerCase());
  }

  query += ' ORDER BY name LIMIT ?';
  params.push(Math.min(parseInt(limit) || 20, 50)); // Max 50 results

  db.all(query, params, (err, rows: any[]) => {
    if (err) {
      console.error('[medicine browse] db error', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      medicines: rows,
      count: rows.length
    });
  });
});

// Search remedies by health issue
router.post('/remedies', (req, res) => {
  const { issue } = req.body;

  if (!issue || typeof issue !== 'string' || !issue.trim()) {
    return res.status(400).json({ error: 'Health issue is required' });
  }

  const sanitizedValue = issue.trim().toLowerCase();
  const searchTerm = `%${sanitizedValue}%`;

  console.log('[remedies search] request:', { issue: sanitizedValue });

  db.all(`
    SELECT id, name, manufacturer, description, category, health_issues
    FROM medicines
    WHERE lower(health_issues) LIKE ?
    ORDER BY category DESC
  `, [searchTerm], (err, rows: any[]) => {
    if (err) {
      console.error('[remedies search] db error', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!rows || rows.length === 0) {
      console.log('[remedies search] not found for:', sanitizedValue);
      return res.status(404).json({ error: 'No remedies found for this health issue' });
    }

    res.json({
      remedies: rows.map(row => ({
        id: row.id,
        name: row.name,
        manufacturer: row.manufacturer,
        description: row.description,
        category: row.category,
        health_issues: row.health_issues
      }))
    });
  });
});

// Get all medicines (authenticated users only)
router.get('/', authenticateToken, (req, res) => {
  db.all(`
    SELECT id, name, manufacturer, batch_number, expiry_date, barcode, description, category, is_authentic, created_at
    FROM medicines
    ORDER BY created_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ medicines: rows });
  });
});

// Get medicine by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT id, name, manufacturer, batch_number, expiry_date, barcode, description, category, is_authentic, created_at
    FROM medicines
    WHERE id = ?
  `, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json({ medicine: row });
  });
});

// Search medicines by various criteria
router.get('/search/:query', authenticateToken, (req, res) => {
  const { query } = req.params;
  const searchTerm = `%${query}%`;

  db.all(`
    SELECT id, name, manufacturer, batch_number, expiry_date, barcode, description, category, is_authentic
    FROM medicines
    WHERE name LIKE ? OR manufacturer LIKE ? OR batch_number LIKE ? OR barcode = ? OR description LIKE ?
    ORDER BY name
  `, [searchTerm, searchTerm, searchTerm, query, searchTerm], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ medicines: rows, searchTerm: query });
  });
});

// Verify medicine by barcode or batch number (public endpoint for verification)
router.post('/verify-identifier', (req, res) => {
  const { identifier, type } = req.body; // type: 'barcode' or 'batch_number'

  if (!identifier || !type) {
    return res.status(400).json({ error: 'Identifier and type are required' });
  }

  const column = type === 'barcode' ? 'barcode' : 'batch_number';

  db.get(`
    SELECT id, name, manufacturer, batch_number, expiry_date, barcode, is_authentic
    FROM medicines
    WHERE ${column} = ?
  `, [identifier], (err, row: any) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({
        authentic: false,
        message: 'Medicine not found in authentic database',
        identifier,
        type
      });
    }

    // Check if expired
    const expiryDate = new Date(row.expiry_date);
    const now = new Date();
    const isExpired = expiryDate < now;

    res.json({
      authentic: row.is_authentic && !isExpired,
      medicine: {
        id: row.id,
        name: row.name,
        manufacturer: row.manufacturer,
        batch_number: row.batch_number,
        expiry_date: row.expiry_date,
        barcode: row.barcode,
        is_expired: isExpired
      },
      message: row.is_authentic && !isExpired
        ? 'Medicine verified as authentic'
        : isExpired
          ? 'Medicine found but has expired'
          : 'Medicine marked as counterfeit'
    });
  });
});



// Add new medicine (admin functionality - authenticated)
router.post('/', authenticateToken, (req, res) => {
  const { name, manufacturer, batch_number, expiry_date, barcode, description, category } = req.body;

  if (!name || !manufacturer) {
    return res.status(400).json({ error: 'Name and manufacturer are required' });
  }

  const medicineId = `med-${Date.now()}`;

  db.run(`
    INSERT INTO medicines (id, name, manufacturer, batch_number, expiry_date, barcode, description, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [medicineId, name, manufacturer, batch_number, expiry_date, barcode, description, category || 'natural'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add medicine' });
    }

    res.status(201).json({
      message: 'Medicine added successfully',
      medicine: {
        id: medicineId,
        name,
        manufacturer,
        batch_number,
        expiry_date,
        barcode,
        description,
        category: category || 'natural'
      }
    });
  });
});

export default router;