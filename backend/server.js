require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
