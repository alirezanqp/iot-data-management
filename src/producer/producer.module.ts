import { Module } from "@nestjs/common";
import { RabbitMQModule } from "../rabbitmq/rabbitmq.module";
import { ProducerController } from "./producer.controller";
import { ProducerService } from "./producer.service";

@Module({
  imports: [RabbitMQModule],
  controllers: [ProducerController],
  providers: [ProducerService],
})
export class ProducerModule {}
