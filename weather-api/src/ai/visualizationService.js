const axios = require('axios');
const logger = require('../utils/logger');

class VisualizationService {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    this.apiUrl = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
  }

  async generateWeatherImage(weatherDescription) {
    try {
      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your_stability_key_here') {
        logger.warn('Stability AI API key not configured, using fallback');
        return this.getFallbackImage(weatherDescription);
      }

      const prompt = `Weather scene: ${weatherDescription}. Realistic, high quality, detailed, 4k.`;

      const response = await axios.post(
        this.apiUrl,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 512,
          width: 512,
          samples: 1,
          steps: 20,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000
        }
      );

      const imageData = response.data.artifacts[0].base64;
      return `data:image/png;base64,${imageData}`;
    } catch (error) {
      logger.error('Image generation error:', error.response?.data || error.message);
      return this.getFallbackImage(weatherDescription);
    }
  }

  getFallbackImage(weatherDescription) {
    // Return a placeholder image URL or a simple SVG
    const condition = weatherDescription.toLowerCase();
    
    if (condition.includes('sunny')) {
      return 'https://via.placeholder.com/512x512/FFD700/000000?text=Sunny';
    } else if (condition.includes('rain')) {
      return 'https://via.placeholder.com/512x512/4169E1/FFFFFF?text=Rainy';
    } else if (condition.includes('cloud')) {
      return 'https://via.placeholder.com/512x512/808080/FFFFFF?text=Cloudy';
    } else if (condition.includes('snow')) {
      return 'https://via.placeholder.com/512x512/F0F8FF/000000?text=Snowy';
    } else {
      return 'https://via.placeholder.com/512x512/87CEEB/000000?text=Weather';
    }
  }
}

module.exports = VisualizationService;