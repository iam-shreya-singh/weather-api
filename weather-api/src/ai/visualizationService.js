const axios = require('axios');
const logger = require('../utils/logger');

class VisualizationService {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    this.apiUrl = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
  }

  async generateWeatherImage(weatherDescription) {
    try {
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
          height: 512,  // Reduced for free tier
          width: 512,   // Reduced for free tier
          samples: 1,
          steps: 20,    // Reduced steps for faster generation
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000  // 30 second timeout
        }
      );

      // The response contains base64 encoded images
      const imageData = response.data.artifacts[0].base64;
      return `data:image/png;base64,${imageData}`;
    } catch (error) {
      logger.error('Image generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate weather image');
    }
  }
}

module.exports = new VisualizationService();