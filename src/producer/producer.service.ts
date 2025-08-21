import { Injectable, Logger } from "@nestjs/common";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async sendSampleXRayData(): Promise<void> {
    const sampleData = this.generateSampleXRayData();
    await this.rabbitMQService.publishToXRayQueue(sampleData);
    this.logger.log("Sample X-Ray data sent to queue");
  }

  async sendCustomXRayData(
    deviceId: string,
    dataPoints: number = 5
  ): Promise<void> {
    const customData = this.generateCustomXRayData(deviceId, dataPoints);
    await this.rabbitMQService.publishToXRayQueue(customData);
    this.logger.log(
      `Custom X-Ray data sent for device ${deviceId} with ${dataPoints} data points`
    );
  }

  async sendMultipleDevicesData(
    deviceCount: number = 3,
    dataPointsPerDevice: number = 5
  ): Promise<void> {
    const multiDeviceData = this.generateMultiDeviceData(
      deviceCount,
      dataPointsPerDevice
    );
    await this.rabbitMQService.publishToXRayQueue(multiDeviceData);
    this.logger.log(`Multi-device X-Ray data sent for ${deviceCount} devices`);
  }

  private generateSampleXRayData(): any {
    // Based on the provided sample data structure
    const deviceId = "66bb584d4ae73e488c30a072";
    return {
      [deviceId]: {
        data: [
          [762, [51.339764, 12.339223833333334, 1.2038000000000002]],
          [1766, [51.33977733333333, 12.339211833333334, 1.531604]],
          [2763, [51.339782, 12.339196166666667, 2.13906]],
        ],
        time: Date.now(),
      },
    };
  }

  private generateCustomXRayData(deviceId: string, dataPoints: number): any {
    const data = [];
    let time = 762;

    for (let i = 0; i < dataPoints; i++) {
      const xCoord = 51.339764 + (Math.random() - 0.5) * 0.001;
      const yCoord = 12.339223833333334 + (Math.random() - 0.5) * 0.001;
      const speed = 1.0 + Math.random() * 2.0;

      data.push([time + i * 1000, [xCoord, yCoord, speed]]);
    }

    return {
      [deviceId]: {
        data,
        time: Date.now(),
      },
    };
  }

  private generateMultiDeviceData(
    deviceCount: number,
    dataPointsPerDevice: number
  ): any {
    const result = {};

    for (let d = 0; d < deviceCount; d++) {
      const deviceId = `device_${Date.now()}_${d}`;
      const data = [];
      let time = 762 + d * 100;

      for (let i = 0; i < dataPointsPerDevice; i++) {
        const baseX = 51.339764 + d * 0.01;
        const baseY = 12.339223833333334 + d * 0.01;

        const xCoord = baseX + (Math.random() - 0.5) * 0.002;
        const yCoord = baseY + (Math.random() - 0.5) * 0.002;
        const speed = 0.5 + Math.random() * 3.0;

        data.push([time + i * 1000, [xCoord, yCoord, speed]]);
      }

      result[deviceId] = {
        data,
        time: Date.now(),
      };
    }

    return result;
  }

  async startContinuousDataGeneration(
    intervalMs: number = 5000
  ): Promise<void> {
    this.logger.log(
      `Starting continuous data generation every ${intervalMs}ms`
    );

    setInterval(async () => {
      try {
        await this.sendMultipleDevicesData(2, 3);
      } catch (error) {
        this.logger.error("Error in continuous data generation:", error);
      }
    }, intervalMs);
  }
}
