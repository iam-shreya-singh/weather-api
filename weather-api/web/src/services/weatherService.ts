import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface WeatherData {
  location: string;
  timezone: string;
  current: {
    temp: number;
    conditions: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    conditions: string;
    precipitation: number;
    icon: string;
  }>;
  timestamp: string;
}

export interface RecommendationData {
  activities: string[];
  clothing: string[];
  health: string[];
  energy: string[];
  overallScore: number;
  generatedAt: string;
}

class WeatherService {
  async getCurrentWeather(location: string, source = 'openweathermap'): Promise<WeatherData> {
    const response = await axios.get(`${API_BASE_URL}/weather/${location}?source=${source}`);
    return response.data.data;
  }

  async getRecommendations(userId: string, location: string, source = 'openweathermap'): Promise<RecommendationData> {
    const response = await axios.get(`${API_BASE_URL}/recommendations/${userId}?location=${location}&source=${source}`);
    return response.data.recommendations;
  }

  async searchLocations(query: string): Promise<string[]> {
    // Mock implementation - in real app, use geocoding API
    return [
      `${query}, USA`,
      `${query}, UK`,
      `${query}, Canada`,
      `${query}, Australia`
    ];
  }
}

export default new WeatherService();