import { db } from './src/database/init.js';

db.all("SELECT name FROM medicines", [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Medicines:', rows);
  }
  db.close();
});