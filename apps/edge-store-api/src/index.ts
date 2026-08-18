import { createApp } from "./app";
import { config } from "./config/index";
import { testDatabaseConnection } from "./config/dbconnection";

const startServer = async () => {
  const app = createApp();

  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error("Failed to connect to database. Please check your configuration.");
    process.exit(1);
  }

  console.log("Database connected successfully.");

  app.listen(config.port, () => {
    console.log(`Edge Store API running on port ${config.port} [${config.env}]`);
    console.log(`API Version: ${config.apiVersion}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});