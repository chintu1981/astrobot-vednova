import React, { useState } from 'react';

const App = () => {
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState('Rajkot, IN');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const apiKey = 'BPbzv8zDmX';

  const buildUrl = (type, location, dateTime) => {
    const encodedLocation = location.replace(/, /g, '-').replace(/ /g, '-');
    return `https://api.vedastro.org/api/Calculate/${type}/Location/${encodedLocation}/Time/${dateTime}/Ayanamsa/LAHIRI/APIKey/${apiKey}`;
  };

  const callApi = async (type, location, dateTime, retries = 3) => {
    const url = buildUrl(type, location, dateTime);
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.Status === 'Pass') return json;
      } catch (err) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return { Status: 'Fail' };
  };

  const formatDateTime = () => {
    const [hr, min] = time.split(':');
    return `${hr}:${min}/${day}/${month}/${year}/+05:30`; // India offset assumed
  };

  const handleClick = async () => {
    setLoading(true);
    setResponse('Vedari is thinking...');
    const dateTime = formatDateTime();

    const planetData = await callApi('AllPlanetData/PlanetName/All', location, dateTime);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const houseData = await callApi('AllHouseData/HouseName/All', location, dateTime);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const predictionData = await callApi('HoroscopePredictions', location, dateTime);

    const formatted = [
      `Vedari Says:`,
      `- 🖐️ Planet Data: ${planetData.Status === 'Pass' ? '✅ Loaded' : '❌ Failed to fetch'}`,
      `- 🏠 House Data: ${houseData.Status === 'Pass' ? '✅ Loaded' : '❌ Failed to fetch'}`,
      `- 📜 Predictions:`,
    ];

    if (predictionData.Status === 'Pass') {
      predictionData.Payload.slice(0, 5).forEach(p => {
        formatted.push(`  • ${p.Name} → ${p.Description}`);
      });
    } else {
      formatted.push(`  ❌ Failed to fetch`);
    }

    setResponse(formatted.join('\n'));
    setLoading(false);
  };

  return (
    <div>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input placeholder="Name" />
      Day:
      <select value={day} onChange={e => setDay(e.target.value)}>
        {[...Array(31)].map((_, i) => <option key={i}>{String(i + 1).padStart(2, '0')}</option>)}
      </select>
      Month:
      <select value={month} onChange={e => setMonth(e.target.value)}>
        {[...Array(12)].map((_, i) => <option key={i}>{String(i + 1).padStart(2, '0')}</option>)}
      </select>
      Year:
      <select value={year} onChange={e => setYear(e.target.value)}>
        {Array.from({ length: 100 }, (_, i) => 2025 - i).map(y => <option key={y}>{y}</option>)}
      </select>
      <input value={time} onChange={e => setTime(e.target.value)} />
      <input value={location} onChange={e => setLocation(e.target.value)} />
      <button onClick={handleClick}>Ask Vedari</button>
      <button onClick={() => setResponse(prev => JSON.stringify(prev, null, 2))}>Show Text Kundali</button>
      <button onClick={() => setResponse('')}>Hide Text Kundali</button>
      <pre>{loading ? 'Loading...' : response}</pre>
    </div>
  );
};

export default App;
