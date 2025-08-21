import * as env from "env-var";

export const databaseConfig = () => ({
  uri: env
    .get("MONGODB_URI")
    .default("mongodb://localhost:27017/iot-data-management")
    .asString(),

  options: {
    maxPoolSize: env.get("DB_MAX_POOL_SIZE").default(10).asIntPositive(),
    serverSelectionTimeoutMS: env
      .get("DB_SERVER_SELECTION_TIMEOUT")
      .default(5000)
      .asIntPositive(),
    socketTimeoutMS: env
      .get("DB_SOCKET_TIMEOUT")
      .default(45000)
      .asIntPositive(),
    connectTimeoutMS: env
      .get("DB_CONNECT_TIMEOUT")
      .default(30000)
      .asIntPositive(),
    retryWrites: env.get("DB_RETRY_WRITES").default("true").asBool(),
    w: "majority" as const,
    readPreference: "primary" as const,
  },

  // Connection monitoring
  monitoring: {
    enabled: env.get("DB_MONITORING_ENABLED").default("true").asBool(),
    commandMonitoring: env
      .get("DB_COMMAND_MONITORING")
      .default("false")
      .asBool(),
  },
});
