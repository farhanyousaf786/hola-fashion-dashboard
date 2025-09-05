const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup (allow common frontend dev ports)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
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

// Serve static assets if build exists (works in dev and prod)
const buildDir = path.join(__dirname, '../build');
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
  // Wildcard handler for client routes (exclude API) - Express v5 compatible
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.resolve(buildDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
