// Import required libraries
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const morgan = require("morgan"); // Middleware for logging HTTP requests
const cors = require("cors"); // Middleware for handling CORS
const helmet = require("helmet"); // Middleware for securing HTTP headers
const bodyParser = require("body-parser"); // Middleware for parsing request bodies

// Initialize the Express app
const app = express();

// --- MIDDLEWARE SETUP ---

// 1. Enable CORS for all routes (useful for handling requests from different origins)
app.use(cors());

// 2. Secure the app by setting various HTTP headers (using helmet)
app.use(helmet());

// 3. Log HTTP requests (using morgan, for debugging purposes)
app.use(morgan("dev"));

// 4. Parse incoming requests with JSON payloads (useful for POST/PUT requests)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://localhost:27017/transactions", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Define Transaction Schema and Model
const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  dateOfSale: Date,
  sold: Boolean,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// 0. to check if the server is working properly
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// 1. API to Seed the Database from a Third-Party API
app.get("/seed-database", async (req, res) => {
  try {
    // Fetch data from the third-party API
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const transactions = response.data;

    // Clear the existing collection (optional)
    await Transaction.deleteMany({});

    // Seed the data into the MongoDB collection
    await Transaction.insertMany(transactions);

    res.status(200).send("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding the database:", error);
    res.status(500).send("Error seeding the database");
  }
});

// 2. API to List All Transactions with Pagination and Search
app.get("/transactions", async (req, res) => {
  const { page = 1, perPage = 10, search = "", month } = req.query;

  // Validate month parameter
  if (!month) {
    return res.status(400).send("Month parameter is required");
  }

  try {
    // Convert month name to a number (e.g., 'March' to 3)
    const monthNumber = new Date(`${month} 1`).getMonth() + 1; // Months are 0-indexed in JavaScript

    // Create the search query
    const searchQuery = {
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber], // Compare month regardless of year
      },
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    // Check if the search term is a valid number
    if (!isNaN(search) && search.trim() !== "") {
      searchQuery.$or.push({ price: parseFloat(search) }); // If it is a number, add to search query
    }

    // Find transactions based on the query with pagination
    const transactions = await Transaction.find(searchQuery)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    const totalCount = await Transaction.countDocuments(searchQuery);

    res.status(200).json({
      transactions,
      pagination: {
        page: Number(page),
        perPage: Number(perPage),
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send("Error fetching transactions");
  }
});

// 3. API to Get Statistics for a Selected Month
app.get("/statistics", async (req, res) => {
  const { month } = req.query;

  // Validate month parameter
  if (!month) {
    return res.status(400).send("Month parameter is required");
  }

  try {
    // Convert month name to a number (e.g., 'March' to 3)
    const monthNumber = new Date(`${month} 1`).getMonth() + 1; // Months are 0-indexed in JavaScript

    // Total sale amount for the selected month across all years
    const totalSaleAmount = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber], // Compare month regardless of year
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$price" }, // Sum of the price field
        },
      },
    ]);

    // Total number of sold items for the selected month
    const soldItems = await Transaction.countDocuments({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber], // Compare month regardless of year
      },
      sold: true, // Only count sold items
    });

    // Total number of unsold items for the selected month
    const unsoldItems = await Transaction.countDocuments({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber], // Compare month regardless of year
      },
      sold: false, // Only count unsold items
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0, // Default to 0 if no transactions
      soldItems,
      unsoldItems,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).send("Error fetching statistics");
  }
});

// 4. API for Bar Chart Data: Price Range Distribution of Items
app.get("/bar-chart", async (req, res) => {
  const { month } = req.query;

  // Validate month parameter
  if (!month) {
    return res.status(400).send("Month parameter is required");
  }

  try {
    // Convert month name to a number (e.g., 'March' to 3)
    const monthNumber = new Date(`${month} 1`).getMonth() + 1; // Months are 0-indexed in JavaScript

    // Define price ranges
    const priceRanges = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-200", min: 101, max: 200 },
      { range: "201-300", min: 201, max: 300 },
      { range: "301-400", min: 301, max: 400 },
      { range: "401-500", min: 401, max: 500 },
      { range: "501-600", min: 501, max: 600 },
      { range: "601-700", min: 601, max: 700 },
      { range: "701-800", min: 701, max: 800 },
      { range: "801-900", min: 801, max: 900 },
      { range: "901-above", min: 901, max: Infinity },
    ];

    // Count items in each price range
    const priceData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber], // Compare month regardless of year
          },
          price: { $gte: range.min, $lt: range.max },
        });
        return { range: range.range, count };
      })
    );

    res.status(200).json(priceData);
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    res.status(500).send("Error fetching bar chart data");
  }
});

// 5. API for Pie Chart Data: Items Grouped by Category
app.get("/pie-chart", async (req, res) => {
  const { month } = req.query;

  // Validate month parameter
  if (!month) {
    return res.status(400).send("Month parameter is required");
  }

  try {
    // Convert month name to a number (e.g., 'March' to 3)
    const monthNumber = new Date(`${month} 1`).getMonth() + 1; // Months are 0-indexed in JavaScript

    // Group items by category and count the number of items in each category for the given month
    const categoryData = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber], // Compare month regardless of year
          },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(categoryData);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).send("Error fetching pie chart data");
  }
});

// 6. Combined API to Fetch Data from All Previous APIs
app.get("/combined", async (req, res) => {
  const { month } = req.query;

  try {
    // Fetch data from the individual APIs
    const [transactions, statistics, barChartData, pieChartData] =
      await Promise.all([
        axios.get(`http://localhost:3000/transactions?month=${month}`),
        axios.get(`http://localhost:3000/statistics?month=${month}`),
        axios.get(`http://localhost:3000/bar-chart?month=${month}`),
        axios.get(`http://localhost:3000/pie-chart?month=${month}`),
      ]);

    res.status(200).json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChartData.data,
      pieChart: pieChartData.data,
    });
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).send("Error fetching combined data");
  }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
