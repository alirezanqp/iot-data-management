import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { SignalsService } from '../signals/signals.service';
import { XRayMessage, ProcessedSignalData } from '../common/interfaces/message.interface';

@Injectable()
export class XRayConsumer implements OnModuleInit {
  private readonly logger = new Logger(XRayConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly signalsService: SignalsService,
  ) {}

  async onModuleInit() {
    // Wait a bit for RabbitMQ to be fully connected
    setTimeout(async () => {
      try {
        await this.startConsuming();
      } catch (error) {
        this.logger.error('Failed to start X-Ray consumer:', error);
      }
    }, 2000);
  }

  private async startConsuming() {
    try {
      // Check if RabbitMQ is connected
      if (!this.rabbitMQService.isConnected()) {
        throw new Error('RabbitMQ is not connected');
      }

      await this.rabbitMQService.consumeXRayQueue(async (data: XRayMessage) => {
        await this.processXRayData(data);
      });
      
      this.logger.log('Started consuming X-Ray data from queue');
    } catch (error) {
      this.logger.error('Failed to start consuming X-Ray queue:', error);
      throw error;
    }
  }

  private async processXRayData(xrayMessage: XRayMessage): Promise<void> {
    try {
      this.logger.log('Processing X-Ray data message');

      // Process each device's data in the message
      for (const [deviceId, deviceData] of Object.entries(xrayMessage)) {
        const processedData: ProcessedSignalData = {
          deviceId,
          timestamp: new Date(deviceData.time),
          dataLength: deviceData.data.length,
          dataVolume: this.calculateDataVolume(deviceData.data),
          rawData: deviceData.data.map(point => [
            point[0], // time
            point[1][0], // x-coordinate
            point[1][1], // y-coordinate
            point[1][2], // speed
          ]),
        };

        // Save to database
        await this.signalsService.createSignal(processedData);
        
        this.logger.log(`Processed signal for device ${deviceId} with ${processedData.dataLength} data points`);
      }
    } catch (error) {
      this.logger.error('Error processing X-Ray data:', error);
      throw error;
    }
  }

  private calculateDataVolume(data: any[]): number {
    // Calculate approximate data volume in bytes
    return JSON.stringify(data).length;
  }
}
