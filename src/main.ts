import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { createConfiguration } from "./common/config";

async function bootstrap() {
  // Load configuration
  const config = createConfiguration();

  const app = await NestFactory.create(AppModule);

  // Create logger instance
  const logger = new Logger("Bootstrap");

  // Global validation pipe with enhanced options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: config.app.nodeEnv === "production",
    })
  );

  // CORS configuration
  if (config.app.cors.enabled) {
    app.enableCors({
      origin: config.app.cors.origin,
      methods: config.app.cors.methods,
      allowedHeaders: config.app.cors.allowedHeaders,
      credentials: config.app.cors.credentials,
    });
  }

  // Swagger documentation
  if (config.app.swagger.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(config.app.swagger.title)
      .setDescription(config.app.swagger.description)
      .setVersion(config.app.swagger.version)
      .addTag("signals", "Signal data management")
      .addTag("producer", "IoT device simulation")
      .addTag("health", "System health monitoring")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(config.app.swagger.path, app, document, {
      customSiteTitle: "IoT Data Management API",
      customfavIcon: "/favicon.ico",
      customCss: ".swagger-ui .topbar { display: none }",
    });
  }

  // Graceful shutdown handlers
  process.on("SIGTERM", async () => {
    logger.log("🛑 SIGTERM received, shutting down gracefully...");
    await app.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.log("🛑 SIGINT received, shutting down gracefully...");
    await app.close();
    process.exit(0);
  });

  // Start the application
  await app.listen(config.app.port, config.app.host);

  logger.log("✅ Application started successfully!");
  logger.log(`🌐 Server: http://${config.app.host}:${config.app.port}`);

  if (config.app.swagger.enabled) {
    logger.log(
      `📚 API Documentation: http://${config.app.host}:${config.app.port}/${config.app.swagger.path}`
    );
  }

  if (config.app.healthCheck.enabled) {
    logger.log(
      `❤️  Health Check: http://${config.app.host}:${config.app.port}/${config.app.healthCheck.path}`
    );
  }
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error("❌ Failed to start application:", error);
  process.exit(1);
});
