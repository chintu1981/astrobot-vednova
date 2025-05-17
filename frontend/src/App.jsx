import React, { useState } from 'react';

const App = () => {
  const [name, setName] = useState('');
  const [day, setDay] = useState('01');
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState('2000');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthPlace, setBirthPlace] = useState('Paris');
  const [result, setResult] = useState('');

  const apiKey = 'BPbzv8zDmX';
  const ayanamsa = 'LAHIRI';

  const handleSubmit = async () => {
    try {
      const [hour, minute] = birthTime.split(':');
      const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      const url = `https://api.vedastro.org/api/Calculate/AllPlanetData/PlanetName/All/Location/${birthPlace}/Time/${formattedTime}/${formattedDate}/+05:30/Ayanamsa/${ayanamsa}/APIKey/${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Fetch error:', error);
      setResult('Error parsing response');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      Day:
      <select value={day} onChange={e => setDay(e.target.value)}>
        {[...Array(31)].map((_, i) => (
          <option key={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
        ))}
      </select>
      Month:
      <select value={month} onChange={e => setMonth(e.target.value)}>
        {[...Array(12)].map((_, i) => (
          <option key={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
        ))}
      </select>
      Year:
      <select value={year} onChange={e => setYear(e.target.value)}>
        {Array.from({ length: 100 }, (_, i) => 2025 - i).map(y => (
          <option key={y}>{y}</option>
        ))}
      </select>
      <input type="text" value={birthTime} onChange={e => setBirthTime(e.target.value)} placeholder="HH:MM" />
      <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="City" />
      <button onClick={handleSubmit}>Ask Vedari</button>
      <hr />
      <h3>Vedari Says:</h3>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
    </div>
  );
};

export default App;
