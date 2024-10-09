// src/components/BarChart.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // Import necessary components from Recharts
import "./BarChart.css";

const CustomBarChart = () => {
  const [barData, setBarData] = useState([]);
  const [month, setMonth] = useState("March"); // Default month

  useEffect(() => {
    const fetchBarData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/bar-chart`, {
          params: { month },
        });
        setBarData(response.data);
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };

    fetchBarData();
  }, [month]);

  return (
    <div className="bar-chart">
      <h2>Bar Chart Data for {month}</h2>
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

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />{" "}
          {/* Adjust based on your fetched data structure */}
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#36a2eb" />{" "}
          {/* Adjust based on your fetched data structure */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
