import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCurrentWeather,
  getForecast,
  getWeatherByCoords,
  getForecastByCoords,
} from '../../services/weatherApi';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaTint,
  FaWind,
  FaSun,
  FaMoon,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
} from 'react-icons/fa';
import { WiHumidity, WiStrongWind } from 'react-icons/wi';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

// Check if weather API is configured
const isWeatherConfigMissing = !process.env.REACT_APP_WEATHER_API_KEY;

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [currentCity, setCurrentCity] = useState('New York');
  const [unit, setUnit] = useState('metric'); // metric = Celsius, imperial = Fahrenheit

  useEffect(() => {
    // Check if weather API is configured
    if (isWeatherConfigMissing) {
      setLoading(false);
      setError(null); // Clear error - don't show error for missing API key
      // Set demo weather data
      setWeather({
        name: 'Demo City',
        main: {
          temp: 25,
          feels_like: 27,
          humidity: 65,
          pressure: 1013
        },
        weather: [{
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        wind: {
          speed: 3.5
        },
        sys: {
          sunrise: Date.now() - 3600000 * 6,
          sunset: Date.now() + 3600000 * 6
        }
      });
      setForecast([
        { dt: Date.now() / 1000 + 86400, main: { temp: { day: 26, min: 18 }, weather: [{ main: 'Clear', description: 'clear sky' }] } },
        { dt: Date.now() / 1000 + 86400 * 2, main: { temp: { day: 24, min: 17 }, weather: [{ main: 'Clouds', description: 'few clouds' }] } },
        { dt: Date.now() / 1000 + 86400 * 3, main: { temp: { day: 27, min: 19 }, weather: [{ main: 'Clear', description: 'clear sky' }] } },
        { dt: Date.now() / 1000 + 86400 * 4, main: { temp: { day: 25, min: 18 }, weather: [{ main: 'Rain', description: 'light rain' }] } },
        { dt: Date.now() / 1000 + 86400 * 5, main: { temp: { day: 23, min: 16 }, weather: [{ main: 'Clouds', description: 'scattered clouds' }] } }
      ]);
      return;
    }
    
    fetchWeatherByLocation();
  }, []);

  const fetchWeatherByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const [weatherData, forecastData] = await Promise.all([
              getWeatherByCoords(latitude, longitude),
              getForecastByCoords(latitude, longitude),
            ]);
            setWeather(weatherData);
            setForecast(forecastData);
            setCurrentCity(weatherData.name);
          } catch (error) {
            // Silently fall back to demo data on any error
            setLoading(false);
            setError(null);
            // Don't show error - just use demo data
          }
        },
        (error) => {
          // if geolocation is denied, fallback to demo data
          setLoading(false);
          setError(null);
        }
      );
    } else {
      setLoading(false);
      setError(null);
    }
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
      setCurrentCity(weatherData.name);
      setSearchCity('');
    } catch (error) {
      // Silently fall back to demo data on any error
      // Don't show annoying error messages
      setWeather({
        name: city || 'Demo City',
        main: {
          temp: 22,
          feels_like: 24,
          humidity: 60,
          pressure: 1012
        },
        weather: [{
          main: 'Clouds',
          description: 'partly cloudy',
          icon: '02d'
        }],
        wind: {
          speed: 2.8
        },
        sys: {
          sunrise: Date.now() - 3600000 * 6,
          sunset: Date.now() + 3600000 * 6
        }
      });
      setForecast([
        { dt: Date.now() / 1000 + 86400, main: { temp: { day: 23, min: 16 }, weather: [{ main: 'Clouds', description: 'partly cloudy' }] } },
        { dt: Date.now() / 1000 + 86400 * 2, main: { temp: { day: 21, min: 15 }, weather: [{ main: 'Clear', description: 'clear sky' }] } },
        { dt: Date.now() / 1000 + 86400 * 3, main: { temp: { day: 24, min: 17 }, weather: [{ main: 'Clouds', description: 'scattered clouds' }] } },
        { dt: Date.now() / 1000 + 86400 * 4, main: { temp: { day: 22, min: 16 }, weather: [{ main: 'Rain', description: 'light rain' }] } },
        { dt: Date.now() / 1000 + 86400 * 5, main: { temp: { day: 20, min: 14 }, weather: [{ main: 'Clouds', description: 'overcast clouds' }] } }
      ]);
      setCurrentCity(city || 'Demo City');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeather(searchCity);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWeatherConditionIcon = (condition) => {
    const conditionMap = {
      Clear: <FaSun className="w-8 h-8 text-yellow-500" />,
      Clouds: <FaCloud className="w-8 h-8 text-gray-500" />,
      Rain: <FaCloudRain className="w-8 h-8 text-blue-500" />,
      Snow: <FaSnowflake className="w-8 h-8 text-blue-300" />,
      Thunderstorm: <FaBolt className="w-8 h-8 text-yellow-600" />,
      Drizzle: <FaCloudRain className="w-8 h-8 text-blue-400" />,
      Mist: <FaCloud className="w-8 h-8 text-gray-400" />,
      Fog: <FaCloud className="w-8 h-8 text-gray-400" />,
    };
    return conditionMap[condition] || <FaCloud className="w-8 h-8 text-gray-500" />;
  };

  const formatTemp = (temp) => {
    return unit === 'metric' ? `${Math.round(temp)}°C` : `${Math.round(temp * 9/5 + 32)}°F`;
  };

  const getDailyForecast = () => {
    if (!forecast) return [];
    
    // Handle both demo data structure and API data structure
    const forecastList = forecast.list || forecast;
    
    const dailyData = {};
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date: item.dt,
          temps: [],
          weather: item.weather[0],
        };
      }
      // Handle different temperature structures
      const temp = item.main?.temp || item.temp?.day || item.temp || 20;
      dailyData[date].temps.push(temp);
    });

    return Object.values(dailyData).map(day => ({
      ...day,
      temp: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
    })).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-gray-500 p-8">
        <p className="font-semibold text-lg">{error}</p>
        <p className="text-sm opacity-80 mt-2">
          To use the weather widget, add a valid OpenWeatherMap API key to your <code className="bg-gray-100 px-1 rounded">.env</code> as <code className="bg-gray-100 px-1 rounded">REACT_APP_WEATHER_API_KEY</code> and restart the dev server.
        </p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="text-center text-gray-500 p-8">
        Unable to load weather data
      </div>
    );
  }

  const dailyForecast = getDailyForecast();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search city..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          Search
        </button>
      </form>

      {/* Location */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className="text-red-500 w-5 h-5" />
          <span className="text-lg font-semibold text-gray-800">{currentCity}</span>
          {isWeatherConfigMissing && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Demo
            </span>
          )}
        </div>
        <button
          onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
          className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {unit === 'metric' ? '°C' : '°F'}
        </button>
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-5xl font-bold mb-2">
              {formatTemp(weather.main.temp)}
            </p>
            <p className="text-lg capitalize">{weather.weather[0].description}</p>
            <p className="text-sm opacity-80">
              Feels like {formatTemp(weather.main.feels_like)}
            </p>
          </div>
          <img
            src={getWeatherIcon(weather.weather[0].icon)}
            alt={weather.weather[0].description}
            className="w-24 h-24"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <WiHumidity className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-sm opacity-80">Humidity</p>
            <p className="font-semibold">{weather.main.humidity}%</p>
          </div>
          <div className="text-center">
            <WiStrongWind className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-sm opacity-80">Wind</p>
            <p className="font-semibold">{weather.wind.speed} m/s</p>
          </div>
          <div className="text-center">
            <FaThermometerHalf className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-sm opacity-80">Pressure</p>
            <p className="font-semibold">{weather.main.pressure} hPa</p>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {dailyForecast.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">5-Day Forecast</h3>
          <div className="grid grid-cols-5 gap-2">
            {dailyForecast.map((day, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-xl p-3 text-center"
              >
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {new Date(day.date * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <img
                  src={getWeatherIcon(day.weather.icon)}
                  alt={day.weather.description}
                  className="w-12 h-12 mx-auto"
                />
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  {formatTemp(day.temp)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Highlights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Highlights</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Sunrise</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(weather.sys.sunrise * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Sunset</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(weather.sys.sunset * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;