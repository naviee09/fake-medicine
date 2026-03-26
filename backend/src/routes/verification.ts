import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth';
import { db } from '../database/init';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload and verify medicine image
router.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { identifier, identifierType } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;
    const userId = (req as any).user.userId;

    // Simulate AI analysis (in real implementation, this would call an AI service)
    const analysisResult = performImageAnalysis(req.file.filename);

    // Check identifier if provided
    let identifierCheck = null;
    if (identifier && identifierType) {
      // This would be implemented to check against medicine database
      identifierCheck = {
        provided: identifier,
        type: identifierType,
        verified: Math.random() > 0.3 // Simulate verification
      };
    }

    // Log verification attempt
    const logId = uuidv4();
    db.run(`
      INSERT INTO verification_logs (id, user_id, image_path, verification_result, confidence_score, identifier_used)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      logId,
      userId,
      imagePath,
      analysisResult.result,
      analysisResult.confidence,
      identifier ? `${identifierType}:${identifier}` : null
    ]);

    res.json({
      success: true,
      analysis: analysisResult,
      identifierCheck,
      imageUrl: imagePath,
      logId
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Get verification history for user
router.get('/history', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  db.all(`
    SELECT vl.*, m.name as medicine_name, m.manufacturer
    FROM verification_logs vl
    LEFT JOIN medicines m ON vl.medicine_id = m.id
    WHERE vl.user_id = ?
    ORDER BY vl.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      history: rows,
      pagination: {
        limit,
        offset,
        hasMore: rows.length === limit
      }
    });
  });
});

// Get verification statistics
router.get('/stats', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;

  db.get(`
    SELECT
      COUNT(*) as total_verifications,
      SUM(CASE WHEN verification_result = 'authentic' THEN 1 ELSE 0 END) as authentic_count,
      SUM(CASE WHEN verification_result = 'suspicious' THEN 1 ELSE 0 END) as suspicious_count,
      SUM(CASE WHEN verification_result = 'counterfeit' THEN 1 ELSE 0 END) as counterfeit_count,
      AVG(confidence_score) as avg_confidence
    FROM verification_logs
    WHERE user_id = ?
  `, [userId], (err, stats: any) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      statistics: {
        totalVerifications: stats.total_verifications || 0,
        authenticCount: stats.authentic_count || 0,
        suspiciousCount: stats.suspicious_count || 0,
        counterfeitCount: stats.counterfeit_count || 0,
        averageConfidence: stats.avg_confidence ? Math.round(stats.avg_confidence * 100) / 100 : 0
      }
    });
  });
});

// Simulate AI image analysis (placeholder for real AI implementation)
function performImageAnalysis(filename: string) {
  // In a real implementation, this would:
  // 1. Send image to AI service (e.g., Google Vision AI, AWS Rekognition, or custom ML model)
  // 2. Analyze packaging features, text, logos, etc.
  // 3. Compare against known authentic medicine patterns
  // 4. Return confidence score and result

  // For now, simulate analysis with random results
  const results = ['authentic', 'suspicious', 'counterfeit'];
  const randomResult = results[Math.floor(Math.random() * results.length)];
  const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence

  return {
    result: randomResult,
    confidence: Math.round(confidence * 100) / 100,
    analysis: {
      packagingQuality: randomResult === 'authentic' ? 'high' : 'medium',
      textClarity: randomResult === 'authentic' ? 'clear' : 'unclear',
      logoAuthenticity: randomResult === 'authentic' ? 'verified' : 'questionable',
      overallAssessment: `Medicine packaging appears ${randomResult} with ${(confidence * 100).toFixed(1)}% confidence`
    },
    recommendations: randomResult === 'authentic'
      ? ['Medicine appears authentic', 'Store in cool, dry place', 'Check expiry date regularly']
      : ['Exercise caution', 'Verify with additional methods', 'Consult healthcare professional', 'Report suspicious products']
  };
}

export default router;