import { Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";

export interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    rabbitmq: HealthCheck;
    memory: HealthCheck;
    disk?: HealthCheck;
  };
}

export interface HealthCheck {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  details?: any;
  error?: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly rabbitMQService: RabbitMQService
  ) {}

  async getHealthStatus(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRabbitMQ(),
      this.checkMemoryUsage(),
    ]);

    const [databaseCheck, rabbitmqCheck, memoryCheck] = checks.map((check) =>
      check.status === "fulfilled"
        ? check.value
        : this.createErrorCheck(check.reason)
    );

    const overallStatus = this.determineOverallStatus([
      databaseCheck,
      rabbitmqCheck,
      memoryCheck,
    ]);

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: databaseCheck,
        rabbitmq: rabbitmqCheck,
        memory: memoryCheck,
      },
    };

    const totalTime = Date.now() - startTime;
    this.logger.log(
      `Health check completed in ${totalTime}ms - Status: ${overallStatus}`
    );

    return result;
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      if (this.mongoConnection.readyState !== 1) {
        return {
          status: "down",
          responseTime: Date.now() - startTime,
          error: "Database connection is not ready",
          details: {
            readyState: this.mongoConnection.readyState,
            host: this.mongoConnection.host,
            port: this.mongoConnection.port,
          },
        };
      }

      // Perform a simple ping
      await this.mongoConnection.db.admin().ping();

      return {
        status: "up",
        responseTime: Date.now() - startTime,
        details: {
          readyState: this.mongoConnection.readyState,
          host: this.mongoConnection.host,
          port: this.mongoConnection.port,
          name: this.mongoConnection.name,
        },
      };
    } catch (error) {
      return {
        status: "down",
        responseTime: Date.now() - startTime,
        error: error.message,
        details: {
          readyState: this.mongoConnection.readyState,
        },
      };
    }
  }

  private async checkRabbitMQ(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const channel = this.rabbitMQService.getChannel();

      if (!channel) {
        return {
          status: "down",
          responseTime: Date.now() - startTime,
          error: "RabbitMQ channel is not available",
        };
      }

      // Check if channel is open
      if (channel.connection.connection.readyState !== "open") {
        return {
          status: "down",
          responseTime: Date.now() - startTime,
          error: "RabbitMQ connection is not open",
          details: {
            connectionState: channel.connection.connection.readyState,
          },
        };
      }

      return {
        status: "up",
        responseTime: Date.now() - startTime,
        details: {
          connectionState: channel.connection.connection.readyState,
        },
      };
    } catch (error) {
      return {
        status: "down",
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      // Consider memory unhealthy if usage is above 90%
      const status =
        memoryUsagePercent > 90
          ? "degraded"
          : memoryUsagePercent > 95
          ? "down"
          : "up";

      return {
        status,
        details: {
          heapUsed: Math.round(usedMemory / 1024 / 1024), // MB
          heapTotal: Math.round(totalMemory / 1024 / 1024), // MB
          usagePercent: Math.round(memoryUsagePercent * 100) / 100,
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        },
      };
    } catch (error) {
      return {
        status: "down",
        error: error.message,
      };
    }
  }

  private createErrorCheck(error: any): HealthCheck {
    return {
      status: "down",
      error: error?.message || "Unknown error",
    };
  }

  private determineOverallStatus(
    checks: HealthCheck[]
  ): "healthy" | "unhealthy" | "degraded" {
    const hasDown = checks.some((check) => check.status === "down");
    const hasDegraded = checks.some((check) => check.status === "degraded");

    if (hasDown) return "unhealthy";
    if (hasDegraded) return "degraded";
    return "healthy";
  }
}
