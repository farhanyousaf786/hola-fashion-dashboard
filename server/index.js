const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: 'http://localhost:3002',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Rallina Dashboard API!' });
});

// Shippo routes
const shippoRoutes = require('./routes/shippoRoutes');
app.use('/api/shippo', shippoRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../build')));

  // Handle React routes without wildcards
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
  
  app.get('/orders', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
  
  app.get('/orders/:id', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
  
  app.get('/orders/:id/shipping', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
  
  app.get('/items', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
