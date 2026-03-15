import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCloudSun, 
  FaTemperatureHigh, 
  FaWind, 
  FaTint, 
  FaEye, 
  FaCompressArrowsAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
  FaSmog,
  FaThermometerHalf,
  FaTachometerAlt,
  FaSpinner
} from 'react-icons/fa';
import WeatherWidget from './WeatherWidget';
import { weatherService } from '../../services/weatherService';
import toast from 'react-hot-toast';

const WeatherPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fallbackCity = 'Manila';

    const resolveInitialCity = () => {
      if (!navigator.geolocation) {
        if (isMounted) setSelectedCity(fallbackCity);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const localWeather = await weatherService.getWeatherByCoords(latitude, longitude);
            const detectedCity = localWeather?.location?.trim();

            if (isMounted) {
              setSelectedCity(detectedCity || fallbackCity);
            }
          } catch (locationError) {
            if (isMounted) {
              setSelectedCity(fallbackCity);
            }
          }
        },
        () => {
          if (isMounted) {
            setSelectedCity(fallbackCity);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    };

    resolveInitialCity();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch weather data when city changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!selectedCity) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const currentWeather = await weatherService.getCurrentWeather(selectedCity);
        
        setWeatherData(currentWeather);
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to load weather for ${selectedCity}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedCity]);

  // Get user location and fetch weather by coordinates
  const fetchLocationWeather = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const localWeather = await weatherService.getWeatherByCoords(latitude, longitude);
          setWeatherData(localWeather);

          if (localWeather?.location) {
            setSelectedCity(localWeather.location);
          }
          
          toast.success(`Weather data loaded for ${localWeather?.location || 'your location'}`);
        } catch (err) {
          setError(err.message);
          toast.error('Failed to load weather for your location');
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        
        switch (geoError.code) {
          case 1:
            setError('Location access was denied.');
            break;
          case 2:
            setError('Location information is unavailable.');
            break;
          case 3:
            setError('Location request timed out.');
            break;
          default:
            setError('Unable to retrieve your location.');
        }
        
        toast.error('Failed to get your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const cities = [
    'Manila', 'Tagum', 'Cebu', 'Davao', 'Baguio', 'Iloilo', 
    'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Parañaque'
  ];

  const weatherFeatures = [
    {
      icon: FaTemperatureHigh,
      title: 'Temperature',
      description: 'Current and feels-like temperature',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50',
      value: weatherData ? `${weatherData.feelsLike}°C` : '--°C'
    },
    {
      icon: FaWind,
      title: 'Wind Conditions',
      description: 'Wind speed and direction',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      value: weatherData ? `${weatherData.windSpeed} km/h` : '-- km/h'
    },
    {
      icon: FaTint,
      title: 'Humidity',
      description: 'Moisture in the air',
      color: 'from-teal-400 to-blue-500',
      bgColor: 'bg-teal-50',
      value: weatherData ? `${weatherData.humidity}%` : '--%'
    },
    {
      icon: FaCompressArrowsAlt,
      title: 'Pressure',
      description: 'Atmospheric pressure',
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-50',
      value: weatherData ? `${weatherData.pressure} hPa` : '-- hPa'
    },
    {
      icon: FaEye,
      title: 'Visibility',
      description: 'Distance you can see',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      value: weatherData ? `${weatherData.visibility} km` : '-- km'
    },
    {
      icon: FaSun,
      title: 'UV Index',
      description: 'Ultraviolet radiation level',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      value: '6' // Would need separate API call for real UV data
    }
  ];

  const weatherConditions = [
    { icon: FaSun, condition: 'Sunny', color: 'text-yellow-500' },
    { icon: FaCloud, condition: 'Cloudy', color: 'text-gray-500' },
    { icon: FaCloudRain, condition: 'Rainy', color: 'text-blue-500' },
    { icon: FaBolt, condition: 'Stormy', color: 'text-purple-500' },
    { icon: FaSmog, condition: 'Foggy', color: 'text-gray-400' },
    { icon: FaSnowflake, condition: 'Snowy', color: 'text-cyan-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Weather Station
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Real-time weather monitoring and forecasts
              </p>
            </div>
            <div className="mt-1 md:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="text-left sm:text-center">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaClock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentTime.toLocaleDateString()}
                  </span>
                </div>
              </div>
              {/* Location Weather Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchLocationWeather}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium shadow-lg inline-flex items-center justify-center gap-2"
                disabled={loading}
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                {loading ? 'Getting Location...' : 'Use My Location'}
              </motion.button>
            </div>
          </div>

          {/* City Selector */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-semibold text-gray-700">Select City:</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedCity === city
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaCloudRain className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold">Weather Data Error</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Location Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {loading ? (
                    <FaSpinner className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                  ) : (
                    <FaMapMarkerAlt className="w-6 h-6 sm:w-8 sm:h-8" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold break-words">
                    {loading ? 'Loading...' : (selectedCity || 'Detecting location...')}
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-base break-words">
                    {weatherData ? new Date(weatherData.timestamp).toLocaleDateString() : 'Current Location'}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '--°C' : weatherData ? `${weatherData.feelsLike}°C` : '--°C'}
                </div>
                <div className="text-blue-100 text-sm sm:text-base">
                  {loading ? 'Feels Like' : 'Feels Like'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Weather Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Weather Widget - Takes 2 columns on xl */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FaCloudSun className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Current Weather</h2>
                    <p className="text-blue-100 text-sm sm:text-base">Real-time weather information</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-6">
                <WeatherWidget 
                  city={selectedCity}
                />
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FaTachometerAlt className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Quick Stats</h2>
                    <p className="text-green-100 text-sm sm:text-base">Weather at a glance</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {weatherFeatures.slice(0, 4).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 ${feature.bgColor} rounded-xl`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-800 self-start sm:self-auto">
                      {feature.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weather Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaThermometerHalf className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Weather Features</h2>
                  <p className="text-purple-100 text-sm sm:text-base">Comprehensive weather information</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {weatherFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-4 sm:p-6 ${feature.bgColor} rounded-xl border-2 border-transparent hover:border-gray-200 transition-all duration-200`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {feature.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weather Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaCloudSun className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Weather Conditions</h2>
                  <p className="text-indigo-100 text-sm sm:text-base">Common weather patterns</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {weatherConditions.map((condition, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 flex items-center justify-center ${condition.color}`}>
                      <condition.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{condition.condition}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeatherPage;
