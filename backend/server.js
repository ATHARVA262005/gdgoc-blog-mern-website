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
  PORT: process.env.PORT
});

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');  // Add this line

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);  // Add this line

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
