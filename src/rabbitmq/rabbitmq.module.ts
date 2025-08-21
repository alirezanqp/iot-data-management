import { Module } from "@nestjs/common";
import { RabbitMQService } from "./rabbitmq.service";
import { XRayConsumer } from "./xray.consumer";
import { RabbitMQAdapterService } from "./services/rabbitmq-adapter.service";
import { MESSAGE_QUEUE_TOKEN } from "./constants/tokens";
import { SignalsModule } from "../signals/signals.module";

@Module({
  imports: [SignalsModule],
  providers: [
    RabbitMQService,
    XRayConsumer,
    RabbitMQAdapterService,
    {
      provide: MESSAGE_QUEUE_TOKEN,
      useClass: RabbitMQAdapterService,
    },
  ],
  exports: [RabbitMQService, MESSAGE_QUEUE_TOKEN],
})
export class RabbitMQModule {}
