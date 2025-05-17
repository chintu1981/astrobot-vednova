import React, { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("01");
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState("1980");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const birthDate = `${year}-${month}-${day}`;

    const response = await fetch("https://api.vedastro.org/planet-positions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "BPbzv8zDmX"
      },
      body: JSON.stringify({
        name,
        birth_date: birthDate,
        birth_time: time,
        birth_place: place
      })
    });

    try {
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("Error parsing response");
    }
  };

  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(<option key={i}>{i.toString().padStart(2, '0')}</option>);
    }
    return options;
  };

  return (
    <div className="App">
      <h1>🧘‍♂️ AstroBot Vedari</h1>
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {generateOptions(1, 31)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {generateOptions(1, 12)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {generateOptions(1900, 2025)}
        </select>
      </div>
      <input
        type="text"
        placeholder="12:00"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <input
        type="text"
        placeholder="rajkot, gujarat"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
      />
      <button onClick={handleSubmit}>Ask Vedari</button>
      <hr />
      <h3>Vedari Says:</h3>
      <pre>{result}</pre>
    </div>
  );
}

export default App;
