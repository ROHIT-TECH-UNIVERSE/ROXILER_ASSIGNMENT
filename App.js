// src/App.js

import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Transactions from "./components/Transactions";
import Statistics from "./components/Statistics";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";

import "./App.css"; // Import your CSS

function App() {
  const [month, setMonth] = useState("March"); // Centralized month state

  return (
    <Router>
      <div className="App">
        {/* Header */}
        <header className="header">
          <h1>Transaction Dashboard</h1>
          <nav>
            <Link to="/transactions">Transactions</Link>
            <Link to="/statistics">Statistics</Link>
            <Link to="/bar-chart">Bar Chart</Link>
            <Link to="/pie-chart">Pie Chart</Link>
          </nav>
        </header>

        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/transactions" element={<Transactions />} />
            <Route
              path="/statistics"
              element={<Statistics month={month} setMonth={setMonth} />}
            />
            <Route path="/bar-chart" element={<BarChart month={month} />} />
            <Route path="/pie-chart" element={<PieChart />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>
            &copy; {new Date().getFullYear()} Transaction Dashboard. All rights
            reserved.
          </p>
          <p>Created by Your Name</p> {/* Replace with your name or company */}
        </footer>
      </div>
    </Router>
  );
}

export default App;
