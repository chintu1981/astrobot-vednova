import React, { useState } from 'react';
import Select from 'react-select';
import tzlookup from 'tz-lookup';

const AstroBot = () => {
  const [formData, setFormData] = useState({
    name: '',
    day: '05',
    month: '06',
    year: '1981',
    time: '12:00',
    location: { label: 'Rajkot, IN', value: { lat: 22.2969, lon: 70.7984 } },
  });
  const [responseText, setResponseText] = useState('');
  const [showKundali, setShowKundali] = useState(false);
  const [kundaliText, setKundaliText] = useState('');

  const locationOptions = [
    { label: 'Rajkot, IN', value: { lat: 22.2969, lon: 70.7984 } },
    { label: 'Ahmedabad, IN', value: { lat: 23.0225, lon: 72.5714 } },
    { label: 'Paris, FR', value: { lat: 48.8566, lon: 2.3522 } },
    { label: 'New York, US', value: { lat: 40.7128, lon: -74.006 } }
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getTimezoneOffset = (lat, lon) => {
    try {
      const tz = tzlookup(lat, lon);
      const now = new Date();
      const local = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      const offset = (local.getTime() - now.getTime()) / 3600000;
      return offset >= 0 ? `+${offset.toFixed(0).padStart(2, '0')}:00` : `${offset.toFixed(0)}:00`;
    } catch (error) {
      return '+00:00';
    }
  };

  const buildVedastroUrl = (endpoint, extraPath = '') => {
    const { day, month, year, time, location } = formData;
    const [hour, minute] = time.split(':');
    const { lat, lon } = location.value;
    const offset = getTimezoneOffset(lat, lon);
    return `https://api.vedastro.org/api/Calculate/${endpoint}/Location/${location.label.replace(/\s+/g, '')}/Time/${hour}:${minute}/${day}/${month}/${year}/${offset}${extraPath}`;
  };

  const fetchData = async () => {
    const planetURL = buildVedastroUrl('AllPlanetData/PlanetName/All/Ayanamsa/LAHIRI/APIKey/BPbzv8zDmX');
    const houseURL = buildVedastroUrl('AllHouseData/HouseName/All/Ayanamsa/LAHIRI/APIKey/BPbzv8zDmX');
    const predictURL = buildVedastroUrl('HoroscopePredictions/Ayanamsa/LAHIRI/APIKey/BPbzv8zDmX');

    try {
      const [planetRes, houseRes, predictRes] = await Promise.all([
        fetch(planetURL),
        fetch(houseURL),
        fetch(predictURL)
      ]);

      const planetJson = await planetRes.json();
      const houseJson = await houseRes.json();
      const predictJson = await predictRes.json();

      const isPlanetOk = planetJson.Status === 'Pass';
      const isHouseOk = houseJson.Status === 'Pass';
      const isPredictOk = predictJson.Status === 'Pass';

      let message = `Vedari Says:\n`;
      message += `- 🖐️  Planet Data: ${isPlanetOk ? '✅ Loaded' : '❌ Failed'}\n`;
      message += `- 🏠 House Data: ${isHouseOk ? '✅ Loaded' : '❌ Failed'}\n`;
      if (isPredictOk) {
        message += `- 📜 Predictions:\n`;
        for (const item of predictJson.Payload) {
          message += `  • ${item.Name} ➜ ${item.Description}\n`;
        }
      }

      setResponseText(message);

      // Build vertical kundali
      if (isPlanetOk) {
        const grouped = {};
        for (const obj of planetJson.Payload.AllPlanetData) {
          for (const [planet, data] of Object.entries(obj)) {
            const house = data.HousePlanetOccupiesBasedOnLongitudes;
            if (!grouped[house]) grouped[house] = [];
            grouped[house].push(planet);
          }
        }
        let chart = '📊 Kundali Chart:\n';
        Object.keys(grouped).sort().forEach(h => {
          chart += `${h}: ${grouped[h].join(', ')}\n`;
        });
        setKundaliText(chart);
      } else {
        setKundaliText('Kundali could not be loaded.');
      }
    } catch (error) {
      setResponseText('❌ Failed to fetch data.');
    }
  };

  return (
    <div>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input placeholder="Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
      Day: <select value={formData.day} onChange={(e) => handleChange('day', e.target.value)}>
        {[...Array(31).keys()].map(d => <option key={d + 1}>{String(d + 1).padStart(2, '0')}</option>)}
      </select>
      Month: <select value={formData.month} onChange={(e) => handleChange('month', e.target.value)}>
        {[...Array(12).keys()].map(m => <option key={m + 1}>{String(m + 1).padStart(2, '0')}</option>)}
      </select>
      Year: <select value={formData.year} onChange={(e) => handleChange('year', e.target.value)}>
        {Array.from({ length: 100 }, (_, i) => 2025 - i).map(y => <option key={y}>{y}</option>)}
      </select>
      <input value={formData.time} onChange={(e) => handleChange('time', e.target.value)} />
      <Select options={locationOptions} value={formData.location} onChange={(val) => handleChange('location', val)} styles={{ container: base => ({ ...base, display: 'inline-block', width: 200 }) }} />

      <div>
        <button onClick={fetchData}>Ask Vedari</button>
        <button onClick={() => setShowKundali(true)}>Show Text Kundali</button>
        <button onClick={() => setShowKundali(false)}>Hide Text Kundali</button>
      </div>
      <pre>{responseText}</pre>
      {showKundali && <pre>{kundaliText}</pre>}
    </div>
  );
};

export default AstroBot;