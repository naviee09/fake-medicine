const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'medicine_verifier.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('db open error', err);
    process.exit(1);
  }
  console.log('db open ok');
});
db.all('select id,name,manufacturer,batch_number,expiry_date,barcode,is_authentic from medicines', [], (err, rows) => {
  if (err) {
    console.error('query error', err);
    process.exit(1);
  }
  console.log('medicines', rows.length);
  console.table(rows);
  db.close();
});
