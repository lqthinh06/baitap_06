import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = "mongodb://admin:admin@localhost:27017";
    const conn = await mongoose.connect(mongoUri);
    console.log(`Database: ${conn.connection.db?.databaseName || "Unknown"}`);
  } catch (error) {
    console.log("Connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
