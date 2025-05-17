import React, { useState } from "react";
import AsyncSelect from "react-select/async";

export default function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState("");
  const [showKundali, setShowKundali] = useState(false);

  const handleAskVedari = async () => {
    if (!location || !location.label) {
      alert("Please select a city from suggestions.");
      return;
    }

    try {
      const [hour, minute] = time.split(":");
      const timezoneOffset = "+05:30"; // You can adjust this based on real data later
      const dateFormatted = `${hour}:${minute}/${day}/${month}/${year}/${timezoneOffset}`;
      const encodedLocation = encodeURIComponent(location.label.split(",")[0]);
      const ayanamsa = "LAHIRI";
      const apiKey = "BPbzv8zDmX";

      const apiUrl = `https://api.vedastro.org/api/Calculate/AllPlanetData/PlanetName/All/Location/${encodedLocation}/Time/${dateFormatted}/Ayanamsa/${ayanamsa}/APIKey/${apiKey}`;

      const response = await fetch(apiUrl);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("ChartJSON error:", err);
      setResult("Chart fetch failed.");
    }
  };

  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await fetch(
      `https://api.api-ninjas.com/v1/city?name=${inputValue}`,
      {
        headers: { "X-Api-Key": "wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m" },
      }
    );
    const data = await response.json();
    return data.map((city) => ({
      label: `${city.name}, ${city.country}`,
      value: city,
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        Day:
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {[...Array(31)].map((_, i) => (
            <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
          ))}
        </select>
        Month:
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
          ))}
        </select>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {[...Array(100)].map((_, i) => (
            <option key={i} value={1980 + i}>
              {1980 + i}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="HH:MM"
        />
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions
          onChange={setLocation}
          placeholder="Search City"
        />
      </div>
      <button onClick={handleAskVedari}>Ask Vedari</button>
      <button onClick={() => setShowKundali(!showKundali)}>
        {showKundali ? "Hide Text Kundali" : "Show Text Kundali"}
      </button>
      {showKundali && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>
          Vedari Says:
          {"\n" + result}
        </pre>
      )}
    </div>
  );
}
