const axios = require('axios');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class OpenWeatherMapService {
  constructor() {
    this.apiKey = process.env.OPENWEATHERMAP_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    
    logger.info(`OpenWeatherMap API Key: ${this.apiKey ? 'Set' : 'Not set'}`);
  }

  async fetchWeatherData(location) {
    const cacheKey = cacheService.generateKey('openweathermap', { location });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      logger.info(`OpenWeatherMap cache hit for ${location}`);
      return cachedData;
    }

    logger.info(`Fetching fresh data from OpenWeatherMap for ${location}`);
    
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeatherMap API key is not configured');
      }
      
      // Get current weather and 5-day forecast
      const currentUrl = `${this.baseUrl}/weather`;
      const forecastUrl = `${this.baseUrl}/forecast`;
      
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(currentUrl, {
          params: {
            q: location,
            appid: this.apiKey,
            units: 'metric'
          },
          timeout: 10000
        }),
        axios.get(forecastUrl, {
          params: {
            q: location,
            appid: this.apiKey,
            units: 'metric'
          },
          timeout: 10000
        })
      ]);

      logger.info(`OpenWeatherMap current response status: ${currentResponse.status}`);
      logger.info(`OpenWeatherMap forecast response status: ${forecastResponse.status}`);

      const weatherData = this.transformResponse(currentResponse.data, forecastResponse.data);
      
      // Cache the response
      await cacheService.set(cacheKey, weatherData);
      
      return weatherData;
    } catch (error) {
      logger.error('OpenWeatherMap API error:', error.message);
      if (error.response) {
        logger.error('OpenWeatherMap response status:', error.response.status);
        logger.error('OpenWeatherMap response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Failed to fetch weather data from OpenWeatherMap: ${error.message}`);
    }
  }

  transformResponse(currentData, forecastData) {
    // Process forecast data to get daily forecasts
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          tempMax: -Infinity,
          tempMin: Infinity,
          conditions: item.weather[0].main,
          precipitation: 0,
          icon: item.weather[0].icon
        };
      }
      
      dailyForecasts[date].tempMax = Math.max(dailyForecasts[date].tempMax, item.main.temp_max);
      dailyForecasts[date].tempMin = Math.min(dailyForecasts[date].tempMin, item.main.temp_min);
      dailyForecasts[date].precipitation += (item.rain ? item.rain['3h'] || 0 : 0);
    });

    return {
      location: `${currentData.name}, ${currentData.sys.country}`,
      timezone: `UTC${currentData.timezone >= 0 ? '+' : ''}${currentData.timezone / 3600}`,
      current: {
        temp: Math.round(currentData.main.temp),
        conditions: this.capitalizeFirst(currentData.weather[0].description),
        humidity: currentDate.main.humidity,
        windSpeed: currentDate.wind.speed,
        icon: currentDate.weather[0].icon
      },
      forecast: Object.values(dailyForecasts).slice(0, 7).map(day => ({
        date: day.date,
        tempMax: Math.round(day.tempMax),
        tempMin: Math.round(day.tempMin),
        conditions: this.capitalizeFirst(day.conditions),
        precipitation: Math.round(day.precipitation * 100) / 100,
        icon: day.icon
      })),
      timestamp: new Date().toISOString(),
      source: 'OpenWeatherMap'
    };
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = new OpenWeatherMapService();