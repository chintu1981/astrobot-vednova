// App.jsx
import React, { useState } from 'react';
import Select from 'react-select/async';

const VEDASTRO_API_KEY = 'BPbzv8zDmX';
const AYANAMSA = 'LAHIRI';
const TIMEZONE = '+05:30'; // Adjust based on user's timezone

const AstroBotVedari = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState({ day: '05', month: '06', year: '1981' });
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [rawJson, setRawJson] = useState(null);

  const loadLocations = async (inputValue) => {
    const response = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${inputValue}`, {
      headers: { 'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m' },
    });
    const data = await response.json();
    return data.map((item) => ({
      label: `${item.name}, ${item.country}`,
      value: { lat: item.latitude, lon: item.longitude, name: item.name },
    }));
  };

  const buildVedastroURL = (type, params = '') => {
    return `https://api.vedastro.org/api/Calculate/${type}/Location/${location?.value?.name || 'Rajkot'}/Time/${time}:00/${date.day}/${date.month}/${date.year}/${TIMEZONE}/Ayanamsa/${AYANAMSA}/APIKey/${VEDASTRO_API_KEY}${params}`;
  };

  const handleAskVedari = async () => {
    if (!location) return alert('Please select a city from suggestions.');
    const urls = [
      buildVedastroURL('HoroscopePredictions'),
      buildVedastroURL('DasaAtRange', `/Location/${location.value.name}/Time/00:00/01/01/${date.year}/+05:30/Location/${location.value.name}/Time/00:00/01/01/${parseInt(date.year) + 10}/+05:30/Levels/3/PrecisionHours/100`),
      buildVedastroURL('AllHouseData/HouseName/All')
    ];

    try {
      const [pred, dasa, house] = await Promise.all(urls.map(url => fetch(url).then(res => res.json())));
      const mergedResult = {
        Horoscope: pred?.Payload,
        Dasha: dasa?.Payload,
        HouseData: house?.Payload
      };
      setResult(mergedResult);
    } catch (err) {
      console.error('ChartJSON error:', err);
      setResult({ error: 'Chart fetch failed.' });
    }
  };

  const handleShowText = async () => {
    if (!location) return alert('Please select a city from suggestions.');
    const url = buildVedastroURL('AllPlanetData/PlanetName/All');
    const response = await fetch(url);
    const data = await response.json();
    setRawJson(data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>
          <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        Day:
        <select value={date.day} onChange={(e) => setDate({ ...date, day: e.target.value })}>
          {[...Array(31)].map((_, i) => (
            <option key={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
          ))}
        </select>
        Month:
        <select value={date.month} onChange={(e) => setDate({ ...date, month: e.target.value })}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
          ))}
        </select>
        Year:
        <select value={date.year} onChange={(e) => setDate({ ...date, year: e.target.value })}>
          {[...Array(100)].map((_, i) => (
            <option key={i}>{1980 + i}</option>
          ))}
        </select>
        <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="HH:MM" />
        <Select cacheOptions loadOptions={loadLocations} onChange={setLocation} placeholder="Select Location" />
      </div>
      <button onClick={handleAskVedari}>Ask Vedari</button>
      <button onClick={handleShowText}>Show Text Kundali</button>
      <button onClick={() => setRawJson(null)}>Hide Text Kundali</button>

      <h2>Vedari Says:</h2>
      <pre>{JSON.stringify(result || rawJson, null, 2)}</pre>
    </div>
  );
};

export default AstroBotVedari;
