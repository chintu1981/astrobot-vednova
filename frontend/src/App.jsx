import React, { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [birthTime, setBirthTime] = useState("12:00");
  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const timezone = "+05:30";
  const [response, setResponse] = useState(null);
  const [showTextKundali, setShowTextKundali] = useState(false);

  useEffect(() => {
    fetch("https://api.vedastro.org/api/LocationList")
      .then((res) => res.json())
      .then((data) => {
        const locs = data.Payload?.map((loc) => loc.Name).sort();
        setLocationList(locs || []);
      });
  }, []);

  const handleSubmit = async () => {
    if (!selectedLocation) return alert("Please select a valid location from the list");
    const [hour, minute] = birthTime.split(":");
    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`;
    const formattedDate = `${year}-${month}-${day}`;
    const apiKey = "BPbzv8zDmX";
    const encodedLocation = encodeURIComponent(selectedLocation);

    const chartJsonURL = `https://api.vedastro.org/api/Calculate/ChartJSON/Location/${encodedLocation}/Time/${formattedTime}/${formattedDate}/${timezone}/Ayanamsa/LAHIRI/APIKey/${apiKey}`;

    console.log("📅 Sending to VedAstro:", { encodedLocation, formattedTime, formattedDate, timezone });

    try {
      const res = await fetch(chartJsonURL);
      const data = await res.json();
      console.log("🧠 VedAstro ChartJSON:", data);

      if (!data.Payload || !data.Payload.PlanetList) {
        setResponse({ error: "VedAstro ChartJSON returned no data. Try another location." });
        return;
      }

      setResponse({ planetList: data.Payload.PlanetList });
    } catch (err) {
      console.error("❌ Error fetching ChartJSON:", err);
      setResponse({ error: "Failed to load data from VedAstro." });
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>

      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
      <input placeholder="HH:MM" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />

      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
        style={{ marginLeft: 10 }}>
        <option value="">-- Select Location --</option>
        {locationList.map((loc, idx) => (
          <option key={idx} value={loc}>{loc}</option>
        ))}
      </select>

      <button onClick={handleSubmit}>Ask Vedari</button>
      <button onClick={() => setShowTextKundali(!showTextKundali)} style={{ marginLeft: 10 }}>
        {showTextKundali ? "Hide" : "Show"} Text Kundali
      </button>

      <hr />
      <h2>Vedari Says:</h2>
      {response?.error && <div style={{ color: "red" }}>{response.error}</div>}

      {showTextKundali && Array.isArray(response?.planetList) && response.planetList.length > 0 && (
        <div>
          <h3>
            <span role="img" aria-label="Planetary Positions">🌌</span> Planetary Positions (ChartJSON)
          </h3>
          <ul>
            {response.planetList.map((planet, idx) => (
              <li key={idx}>
                <strong>{planet.PlanetName}</strong>: House: {planet.House} | Rashi: {planet.Sign} | Degree: {planet.Longitude?.Degree || "-"}°
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
