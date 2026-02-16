/**
 * Instagram Influencer Profiles Module
 * Fetch and display Instagram business account profiles via Meta Graph API
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Verified as VerifiedIcon,
  Instagram as InstagramIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const InstagramInfluencerProfiles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [cached, setCached] = useState(false);
  const [cacheAge, setCacheAge] = useState(null);

  // Check if Instagram Graph API is configured
  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      setCheckingConfig(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/influencers/instagram/config/status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIsConfigured(response.data.configured);
      
      if (!response.data.configured) {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Config check error:', err);
      setError('Failed to check Instagram Graph API configuration');
    } finally {
      setCheckingConfig(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter an Instagram username');
      return;
    }

    await fetchProfile();
  };

  const fetchProfile = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setProfile(null);
      setCached(false);

      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/influencers/instagram/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            username: searchQuery.trim().replace('@', '') // Remove @ if user includes it
          }
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
        setCached(response.data.cached);
        setCacheAge(response.data.cacheAge);
        
        if (response.data.cached) {
          setSuccess(`Profile loaded from cache (${formatCacheAge(response.data.cacheAge)} old)`);
        } else {
          setSuccess('Profile fetched successfully from Instagram Graph API');
        }
      }

    } catch (err) {
      console.error('Fetch error:', err);
      
      const errorData = err.response?.data;
      
      if (errorData?.code === 'SERVICE_NOT_CONFIGURED') {
        setError('Instagram Graph API not configured. Please contact administrator.');
        setIsConfigured(false);
      } else if (errorData?.code === 'TOKEN_EXPIRED') {
        setError('Access token expired. Please contact administrator to update token.');
      } else if (errorData?.code === 'MISSING_PERMISSIONS') {
        setError('Missing required permissions. Please contact administrator.');
      } else if (errorData?.code === 'PROFILE_NOT_FOUND') {
        setError('Instagram account not found or not accessible. Make sure it\'s a Business Account.');
      } else {
        setError(errorData?.message || 'Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCacheAge = (ageMs) => {
    if (!ageMs) return 'unknown';
    
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (checkingConfig) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <InstagramIcon sx={{ fontSize: 40, color: '#E4405F' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Instagram Influencer Profiles
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Fetch Instagram Business Account profiles using Meta Graph API
        </Typography>
      </Box>

      {/* Configuration Status Alert */}
      {!isConfigured && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            Instagram Graph API Not Configured
          </Typography>
          <Typography variant="body2">
            Please configure META_PAGE_ID and META_PAGE_ACCESS_TOKEN in the backend .env file.
          </Typography>
        </Alert>
      )}

      {/* Search Box */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Box display="flex" gap={2} alignItems="flex-start">
            <TextField
              fullWidth
              label="Instagram Username"
              placeholder="Enter username (without @)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!isConfigured || loading}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <Typography variant="body1" sx={{ mr: 0.5, color: 'text.secondary' }}>
                    @
                  </Typography>
                )
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isConfigured || loading || !searchQuery.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 120, height: 56 }}
            >
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </Box>
        </form>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Note: Currently supports fetching the connected Instagram Business Account only.
        </Typography>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Profile Card */}
      {profile && (
        <Card elevation={4} sx={{ mb: 4, overflow: 'visible' }}>
          {/* Loading indicator for cached data */}
          {cached && (
            <LinearProgress 
              sx={{ 
                height: 3, 
                backgroundColor: 'rgba(228, 64, 95, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#E4405F'
                }
              }} 
            />
          )}

          <CardContent sx={{ p: 4 }}>
            {/* Profile Header */}
            <Box display="flex" alignItems="flex-start" gap={3} mb={3}>
              {/* Profile Picture */}
              <Avatar
                src={profile.profilePictureUrl}
                alt={profile.username}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: 3
                }}
              />

              {/* Profile Info */}
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h5" fontWeight="bold">
                    @{profile.username}
                  </Typography>
                  
                  {/* Verified Badge */}
                  <Tooltip title="Verified by Meta Graph API">
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Verified"
                      color="primary"
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#E4405F',
                        color: 'white'
                      }}
                    />
                  </Tooltip>

                  {/* Cached Badge */}
                  {cached && (
                    <Chip
                      label={`Cached ${formatCacheAge(cacheAge)}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {profile.name && (
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {profile.name}
                  </Typography>
                )}

                {/* Action Buttons */}
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<InstagramIcon />}
                    href={profile.profileUrl}
                    target="_blank"
                    sx={{
                      backgroundColor: '#E4405F',
                      '&:hover': {
                        backgroundColor: '#C13584'
                      }
                    }}
                  >
                    View on Instagram
                  </Button>

                  <Tooltip title="Refresh profile data">
                    <IconButton
                      onClick={() => fetchProfile(true)}
                      disabled={loading}
                      color="primary"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Statistics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <GroupIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {formatNumber(profile.followersCount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Followers
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <GroupIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {formatNumber(profile.followsCount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Following
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <PhotoLibraryIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="secondary">
                    {formatNumber(profile.mediaCount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Biography */}
            {profile.biography && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Biography
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {profile.biography}
                </Typography>
              </Box>
            )}

            {/* Website */}
            {profile.website && (
              <Box display="flex" alignItems="center" gap={1}>
                <LinkIcon sx={{ color: 'primary.main' }} />
                <Typography
                  component="a"
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {profile.website}
                </Typography>
                <OpenInNewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
            )}

            {/* Metadata */}
            <Box mt={3} pt={2} borderTop={1} borderColor="divider">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Instagram ID: {profile.instagramId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} textAlign={{ sm: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated: {new Date(profile.lastFetchedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!profile && !loading && (
        <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
          <InstagramIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Profile Loaded
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter an Instagram username above and click Search to fetch profile data
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default InstagramInfluencerProfiles;
