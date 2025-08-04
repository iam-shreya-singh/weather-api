import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  DirectionsRun as ActivityIcon,
  Checkroom as ClothingIcon,
  Favorite as HealthIcon,
  Power as EnergyIcon,
} from '@mui/icons-material';
import weatherService from '../../services/weatherService';
import { RecommendationData } from '../../services/weatherService';

interface RecommendationCardProps {
  location: string;
  userId: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ location, userId }) => {
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await weatherService.getRecommendations(userId, location);
        setRecommendations(data);
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [location, userId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Personalized Recommendations
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Overall Score:
          </Typography>
          <Chip
            label={`${recommendations.overallScore}/100`}
            color={getScoreColor(recommendations.overallScore)}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Activities */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ActivityIcon color="primary" />
            <Typography variant="subtitle2">Activities</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recommendations.activities.map((activity, index) => (
              <Chip key={index} label={activity} variant="outlined" size="small" />
            ))}
          </Box>
        </Box>

        {/* Clothing */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ClothingIcon color="secondary" />
            <Typography variant="subtitle2">Clothing</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recommendations.clothing.map((item, index) => (
              <Chip key={index} label={item} variant="outlined" size="small" />
            ))}
          </Box>
        </Box>

        {/* Health */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <HealthIcon color="error" />
            <Typography variant="subtitle2">Health</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recommendations.health.map((item, index) => (
              <Chip key={index} label={item} variant="outlined" size="small" />
            ))}
          </Box>
        </Box>

        {/* Energy */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EnergyIcon color="info" />
            <Typography variant="subtitle2">Energy</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recommendations.energy.map((item, index) => (
              <Chip key={index} label={item} variant="outlined" size="small" />
            ))}
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Generated at {new Date(recommendations.generatedAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;