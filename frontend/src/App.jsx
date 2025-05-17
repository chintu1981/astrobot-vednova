import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import tzlookup from "tz-lookup";

export default function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState(null);
  const [response, setResponse] = useState("");

  const loadOptions = async (inputValue, callback) => {
    if (!inputValue) return callback([]);
    try {
      const response = await fetch(`https://api.api-ninjas.com/v1/city?name=${inputValue}`, {
        headers: { 'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m' },
      });
      const data = await response.json();
      const options = data.map(city => ({
        label: `${city.name}, ${city.country}`,
        value: city,
      }));
      callback(options);
    } catch (error) {
      console.error("Location fetch error:", error);
      callback([]);
    }
  };

  const handleLocationChange = (selectedOption) => {
    setLocation(selectedOption.value);
  };

  const handleAskVedari = async () => {
    if (!location) {
      alert("Please select a city from suggestions.");
      return;
    }

    try {
      const latitude = location.latitude;
      const longitude = location.longitude;
      const timezone = tzlookup(latitude, longitude);

      const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const formattedTime = `${date}T${time}:00+05:30`; // hardcoded IST for now
      const locationString = `${latitude},${longitude}`;

      const chartUrl = `https://api.vedastro.org/ChartJSON/${formattedTime}/${locationString}`;

      const chartRes = await fetch(chartUrl);
      if (!chartRes.ok) throw new Error("Chart fetch failed.");
      const chartData = await chartRes.json();

      setResponse(JSON.stringify(chartData, null, 2));
    } catch (err) {
      console.error("ChartJSON error:", err.message);
      setResponse("Chart fetch failed.");
    }
  };

  return (
    <div>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        Day:
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {[...Array(31).keys()].map(d => <option key={d+1}>{String(d+1).padStart(2, '0')}</option>)}
        </select>
        Month:
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {[...Array(12).keys()].map(m => <option key={m+1}>{String(m+1).padStart(2, '0')}</option>)}
        </select>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {Array.from({ length: 100 }, (_, i) => 2024 - i).map(y => <option key={y}>{y}</option>)}
        </select>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={handleLocationChange}
          placeholder="Type city name..."
        />
        <button onClick={handleAskVedari}>Ask Vedari</button>
        <button onClick={() => setResponse("")}>Hide Text Kundali</button>
      </div>
      <hr />
      <div>
        <h2>Vedari Says:</h2>
        <pre>{response}</pre>
      </div>
    </div>
  );
}