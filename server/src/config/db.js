import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";

let memoryServer;
const LOCAL_DEV_MONGO_URI = "mongodb://127.0.0.1:27017/ai-smart-wallet";

async function disconnectIfNeeded() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }
}

async function connectWithUri(uri, { label, timeoutMs = 5000 } = {}) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: timeoutMs,
    connectTimeoutMS: timeoutMs,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    autoCreate: true
  });
  console.log(`MongoDB connected (${label})`);
}

async function createInMemoryMongoUri() {
  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: "ai-smart-wallet"
    }
  });

  console.log("Using in-memory MongoDB for local development");
  return memoryServer.getUri();
}

export async function connectDatabase() {
  const candidates = [];
  const preferLocalMongoInDevelopment =
    process.env.NODE_ENV !== "production" && env.mongoUri !== LOCAL_DEV_MONGO_URI;

  if (env.useInMemoryMongo) {
    candidates.push({
      label: "in-memory MongoDB",
      resolveUri: createInMemoryMongoUri,
      timeoutMs: 10000
    });
  }

  if (preferLocalMongoInDevelopment) {
    candidates.push({
      label: "local MongoDB (preferred for development)",
      resolveUri: async () => LOCAL_DEV_MONGO_URI,
      timeoutMs: 4000
    });
  }

  candidates.push({
    label: env.mongoUri === LOCAL_DEV_MONGO_URI ? "local MongoDB" : "configured MongoDB",
    resolveUri: async () => env.mongoUri,
    timeoutMs: 5000
  });

  let lastError;

  for (const candidate of candidates) {
    try {
      const connectionUri = await candidate.resolveUri();
      await connectWithUri(connectionUri, {
        label: candidate.label,
        timeoutMs: candidate.timeoutMs
      });
      return;
    } catch (error) {
      lastError = error;
      console.warn(`MongoDB connection attempt failed (${candidate.label}): ${error.message}`);

      if (candidate.label === "in-memory MongoDB" && memoryServer) {
        await memoryServer.stop().catch(() => {});
        memoryServer = undefined;
      }

      await disconnectIfNeeded();
    }
  }

  try {
    if (env.useInMemoryMongo) {
      try {
        const connectionUri = await createInMemoryMongoUri();
        await connectWithUri(connectionUri, {
          label: "in-memory MongoDB final fallback",
          timeoutMs: 10000
        });
        return;
      } catch (error) {
        lastError = error;
        console.warn(`In-memory MongoDB final fallback failed: ${error.message}`);
      }
    }
  } catch (error) {
    lastError = error;
  }

  console.error("MongoDB connection failed:", lastError?.message || "Unknown database error");
  throw lastError;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
