import { useEffect, useMemo, useRef, useState } from "react";
import "./WeatherWidget.css";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const hasApiKey = Boolean((API_KEY || "").trim());
const BASE_URL = "https://api.openweathermap.org";
const ICON_URL = "https://openweathermap.org/img/wn";

function formatTemp(value) {
  return `${Math.round(value)}°C`;
}

function formatDate(dateText) {
  return new Date(dateText).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatPlaceLabel(place) {
  return [place.name, place.state, place.country].filter(Boolean).join(", ");
}

function getWeatherTheme(main = "", iconCode = "", isDaytime = true) {
  const value = main.toLowerCase();
  const iconGroup = typeof iconCode === "string" ? iconCode.slice(0, 2) : "";
  const time = isDaytime ? "day" : "night";

  if (iconGroup === "01") return `theme-clear-${time}`;
  if (iconGroup === "02") return `theme-partly-${time}`;
  if (iconGroup === "03" || iconGroup === "04") return `theme-clouds-${time}`;
  if (iconGroup === "09" || iconGroup === "10") return `theme-rain-${time}`;
  if (iconGroup === "11") return `theme-storm-${time}`;
  if (iconGroup === "13") return `theme-snow-${time}`;
  if (iconGroup === "50") return `theme-mist-${time}`;

  if (value.includes("clear")) return `theme-clear-${time}`;
  if (value.includes("few clouds")) return `theme-partly-${time}`;
  if (value.includes("cloud")) return `theme-clouds-${time}`;
  if (value.includes("rain") || value.includes("drizzle")) return `theme-rain-${time}`;
  if (value.includes("thunder")) return `theme-storm-${time}`;
  if (value.includes("snow")) return `theme-snow-${time}`;
  if (value.includes("mist") || value.includes("fog") || value.includes("haze")) return `theme-mist-${time}`;

  return `theme-default-${time}`;
}

function getWeatherVisual(main = "") {
  const value = main.toLowerCase();

  if (value.includes("clear")) return "☀️";
  if (value.includes("cloud")) return "☁️";
  if (value.includes("rain")) return "🌧️";
  if (value.includes("drizzle")) return "🌦️";
  if (value.includes("thunder")) return "⛈️";
  if (value.includes("snow")) return "❄️";
  if (value.includes("mist") || value.includes("fog") || value.includes("haze")) return "🌫️";

  return "🌍";
}

function summarizeForecast(list = []) {
  const grouped = {};

  for (const item of list) {
    const date = item.dt_txt.split(" ")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  }

  const today = new Date().toISOString().split("T")[0];

  return Object.entries(grouped)
    .filter(([date]) => date !== today)
    .slice(0, 5)
    .map(([date, entries]) => {
      const midday =
        entries.find((entry) => entry.dt_txt.includes("12:00:00")) ||
        entries[Math.floor(entries.length / 2)];

      const min = Math.min(...entries.map((entry) => entry.main.temp_min));
      const max = Math.max(...entries.map((entry) => entry.main.temp_max));

      return {
        date,
        label: formatDate(midday.dt_txt),
        icon: midday.weather?.[0]?.icon,
        description: midday.weather?.[0]?.description || "No data",
        main: midday.weather?.[0]?.main || "Weather",
        min,
        max,
      };
    });
}

function buildErrorMessage(status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check the city name.";
    case 401:
      return "Invalid API key. Please check your OpenWeather key.";
    case 404:
      return "Location not found.";
    case 429:
      return "Too many requests. Please wait and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Weather service is temporarily unavailable.";
    default:
      return "Something went wrong while fetching weather data.";
  }
}

async function safeFetch(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(buildErrorMessage(response.status));
  }

  return response.json();
}

const WeatherWidget = ({ city = "Manila" }) => {
  const [query, setQuery] = useState(city);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [locationLabel, setLocationLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRequestAt, setLastRequestAt] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [liveNow, setLiveNow] = useState(Date.now());

  const controllerRef = useRef(null);
  const suggestionControllerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const skipSuggestionFetchRef = useRef(false);

  const isDaytimeAtLocation = useMemo(() => {
    if (!current) return true;

    const nowSeconds = Math.floor(liveNow / 1000);
    const sunrise = Number(current?.sys?.sunrise);
    const sunset = Number(current?.sys?.sunset);

    if (Number.isFinite(sunrise) && Number.isFinite(sunset)) {
      return nowSeconds >= sunrise && nowSeconds < sunset;
    }

    const timezoneOffset = Number(current?.timezone);
    if (Number.isFinite(timezoneOffset)) {
      const localHour = new Date(liveNow + timezoneOffset * 1000).getUTCHours();
      return localHour >= 6 && localHour < 18;
    }

    return true;
  }, [current, liveNow]);

  const themeClass = useMemo(() => {
    const main = current?.weather?.[0]?.main || "";
    const iconCode = current?.weather?.[0]?.icon || "";
    return getWeatherTheme(main, iconCode, isDaytimeAtLocation);
  }, [current, isDaytimeAtLocation]);

  async function fetchCitySuggestions(keyword) {
    if (!hasApiKey) {
      setSuggestions([]);
      return;
    }

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length < 2) {
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (suggestionControllerRef.current) {
      suggestionControllerRef.current.abort();
    }

    const controller = new AbortController();
    suggestionControllerRef.current = controller;

    setIsSuggesting(true);
    try {
      const geoUrl =
        `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(trimmedKeyword)}&limit=7&appid=${API_KEY}`;

      const geoData = await safeFetch(geoUrl, controller.signal);
      if (!Array.isArray(geoData)) {
        setSuggestions([]);
        return;
      }

      const uniquePlaces = [];
      const seen = new Set();

      for (const place of geoData) {
        const label = formatPlaceLabel(place);
        const key = label.toLowerCase();
        if (!label || seen.has(key)) continue;
        seen.add(key);
        uniquePlaces.push(place);
      }

      setSuggestions(uniquePlaces);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } catch (err) {
      if (err.name === "AbortError") return;
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  }

  async function selectSuggestion(place) {
    const displayName = formatPlaceLabel(place);
    skipSuggestionFetchRef.current = true;
    setQuery(displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    await fetchByCoords(place.lat, place.lon, displayName, false);
  }

  async function fetchByCoords(lat, lon, displayName = "", syncInput = true) {
    if (!hasApiKey) {
      setError("Missing OpenWeather API key. Add REACT_APP_WEATHER_API_KEY in .env and restart the dev server.");
      setCurrent(null);
      setForecast([]);
      return;
    }

    const now = Date.now();

    // Simple client-side throttle to reduce duplicate calls
    if (lastRequestAt && now - lastRequestAt < 1500) {
      setError("Please wait a moment before trying again.");
      return;
    }

    setLastRequestAt(now);
    setLoading(true);
    setError("");

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const units = "metric";

      const currentUrl =
        `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

      const forecastUrl =
        `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

      const [currentData, forecastData] = await Promise.all([
        safeFetch(currentUrl, controller.signal),
        safeFetch(forecastUrl, controller.signal),
      ]);

      setCurrent(currentData);
      setForecast(summarizeForecast(forecastData.list || []));

      const fallbackName = [
        currentData.name,
        currentData.sys?.country,
      ].filter(Boolean).join(", ");

      setLocationLabel(displayName || fallbackName);
      if (syncInput) {
        const nextQuery = displayName || fallbackName || currentData.name;
        if (!nextQuery) return;
        skipSuggestionFetchRef.current = true;
        setQuery(nextQuery);
      }
    } catch (err) {
      if (err.name === "AbortError") return;

      setError(err.message || "Failed to fetch weather.");
      setCurrent(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchByCity(cityName) {
    if (!cityName.trim()) {
      setError("Please enter a city name.");
      return;
    }

    if (!hasApiKey) {
      setError("Missing OpenWeather API key. Add REACT_APP_WEATHER_API_KEY in .env and restart the dev server.");
      setCurrent(null);
      setForecast([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoUrl =
        `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;

      const geoData = await safeFetch(geoUrl);

      if (!Array.isArray(geoData) || geoData.length === 0) {
        throw new Error("City not found.");
      }

      const place = geoData[0];
      const displayName = [
        place.name,
        place.state,
        place.country,
      ].filter(Boolean).join(", ");

      skipSuggestionFetchRef.current = true;
      setQuery(displayName || place.name);
      await fetchByCoords(place.lat, place.lon, displayName, false);
    } catch (err) {
      setLoading(false);

      setError(err.message || "Failed to search city.");
      setCurrent(null);
      setForecast([]);
    }
  }

  function handleSearch(e) {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Please enter a city name.");
      return;
    }

    if (showSuggestions && suggestions.length > 0) {
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        selectSuggestion(suggestions[activeSuggestionIndex]);
        return;
      }

      const exactMatch = suggestions.find((place) => {
        const label = formatPlaceLabel(place).toLowerCase();
        return label === trimmedQuery.toLowerCase() || place.name.toLowerCase() === trimmedQuery.toLowerCase();
      });

      if (exactMatch) {
        selectSuggestion(exactMatch);
        return;
      }

      setError("Please choose a city from the suggestions list.");
      return;
    }

    fetchByCity(trimmedQuery);
  }

  function handleClearQuery() {
    setQuery("");
    setError("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  }

  function handleQueryChange(e) {
    setQuery(e.target.value);
    setError("");
    setShowSuggestions(true);
    setActiveSuggestionIndex(-1);
  }

  function handleInputKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setGeoLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchByCoords(latitude, longitude);
        setGeoLoading(false);
      },
      (geoError) => {
        setGeoLoading(false);

        switch (geoError.code) {
          case 1:
            setError("Location access was denied.");
            break;
          case 2:
            setError("Location information is unavailable.");
            break;
          case 3:
            setError("Location request timed out.");
            break;
          default:
            setError("Unable to retrieve your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!city) return;
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    setQuery(city);
    fetchByCity(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    if (skipSuggestionFetchRef.current) {
      skipSuggestionFetchRef.current = false;
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2 || !showSuggestions) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const debounceTimer = setTimeout(() => {
      fetchCitySuggestions(trimmedQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      if (suggestionControllerRef.current) {
        suggestionControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={`weather-widget ${themeClass}`}>
      <div className="overlay" />
      <div className="weather-shell">
        <header className="hero">
          <div>
            <p className="eyebrow">Real-Time Weather Dashboard</p>
            <h1>Weather API Integration</h1>
            <p className="subtext">
              Current conditions, 5-day forecast, city search, geolocation, and graceful error handling.
            </p>
          </div>

          <div className="hero-visual">
            {getWeatherVisual(current?.weather?.[0]?.main)}
          </div>
        </header>

        <section className="search-card glass">
          <div className="search-head">
            <p className="search-title">Search city or place</p>
            <p className="search-subtitle">Choose from suggestions for more accurate results.</p>
          </div>

          <form onSubmit={handleSearch} className="search-form" autoComplete="off">
            <div className="search-input-wrap" ref={searchBoxRef}>
              <input
                className="search-input"
                type="text"
                placeholder="Type city, province, or country"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="new-password"
              />

              {query.trim().length > 0 && (
                <button
                  type="button"
                  className="clear-query-btn"
                  onClick={handleClearQuery}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}

              {showSuggestions && query.trim().length >= 2 && (
                <ul className="suggestions-list" role="listbox" aria-label="City suggestions">
                  {isSuggesting && (
                    <li className="suggestion-item muted">Searching places...</li>
                  )}

                  {!isSuggesting && suggestions.length === 0 && (
                    <li className="suggestion-item muted">No matching city found</li>
                  )}

                  {!isSuggesting && suggestions.map((place, index) => {
                    const label = formatPlaceLabel(place);
                    const meta = [place.state, place.country].filter(Boolean).join(", ");

                    return (
                      <li key={`${label}-${place.lat}-${place.lon}`} className="suggestion-item">
                        <button
                          type="button"
                          className={`suggestion-btn ${index === activeSuggestionIndex ? "active" : ""}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSuggestion(place)}
                        >
                          <span className="suggestion-name">{place.name}</span>
                          {meta && <span className="suggestion-meta">{meta}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="search-actions">
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                className="secondary-btn location-btn"
                onClick={handleUseMyLocation}
                disabled={geoLoading || loading}
              >
                {geoLoading ? "Locating..." : "Use My Location"}
              </button>
            </div>
          </form>

          <p className="search-tip">Tip: use arrow keys to pick a suggestion, then press Enter.</p>

          {!hasApiKey && (
            <p className="warning">
              Missing weather API key. Set <code>REACT_APP_WEATHER_API_KEY</code> in <code>.env</code> and restart the dev server.
            </p>
          )}

          {error && <p className="error">{error}</p>}
        </section>

        {current && (
          <section className="current-grid">
            <div className="current-card glass">
              <div className="current-top">
                <div>
                  <p className="location">{locationLabel || current.name}</p>
                  <h2>{current.weather?.[0]?.main}</h2>
                  <p className="desc">{current.weather?.[0]?.description}</p>
                </div>

                {current.weather?.[0]?.icon && (
                  <img
                    src={`${ICON_URL}/${current.weather[0].icon}@2x.png`}
                    alt={current.weather?.[0]?.description || "Weather icon"}
                    className="weather-icon"
                  />
                )}
              </div>

              <div className="temp-row">
                <span className="big-temp">{formatTemp(current.main.temp)}</span>
                <span className="feels-like">
                  Feels like {formatTemp(current.main.feels_like)}
                </span>
              </div>
            </div>

            <div className="stats-card glass">
              <div className="stat">
                <span className="label">Humidity</span>
                <strong>{current.main.humidity}%</strong>
              </div>
              <div className="stat">
                <span className="label">Wind Speed</span>
                <strong>{current.wind.speed} m/s</strong>
              </div>
              <div className="stat">
                <span className="label">Min / Max</span>
                <strong>
                  {formatTemp(current.main.temp_min)} / {formatTemp(current.main.temp_max)}
                </strong>
              </div>
              <div className="stat">
                <span className="label">Pressure</span>
                <strong>{current.main.pressure} hPa</strong>
              </div>
            </div>
          </section>
        )}

        <section className="forecast-section">
          <div className="section-head">
            <h3>5-Day Forecast</h3>
            <p>Daily summary based on 3-hour forecast data</p>
          </div>

          <div className="forecast-grid">
            {forecast.map((day) => (
              <article key={day.date} className="forecast-card glass">
                <p className="forecast-date">{day.label}</p>

                {day.icon && (
                  <img
                    src={`${ICON_URL}/${day.icon}@2x.png`}
                    alt={day.description}
                    className="forecast-icon"
                  />
                )}

                <h4>{day.main}</h4>
                <p className="forecast-desc">{day.description}</p>
                <div className="forecast-temp">
                  <span>{formatTemp(day.max)}</span>
                  <small>{formatTemp(day.min)}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default WeatherWidget;
