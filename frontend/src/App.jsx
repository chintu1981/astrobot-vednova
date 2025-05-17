import React, { useState, useEffect } from 'react';

function App() {
  const [name, setName] = useState('');
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const NINJA_API_KEY = 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m';

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setLocation(query);
    if (query.length < 3) return;
    try {
      const res = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${query}`, {
        headers: { 'X-Api-Key': NINJA_API_KEY },
      });
      const data = await res.json();
      setLocationSuggestions(data);
    } catch (err) {
      console.error('Location fetch error:', err);
    }
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setLocation(`${loc.name}, ${loc.country}`);
    setLocationSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      alert('Please select a city from suggestions.');
      return;
    }
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${time}:00`;
    const { latitude, longitude } = selectedLocation;

    const payload = {
      name,
      birthDate: dateStr,
      birthTime: timeStr,
      latitude,
      longitude,
    };

    try {
      const res = await fetch('https://api.vedastro.org/api/ChartJSON', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.Status === 'Fail') throw new Error(data.Payload);
      setResult(data.Payload);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div className="App">
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
          {[...Array(31).keys()].map((d) => (
            <option key={d + 1} value={String(d + 1).padStart(2, '0')}>
              {d + 1}
            </option>
          ))}
        </select>
        Month:
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {[...Array(12).keys()].map((m) => (
            <option key={m + 1} value={String(m + 1).padStart(2, '0')}>
              {m + 1}
            </option>
          ))}
        </select>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {Array.from({ length: 100 }, (_, i) => 2025 - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="HH:MM" />
        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          placeholder="City"
          list="suggestions"
        />
        <datalist id="suggestions">
          {locationSuggestions.map((loc, i) => (
            <option
              key={i}
              value={`${loc.name}, ${loc.country}`}
              onClick={() => handleSelectLocation(loc)}
            />
          ))}
        </datalist>
        <button onClick={handleSubmit}>Ask Vedari</button>
      </div>

      <hr />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div>
          <h2>Vedari Says:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
