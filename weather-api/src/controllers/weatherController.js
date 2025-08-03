const weatherService = require('../services/weatherService');
const aiService = require('../ai/aiService');
const { validationResult } = require('express-validator');

class WeatherController {
  async getWeather(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { location } = req.params;
      const { includeAI } = req.query;

      const weatherData = await weatherService.fetchWeatherData(location);

      let aiEnhanced = null;
      if (includeAI === 'true') {
        aiEnhanced = await aiService.enhanceWeatherData(weatherData);
      }

      res.json({
        success: true,
        data: weatherData,
        ai: aiEnhanced
      });
    } catch (error) {
      next(error);
    }
  }

  async getWeatherWithNLP(req, res, next) {
    try {
      const { query } = req.body;
      const location = await aiService.extractLocationFromQuery(query);
      
      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Could not determine location from your query'
        });
      }

      const weatherData = await weatherService.fetchWeatherData(location);
      const response = await aiService.generateNaturalLanguageResponse(query, weatherData);

      res.json({
        success: true,
        location,
        weather: weatherData,
        response
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WeatherController();