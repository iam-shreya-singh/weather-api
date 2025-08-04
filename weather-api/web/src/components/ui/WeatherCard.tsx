import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import { WeatherData } from '../services/weatherService';

interface WeatherCardProps {
  weatherData: WeatherData;
  onDetailsClick?: () => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData, onDetailsClick }) => {
  const getWeatherIcon = (conditions: string) => {
    const condition = conditions.toLowerCase();
    if (condition.includes('clear') || condition.includes('sunny')) {
      return '☀️';
    } else if (condition.includes('cloud')) {
      return '☁️';
    } else if (condition.includes('rain')) {
      return '🌧️';
    } else if (condition.includes('snow')) {
      return '❄️';
    } else if (condition.includes('storm')) {
      return '⛈️';
    } else if (condition.includes('fog')) {
      return '🌫️';
    } else {
      return '🌤️';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'error';
    if (temp >= 20) return 'warning';
    if (temp >= 10) return 'info';
    return 'primary';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="div">
            {weatherData.location}
          </Typography>
          <Typography variant="h2" component="div" color={getTemperatureColor(weatherData.current.temp)}>
            {weatherData.current.temp}°C
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <span style={{ fontSize: '2rem' }}>
            {getWeatherIcon(weatherData.current.conditions)}
          </span>
          <Typography variant="body1">
            {weatherData.current.conditions}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Details:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Humidity: ${weatherData.current.humidity}%`} size="small" />
            <Chip label={`Wind: ${weatherData.current.windSpeed} m/s`} size="small" />
            <Chip label={new Date(weatherData.timestamp).toLocaleTimeString()} size="small" />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Forecast:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, overflow: 'auto', pb: 1 }}>
          {weatherData.forecast.slice(0, 5).map((day, index) => (
            <Box key={index} sx={{ minWidth: '80px', textAlign: 'center' }}>
              <Typography variant="caption" display="block">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {day.tempMax}°
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {day.tempMin}°
              </Typography>
              <span style={{ fontSize: '1.2rem' }}>
                {getWeatherIcon(day.conditions)}
              </span>
            </Box>
          ))}
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onDetailsClick}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default WeatherCard;