// ??$$$ Database connection configuration - MongoDB Atlas SRV
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ??$$$ No deprecated options needed in Mongoose 8+
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
