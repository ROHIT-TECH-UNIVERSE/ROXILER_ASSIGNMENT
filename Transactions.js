// src/components/Transactions.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [monthIndex, setMonthIndex] = useState(2); // Starting from March (index 2)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [page, setPage] = useState(1);
  const perPage = 10; // Default items per page

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/transactions`, {
          params: {
            month: months[monthIndex],
            page,
            perPage,
          },
        });
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [monthIndex, page, perPage]);

  const handleNextMonth = () => {
    setMonthIndex((prevIndex) => (prevIndex + 1) % 12); // Go to the next month
    setPage(1); // Reset to the first page
  };

  const handlePreviousMonth = () => {
    setMonthIndex((prevIndex) => (prevIndex - 1 + 12) % 12); // Go to the previous month
    setPage(1); // Reset to the first page
  };

  return (
    <div className="transactions">
      <h2>Transactions for {months[monthIndex]}</h2>
      <select
        value={months[monthIndex]}
        onChange={(e) => setMonthIndex(months.indexOf(e.target.value))}
      >
        {months.map((month, index) => (
          <option key={index} value={month}>
            {month}
          </option>
        ))}
      </select>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Date of Sale</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>${transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
              <td>{transaction.sold ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handlePreviousMonth}>Previous Month</button>
      <button onClick={handleNextMonth}>Next Month</button>
    </div>
  );
};

export default Transactions;
