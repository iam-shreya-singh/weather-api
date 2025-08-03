require('dotenv').config();
const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Redis
redisConfig.connect().catch(err => {
  console.error('Failed to connect to Redis, continuing without caching:', err.message);
});


// Routes
app.use('/api/weather', weatherRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    redis: 'disconnected'
  };

  // Check Redis connection
  try {
    await redisConfig.client.ping();
    healthStatus.redis = 'connected';
  } catch (error) {
    healthStatus.redis = 'disconnected';
  }

  res.status(200).json(healthStatus);
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Weather API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;