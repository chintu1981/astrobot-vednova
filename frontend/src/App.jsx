// Updated App.jsx with stable API handling, full Vedic data integration, and your live keys.

import React, { useState } from 'react';
import Select from 'react-select/async';
import tzLookup from 'tz-lookup';

const vedastroKey = 'BPbzv8zDmX';
const ninjaKey = 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m';

function App() {
  const [name, setName] = useState('');
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState(null);
  const [response, setResponse] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const loadOptions = async (inputValue, callback) => {
    if (!inputValue) return callback([]);
    try {
      const res = await fetch(`https://api.api-ninjas.com/v1/city?name=${inputValue}`, {
        headers: { 'X-Api-Key': ninjaKey },
      });
      const data = await res.json();
      const options = data.map(city => ({
        label: `${city.name}, ${city.country}`,
        value: {
          city: city.name,
          lat: city.latitude,
          lon: city.longitude,
          country: city.country
        },
      }));
      callback(options);
    } catch (err) {
      console.error('City search error:', err);
      callback([]);
    }
  };

  const getTimezoneOffset = (lat, lon) => {
    try {
      const tz = tzLookup(lat, lon);
      const now = new Date();
      const local = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      const diff = (now - local) / 3600000;
      const sign = diff >= 0 ? '+' : '-';
      const hours = String(Math.abs(Math.floor(diff))).padStart(2, '0');
      const minutes = String(Math.abs(diff % 1 * 60)).padStart(2, '0');
      return `${sign}${hours}:${minutes}`;
    } catch (e) {
      return '+00:00';
    }
  };

  const handleAskVedari = async () => {
    if (!location) return alert('Please select a city from suggestions.');

    const { lat, lon } = location.value;
    const tzOffset = getTimezoneOffset(lat, lon);
    const [hour, minute] = time.split(':');
    const formattedTime = `${hour}:${minute}`;
    const dateStr = `${formattedTime}/${day}/${month}/${year}/${tzOffset}`;
    const locStr = `${location.value.city}`;

    const planetURL = `https://api.vedastro.org/api/Calculate/AllPlanetData/PlanetName/All/Location/${locStr}/Time/${dateStr}/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;
    const houseURL = `https://api.vedastro.org/api/Calculate/AllHouseData/HouseName/All/Location/${locStr}/Time/${dateStr}/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;
    const predictURL = `https://api.vedastro.org/api/Calculate/HoroscopePredictions/Location/${locStr}/Time/${dateStr}/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;
    const chartURL = `https://api.vedastro.org/api/Calculate/SouthIndianChart/Location/${locStr}/Time/${dateStr}/ChartType/BhavaChalit/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;

    try {
      const [planet, house, predict, chart] = await Promise.all([
        fetch(planetURL),
        fetch(houseURL),
        fetch(predictURL),
        fetch(chartURL)
      ]);

      const data = {
        planetData: await planet.json(),
        houseData: await house.json(),
        predictions: await predict.json(),
        chartSVG: await chart.text(),
      };
      setResponse(data);
    } catch (err) {
      console.error('ChartJSON error:', err);
      setResponse({ error: 'Chart fetch failed.' });
    }
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      Day: <select value={day} onChange={e => setDay(e.target.value)}>{Array.from({ length: 31 }, (_, i) => <option key={i+1}>{String(i+1).padStart(2, '0')}</option>)}</select>
      Month: <select value={month} onChange={e => setMonth(e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i+1}>{String(i+1).padStart(2, '0')}</option>)}</select>
      Year: <select value={year} onChange={e => setYear(e.target.value)}>{Array.from({ length: 100 }, (_, i) => <option key={i} value={1980+i}>{1980+i}</option>)}</select>
      <input value={time} onChange={e => setTime(e.target.value)} placeholder="hh:mm" />
      <Select cacheOptions defaultOptions loadOptions={loadOptions} onChange={setLocation} placeholder="City" />
      <br/>
      <button onClick={handleAskVedari}>Ask Vedari</button>
      <button onClick={() => setShowRaw(true)}>Show Text Kundali</button>
      <button onClick={() => setShowRaw(false)}>Hide Text Kundali</button>
      <hr/>
      <h2>Vedari Says:</h2>
      <pre>{showRaw ? JSON.stringify(response, null, 2) : ''}</pre>
    </div>
  );
}

export default App;
