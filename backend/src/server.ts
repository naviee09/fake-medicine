import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './database/init';
import authRoutes from './routes/auth';
import medicineRoutes from './routes/medicine';
import verificationRoutes from './routes/verification';

dotenv.config();

const app = express();
const PORT = 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/verification', verificationRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'MEDPROOF AI Tablet Verification API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Natural Medicine Authenticity Verifier API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = (port: number) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Natural Medicine Authenticity Verifier API running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
  });

  server.on('error', (error: any) => {
    console.error('Server error:', error);
    process.exit(1);
  });
};

startServer(PORT);

export default app;