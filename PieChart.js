// src/components/PieChart.js

import React, { useEffect, useState } from "react";
import axios from "axios";
// import './PieChart.css';

const PieChart = () => {
  const [pieData, setPieData] = useState([]);
  const [month, setMonth] = useState("March"); // Default month

  useEffect(() => {
    const fetchPieData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/pie-chart`, {
          params: { month },
        });
        setPieData(response.data);
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchPieData();
  }, [month]);

  return (
    <div className="pie-chart">
      <h2>Pie Chart Data for {month}</h2>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="April">April</option>
        <option value="May">May</option>
        <option value="June">June</option>
        <option value="July">July</option>
        <option value="August">August</option>
        <option value="September">September</option>
        <option value="October">October</option>
        <option value="November">November</option>
        <option value="December">December</option>
      </select>
      <ul>
        {pieData.map((item) => (
          <li key={item._id}>
            {item._id}: {item.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PieChart;
