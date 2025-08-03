const request = require('supertest');
const app = require('../src/app');
const weatherService = require('../src/services/weatherService');

// Mock the weather service
jest.mock('../src/services/weatherService');
jest.mock('../src/ai/aiService');
jest.mock('../src/ai/visualizationService');

describe('Weather API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/weather/:location', () => {
    it('should return weather data for valid location', async () => {
      const mockWeatherData = {
        location: 'London, UK',
        current: { temp: 20, conditions: 'Clear' },
        forecast: []
      };

      weatherService.fetchWeatherData.mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get('/api/weather/London')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockWeatherData);
    });

    it('should return 400 for invalid location', async () => {
      const response = await request(app)
        .get('/api/weather/a')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/weather/nlp', () => {
    it('should process natural language query', async () => {
      const mockWeatherData = {
        location: 'Paris, France',
        current: { temp: 22, conditions: 'Sunny' }
      };

      weatherService.fetchWeatherData.mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .post('/api/weather/nlp')
        .send({ query: 'What is the weather like in Paris?' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.location).toBeDefined();
    });

    it('should return 400 for missing query', async () => {
      const response = await request(app)
        .post('/api/weather/nlp')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});