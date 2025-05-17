import React, { useState } from 'react';
import Select from 'react-select/async';

function App() {
  const [name, setName] = useState('');
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState(null);
  const [chartData, setChartData] = useState('');

  const fetchCityOptions = async (inputValue) => {
    if (!inputValue) return [];

    const response = await fetch(`https://api.api-ninjas.com/v1/city?name=${inputValue}`, {
      headers: {
        'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m'
      }
    });
    const data = await response.json();

    return data.map(city => ({
      label: `${city.name}, ${city.country}`,
      value: city.name,
      lat: city.latitude,
      lon: city.longitude,
      timezone: city.timezone
    }));
  };

  const handleChartRequest = async () => {
    if (!location) {
      alert("Please select a city from suggestions.");
      return;
    }

    const date = `${year}-${month}-${day}`;
    const timezone = location.timezone || "+05:30";

    const requestBody = {
      birthTime: {
        date: date,
        time: time,
        timezone: timezone
      },
      location: {
        latitude: location.lat,
        longitude: location.lon,
        name: location.label
      }
    };

    try {
      const response = await fetch("https://api.vedastro.org/api/ChartJSON", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log("VedAstro ChartJSON:", data);
      setChartData(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("ChartJSON error:", err);
      setChartData('"Chart fetch failed."');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      Day: <select value={day} onChange={e => setDay(e.target.value)}>{[...Array(31).keys()].map(i => <option key={i+1}>{(i+1).toString().padStart(2, '0')}</option>)}</select>
      Month: <select value={month} onChange={e => setMonth(e.target.value)}>{[...Array(12).keys()].map(i => <option key={i+1}>{(i+1).toString().padStart(2, '0')}</option>)}</select>
      Year: <select value={year} onChange={e => setYear(e.target.value)}>{[...Array(100).keys()].map(i => <option key={i}>{(2025 - i).toString()}</option>)}</select>
      <input value={time} onChange={e => setTime(e.target.value)} style={{ width: '70px' }} />
      <Select
        cacheOptions
        loadOptions={fetchCityOptions}
        defaultOptions
        placeholder="Select a location"
        onChange={setLocation}
        value={location}
      />
      <button onClick={handleChartRequest}>Ask Vedari</button>
      <button onClick={() => setChartData('')}>Hide Text Kundali</button>
      <hr />
      <h2>Vedari Says:</h2>
      <pre>{chartData}</pre>
    </div>
  );
}

export default App;
