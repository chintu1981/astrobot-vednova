import React, { useState } from 'react';
import Select from 'react-select/async';

const AstroBotVedari = () => {
  const [name, setName] = useState('');
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState(null);
  const [vedariText, setVedariText] = useState('');
  const [showText, setShowText] = useState(false);

  const fetchLocationSuggestions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${inputValue}`, {
      headers: { 'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m' }
    });
    const data = await response.json();
    return data.map(city => ({
      label: `${city.name}, ${city.country}`,
      value: { lat: city.latitude, lon: city.longitude, name: city.name }
    }));
  };

  const handleAskVedari = async () => {
    if (!location) {
      alert("Please select a city from suggestions.");
      return;
    }

    const fullDate = `${year}-${month}-${day}`;
    const formattedTime = `${time}:00`;
    const offset = "+05:30"; // You may calculate this dynamically later
    const dateTime = `${formattedTime}/${day}/${month}/${year}/${offset}`;
    const base = `Location/${location.value.name}/Time/${dateTime}/Ayanamsa/LAHIRI/APIKey/BPbzv8zDmX`;

    try {
      const responses = await Promise.all([
        fetch(`https://api.vedastro.org/api/Calculate/AllPlanetData/PlanetName/All/${base}`),
        fetch(`https://api.vedastro.org/api/Calculate/AllHouseData/HouseName/All/${base}`),
        fetch(`https://api.vedastro.org/api/Calculate/HoroscopePredictions/${base}`),
        fetch(`https://api.vedastro.org/api/Calculate/SouthIndianChart/${base}/ChartType/BhavaChalit`)
      ]);

      const allJson = await Promise.all(responses.map(res => res.json()));
      const combined = {
        planetData: allJson[0],
        houseData: allJson[1],
        predictions: allJson[2],
        chartSVG: allJson[3]
      };

      setVedariText(JSON.stringify(combined, null, 2));
    } catch (err) {
      console.error("ChartJSON error:", err);
      setVedariText(JSON.stringify({ error: "Chart fetch failed." }, null, 2));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1><span role="img" aria-label="yogi">🧘</span> AstroBot Vedari</h1>

      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      Day: <select value={day} onChange={e => setDay(e.target.value)}>{Array.from({ length: 31 }, (_, i) => <option key={i+1}>{String(i+1).padStart(2, '0')}</option>)}</select>
      Month: <select value={month} onChange={e => setMonth(e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i+1}>{String(i+1).padStart(2, '0')}</option>)}</select>
      Year: <select value={year} onChange={e => setYear(e.target.value)}>{Array.from({ length: 100 }, (_, i) => <option key={i}>{1980 + i}</option>)}</select>
      <input placeholder="HH:MM" value={time} onChange={e => setTime(e.target.value)} />
      <div style={{ width: '300px', display: 'inline-block', marginLeft: '10px' }}>
        <Select
          cacheOptions
          loadOptions={fetchLocationSuggestions}
          onChange={setLocation}
          placeholder="Type City..."
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={handleAskVedari}>Ask Vedari</button>
        <button onClick={() => setShowText(true)}>Show Text Kundali</button>
        <button onClick={() => setShowText(false)}>Hide Text Kundali</button>
      </div>

      {showText && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>Vedari Says: {'\n'}{vedariText}</pre>
      )}
    </div>
  );
};

export default AstroBotVedari;
