import mongoose from "mongoose";
import dns from "node:dns";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }

    // Optional DNS configuration for local network issues
    const dnsServers = process.env.DNS_SERVERS;

    if (dnsServers) {
      dns.setServers(dnsServers.split(",").map((server) => server.trim()));
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });

    await mongoose.connection.db?.admin().ping();

    console.log("MongoDB Atlas connected successfully!");
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
};
