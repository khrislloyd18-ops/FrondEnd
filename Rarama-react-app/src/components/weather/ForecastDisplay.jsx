function ForecastDisplay({ forecast = [] }) {
  return (
    <div className="forecast-grid">
      {forecast.map((item) => (
        <div className="glass-card forecast-card" key={item.date}>
          <p className="forecast-date">
            {new Date(item.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>

          <div className="forecast-icon-wrap">
            <img
              src={item?.day?.condition?.icon}
              alt={item?.day?.condition?.text || "Weather icon"}
              className="forecast-icon"
            />
          </div>

          <h4 className="forecast-temp">
            {Math.round(item?.day?.maxtemp_c)}° / {Math.round(item?.day?.mintemp_c)}°
          </h4>

          <p className="forecast-text">{item?.day?.condition?.text}</p>
        </div>
      ))}
    </div>
  );
}

export default ForecastDisplay;