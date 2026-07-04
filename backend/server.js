require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:5174',
    'https://rapid-revision-hub.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/assistant', require('./routes/ai'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rapid Revision Hub AI API is running! 🚀', 
    timestamp: new Date().toISOString(),
    sdg: 'SDG 4 — Quality Education',
    env: {
      jwtSecret: !!process.env.JWT_SECRET,
      mongodbUri: !!process.env.MONGODB_URI,
      geminiApiKey: !!process.env.GEMINI_API_KEY
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Rapid Revision Hub AI Server running on http://localhost:${PORT}`);
  console.log(`📚 SDG 4 — Quality Education Platform`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`✓ JWT_SECRET Loaded: ${!!process.env.JWT_SECRET}`);
  console.log(`✓ MONGODB_URI Loaded: ${!!process.env.MONGODB_URI}`);
  console.log(`✓ GEMINI_API_KEY Loaded: ${!!process.env.GEMINI_API_KEY}`);
});

module.exports = app;
