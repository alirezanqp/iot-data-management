import { Injectable, Logger } from "@nestjs/common";
import * as amqp from "amqplib";
import { IMessageQueue } from "../interfaces/message-queue.interface";
import { rabbitmqConfig } from "../../common/config/rabbitmq.config";

@Injectable()
export class RabbitMQAdapterService implements IMessageQueue {
  private readonly logger = new Logger(RabbitMQAdapterService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly config = rabbitmqConfig();

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      // Assert exchanges first
      if (this.config.exchanges?.deadLetter) {
        await this.channel.assertExchange(
          this.config.exchanges.deadLetter.name,
          this.config.exchanges.deadLetter.type,
          this.config.exchanges.deadLetter.options
        );
      }

      // Assert queues
      await this.channel.assertQueue(
        this.config.queues.xray.name,
        this.config.queues.xray.options
      );
      await this.channel.assertQueue(
        this.config.queues.deadLetter.name,
        this.config.queues.deadLetter.options
      );

      // Set prefetch for consumer
      await this.channel.prefetch(this.config.queues.xray.consumer.prefetch);

      this.logger.log("Connected to RabbitMQ");

      // Handle connection events
      this.connection.on("error", (err) => {
        this.logger.error("RabbitMQ connection error:", err);
      });

      this.connection.on("close", () => {
        this.logger.warn("RabbitMQ connection closed");
      });
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log("Disconnected from RabbitMQ");
    } catch (error) {
      this.logger.error("Error disconnecting from RabbitMQ:", error);
    }
  }

  async publishMessage(queue: string, data: any): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error("RabbitMQ channel is not initialized");
      }

      const message = JSON.stringify(data);
      await this.channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true,
      });
      this.logger.log(`Message published to ${queue} queue`);
    } catch (error) {
      this.logger.error("Failed to publish message:", error);
      throw error;
    }
  }

  async consumeMessages(
    queue: string,
    callback: (data: any) => Promise<void>
  ): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error("RabbitMQ channel is not initialized");
      }

      await this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const data = JSON.parse(msg.content.toString());
              await callback(data);
              this.channel.ack(msg);
            } catch (error) {
              this.logger.error("Error processing message:", error);
              this.channel.nack(msg, false, false);
            }
          }
        },
        {
          noAck: this.config.queues.xray.consumer.noAck,
        }
      );

      this.logger.log(`Started consuming ${queue} queue`);
    } catch (error) {
      this.logger.error("Failed to start consuming:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return !!(
      this.connection &&
      !this.connection.closed &&
      this.channel &&
      !this.channel.closed
    );
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }
}
