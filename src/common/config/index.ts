// Configuration barrel file for centralized config management
export { appConfig } from "./app.config";
export { databaseConfig } from "./database.config";
export { rabbitmqConfig } from "./rabbitmq.config";

// Configuration validation
import { appConfig } from "./app.config";
import { databaseConfig } from "./database.config";
import { rabbitmqConfig } from "./rabbitmq.config";

export interface AppConfiguration {
  app: ReturnType<typeof appConfig>;
  database: ReturnType<typeof databaseConfig>;
  rabbitmq: ReturnType<typeof rabbitmqConfig>;
}

// Configuration factory
export const createConfiguration = (): AppConfiguration => ({
  app: appConfig(),
  database: databaseConfig(),
  rabbitmq: rabbitmqConfig(),
});

// Configuration validation function
export const validateConfiguration = (config: AppConfiguration): void => {
  // Validate critical configuration values
  if (!config.database.uri) {
    throw new Error("Database URI is required");
  }

  if (!config.rabbitmq.url) {
    throw new Error("RabbitMQ URL is required");
  }

  if (config.app.port < 1 || config.app.port > 65535) {
    throw new Error("Port must be between 1 and 65535");
  }

  // Environment-specific validations
  if (config.app.nodeEnv === "production") {
    if (config.app.cors.origin === "*") {
      console.warn("WARNING: CORS is set to allow all origins in production");
    }

    if (!config.app.logging.enableFile) {
      console.warn("WARNING: File logging is disabled in production");
    }
  }
};
