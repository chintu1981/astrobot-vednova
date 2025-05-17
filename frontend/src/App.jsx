import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/async";

const App = () => {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [time, setTime] = useState("12:00");
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [vedastroResponse, setVedastroResponse] = useState(null);
  const [chartError, setChartError] = useState(null);

  const loadLocations = async (inputValue, callback) => {
    if (!inputValue) return callback([]);
    try {
      const response = await axios.get("https://api.api-ninjas.com/v1/geocoding", {
        headers: { 'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m' },
        params: { city: inputValue, country: "IN" },
      });
      const formatted = response.data.map((loc) => ({
        label: `${loc.name}, ${loc.country}`,
        value: loc,
      }));
      callback(formatted);
    } catch (err) {
      console.error("Location fetch error:", err);
      callback([]);
    }
  };

  const handleAskVedari = async () => {
    if (!selectedLocation || !selectedLocation.value) {
      alert("Please select a city from suggestions.");
      return;
    }

    const { latitude, longitude } = selectedLocation.value;
    const formattedLat = parseFloat(latitude).toFixed(4);
    const formattedLon = parseFloat(longitude).toFixed(4);
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${time}:00`;

    const url = `https://api.vedastro.org/ChartJSON/${formattedLat}/${formattedLon}/${formattedDate}/${formattedTime}`;

    try {
      const response = await axios.get(url);
      setVedastroResponse(response.data);
      setChartError(null);
    } catch (err) {
      console.error("ChartJSON error:", err);
      setChartError(err);
      setVedastroResponse({ Status: "Fail", Payload: "Could not fetch chart data." });
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 5 }}
        />
        Day:
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {[...Array(31)].map((_, i) => (
            <option key={i + 1}>{(i + 1).toString().padStart(2, "0")}</option>
          ))}
        </select>
        Month:
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1}>{(i + 1).toString().padStart(2, "0")}</option>
          ))}
        </select>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {Array.from({ length: 100 }, (_, i) => 2025 - i).map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="HH:MM"
          style={{ marginLeft: 5, width: "80px" }}
        />
        <AsyncSelect
          cacheOptions
          loadOptions={loadLocations}
          onInputChange={(value) => setLocationInput(value)}
          onChange={(opt) => setSelectedLocation(opt)}
          placeholder="Search City..."
          styles={{ container: (base) => ({ ...base, width: 220, display: "inline-block", marginLeft: 10 }) }}
        />
        <button onClick={handleAskVedari} style={{ marginLeft: 10 }}>Ask Vedari</button>
      </div>

      <hr />

      <h2>Vedari Says:</h2>
      <pre style={{ fontFamily: "monospace" }}>
        {vedastroResponse ? JSON.stringify(vedastroResponse, null, 2) : ""}
      </pre>
    </div>
  );
};

export default App;