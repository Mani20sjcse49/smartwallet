import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { startReportScheduler } from "./services/reportScheduler.js";
import { useFallbackStore, isFallbackStore } from "./services/dataStore.js";

async function startServer() {
  let mongoConnected = false;

  try {
    await connectDatabase();
    mongoConnected = true;
  } catch (error) {
    console.warn("MongoDB connection failed:", error.message);
    console.warn("Falling back to in-memory API mode. Database-backed persistence will be unavailable.");
    useFallbackStore();
  }

  const app = createApp(env.clientUrl);

  app.listen(env.port, () => {
    console.log(`AI Smart Wallet API running on port ${env.port}`);
    if (!mongoConnected) {
      console.warn("API is running in fallback mode without persistent storage.");
    }
  });

  if (mongoConnected && !isFallbackStore()) {
    startReportScheduler();
  }
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
