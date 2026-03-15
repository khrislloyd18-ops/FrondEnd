// Weather API Service using OpenWeatherMap API
const API_KEY = (process.env.REACT_APP_WEATHER_API_KEY || '').trim();
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const ensureApiKey = () => {
  if (!API_KEY || API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
    throw new Error('Missing OpenWeather API key. Set REACT_APP_WEATHER_API_KEY in .env and restart the dev server.');
  }
};

export const weatherService = {
  // Get current weather by city name
  getCurrentWeather: async (city) => {
    try {
      ensureApiKey();

      const response = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Weather API Response:', response.status, errorText);
        throw new Error(`Weather API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
        timestamp: new Date(data.dt * 1000)
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },

  // Get comprehensive weather data using One Call API
  getComprehensiveWeather: async (lat, lon) => {
    try {
      ensureApiKey();

      // Use the free /weather endpoint by coordinates so this works on standard API plans.
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        location: data.name,
        country: data.sys?.country,
        latitude: lat,
        longitude: lon,
        current: {
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          visibility: data.visibility / 1000,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          sunrise: new Date(data.sys.sunrise * 1000),
          sunset: new Date(data.sys.sunset * 1000),
          uvIndex: null
        },
        minutely: [],
        hourly: [],
        alerts: []
      };
    } catch (error) {
      console.error('Error fetching comprehensive weather:', error);
      throw error;
    }
  },

  // Get weather forecast by city name
  getForecast: async (city) => {
    try {
      ensureApiKey();

      const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process forecast data to get daily forecasts
      const dailyForecasts = [];
      const processedDates = new Set();
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!processedDates.has(dateKey)) {
          processedDates.add(dateKey);
          dailyForecasts.push({
            date: date,
            tempMin: Math.round(item.main.temp_min),
            tempMax: Math.round(item.main.temp_max),
            tempAvg: Math.round(item.main.temp),
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon
          });
        }
      });
      
      return dailyForecasts.slice(0, 5); // Return 5-day forecast
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },

  // Get weather by coordinates (lat, lon)
  getWeatherByCoords: async (lat, lon) => {
    try {
      ensureApiKey();

      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
        timestamp: new Date(data.dt * 1000)
      };
    } catch (error) {
      console.error('Error fetching weather by coords:', error);
      throw error;
    }
  },

  // Get UV index data
  getUVIndex: async (lat, lon) => {
    try {
      ensureApiKey();

      // OpenWeather free tier does not provide a standalone UV endpoint.
      return {
        uvIndex: null,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching UV index:', error);
      throw error;
    }
  },

  // Get air pollution data
  getAirPollution: async (lat, lon) => {
    try {
      ensureApiKey();

      const response = await fetch(
        `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Air pollution API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        aqi: data.list[0].main.aqi,
        components: data.list[0].components,
        timestamp: new Date(data.list[0].dt * 1000)
      };
    } catch (error) {
      console.error('Error fetching air pollution:', error);
      throw error;
    }
  },

  // Helper function to get weather icon URL
  getIconUrl: (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },

  // Helper function to get wind direction
  getWindDirection: (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  },

  // Helper function to get UV index description
  getUVIndexDescription: (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'green' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'yellow' };
    if (uvIndex <= 7) return { level: 'High', color: 'orange' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'red' };
    return { level: 'Extreme', color: 'purple' };
  },

  // Helper function to get AQI description
  getAQIDescription: (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: 'green' };
    if (aqi <= 100) return { level: 'Moderate', color: 'yellow' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'orange' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'red' };
    return { level: 'Very Unhealthy', color: 'purple' };
  }
};
