import { Controller, Post, Body, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { ProducerService } from "./producer.service";

@ApiTags("producer")
@Controller("producer")
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post("sample")
  @ApiOperation({ summary: "Send sample X-Ray data to queue" })
  @ApiResponse({ status: 201, description: "Sample data sent successfully." })
  async sendSample() {
    await this.producerService.sendSampleXRayData();
    return { message: "Sample X-Ray data sent to queue" };
  }

  @Post("custom")
  @ApiOperation({ summary: "Send custom X-Ray data for a specific device" })
  @ApiResponse({ status: 201, description: "Custom data sent successfully." })
  @ApiQuery({
    name: "deviceId",
    required: true,
    description: "Device identifier",
  })
  @ApiQuery({
    name: "dataPoints",
    required: false,
    description: "Number of data points to generate",
    type: Number,
  })
  async sendCustom(
    @Query("deviceId") deviceId: string,
    @Query("dataPoints") dataPoints?: number
  ) {
    await this.producerService.sendCustomXRayData(deviceId, dataPoints);
    return {
      message: `Custom X-Ray data sent for device ${deviceId}`,
      dataPoints: dataPoints || 5,
    };
  }

  @Post("multi-device")
  @ApiOperation({ summary: "Send X-Ray data for multiple devices" })
  @ApiResponse({
    status: 201,
    description: "Multi-device data sent successfully.",
  })
  @ApiQuery({
    name: "deviceCount",
    required: false,
    description: "Number of devices",
    type: Number,
  })
  @ApiQuery({
    name: "dataPointsPerDevice",
    required: false,
    description: "Data points per device",
    type: Number,
  })
  async sendMultiDevice(
    @Query("deviceCount") deviceCount?: number,
    @Query("dataPointsPerDevice") dataPointsPerDevice?: number
  ) {
    await this.producerService.sendMultipleDevicesData(
      deviceCount,
      dataPointsPerDevice
    );
    return {
      message: "Multi-device X-Ray data sent to queue",
      deviceCount: deviceCount || 3,
      dataPointsPerDevice: dataPointsPerDevice || 5,
    };
  }

  @Post("start-continuous")
  @ApiOperation({ summary: "Start continuous data generation" })
  @ApiResponse({
    status: 201,
    description: "Continuous data generation started.",
  })
  @ApiQuery({
    name: "intervalMs",
    required: false,
    description: "Interval in milliseconds",
    type: Number,
  })
  async startContinuous(@Query("intervalMs") intervalMs?: number) {
    await this.producerService.startContinuousDataGeneration(intervalMs);
    return {
      message: "Continuous data generation started",
      interval: intervalMs || 5000,
    };
  }
}
