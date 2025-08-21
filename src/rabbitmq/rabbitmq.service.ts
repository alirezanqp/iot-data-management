import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from "@nestjs/common";
import { IMessageQueue } from "./interfaces/message-queue.interface";
import { RabbitMQAdapterService } from "./services/rabbitmq-adapter.service";
import { MESSAGE_QUEUE_TOKEN } from "./constants/tokens";
import { rabbitmqConfig } from "../common/config/rabbitmq.config";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly config = rabbitmqConfig();

  constructor(
    @Inject(MESSAGE_QUEUE_TOKEN) private readonly messageQueue: IMessageQueue
  ) {}

  async onModuleInit() {
    await this.messageQueue.connect();
  }

  async onModuleDestroy() {
    await this.messageQueue.disconnect();
  }

  async publishToXRayQueue(data: any): Promise<void> {
    try {
      await this.messageQueue.publishMessage(
        this.config.queues.xray.name,
        data
      );
    } catch (error) {
      this.logger.error("Failed to publish to X-Ray queue:", error);
      throw error;
    }
  }

  async consumeXRayQueue(
    callback: (data: any) => Promise<void>
  ): Promise<void> {
    try {
      await this.messageQueue.consumeMessages(
        this.config.queues.xray.name,
        callback
      );
    } catch (error) {
      this.logger.error("Failed to consume X-Ray queue:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.messageQueue.isConnected();
  }

  getChannel(): any {
    if (this.messageQueue instanceof RabbitMQAdapterService) {
      return this.messageQueue.getChannel();
    }
    return null;
  }
}
