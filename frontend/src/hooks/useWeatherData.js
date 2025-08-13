// src/hooks/useWeatherData.js
import { useCallback } from 'react';
import { useApiData } from './useApiData';
import ApiService from '../services/ApiService';

export const useWeatherData = (city) => {
  const apiCall = useCallback(() => {
    if (!city) return Promise.resolve({ data: null });
    return ApiService.getWeather(city);
  }, [city]);
  
  return useApiData(apiCall, [city], { 
    cacheTime: 600000, // 10 minutes cache for weather
    enabled: !!city 
  });
};

// Weather utility functions
export const getWeatherIcon = (condition) => {
  const icons = {
    'Clear': '☀️',
    'Sunny': '☀️',
    'Partly Cloudy': '⛅',
    'Cloudy': '☁️',
    'Overcast': '☁️',
    'Rain': '🌧️',
    'Light Rain': '🌦️',
    'Heavy Rain': '🌧️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Fog': '🌫️',
    'Mist': '🌫️',
    'Drizzle': '🌦️'
  };
  
  return icons[condition] || '🌤️';
};

export const getWeatherAdvice = (weather) => {
  if (!weather) return null;
  
  const { temp, humidity, condition, windSpeed } = weather;
  
  if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('thunder')) {
    return {
      type: 'warning',
      message: 'Rain expected - match may be affected',
      icon: '⚠️'
    };
  }
  
  if (temp > 35) {
    return {
      type: 'info',
      message: 'Hot conditions - hydration important',
      icon: '🌡️'
    };
  }
  
  if (windSpeed > 20) {
    return {
      type: 'info',
      message: 'Windy conditions - may affect bowling',
      icon: '💨'
    };
  }
  
  if (humidity > 80) {
    return {
      type: 'info',
      message: 'High humidity - ball may swing',
      icon: '💧'
    };
  }
  
  return {
    type: 'success',
    message: 'Good conditions for cricket',
    icon: '✅'
  };
};