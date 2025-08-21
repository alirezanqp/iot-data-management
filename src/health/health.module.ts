import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { RabbitMQModule } from "../rabbitmq/rabbitmq.module";

@Module({
  imports: [TerminusModule, MongooseModule, RabbitMQModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
