import axios from 'axios';
import toast from 'react-hot-toast';

// CRA uses REACT_APP_ prefix for environment variables.
// Set REACT_APP_WEATHER_API_KEY in your .env file.
const WEATHER_API_URL = process.env.REACT_APP_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

export const isWeatherConfigMissing = !WEATHER_API_KEY;

const weatherApi = axios.create({
  baseURL: WEATHER_API_URL,
  params: {
    appid: WEATHER_API_KEY,
    units: 'metric',
  },
});

export const getCurrentWeather = async (city) => {
  try {
    const response = await weatherApi.get('/weather', {
      params: { q: city },
    });
    return response.data;
  } catch (error) {
    if (isWeatherConfigMissing) {
      toast.error('Weather API key is missing. Please add REACT_APP_WEATHER_API_KEY to your .env file.');
    } else if (error.response?.status === 404) {
      toast.error('City not found. Please check the city name.');
    } else if (error.response?.status === 429) {
      toast.error('Weather API rate limit reached. Please try again later.');
    } else {
      toast.error('Failed to fetch weather data.');
    }
    throw error;
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const response = await weatherApi.get('/weather', {
      params: { lat, lon },
    });
    return response.data;
  } catch (error) {
    if (isWeatherConfigMissing) {
      toast.error('Weather API key is missing. Please add REACT_APP_WEATHER_API_KEY to your .env file.');
    } else if (error.response?.status === 429) {
      toast.error('Weather API rate limit reached. Please try again later.');
    } else {
      toast.error('Failed to fetch weather data for your location.');
    }
    throw error;
  }
};

export const getForecast = async (city) => {
  try {
    const response = await weatherApi.get('/forecast', {
      params: { q: city, cnt: 40 },
    });
    return response.data;
  } catch (error) {
    if (isWeatherConfigMissing) {
      toast.error('Weather API key is missing. Please add REACT_APP_WEATHER_API_KEY to your .env file.');
    } else if (error.response?.status === 404) {
      toast.error('City not found. Please check the city name.');
    } else if (error.response?.status === 429) {
      toast.error('Weather API rate limit reached. Please try again later.');
    } else {
      toast.error('Failed to fetch forecast data.');
    }
    throw error;
  }
};

export const getForecastByCoords = async (lat, lon) => {
  try {
    const response = await weatherApi.get('/forecast', {
      params: { lat, lon, cnt: 40 },
    });
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch forecast data for your location.');
    throw error;
  }
};

export const getWeatherIcon = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export default weatherApi;