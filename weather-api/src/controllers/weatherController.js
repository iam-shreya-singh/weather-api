const weatherService = require('../services/weatherService');
const aiService = require('../ai/aiService');
const { validationResult } = require('express-validator');
const VisualizationService = require('../ai/visualizationService');

class WeatherController {
  // Missing method - add this
  async getWeather(req, res, next) {
    try {
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

  // Fix this method to actually generate visualization
  async getWeatherVisualization(req, res, next) {
    try {
      const { location } = req.params;
      
      // Get weather data
      const weatherData = await weatherService.fetchWeatherData(location);
      
      // Generate a description for the image
      const aiEnhanced = await aiService.enhanceWeatherData(weatherData);
      if (!aiEnhanced) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate weather description'
        });
      }

      // Extract the description from the AI response
      const description = aiEnhanced.description;
      
      // Generate the image
      const visualizationService = new VisualizationService();
      const imageUrl = await visualizationService.generateWeatherImage(description);

      res.json({
        success: true,
        location,
        weather: weatherData,
        imageUrl,
        timestamp: new Date().toISOString()
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