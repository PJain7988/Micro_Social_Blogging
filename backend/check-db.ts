
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./src/config/db";

dotenv.config();

const testConnection = async () => {
  try {
    await connectDB();

    console.log("Database connection test passed!");
  } catch (error) {
    console.error("Database test failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

testConnection();
