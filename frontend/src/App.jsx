import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [name, setName] = useState('');
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [chartResult, setChartResult] = useState(null);
  const [error, setError] = useState('');

  const ninjaKey = 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m';

  const handleLocationChange = async (e) => {
    const input = e.target.value;
    setLocationInput(input);
    setSelectedLocation(null);
    if (input.length < 3) return;

    try {
      const res = await axios.get(`https://api.api-ninjas.com/v1/city?name=${input}`, {
        headers: { 'X-Api-Key': ninjaKey }
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error('Error fetching city suggestions:', err);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (city) => {
    setSelectedLocation(city);
    setLocationInput(`${city.name}, ${city.country}`);
    setSuggestions([]);
  };

  const handleAskVedari = async () => {
    if (!selectedLocation) {
      alert('Please select a city from suggestions.');
      return;
    }

    const [hour, minute] = time.split(':');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    const encodedLocation = encodeURIComponent(locationInput);

    try {
      const chartUrl = `https://api.vedastro.org/ChartJSON/${formattedDate}/${formattedTime}/${selectedLocation.latitude}/${selectedLocation.longitude}`;
      const response = await axios.get(chartUrl);
      setChartResult(response.data);
    } catch (err) {
      console.error('ChartJSON error:', err);
      setChartResult({ Status: 'Fail', Payload: 'Could not fetch chart data.' });
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      Day:<select value={day} onChange={(e) => setDay(e.target.value)}>
        {[...Array(31).keys()].map(i => <option key={i+1}>{(i+1).toString().padStart(2, '0')}</option>)}
      </select>
      Month:<select value={month} onChange={(e) => setMonth(e.target.value)}>
        {[...Array(12).keys()].map(i => <option key={i+1}>{(i+1).toString().padStart(2, '0')}</option>)}
      </select>
      Year:<select value={year} onChange={(e) => setYear(e.target.value)}>
        {Array.from({length: 100}, (_, i) => 1980 + i).map(y => <option key={y}>{y}</option>)}
      </select>
      <input type="text" placeholder="12:00" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '60px' }} />

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <input
          type="text"
          placeholder="Enter city"
          value={locationInput}
          onChange={handleLocationChange}
        />
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1000 }}>
            {suggestions.map((city, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(city)}
                style={{ padding: '5px', cursor: 'pointer' }}
              >
                {city.name}, {city.country}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleAskVedari}>Ask Vedari</button>

      <hr />
      <h2>Vedari Says:</h2>
      <pre>{JSON.stringify(chartResult, null, 2)}</pre>
    </div>
  );
}