import * as env from "env-var";

export const rabbitmqConfig = () => ({
  // Connection settings
  url: env.get("RABBITMQ_URL").default("amqp://localhost:5672").asString(),

  username: env.get("RABBITMQ_USERNAME").default("guest").asString(),
  password: env.get("RABBITMQ_PASSWORD").default("guest").asString(),

  // Connection options
  connection: {
    heartbeat: env.get("RABBITMQ_HEARTBEAT").default(60).asIntPositive(),
    connectionTimeout: env
      .get("RABBITMQ_CONNECTION_TIMEOUT")
      .default(60000)
      .asIntPositive(),
    channelMax: env.get("RABBITMQ_CHANNEL_MAX").default(100).asIntPositive(),
    frameMax: env.get("RABBITMQ_FRAME_MAX").default(0x1000).asIntPositive(),
    reconnectTimeInSeconds: env
      .get("RABBITMQ_RECONNECT_TIME")
      .default(30)
      .asIntPositive(),
    maxReconnectAttempts: env
      .get("RABBITMQ_MAX_RECONNECT_ATTEMPTS")
      .default(10)
      .asIntPositive(),
  },

  // Queue configurations
  queues: {
    xray: {
      name: env.get("XRAY_QUEUE_NAME").default("xray-data").asString(),
      options: {
        durable: env.get("XRAY_QUEUE_DURABLE").default("true").asBool(),
        exclusive: false,
        autoDelete: false,
        arguments: {
          "x-message-ttl": env
            .get("XRAY_QUEUE_TTL")
            .default(86400000)
            .asIntPositive(), // 24 hours
          "x-max-length": env
            .get("XRAY_QUEUE_MAX_LENGTH")
            .default(10000)
            .asIntPositive(),
          "x-max-length-bytes": env
            .get("XRAY_QUEUE_MAX_BYTES")
            .default(1048576)
            .asIntPositive(), // 1MB
          "x-overflow": env
            .get("XRAY_QUEUE_OVERFLOW")
            .default("reject-publish")
            .asString(),
          "x-dead-letter-exchange": env
            .get("XRAY_DLX_NAME")
            .default("xray-dlx")
            .asString(),
          "x-dead-letter-routing-key": env
            .get("XRAY_DLQ_ROUTING_KEY")
            .default("xray.failed")
            .asString(),
        },
      },
      consumer: {
        prefetch: env.get("XRAY_CONSUMER_PREFETCH").default(10).asIntPositive(),
        noAck: env.get("XRAY_CONSUMER_NO_ACK").default("false").asBool(),
      },
    },

    deadLetter: {
      name: env.get("XRAY_DLQ_NAME").default("xray-data-dlq").asString(),
      options: {
        durable: env.get("XRAY_DLQ_DURABLE").default("true").asBool(),
        exclusive: false,
        autoDelete: false,
        arguments: {
          "x-message-ttl": env
            .get("XRAY_DLQ_TTL")
            .default(604800000)
            .asIntPositive(), // 7 days
        },
      },
    },
  },

  // Exchange configurations
  exchanges: {
    deadLetter: {
      name: env.get("XRAY_DLX_NAME").default("xray-dlx").asString(),
      type: "direct",
      options: {
        durable: true,
        autoDelete: false,
      },
    },
  },

  // Retry and circuit breaker settings
  retry: {
    maxAttempts: env
      .get("RABBITMQ_RETRY_MAX_ATTEMPTS")
      .default(3)
      .asIntPositive(),
    backoffMultiplier: env
      .get("RABBITMQ_RETRY_BACKOFF_MULTIPLIER")
      .default(2)
      .asIntPositive(),
    initialDelay: env
      .get("RABBITMQ_RETRY_INITIAL_DELAY")
      .default(1000)
      .asIntPositive(),
    maxDelay: env
      .get("RABBITMQ_RETRY_MAX_DELAY")
      .default(30000)
      .asIntPositive(),
  },

  // Health check settings
  healthCheck: {
    enabled: env.get("RABBITMQ_HEALTH_CHECK_ENABLED").default("true").asBool(),
    interval: env
      .get("RABBITMQ_HEALTH_CHECK_INTERVAL")
      .default(30000)
      .asIntPositive(),
    timeout: env
      .get("RABBITMQ_HEALTH_CHECK_TIMEOUT")
      .default(5000)
      .asIntPositive(),
  },
});
