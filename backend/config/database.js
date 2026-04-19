/**
 * database.js — MongoDB connection via Mongoose
 *
 * OOSE Concept: Abstraction
 *   - Hides connection details. The rest of the app just calls connectDB()
 *     without knowing the underlying driver implementation.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI 
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected → ${mongoose.connection.name}`);
};

module.exports = connectDB;
