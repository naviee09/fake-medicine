import { db } from './src/database/init.js';

const addAspirin = () => {
  db.run(`
    INSERT OR IGNORE INTO medicines (id, name, manufacturer, batch_number, expiry_date, barcode, description, category, is_authentic)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'med-004',
    'Aspirin',
    'Bayer Pharmaceuticals',
    'ASP-2024-100',
    '2025-12-31',
    '111222333444',
    'Common pain reliever and anti-inflammatory',
    'pharmaceutical',
    1
  ], function(err) {
    if (err) {
      console.error('Error inserting Aspirin:', err);
    } else {
      console.log('Aspirin added to database');
    }
    db.close();
  });
};

addAspirin();