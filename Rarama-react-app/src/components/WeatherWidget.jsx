import React, { useState, useEffect } from 'react';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake } from 'react-icons/fa';

const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    city: 'Manila',
    temperature: 28,
    description: 'sunny',
    humidity: 65,
    windSpeed: 10
  });
  const [loading, setLoading] = useState(false);

  // Mock weather data - will be replaced with actual API
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setWeather({
        city: 'Manila',
        temperature: 28,
        description: 'sunny',
        humidity: 65,
        windSpeed: 10
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = () => {
    switch(weather.description.toLowerCase()) {
      case 'sunny':
        return <FaSun size={40} />;
      case 'cloudy':
        return <FaCloud size={40} />;
      case 'rainy':
        return <FaCloudRain size={40} />;
      case 'snowy':
        return <FaSnowflake size={40} />;
      default:
        return <FaSun size={40} />;
    }
  };

  return (
    <div className="weather-widget">
      <div className="weather-header">
        <div>
          <div className="weather-city">{weather.city}</div>
          <div className="weather-temp">{weather.temperature}°C</div>
          <div className="weather-desc">{weather.description}</div>
        </div>
        <div>
          {getWeatherIcon()}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
        <div>Humidity: {weather.humidity}%</div>
        <div>Wind: {weather.windSpeed} km/h</div>
      </div>
    </div>
  );
};

export default WeatherWidget;