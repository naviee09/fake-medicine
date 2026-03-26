import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../data/medicine_verifier.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

export const initializeDatabase = () => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create medicines table
  db.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      batch_number TEXT,
      expiry_date DATE,
      barcode TEXT,
      description TEXT,
      category TEXT DEFAULT 'natural',
      health_issues TEXT,
      dosage TEXT,
      side_effects TEXT,
      warnings TEXT,
      interactions TEXT,
      price REAL DEFAULT 0,
      stock_quantity INTEGER DEFAULT 100,
      is_authentic BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create verification_logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS verification_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      medicine_id TEXT,
      image_path TEXT,
      verification_result TEXT,
      confidence_score REAL,
      identifier_used TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (medicine_id) REFERENCES medicines (id)
    )
  `);

  // Insert sample medicine data
  db.get("SELECT COUNT(*) as count FROM medicines", [], (err, row: any) => {
    console.log('Count query err:', err);
    console.log('Count:', row ? row.count : 'no row');
    if (!err && row.count === 0) {
      console.log('Inserting sample data...');
      const sampleMedicines = [
        {
          id: 'med-001',
          name: 'Natural Vitamin C Complex',
          manufacturer: 'NatureHealth Labs',
          batch_number: 'NAT-VC-2024-001',
          expiry_date: '2026-12-31',
          barcode: '123456789012',
          description: 'High-quality natural vitamin C from organic sources, supports immune function and collagen production',
          category: 'natural',
          health_issues: 'immune support, cold, flu, skin health',
          dosage: '500mg daily',
          side_effects: 'Mild stomach upset in high doses',
          warnings: 'Consult doctor if pregnant or have kidney stones',
          interactions: 'May interact with blood thinners',
          price: 24.99,
          stock_quantity: 150
        },
        {
          id: 'med-002',
          name: 'Herbal Immune Support',
          manufacturer: 'GreenLeaf Pharmaceuticals',
          batch_number: 'HL-IS-2024-045',
          expiry_date: '2025-08-15',
          barcode: '987654321098',
          description: 'Traditional herbal formula with echinacea, elderberry, and zinc for comprehensive immune system support',
          category: 'natural',
          health_issues: 'immune system, cold prevention, seasonal allergies',
          dosage: '2 capsules twice daily',
          side_effects: 'Rare allergic reactions',
          warnings: 'Not for children under 12',
          interactions: 'May interact with immunosuppressants',
          price: 19.99,
          stock_quantity: 200
        },
        {
          id: 'med-003',
          name: 'Organic Omega-3 Supplement',
          manufacturer: 'PureOcean Naturals',
          batch_number: 'PO-ON-2024-078',
          expiry_date: '2026-03-20',
          barcode: '456789012345',
          description: 'Pure omega-3 fatty acids (EPA/DHA) from sustainable wild-caught fish, supports heart and brain health',
          category: 'natural',
          health_issues: 'heart health, joint pain, brain function, inflammation',
          dosage: '1000mg daily with meals',
          side_effects: 'Fishy aftertaste, mild digestive upset',
          warnings: 'Contains fish oil, not suitable for fish allergies',
          interactions: 'May interact with blood thinners',
          price: 29.99,
          stock_quantity: 120
        },
        {
          id: 'med-004',
          name: 'Aspirin',
          manufacturer: 'Bayer',
          batch_number: 'ASP-2024-123',
          expiry_date: '2025-12-31',
          barcode: '111111111111',
          description: 'Acetylsalicylic acid for pain relief, fever reduction, and anti-inflammatory effects',
          category: 'pharmaceutical',
          health_issues: 'pain, fever, inflammation, headache, heart attack prevention',
          dosage: '325-650mg every 4-6 hours as needed',
          side_effects: 'Stomach irritation, bleeding risk, tinnitus',
          warnings: 'Risk of Reye syndrome in children, avoid if allergic to NSAIDs',
          interactions: 'Many drugs including blood thinners, other NSAIDs',
          price: 8.99,
          stock_quantity: 300
        },
        {
          id: 'med-005',
          name: 'Ibuprofen',
          manufacturer: 'Pfizer',
          batch_number: 'IBU-2024-456',
          expiry_date: '2026-06-30',
          barcode: '222222222222',
          description: 'Non-steroidal anti-inflammatory drug (NSAID) for pain, fever, and inflammation',
          category: 'pharmaceutical',
          health_issues: 'pain, fever, inflammation, arthritis, menstrual cramps',
          dosage: '200-400mg every 4-6 hours',
          side_effects: 'Stomach upset, heartburn, dizziness, increased blood pressure',
          warnings: 'Increased heart attack/stroke risk, kidney problems, avoid in late pregnancy',
          interactions: 'ACE inhibitors, diuretics, lithium, methotrexate',
          price: 12.99,
          stock_quantity: 250
        },
        {
          id: 'med-006',
          name: 'Paracetamol',
          manufacturer: 'GSK',
          batch_number: 'PAR-2024-789',
          expiry_date: '2025-09-15',
          barcode: '333333333333',
          description: 'Acetaminophen for effective pain relief and fever reduction with fewer stomach side effects',
          category: 'pharmaceutical',
          health_issues: 'pain, fever, headache, toothache, muscle aches',
          dosage: '500-1000mg every 4-6 hours, max 4000mg daily',
          side_effects: 'Rare: skin rash, liver damage in overdose',
          warnings: 'Do not exceed recommended dose, liver disease risk, avoid alcohol',
          interactions: 'Warfarin, carbamazepine, phenytoin',
          price: 6.99,
          stock_quantity: 400
        },
        {
          id: 'med-007',
          name: 'Amoxicillin',
          manufacturer: 'Novartis',
          batch_number: 'AMX-2024-101',
          expiry_date: '2026-01-20',
          barcode: '444444444444',
          description: 'Broad-spectrum penicillin antibiotic for bacterial infections',
          category: 'pharmaceutical',
          health_issues: 'bacterial infection, ear infection, urinary tract infection, skin infection',
          dosage: '500mg three times daily for 7-10 days',
          side_effects: 'Diarrhea, nausea, vomiting, allergic reactions',
          warnings: 'Complete full course, may cause antibiotic resistance if stopped early',
          interactions: 'Oral contraceptives, methotrexate, warfarin',
          price: 15.99,
          stock_quantity: 180
        },
        {
          id: 'med-008',
          name: 'Metformin',
          manufacturer: 'Merck',
          batch_number: 'MET-2024-202',
          expiry_date: '2025-11-10',
          barcode: '555555555555',
          description: 'First-line medication for type 2 diabetes, helps control blood sugar levels',
          category: 'pharmaceutical',
          health_issues: 'diabetes, blood sugar control, insulin resistance',
          dosage: '500-1000mg twice daily with meals',
          side_effects: 'Nausea, diarrhea, stomach upset, metallic taste',
          warnings: 'Monitor kidney function, risk of lactic acidosis, avoid in severe kidney disease',
          interactions: 'Cimetidine, furosemide, nifedipine',
          price: 22.99,
          stock_quantity: 160
        },
        {
          id: 'med-009',
          name: 'Lisinopril',
          manufacturer: 'AstraZeneca',
          batch_number: 'LIS-2024-303',
          expiry_date: '2026-04-25',
          barcode: '666666666666',
          description: 'ACE inhibitor for high blood pressure and heart failure treatment',
          category: 'pharmaceutical',
          health_issues: 'high blood pressure, heart failure, kidney protection',
          dosage: '10-40mg once daily',
          side_effects: 'Dry cough, dizziness, headache, fatigue',
          warnings: 'May cause birth defects, monitor potassium levels, avoid in pregnancy',
          interactions: 'Potassium supplements, diuretics, NSAIDs',
          price: 18.99,
          stock_quantity: 140
        },
        {
          id: 'med-010',
          name: 'Omeprazole',
          manufacturer: 'AstraZeneca',
          batch_number: 'OME-2024-404',
          expiry_date: '2025-07-30',
          barcode: '777777777777',
          description: 'Proton pump inhibitor for acid reflux, ulcers, and heartburn',
          category: 'pharmaceutical',
          health_issues: 'acid reflux, ulcers, heartburn, GERD',
          dosage: '20-40mg once daily before meals',
          side_effects: 'Headache, diarrhea, nausea, abdominal pain',
          warnings: 'Long-term use may increase fracture risk, monitor vitamin B12',
          interactions: 'Clopidogrel, digoxin, iron supplements',
          price: 14.99,
          stock_quantity: 220
        },
        {
          id: 'med-011',
          name: 'Simvastatin',
          manufacturer: 'Merck',
          batch_number: 'SIM-2024-505',
          expiry_date: '2026-02-15',
          barcode: '888888888888',
          description: 'Statin medication to lower cholesterol and reduce cardiovascular risk',
          category: 'pharmaceutical',
          health_issues: 'high cholesterol, heart disease prevention',
          dosage: '10-40mg once daily in evening',
          side_effects: 'Muscle pain, liver enzyme changes, digestive issues',
          warnings: 'Monitor liver function, risk of muscle breakdown, avoid grapefruit',
          interactions: 'Fibrates, niacin, cyclosporine, warfarin',
          price: 26.99,
          stock_quantity: 130
        },
        {
          id: 'med-012',
          name: 'Sertraline',
          manufacturer: 'Pfizer',
          batch_number: 'SER-2024-606',
          expiry_date: '2025-10-20',
          barcode: '999999999999',
          description: 'Selective serotonin reuptake inhibitor (SSRI) for depression and anxiety',
          category: 'pharmaceutical',
          health_issues: 'depression, anxiety, OCD, PTSD',
          dosage: '50-200mg once daily',
          side_effects: 'Nausea, insomnia, sexual dysfunction, dizziness',
          warnings: 'May increase suicide risk in young adults, taper gradually when stopping',
          interactions: 'MAOIs, other SSRIs, tramadol, St. John wort',
          price: 31.99,
          stock_quantity: 100
        },
        {
          id: 'med-013',
          name: 'Turmeric Curcumin Extract',
          manufacturer: 'NatureHealth Labs',
          batch_number: 'NAT-TC-2024-707',
          expiry_date: '2026-08-10',
          barcode: '101010101010',
          description: 'High-potency curcumin extract with black pepper for enhanced absorption, natural anti-inflammatory',
          category: 'natural',
          health_issues: 'inflammation, joint pain, arthritis, antioxidant support',
          dosage: '500mg twice daily with meals',
          side_effects: 'Mild digestive upset, may cause gallstones in high doses',
          warnings: 'Consult doctor if have gallbladder issues or are pregnant',
          interactions: 'Blood thinners, diabetes medications',
          price: 27.99,
          stock_quantity: 180
        },
        {
          id: 'med-014',
          name: 'Probiotic Complex',
          manufacturer: 'GutHealth Pro',
          batch_number: 'GHP-PB-2024-808',
          expiry_date: '2025-12-05',
          barcode: '111111111112',
          description: 'Multi-strain probiotic supplement for gut health and immune support',
          category: 'natural',
          health_issues: 'digestive health, immune support, gut flora balance',
          dosage: '1 capsule daily with food',
          side_effects: 'Mild bloating initially, rare allergic reactions',
          warnings: 'Contains dairy, refrigerate for best potency',
          interactions: 'May affect antibiotic effectiveness',
          price: 34.99,
          stock_quantity: 90
        },
        {
          id: 'med-015',
          name: 'Magnesium Glycinate',
          manufacturer: 'MineralMax',
          batch_number: 'MM-MG-2024-909',
          expiry_date: '2026-05-18',
          barcode: '121212121212',
          description: 'Highly absorbable magnesium supplement for muscle relaxation and nervous system support',
          category: 'natural',
          health_issues: 'muscle cramps, anxiety, sleep, constipation',
          dosage: '400mg daily, preferably evening',
          side_effects: 'Loose stools in high doses',
          warnings: 'Consult doctor if have kidney disease',
          interactions: 'Antibiotics, diuretics, bisphosphonates',
          price: 21.99,
          stock_quantity: 200
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO medicines (id, name, manufacturer, batch_number, expiry_date, barcode, description, category, health_issues, dosage, side_effects, warnings, interactions, price, stock_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleMedicines.forEach(medicine => {
        stmt.run([
          medicine.id,
          medicine.name,
          medicine.manufacturer,
          medicine.batch_number,
          medicine.expiry_date,
          medicine.barcode,
          medicine.description,
          medicine.category,
          medicine.health_issues,
          medicine.dosage,
          medicine.side_effects,
          medicine.warnings,
          medicine.interactions,
          medicine.price,
          medicine.stock_quantity
        ]);
      });

      stmt.finalize();
      console.log('Sample medicine data inserted');
    }
  });

  console.log('Database initialized successfully');
};