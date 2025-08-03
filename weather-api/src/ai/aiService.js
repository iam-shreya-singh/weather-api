const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.hfApiKey = process.env.HUGGINGFACE_API_TOKEN;
    this.hfApiUrl = 'https://api-inference.huggingface.co/models/';
  }

  async enhanceWeatherData(weatherData) {
    try {
      if (!this.hfApiKey) {
        logger.warn('Hugging Face API key not configured, using fallback');
        return this.getFallbackWeatherDescription(weatherData);
      }

      const prompt = `Based on this weather data, provide a creative weather description and lifestyle recommendations: ${JSON.stringify(weatherData)}`;

      // Use a free, lightweight model
      const response = await axios.post(
        `${this.hfApiUrl}microsoft/DialoGPT-medium`,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.hfApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const generatedText = response.data[0].generated_text;
      return {
        description: generatedText,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('AI enhancement error:', error.response?.data || error.message);
      return this.getFallbackWeatherDescription(weatherData);
    }
  }

  async extractLocationFromQuery(query) {
    try {
      if (!this.hfApiKey) {
        logger.warn('Hugging Face API key not configured, using pattern matching');
        return this.extractLocationWithPatterns(query);
      }

      const prompt = `Extract the location from this weather query: "${query}". Return only the location name.`;

      const response = await axios.post(
        `${this.hfApiUrl}microsoft/DialoGPT-medium`,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.hfApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const generatedText = response.data[0].generated_text;
      // Extract location from generated text
      const locationMatch = generatedText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      return locationMatch ? locationMatch[1].trim() : null;
    } catch (error) {
      logger.error('Location extraction error:', error.response?.data || error.message);
      return this.extractLocationWithPatterns(query);
    }
  }

  async generateNaturalLanguageResponse(query, weatherData) {
    try {
      if (!this.hfApiKey) {
        logger.warn('Hugging Face API key not configured, using fallback');
        return this.getFallbackNLPResponse(query, weatherData);
      }

      const prompt = `User query: "${query}". Weather data: ${JSON.stringify(weatherData)}. Provide a natural language response.`;

      const response = await axios.post(
        `${this.hfApiUrl}microsoft/DialoGPT-medium`,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.hfApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const generatedText = response.data[0].generated_text;
      return generatedText;
    } catch (error) {
      logger.error('NLP response error:', error.response?.data || error.message);
      return this.getFallbackNLPResponse(query, weatherData);
    }
  }

  // Keep the fallback methods
  getFallbackWeatherDescription(weatherData) {
    const condition = weatherData.current.conditions.toLowerCase();
    const temp = weatherData.current.temp;
    
    let description = `The weather in ${weatherData.location} is currently ${condition} with a temperature of ${temp}°C. `;
    
    if (condition.includes('sunny') || condition.includes('clear')) {
      description += "It's a great day for outdoor activities!";
    } else if (condition.includes('rain')) {
      description += "Don't forget your umbrella if you're heading out.";
    } else if (condition.includes('cloud')) {
      description += "Perfect weather for a walk or outdoor exercise.";
    } else if (temp > 25) {
      description += "It's quite warm, stay hydrated!";
    } else if (temp < 10) {
      description += "Bundle up, it's quite chilly!";
    }
    
    return {
      description,
      timestamp: new Date().toISOString()
    };
  }

  extractLocationWithPatterns(query) {
    const locationPatterns = [
      /(?:in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s+weather)/i,
      /weather\s+(?:in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Fallback: look for capitalized words that might be location names
    const words = query.split(' ');
    for (const word of words) {
      if (word[0] === word[0].toUpperCase() && word.length > 2) {
        return word;
      }
    }
    
    return null;
  }

  getFallbackNLPResponse(query, weatherData) {
    const location = weatherData.location;
    const condition = weatherData.current.conditions;
    const temp = weatherData.current.temp;
    
    if (query.toLowerCase().includes('weather')) {
      return `The weather in ${location} is currently ${condition} with a temperature of ${temp}°C.`;
    } else if (query.toLowerCase().includes('temperature')) {
      return `The current temperature in ${location} is ${temp}°C.`;
    } else if (query.toLowerCase().includes('condition')) {
      return `The weather condition in ${location} is currently ${condition}.`;
    } else {
      return `In ${location}, it's currently ${condition} with a temperature of ${temp}°C.`;
    }
  }
}

module.exports = new AIService();