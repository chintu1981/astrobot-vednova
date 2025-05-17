import React, { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [birthDay, setBirthDay] = useState("01");
  const [birthMonth, setBirthMonth] = useState("01");
  const [birthYear, setBirthYear] = useState("2000");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    const fullDate = `${birthYear}-${birthMonth}-${birthDay}`;
    const apiUrl = "https://api.vedastro.org/api/planet-position";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "BPbzv8zDmX"
        },
        body: JSON.stringify({
          name,
          birth_date: fullDate,
          birth_time: birthTime,
          birth_place: birthPlace
        })
      });
      const data = await res.json();
      setResponse(JSON.stringify(data));
    } catch (error) {
      setResponse("Error parsing response");
    }
  };

  const renderDropdown = (label, value, onChange, options) => (
    <label>
      {label}:
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const years = Array.from({ length: 100 }, (_, i) => String(2025 - i));

  return (
    <div className="App">
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      {renderDropdown("Day", birthDay, setBirthDay, days)}
      {renderDropdown("Month", birthMonth, setBirthMonth, months)}
      {renderDropdown("Year", birthYear, setBirthYear, years)}
      <input type="text" value={birthTime} onChange={e => setBirthTime(e.target.value)} placeholder="HH:MM" />
      <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="Birth Place" />
      <button onClick={handleSubmit}>Ask Vedari</button>
      <hr />
      <h3>Vedari Says:</h3>
      <pre>{response}</pre>
    </div>
  );
}

export default App;
