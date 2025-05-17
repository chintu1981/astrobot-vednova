import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [time, setTime] = useState("12:00");
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [response, setResponse] = useState(null);
  const [showText, setShowText] = useState(false);

  const geoDBApiKey = "c692960917msh69316d06d1e0408p182b0ejsne1e40ea437ab"; // <-- Add your RapidAPI key here
  const ninjaApiKey = "wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m";

  // Autocomplete for cities using GeoDB
  useEffect(() => {
    const fetchCities = async () => {
      if (cityQuery.length < 3) return;
      try {
        const res = await axios.get(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities`,
          {
            params: { namePrefix: cityQuery },
            headers: {
              "X-RapidAPI-Key": geoDBApiKey,
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
          }
        );
        setCities(res.data.data);
      } catch (error) {
        console.error("GeoDB fetch error:", error);
      }
    };

    const delayDebounce = setTimeout(fetchCities, 500);
    return () => clearTimeout(delayDebounce);
  }, [cityQuery]);

  const fetchTimezone = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.api-ninjas.com/v1/timezone?lat=${lat}&lon=${lon}`,
        {
          headers: { "X-Api-Key": ninjaApiKey },
        }
      );
      return res.data.utc_offset;
    } catch (error) {
      console.error("Timezone fetch error:", error);
      return null;
    }
  };

  const handleAskVedari = async () => {
    if (!selectedCity) {
      alert("Please select a city from suggestions.");
      return;
    }

    const { name: cityName, latitude, longitude, country } = selectedCity;
    const locationName = `${cityName}, ${country}`;
    const timezoneOffset = await fetchTimezone(latitude, longitude);

    if (!timezoneOffset) {
      alert("Failed to get timezone. Try another city.");
      return;
    }

    const location = {
      Name: locationName,
      GeoLat: latitude,
      GeoLong: longitude,
      TimeZone: timezoneOffset,
    };

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = time + ":00";

    const payload = {
      name,
      location,
      formattedDate,
      formattedTime,
    };

    console.log("Sending to VedAstro:", payload);

    try {
      const res = await axios.post(
        `https://api.vedastro.org/api/ChartJSON`,
        payload
      );
      console.log("VedAstro ChartJSON:", res.data);
      setResponse(res.data);
    } catch (error) {
      console.error("VedAstro Error:", error);
      setResponse({ Status: "Fail", Payload: "Error contacting VedAstro API" });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        Day:
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
          ))}
        </select>
        Month:
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
          ))}
        </select>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {Array.from({ length: 100 }, (_, i) => (
            <option key={i}>{1980 + i}</option>
          ))}
        </select>
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="12:00"
        />
        <input
          list="city-list"
          placeholder="Start typing city..."
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
        />
        <datalist id="city-list">
          {cities.map((city) => (
            <option
              key={city.id}
              value={`${city.name}, ${city.country}`}
              onClick={() => setSelectedCity(city)}
            />
          ))}
        </datalist>
        <button onClick={handleAskVedari}>Ask Vedari</button>
        <button onClick={() => setShowText(!showText)}>
          {showText ? "Hide Text Kundali" : "Show Text Kundali"}
        </button>
      </div>

      <hr />
      <h2>Vedari Says:</h2>
      {response && showText && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(response.Payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
