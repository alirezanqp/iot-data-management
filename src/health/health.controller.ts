import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { HealthService, HealthCheckResult } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Get system health status" })
  @ApiResponse({
    status: 200,
    description: "System is healthy",
    schema: {
      example: {
        status: "healthy",
        timestamp: "2023-12-31T12:00:00.000Z",
        uptime: 3600,
        checks: {
          database: { status: "up", responseTime: 45 },
          rabbitmq: { status: "up", responseTime: 23 },
          memory: { status: "up", details: { usagePercent: 65 } },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: "System is unhealthy",
    schema: {
      example: {
        status: "unhealthy",
        timestamp: "2023-12-31T12:00:00.000Z",
        uptime: 3600,
        checks: {
          database: { status: "down", error: "Connection timeout" },
          rabbitmq: { status: "up", responseTime: 23 },
          memory: { status: "up", details: { usagePercent: 65 } },
        },
      },
    },
  })
  async getHealth(@Res() response: Response): Promise<void> {
    try {
      const healthStatus: HealthCheckResult =
        await this.healthService.getHealthStatus();

      // Set appropriate HTTP status based on health
      let httpStatus: number;
      switch (healthStatus.status) {
        case "healthy":
          httpStatus = HttpStatus.OK;
          break;
        case "degraded":
          httpStatus = HttpStatus.OK; // Still operational but with warnings
          break;
        case "unhealthy":
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          break;
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      response.status(httpStatus).json(healthStatus);
    } catch (error) {
      const errorResponse = {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        error: "Health check failed",
        details: error.message,
      };

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }

  @Get("ready")
  @ApiOperation({ summary: "Check if system is ready to serve traffic" })
  @ApiResponse({ status: 200, description: "System is ready" })
  @ApiResponse({ status: 503, description: "System is not ready" })
  async getReadiness(@Res() response: Response): Promise<void> {
    try {
      const healthStatus = await this.healthService.getHealthStatus();

      // System is ready if database and rabbitmq are up
      const isReady =
        healthStatus.checks.database.status === "up" &&
        healthStatus.checks.rabbitmq.status === "up";

      const readinessStatus = {
        ready: isReady,
        timestamp: new Date().toISOString(),
        checks: {
          database: healthStatus.checks.database.status,
          rabbitmq: healthStatus.checks.rabbitmq.status,
        },
      };

      const httpStatus = isReady
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;
      response.status(httpStatus).json(readinessStatus);
    } catch (error) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        ready: false,
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }

  @Get("live")
  @ApiOperation({ summary: "Check if system is alive (liveness probe)" })
  @ApiResponse({ status: 200, description: "System is alive" })
  async getLiveness(): Promise<{
    alive: boolean;
    timestamp: string;
    uptime: number;
  }> {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
