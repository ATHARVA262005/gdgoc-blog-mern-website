const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify environment variables are loaded
console.log('Loaded environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
  ADMIN_MASTER_PASSWORD: process.env.ADMIN_MASTER_PASSWORD ? 'Set' : 'Not set',
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL
});

if (!process.env.ADMIN_MASTER_PASSWORD) {
  console.error('Warning: ADMIN_MASTER_PASSWORD is not set in environment variables');
}

if (!process.env.FRONTEND_URL) {
  console.error('Warning: FRONTEND_URL is not set in environment variables');
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');  
const adminRoutes = require('./routes/admin'); // Add this line
const blogRoutes = require('./routes/blogs'); // Add this line
const usersRoute = require('./routes/users'); // Import the users route

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gdgocblog.vercel.app',
  'https://gdgoc-blog-backend.vercel.app'
];

// Update CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin); // Debug logging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  maxAge: 86400 // Cache preflight request for 24 hours
}));

// Ensure OPTIONS requests are handled properly
app.options('*', cors());

app.use(express.json());

// Add detailed MongoDB connection logging
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Hide credentials in logs
  })
  .catch(err => {
    console.error('MongoDB connection error details:', {
      message: err.message,
      code: err.code,
      uri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);  
app.use('/api/admin', adminRoutes); // Add this line
app.use('/api/blogs', blogRoutes); // Add this line
// Remove the duplicate usersRoute mounting
// app.use('/api/users', usersRoute); // Mount the users route

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed'
    });
  }
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong! Please try again later.'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
