import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSun, 
  FaCloud, 
  FaCloudRain, 
  FaSnowflake,
  FaWind,
  FaTint,
  FaEye,
  FaCompass
} from 'react-icons/fa';
import axios from 'axios';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Using OpenWeatherMap API (you'll need to sign up for a free API key)
      // For demo, using mock data
      const mockWeather = {
        city: 'Manila',
        country: 'PH',
        temperature: 28,
        feelsLike: 30,
        description: 'sunny',
        humidity: 65,
        windSpeed: 10,
        windDirection: 'NE',
        visibility: 10,
        pressure: 1012,
        uvIndex: 8
      };
      
      setWeather(mockWeather);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch weather');
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <FaSun />;
    
    switch(weather.description.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <FaSun />;
      case 'cloudy':
      case 'partly cloudy':
        return <FaCloud />;
      case 'rainy':
      case 'rain':
        return <FaCloudRain />;
      case 'snowy':
      case 'snow':
        return <FaSnowflake />;
      default:
        return <FaSun />;
    }
  };

  if (loading) {
    return (
      <div className="weather-widget" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="loading-spinner" style={{ width: '30px', height: '30px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget" style={{ textAlign: 'center', padding: '30px' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="weather-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="weather-header">
        <div>
          <div className="weather-city">{weather.city}, {weather.country}</div>
          <div className="weather-temp">{weather.temperature}°C</div>
          <div className="weather-desc">{weather.description}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '5px' }}>
            Feels like {weather.feelsLike}°C
          </div>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '4rem' }}
        >
          {getWeatherIcon()}
        </motion.div>
      </div>

      <div className="weather-details">
        <div className="weather-detail-item">
          <FaTint />
          <div className="weather-detail-label">Humidity</div>
          <div className="weather-detail-value">{weather.humidity}%</div>
        </div>
        <div className="weather-detail-item">
          <FaWind />
          <div className="weather-detail-label">Wind</div>
          <div className="weather-detail-value">{weather.windSpeed} km/h</div>
        </div>
        <div className="weather-detail-item">
          <FaCompass />
          <div className="weather-detail-label">Direction</div>
          <div className="weather-detail-value">{weather.windDirection}</div>
        </div>
        <div className="weather-detail-item">
          <FaEye />
          <div className="weather-detail-label">Visibility</div>
          <div className="weather-detail-value">{weather.visibility} km</div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;