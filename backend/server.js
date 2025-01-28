const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const generateSitemap = require('./utils/sitemapGenerator');

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
const isDevelopment = process.env.NODE_ENV === 'development';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gdgocblog.vercel.app',
  'https://gdgoc-blog-backend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Update CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Update security headers
app.use((req, res, next) => {
  // Remove the previous Access-Control-Allow-Origin header setting
  // as it's now handled by the CORS middleware
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());

// Add canonical URL middleware
app.use((req, res, next) => {
  // Skip for API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Handle trailing slashes
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const canonicalUrl = `${process.env.APP_URL}${req.path.slice(0, -1)}`;
    return res.redirect(301, canonicalUrl);
  }

  next();
});

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

// Add root test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GDG Blog API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Add test route before other routes
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running correctly and accepting requests',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Remove or comment out the sitemap route and related code
// app.get('/sitemap.xml', async (req, res) => { ... });

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
  
  // Add logging for sitemap errors
  if (err.message.includes('sitemap')) {
    console.error('Sitemap error:', err);
  }

  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong! Please try again later.'
  });
});

// Add error logging middleware
app.use((err, req, res, next) => {
  console.error('API Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  });
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing token'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Improve 404 handler with more details
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url); // Add logging
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
