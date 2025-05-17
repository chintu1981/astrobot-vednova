import React, { useState, useEffect } from 'react';
import axios from 'axios';


const App = () => {
  const [name, setName] = useState('');
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [response, setResponse] = useState('');
  const [showKundali, setShowKundali] = useState(true);

  useEffect(() => {
    if (locationInput.length > 2) {
      const timeoutId = setTimeout(() => {
        axios.get(`https://api.api-ninjas.com/v1/city?name=${locationInput}`, {
          headers: { 'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m' },
        })
        .then(res => {
          const matches = res.data.map(city => ({
            name: `${city.name}, ${city.country}`,
            lat: city.latitude,
            lon: city.longitude,
          }));
          setLocationSuggestions(matches);
        })
        .catch(err => console.error(err));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [locationInput]);

  const handleSubmit = async () => {
    if (!selectedLocation) {
      alert("Please select a city from suggestions.");
      return;
    }

    const birthDate = `${year}-${month}-${day}`;
    const birthTime = time;
    const timezoneRes = await axios.get(
      `https://api.api-ninjas.com/v1/timezone?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`,
      {
        headers: { 'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m' },
      }
    );

    const timezone = timezoneRes.data.timezone;

    const encodedLocation = encodeURIComponent(selectedLocation.name);
    const encodedTime = encodeURIComponent(birthTime);
    const encodedDate = encodeURIComponent(birthDate);
    const encodedTz = encodeURIComponent(timezone);

    const apiUrl = `https://api.vedastro.org/ChartJSON/${encodedLocation}/${encodedDate}/${encodedTime}/${encodedTz}`;

    const vedastroResponse = await axios.get(apiUrl);
    const chartData = vedastroResponse.data;
    setResponse(chartData);
  };

  return (
    <div className="App">
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      Day:
      <select value={day} onChange={(e) => setDay(e.target.value)}>
        {[...Array(31)].map((_, i) => (
          <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>
        ))}
      </select>
      Month:
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {[...Array(12)].map((_, i) => (
          <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>
        ))}
      </select>
      Year:
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        {[...Array(100)].map((_, i) => (
          <option key={i}>{1981 + i}</option>
        ))}
      </select>
      <input value={time} onChange={(e) => setTime(e.target.value)} />
      <input
        list="location-options"
        placeholder="Start typing city"
        value={locationInput}
        onChange={(e) => {
          setLocationInput(e.target.value);
          setSelectedLocation(null);
        }}
      />
      <datalist id="location-options">
        {locationSuggestions.map((loc, i) => (
          <option
            key={i}
            value={loc.name}
            onClick={() => setSelectedLocation(loc)}
          >
            {loc.name}
          </option>
        ))}
      </datalist>
      <button onClick={handleSubmit}>Ask Vedari</button>
      <button onClick={() => setShowKundali(!showKundali)}>
        {showKundali ? 'Hide' : 'Show'} Text Kundali
      </button>
      <div>
        <h2>Vedari Says:</h2>
        <pre>{showKundali ? JSON.stringify(response, null, 2) : ''}</pre>
      </div>
    </div>
  );
};

export default App;
