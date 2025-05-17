import React, { useState } from 'react';
import Select from 'react-select/async';

const AstroBotVedari = () => {
  const [day, setDay] = useState('05');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1981');
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState({ label: 'Rajkot, IN', value: 'Rajkot, IN' });
  const [name, setName] = useState('');
  const [textKundali, setTextKundali] = useState('');
  const [vedariSays, setVedariSays] = useState('');
  const [statusPlanet, setStatusPlanet] = useState(null);
  const [statusHouse, setStatusHouse] = useState(null);

  const fetchLocationOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${inputValue}`, {
      headers: { 'X-Api-Key': 'wBK21wCy9SmT29zbfnAjOA==CmbJZ2DKxu3EiQ4m' }
    });
    const data = await response.json();
    return data.map(loc => ({
      label: `${loc.name}, ${loc.country}`,
      value: `${loc.name}, ${loc.country}`
    }));
  };

  const fetchChartData = async () => {
    const datetime = `${time}:00/${year}-${month}-${day}`;
    const loc = location.label.split(',')[0];
    const baseURL = 'https://api.vedastro.org/api/Calculate';
    const key = 'BPbzv8zDmX';

    const planetURL = `${baseURL}/AllPlanetData/PlanetName/All/Location/${loc}/Time/${datetime}/Ayanamsa/LAHIRI/APIKey/${key}`;
    const houseURL = `${baseURL}/AllHouseData/HouseName/All/Location/${loc}/Time/${datetime}/Ayanamsa/LAHIRI/APIKey/${key}`;
    const predictURL = `${baseURL}/HoroscopePredictions/Location/${loc}/Time/${datetime}/Ayanamsa/LAHIRI/APIKey/${key}`;

    try {
      const [planetRes, houseRes, predictRes] = await Promise.all([
        fetch(planetURL),
        fetch(houseURL),
        fetch(predictURL)
      ]);

      const planetData = await planetRes.json();
      const houseData = await houseRes.json();
      const predictData = await predictRes.json();

      setStatusPlanet(planetData.Status);
      setStatusHouse(houseData.Status);

      if (predictData.Status === 'Pass') {
        const commentary = await getGPTCommentary(predictData.Payload);
        setVedariSays(commentary);
      } else {
        setVedariSays('GPT Commentary failed.');
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setVedariSays('Failed to fetch chart data.');
    }
  };

  const getGPTCommentary = async (predictions) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a Vedic astrology guru. Analyze these planetary prediction tags and provide a cosmic-style interpretation for a client.' },
            { role: 'user', content: JSON.stringify(predictions) }
          ]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('GPT Error:', error);
      return 'Could not generate GPT commentary.';
    }
  };

  return (
    <div>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        Day:<select value={day} onChange={e => setDay(e.target.value)}>{[...Array(31)].map((_, i) => <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select>
        Month:<select value={month} onChange={e => setMonth(e.target.value)}>{[...Array(12)].map((_, i) => <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select>
        Year:<select value={year} onChange={e => setYear(e.target.value)}>{[...Array(100)].map((_, i) => <option key={1925 + i}>{1925 + i}</option>)}</select>
        <input value={time} onChange={e => setTime(e.target.value)} />
        <Select cacheOptions loadOptions={fetchLocationOptions} defaultOptions value={location} onChange={setLocation} />
      </div>
      <button onClick={fetchChartData}>Ask Vedari</button>
      <button onClick={() => setTextKundali(vedariSays)}>Show Text Kundali</button>
      <button onClick={() => setTextKundali('')}>Hide Text Kundali</button>
      <pre>
        Vedari Says:
        {statusPlanet && `- 🖐️ Planet Data: ${statusPlanet === 'Pass' ? '✅ Loaded' : '❌ Failed'}`}
        {statusHouse && `\n- 🏠 House Data: ${statusHouse === 'Pass' ? '✅ Loaded' : '❌ Failed'}`}
        {textKundali || vedariSays}
      </pre>
    </div>
  );
};

export default AstroBotVedari;
