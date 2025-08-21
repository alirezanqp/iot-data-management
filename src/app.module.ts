import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

// Configuration
import { createConfiguration, validateConfiguration } from "./common/config";

// Modules
import { RabbitMQModule } from "./rabbitmq/rabbitmq.module";
import { SignalsModule } from "./signals/signals.module";
import { ProducerModule } from "./producer/producer.module";
import { HealthModule } from "./health/health.module";

// Common components
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { Logger } from "@nestjs/common";

// Load and validate configuration
const config = createConfiguration();
validateConfiguration(config);

@Module({
  imports: [
    // Database connection with simplified settings
    MongooseModule.forRoot(config.database.uri, {
      maxPoolSize: config.database.options.maxPoolSize,
      serverSelectionTimeoutMS:
        config.database.options.serverSelectionTimeoutMS,
      socketTimeoutMS: config.database.options.socketTimeoutMS,
      connectTimeoutMS: config.database.options.connectTimeoutMS,
      retryWrites: config.database.options.retryWrites,
    }),

    // Application modules
    RabbitMQModule,
    SignalsModule,
    ProducerModule,
    HealthModule,
  ],
  providers: [
    // Global exception filter for centralized error handling
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // Global logging interceptor for request/response logging
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
  constructor() {
    const logger = new Logger("AppModule");

    // Log application startup configuration
    logger.log("🚀 IoT Data Management System starting...");
    logger.log(`📊 Environment: ${config.app.nodeEnv}`);
    logger.log(`🔌 Port: ${config.app.port}`);
    logger.log(
      `💾 Database: ${config.database.uri.split("@")[1] || "localhost"}`
    );
    logger.log(
      `📨 Message Queue: ${config.rabbitmq.url.split("@")[1] || "localhost"}`
    );

    if (config.app.nodeEnv === "production") {
      logger.log("⚠️  Running in PRODUCTION mode");
    }
  }
}
