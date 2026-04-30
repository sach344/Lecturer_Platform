const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));

// Static info
app.get('/api/modules', (_req, res) => {
  res.json([
    { id: 'GK', label: 'General Knowledge', icon: '🌍', color: '#f59e0b' },
    { id: 'DSA', label: 'Data Structures & Algorithms', icon: '🧮', color: '#3b82f6' },
    { id: 'Hindi', label: 'Hindi', icon: '📖', color: '#ec4899' },
    { id: 'Paper 1', label: 'Paper 1', icon: '📄', color: '#8b5cf6' },
    { id: 'Paper 2', label: 'Paper 2', icon: '📋', color: '#06b6d4' },
    { id: 'System Design', label: 'System Design', icon: '🏗️', color: '#10b981' },
  ]);
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyplatform').then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`🚀 Backend running on http://localhost:${port}`));
});
