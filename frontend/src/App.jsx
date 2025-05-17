import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";

const locationOptions = [
  { value: "Rajkot", label: "Rajkot, IN" },
  { value: "Ahmedabad", label: "Ahmedabad, IN" },
  { value: "Mumbai", label: "Mumbai, IN" }
];

const App = () => {
  const [name, setName] = useState("");
  const [day, setDay] = useState("05");
  const [month, setMonth] = useState("06");
  const [year, setYear] = useState("1981");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState(locationOptions[0]);
  const [response, setResponse] = useState({});
  const [showText, setShowText] = useState(false);
  const [status, setStatus] = useState({ planet: false, house: false });

  const apiUrl = process.env.REACT_APP_API_URL;
  const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const vedastroKey = process.env.REACT_APP_VEDASTRO_API_KEY;

  const handleAskVedari = async () => {
    const baseParams = `${location.value}/Time/${time}/${day}/${month}/${year}/+05:30/Ayanamsa/LAHIRI/APIKey/${vedastroKey}`;

    try {
      const [planetRes, houseRes, predictionRes] = await Promise.all([
        axios.get(`${apiUrl}/Calculate/AllPlanetData/PlanetName/Sun/Location/${baseParams}`),
        axios.get(`${apiUrl}/Calculate/AllHouseData/HouseName/Ascendant/Location/${baseParams}`),
        axios.get(`${apiUrl}/Calculate/HoroscopePredictions/Location/${baseParams}`)
      ]);

      const planetData = planetRes.data;
      const houseData = houseRes.data;
      const predictionData = predictionRes.data;

      setStatus({
        planet: planetData?.Status === "Pass",
        house: houseData?.Status === "Pass"
      });

      let gptResponse = "GPT Commentary failed.";
      try {
        const chatRes = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a Vedic astrology expert. Interpret the following data briefly:"
              },
              {
                role: "user",
                content: JSON.stringify({
                  planetData: planetData?.Payload,
                  houseData: houseData?.Payload,
                  predictions: predictionData?.Payload
                })
              }
            ]
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openAiKey}`
            }
          }
        );
        gptResponse = chatRes.data.choices[0].message.content;
      } catch (err) {
        console.log("GPT failed", err);
      }

      setResponse({
        planetData: planetData?.Payload,
        houseData: houseData?.Payload,
        predictions: predictionData?.Payload,
        gpt: gptResponse
      });
    } catch (error) {
      console.error("API Error:", error);
      setStatus({ planet: false, house: false });
      setResponse({ gpt: "Error fetching data." });
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>
        <span role="img" aria-label="meditating person">🧘‍♂️</span> AstroBot Vedari
      </h1>
      <div style={{ marginBottom: "10px" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        Day:
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {[...Array(31)].map((_, i) => (
            <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
          ))}
        </select>
        Month:
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
          ))}
        </select>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {Array.from({ length: 100 }, (_, i) => 1980 + i).map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <input value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <Select options={locationOptions} value={location} onChange={setLocation} />
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleAskVedari}>Ask Vedari</button>
        <button onClick={() => setShowText(true)}>Show Text Kundali</button>
        <button onClick={() => setShowText(false)}>Hide Text Kundali</button>
      </div>
      <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        <strong>Vedari Says:</strong>
        <br />
        - 🖐 Planet Data: {status.planet ? "✅ Loaded" : "❌ Failed"}
        <br />
        - 🏡 House Data: {status.house ? "✅ Loaded" : "❌ Failed"}
        <br />
        {response.gpt || "GPT Commentary loading..."}
        {showText && (
          <pre style={{ fontSize: "12px" }}>{JSON.stringify(response, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default App;