import { useState, useEffect } from 'react';
import weatherService from '../services/weatherService';
import { WeatherData } from '../services/weatherService';

export const useWeather = (location: string, source = 'openweathermap') => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getCurrentWeather(location, source);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [location, source]);

  return { weatherData, loading, error, refetch };
};