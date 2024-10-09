// src/components/Statistics.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Statistics.css"; // Import CSS

const Statistics = () => {
  const [statistics, setStatistics] = useState({});
  const [month, setMonth] = useState("March"); // Default month

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/statistics`, {
          params: { month },
        });
        setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, [month]);

  return (
    <div className="statistics">
      <h2>Statistics for {month}</h2>
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

      {/* Badge container for displaying statistics */}
      <div className="badge-container">
        <div className="badge">
          Total Sale Amount: ${statistics.totalSaleAmount || 0}
        </div>
        <div className="badge">Sold Items: {statistics.soldItems || 0}</div>
        <div className="badge">Unsold Items: {statistics.unsoldItems || 0}</div>
      </div>
    </div>
  );
};

export default Statistics;
