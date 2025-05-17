
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [time, setTime] = useState("12:00");
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [result, setResult] = useState("");

  const ninjaApiKey = "wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m";

  useEffect(() => {
    if (cityInput.length > 2) {
      axios
        .get("https://api.api-ninjas.com/v1/geocoding?city=" + cityInput, {
          headers: { "X-Api-Key": ninjaApiKey },
        })
        .then((res) => {
          setSuggestions(res.data);
        })
        .catch((err) => console.error(err));
    }
  }, [cityInput]);

  const handleAskVedari = async () => {
    if (!selectedCity) {
      alert("Please select a city from suggestions.");
      return;
    }

    const [hour, minute] = time.split(":");
    const payload = {
      name,
      location: {
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
      },
      datetime: {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
      },
    };

    console.log("Sending to VedAstro:", payload);
    try {
      const response = await axios.post(
        "https://api.vedastro.org/api/ChartJSON",
        payload
      );
      console.log("VedAstro ChartJSON:", response.data);
      if (response.data.Status === "Pass") {
        setResult(JSON.stringify(response.data.Payload, null, 2));
      } else {
        setResult("VedAstro returned no data. Try a nearby major city.");
      }
    } catch (err) {
      console.error("API error:", err);
      setResult("Something went wrong fetching the chart.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
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
        {Array.from({ length: 100 }, (_, i) => 2025 - i).map((y) => (
          <option key={y}>{y}</option>
        ))}
      </select>
      <input
        type="text"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="HH:MM"
      />
      <input
        type="text"
        value={cityInput}
        onChange={(e) => {
          setCityInput(e.target.value);
          setSelectedCity(null);
        }}
        placeholder="Start typing city..."
        list="city-suggestions"
      />
      <datalist id="city-suggestions">
        {suggestions.map((city, idx) => (
          <option
            key={idx}
            value={`${city.name}, ${city.country}`}
            onClick={() => setSelectedCity(city)}
          />
        ))}
      </datalist>
      <button onClick={handleAskVedari}>Ask Vedari</button>
      <hr />
      <h2>Vedari Says:</h2>
      <pre>{result}</pre>
    </div>
  );
}

export default App;
