const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async enhanceWeatherData(weatherData) {
    try {
      const prompt = `
        Based on this weather data, provide:
        1. A creative weather description
        2. Lifestyle recommendations
        3. A visual description for image generation
        
        Weather Data: ${JSON.stringify(weatherData)}
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      });

      return {
        description: response.choices[0].message.content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('AI enhancement error:', error);
      return null;
    }
  }

  async extractLocationFromQuery(query) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "Extract the location from this weather query. Return only the location name."
        }, {
          role: "user",
          content: query
        }],
        max_tokens: 50,
        temperature: 0.3
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.error('Location extraction error:', error);
      return null;
    }
  }

  async generateNaturalLanguageResponse(query, weatherData) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a helpful weather assistant. Answer the user's question based on the provided weather data."
        }, {
          role: "user",
          content: query
        }, {
          role: "assistant",
          content: `Weather data: ${JSON.stringify(weatherData)}`
        }],
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('NLP response error:', error);
      return "I'm sorry, I couldn't process your request at this time.";
    }
  }
}

module.exports = new AIService();