const express = require('express');
const { body } = require('express-validator');
const weatherController = require('../controllers/weatherController');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all routes
router.use(rateLimiter);

// Get weather for a location
router.get('/:location', [
  // Validate location parameter
  (req, res, next) => {
    if (!req.params.location || req.params.location.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Location must be at least 2 characters long'
      });
    }
    next();
  }
], weatherController.getWeather);

// Natural language weather query
router.post('/nlp', [
  body('query').isLength({ min: 5 }).withMessage('Query must be at least 5 characters long')
], weatherController.getWeatherWithNLP);

module.exports = router;