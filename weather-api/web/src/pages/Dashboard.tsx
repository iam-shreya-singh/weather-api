import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Thermostat as TempIcon,
  WaterDrop as HumidityIcon,
  Air as WindIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import weatherService from '../services/weatherService';
import SearchBar from '../components/ui/SearchBar';
import WeatherCard from '../components/ui/WeatherCard';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import { useWeather } from '../hooks/useWeather';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { weatherData, refetch } = useWeather(selectedLocation);

  const handleLocationSearch = async (location: string) => {
    setSelectedLocation(location);
    setLoading(true);
    setError(null);
    
    try {
      await refetch();
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLocation = (location: string) => {
    setSelectedLocation(location);
  };

  const quickLocations = [
    'London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Mumbai'
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Weather Intelligence Dashboard
      </Typography>
      
      <SearchBar
        onSearch={handleLocationSearch}
        loading={loading}
        placeholder="Search for a city..."
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quick Locations
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {quickLocations.map((location) => (
            <Chip
              key={location}
              label={location}
              onClick={() => handleQuickLocation(location)}
              clickable
              color={selectedLocation === location ? 'primary' : 'default'}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : weatherData ? (
        <Grid container spacing={3}>
          {/* Current Weather Card */}
          <Grid item xs={12} md={6} lg={4}>
            <WeatherCard
              weatherData={weatherData}
              onDetailsClick={() => navigate(`/weather/${selectedLocation}`)}
            />
          </Grid>

          {/* Weather Stats */}
          <Grid item xs={12} md={6} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Conditions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TempIcon color="error" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Temperature
                        </Typography>
                        <Typography variant="h6">
                          {weatherData.current.temp}°C
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HumidityIcon color="info" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Humidity
                        </Typography>
                        <Typography variant="h6">
                          {weatherData.current.humidity}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WindIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Wind Speed
                        </Typography>
                        <Typography variant="h6">
                          {weatherData.current.windSpeed} m/s
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="success" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="h6">
                          {weatherData.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <RecommendationCard
              location={selectedLocation}
              userId="user123" // In real app, get from auth
            />
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Enter a location to see weather data
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;