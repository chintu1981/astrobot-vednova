import React, { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [birthTime, setBirthTime] = useState("12:00");
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [timezone, setTimezone] = useState("+05:30");
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (citySearch.length > 2) {
        fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&namePrefix=${citySearch}`,
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": "demo-key", // Replace with your real key
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
          }
        )
          .then((res) => res.json())
          .then((data) => setCityResults(data.data || []))
          .catch(() => setCityResults([]));
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [citySearch]);

  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    setCitySearch(`${city.city}, ${city.country}`);
    setCityResults([]);

    // Fetch timezone from lat/lon
    try {
      const res = await fetch(
        `https://api.api-ninjas.com/v1/timezone?lat=${city.latitude}&lon=${city.longitude}`,
        {
          headers: {
            "X-Api-Key": "demo-key" // Replace with your real key
          },
        }
      );
      const data = await res.json();
      const offset = data.utc_offset;
      const sign = offset >= 0 ? "+" : "-";
      const hours = String(Math.floor(Math.abs(offset))).padStart(2, "0");
      const minutes = String((Math.abs(offset) * 60) % 60).padStart(2, "0");
      setTimezone(`${sign}${hours}:${minutes}`);
    } catch (e) {
      setTimezone("+00:00");
    }
  };

  const handleSubmit = async () => {
    if (!selectedCity) return alert("Please select a city from suggestions");
    const [hour, minute] = birthTime.split(":");
    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`;
    const formattedDate = `${year}-${month}-${day}`;
    const apiKey = "BPbzv8zDmX";
    const encodedLocation = encodeURIComponent(
      `${selectedCity.city}, ${selectedCity.country}`
    );

    const chartURL = `https://api.vedastro.org/api/Calculate/NorthIndianChart/Location/${encodedLocation}/Time/${formattedTime}/${formattedDate}/${timezone}/ChartType/BhavaChalit/Ayanamsa/LAHIRI/APIKey/${apiKey}`;
    const planetDataURL = `https://api.vedastro.org/api/Calculate/AllPlanetData/PlanetName/All/Location/${encodedLocation}/Time/${formattedTime}/${formattedDate}/${timezone}/Ayanamsa/LAHIRI/APIKey/${apiKey}`;
    const predictionURL = `https://api.vedastro.org/api/Calculate/HoroscopePredictions/Location/${encodedLocation}/Time/${formattedTime}/${formattedDate}/${timezone}/Ayanamsa/LAHIRI/APIKey/${apiKey}`;

    try {
      const [planetRes, predictionRes] = await Promise.all([
        fetch(planetDataURL),
        fetch(predictionURL),
      ]);
      const planetJson = await planetRes.json();
      const predictionJson = await predictionRes.json();

      setResponse({
        chartURL,
        planetData: planetJson.Payload?.AllPlanetData || [],
        predictions: predictionJson.Payload || [],
      });
    } catch (err) {
      setResponse({ error: "Error fetching data" });
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      Day:
      <select value={day} onChange={(e) => setDay(e.target.value)}>
        {[...Array(31)].map((_, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</option>
        ))}
      </select>
      Month:
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {[...Array(12)].map((_, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</option>
        ))}
      </select>
      Year:
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        {[...Array(100)].map((_, i) => {
          const y = 1980 + i;
          return <option key={y} value={y}>{y}</option>;
        })}
      </select>
      <input
        placeholder="HH:MM"
        value={birthTime}
        onChange={(e) => setBirthTime(e.target.value)}
      />

      <input
        placeholder="Enter city"
        value={citySearch}
        onChange={(e) => setCitySearch(e.target.value)}
      />
      <div>
        {cityResults.map((city, idx) => (
          <div
            key={idx}
            onClick={() => handleCitySelect(city)}
            style={{ cursor: "pointer", background: "#eee", marginTop: 2, padding: 4 }}>
            {city.city}, {city.country}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit}>Ask Vedari</button>

      <hr />
      <h2>Vedari Says:</h2>
      {response?.error && <div style={{ color: "red" }}>{response.error}</div>}

      {response?.chartURL && (
        <div>
          <h3>
            <span role="img" aria-label="North Indian Chart">🧭</span> North Indian Chart
          </h3>
          <img src={response.chartURL} alt="North Indian Chart" style={{ border: "1px solid gray", maxWidth: "90%" }} />
        </div>
      )}

      {Array.isArray(response?.planetData) && response.planetData.length > 0 && (
        <div>
          <h3>
            <span role="img" aria-label="Planetary Positions">🌌</span> Planetary Positions
          </h3>
          <ul>
            {response.planetData.map((planet, idx) => {
              const [name, data] = Object.entries(planet)[0];
              const house = data?.HousePlanetOccupies?.Name || "Unknown";
              const benefic = data?.IsPlanetBenefic ? "True" : "False";
              return (
                <li key={idx}>
                  <strong>{name}</strong>: {house} | Benefic: {benefic}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {Array.isArray(response?.predictions) && response.predictions.length > 0 && (
        <div>
          <h3>
            <span role="img" aria-label="Horoscope Predictions">📜</span> Horoscope Predictions
          </h3>
          <ul>
            {response.predictions.map((item, idx) => (
              <li key={idx}>{item?.PredictionText || "No prediction text"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
