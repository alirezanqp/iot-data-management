import * as env from "env-var";

export const appConfig = () => ({
  // Server settings
  port: env.get("PORT").default(3000).asPortNumber(),
  host: env.get("HOST").default("0.0.0.0").asString(),

  // Environment
  nodeEnv: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["development", "production", "test"]),

  // API settings
  api: {
    prefix: env.get("API_PREFIX").default("").asString(),
    version: env.get("API_VERSION").default("1.0").asString(),
    title: env
      .get("API_TITLE")
      .default("IoT Data Management System")
      .asString(),
    description: env
      .get("API_DESCRIPTION")
      .default("API for managing IoT x-ray data with RabbitMQ integration")
      .asString(),
  },

  // CORS settings
  cors: {
    enabled: env.get("CORS_ENABLED").default("true").asBool(),
    origin: env.get("CORS_ORIGIN").default("*").asString(),
    methods: env
      .get("CORS_METHODS")
      .default("GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS")
      .asString(),
    allowedHeaders: env
      .get("CORS_ALLOWED_HEADERS")
      .default("Content-Type,Accept,Authorization")
      .asString(),
    credentials: env.get("CORS_CREDENTIALS").default("false").asBool(),
  },

  // Security settings
  security: {
    rateLimiting: {
      enabled: env.get("RATE_LIMITING_ENABLED").default("true").asBool(),
      windowMs: env
        .get("RATE_LIMITING_WINDOW_MS")
        .default(900000)
        .asIntPositive(), // 15 minutes
      max: env.get("RATE_LIMITING_MAX_REQUESTS").default(100).asIntPositive(),
    },
    helmet: {
      enabled: env.get("HELMET_ENABLED").default("true").asBool(),
    },
  },

  // Logging settings
  logging: {
    level: env
      .get("LOG_LEVEL")
      .default("info")
      .asEnum(["error", "warn", "info", "debug", "verbose"]),
    format: env
      .get("LOG_FORMAT")
      .default("combined")
      .asEnum(["combined", "common", "dev", "short", "tiny"]),
    enableConsole: env.get("LOG_ENABLE_CONSOLE").default("true").asBool(),
    enableFile: env.get("LOG_ENABLE_FILE").default("false").asBool(),
    filePath: env.get("LOG_FILE_PATH").default("./logs/app.log").asString(),
  },

  // Swagger settings
  swagger: {
    enabled: env.get("SWAGGER_ENABLED").default("true").asBool(),
    path: env.get("SWAGGER_PATH").default("api").asString(),
    title: env
      .get("SWAGGER_TITLE")
      .default("IoT Data Management System API")
      .asString(),
    description: env
      .get("SWAGGER_DESCRIPTION")
      .default("API documentation for IoT data management system")
      .asString(),
    version: env.get("SWAGGER_VERSION").default("1.0.0").asString(),
  },

  // Health check settings
  healthCheck: {
    enabled: env.get("HEALTH_CHECK_ENABLED").default("true").asBool(),
    path: env.get("HEALTH_CHECK_PATH").default("health").asString(),
    timeout: env.get("HEALTH_CHECK_TIMEOUT").default(5000).asIntPositive(),
  },

  // Metrics settings
  metrics: {
    enabled: env.get("METRICS_ENABLED").default("false").asBool(),
    path: env.get("METRICS_PATH").default("metrics").asString(),
    defaultLabels: {
      app: env
        .get("METRICS_APP_NAME")
        .default("iot-data-management")
        .asString(),
      version: env.get("METRICS_APP_VERSION").default("1.0.0").asString(),
    },
  },
});
