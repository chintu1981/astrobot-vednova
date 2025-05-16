import React, { useState } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({ name: "", date: "", time: "", place: "" });
  const [response, setResponse] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(process.env.REACT_APP_API_URL, form);
      setResponse(res.data.response);
    } catch (err) {
      setResponse("Something went wrong. Check server or API key.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🧘‍♂️ AstroBot Vedari</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" onChange={handleChange} /><br/><br/>
        <input name="date" placeholder="Date of Birth (YYYY-MM-DD)" onChange={handleChange} /><br/><br/>
        <input name="time" placeholder="Time of Birth (HH:MM)" onChange={handleChange} /><br/><br/>
        <input name="place" placeholder="Place of Birth" onChange={handleChange} /><br/><br/>
        <button type="submit">Ask Vedari</button>
      </form>
      <hr/>
      <div><strong>Vedari Says:</strong><br/>{response}</div>
    </div>
  );
}

export default App;