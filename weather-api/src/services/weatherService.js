const axios = require('axios');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = process.env.WEATHER_API_URL;
    this.cacheInitialized = false;
  }

  async ensureCacheInitialized() {
    if (!this.cacheInitialized) {
      await cacheService.checkRedisConnection();
      this.cacheInitialized = true;
    }
  }

  async fetchWeatherData(location) {
    // Ensure cache is initialized
    await this.ensureCacheInitialized();
    
    const cacheKey = cacheService.generateKey('weather', { location });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      logger.info(`Cache hit for ${location}`);
      return cachedData;
    }

    logger.info(`Fetching fresh data for ${location}`);
    
    try {
      const response = await axios.get(`${this.baseUrl}/${location}`, {
        params: {
          key: this.apiKey,
          unitGroup: 'metric',
          include: 'current,days,hours'
        },
        timeout: 5000
      });

      const weatherData = this.transformResponse(response.data);
      
      // Cache the response
      await cacheService.set(cacheKey, weatherData);
      
      return weatherData;
    } catch (error) {
      logger.error('Weather API error:', error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  transformResponse(data) {
    return {
      location: data.resolvedAddress,
      timezone: data.timezone,
      current: {
        temp: data.currentConditions.temp,
        conditions: data.currentConditions.conditions,
        humidity: data.currentConditions.humidity,
        windSpeed: data.currentConditions.windspeed,
        icon: data.currentConditions.icon
      },
      forecast: data.days.slice(0, 7).map(day => ({
        date: day.datetime,
        tempMax: day.tempmax,
        tempMin: day.tempmin,
        conditions: day.conditions,
        precipitation: day.precip,
        icon: day.icon
      })),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new WeatherService();