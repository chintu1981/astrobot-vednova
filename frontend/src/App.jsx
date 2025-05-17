import React, { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [birthTime, setBirthTime] = useState("12:00");
  const [location, setLocation] = useState("Rajkot, Gujarat");
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    const [hour, minute] = birthTime.split(":");
    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`;
    const formattedDate = `${year}-${month}-${day}`;
    const apiKey = "BPbzv8zDmX";

    const encodedLocation = encodeURIComponent(location);

    const chartURL = `https://api.vedastro.org/api/Calculate/NorthIndianChart/Location/${encodedLocation}/Time/${formattedTime}/${formattedDate}/+05:30/ChartType/BhavaChalit/Ayanamsa/LAHIRI/APIKey/${apiKey}`;
    const planetDataURL = `https://api.vedastro.org/api/Calculate/AllPlanetData/PlanetName/All/Location/${encodedLocation}/Time/${formattedTime}/${formattedDate}/+05:30/Ayanamsa/LAHIRI/APIKey/${apiKey}`;
    const predictionURL = `https://api.vedastro.org/api/Calculate/HoroscopePredictions/Location/${encodedLocation}/Time/${formattedTime}/${formattedDate}/+05:30/Ayanamsa/LAHIRI/APIKey/${apiKey}`;

    try {
      const [planetRes, predictionRes] = await Promise.all([
        fetch(planetDataURL),
        fetch(predictionURL),
      ]);
      const planetJson = await planetRes.json();
      const predictionJson = await predictionRes.json();

      setResponse({
        chartURL,
        planetData: planetJson.Payload?.AllPlanetData,
        predictions: predictionJson.Payload,
      });
    } catch (err) {
      setResponse({ error: "Error fetching data" });
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>

      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      Day:
      <select value={day} onChange={(e) => setDay(e.target.value)}>
        {[...Array(31)].map((_, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>
            {String(i + 1).padStart(2, "0")}
          </option>
        ))}
      </select>
      Month:
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {[...Array(12)].map((_, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>
            {String(i + 1).padStart(2, "0")}
          </option>
        ))}
      </select>
      Year:
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        {[...Array(100)].map((_, i) => {
          const y = 1980 + i;
          return (
            <option key={y} value={y}>
              {y}
            </option>
          );
        })}
      </select>
      <input
        placeholder="HH:MM"
        value={birthTime}
        onChange={(e) => setBirthTime(e.target.value)}
      />
      <input
        placeholder="City, Country"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button onClick={handleSubmit}>Ask Vedari</button>

      <hr />
      <h2>Vedari Says:</h2>
      {response?.error && <div>{response.error}</div>}
      {response?.chartURL && (
        <div>
          <h3>
           <span role="img" aria-label="North Indian Chart">🧭</span> North Indian Chart
          </h3>
          <img src={response.chartURL} alt="North Indian Chart" style={{ border: "1px solid gray" }} />
        </div>
      )}

      {response?.planetData && (
        <div>
          <h3>
            <span role="img" aria-label="Planetary Positions">🌌</span> Planetary Positions
          </h3>
          <ul>
            {response.planetData.map((planet, idx) => {
              const [name, data] = Object.entries(planet)[0];
              return (
                <li key={idx}>
                  <strong>{name}</strong>: House {data.HousePlanetOccupiesBasedOnLongitudes} | Benefic: {data.IsPlanetBenefic}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {response?.predictions && (
        <div>
          <h3>
            <span role="img" aria-label="Horoscope Predictions">📜</span> Horoscope Predictions
          </h3>
          <ul>
            {response.predictions.map((item, idx) => (
              <li key={idx}>{item.PredictionText}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
