import React, { useState } from 'react';
import Select from 'react-select/async';

const AstroBotVedari = () => {
  const [name, setName] = useState('');
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState(null);
  const [vedariResponse, setVedariResponse] = useState('');
  const [showTextKundali, setShowTextKundali] = useState(false);

  const vedastroKey = process.env.REACT_APP_VEDASTRO_API_KEY;
  const openaiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const ninjaKey = process.env.REACT_APP_NINJA_API_KEY;
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const fetchLocationOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${inputValue}`, {
      headers: { 'X-Api-Key': ninjaKey }
    });
    const data = await response.json();
    return data.map(loc => ({
      label: `${loc.name}, ${loc.country}`,
      value: { lat: loc.latitude, lon: loc.longitude, name: loc.name }
    }));
  };

  const buildTimeUrl = () => {
    const [hour, minute] = time.split(':');
    return `Time/${hour}:${minute}/${day}/${month}/${year}/+05:30`;
  };

  const handleAskVedari = async () => {
    if (!location) return;
    const loc = `Location/${location.value.name}`;
    const timeUrl = buildTimeUrl();

    const planetUrl = `${apiUrl}/api/Calculate/AllPlanetData/PlanetName/All/${loc}/${timeUrl}/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;
    const houseUrl = `${apiUrl}/api/Calculate/AllHouseData/HouseName/All/${loc}/${timeUrl}/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;
    const predictionsUrl = `${apiUrl}/api/Calculate/HoroscopePredictions/${loc}/${timeUrl}/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;


    let result = 'Vedari Says:';
    try {
      const [planetRes, houseRes, predRes] = await Promise.all([
        fetch(planetUrl),
        fetch(houseUrl),
        fetch(predictionsUrl)
      ]);

      const planetData = await planetRes.json();
      const houseData = await houseRes.json();
      const predictionData = await predRes.json();

      result += `\n- 🖐️ Planet Data: ${planetData.Status === 'Pass' ? '✅ Loaded' : '❌ Failed'}`;
      result += `\n- 🏠 House Data: ${houseData.Status === 'Pass' ? '✅ Loaded' : '❌ Failed'}`;

      if (predictionData.Status === 'Pass') {
        result += `\n📜 Predictions:`;
        predictionData.Payload.forEach(pred => {
          result += `\n • ${pred.Name} → ${pred.Description}`;
        });
      } else {
        result += '\nGPT Commentary failed.';
      }

    } catch (err) {
      result += '\nSomething went wrong. Try again.';
    }
    setVedariResponse(result);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div>
        <input placeholder="Name" onChange={e => setName(e.target.value)} />
        Day: <select value={day} onChange={e => setDay(e.target.value)}>{Array.from({ length: 31 }, (_, i) => <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select>
        Month: <select value={month} onChange={e => setMonth(e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select>
        Year: <select value={year} onChange={e => setYear(e.target.value)}>{Array.from({ length: 100 }, (_, i) => <option key={1980 + i}>{1980 + i}</option>)}</select>
        <input placeholder="12:00" value={time} onChange={e => setTime(e.target.value)} />
        <Select cacheOptions loadOptions={fetchLocationOptions} defaultOptions onChange={setLocation} placeholder="Rajkot, IN" />
        <button onClick={handleAskVedari}>Ask Vedari</button>
        <button onClick={() => setShowTextKundali(true)}>Show Text Kundali</button>
        <button onClick={() => setShowTextKundali(false)}>Hide Text Kundali</button>
      </div>
      <pre>
        {vedariResponse}
        {showTextKundali && vedariResponse.includes('Predictions') ? '\n\n[Text Kundali here in future version]' : ''}
      </pre>
    </div>
  );
};

export default AstroBotVedari;