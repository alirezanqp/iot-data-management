import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { SignalsService } from "./signals.service";
import { CreateSignalDto } from "./dto/create-signal.dto";
import { UpdateSignalDto } from "./dto/update-signal.dto";
import { FilterSignalDto } from "./dto/filter-signal.dto";

@ApiTags("signals")
@Controller("signals")
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new signal" })
  @ApiResponse({
    status: 201,
    description: "The signal has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad request." })
  async create(@Body() createSignalDto: CreateSignalDto) {
    return this.signalsService.createSignal(createSignalDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all signals with optional filtering" })
  @ApiResponse({ status: 200, description: "Return all signals." })
  @ApiQuery({
    name: "deviceId",
    required: false,
    description: "Filter by device ID",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Filter by start date",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "Filter by end date",
  })
  @ApiQuery({
    name: "minDataLength",
    required: false,
    description: "Minimum data length",
  })
  @ApiQuery({
    name: "maxDataLength",
    required: false,
    description: "Maximum data length",
  })
  @ApiQuery({ name: "page", required: false, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, description: "Items per page" })
  async findAll(@Query() filterDto: FilterSignalDto) {
    return this.signalsService.findAllSignals(filterDto);
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get signals statistics" })
  @ApiResponse({ status: 200, description: "Return signals statistics." })
  async getStatistics() {
    return this.signalsService.getSignalsStatistics();
  }

  @Get("device/:deviceId")
  @ApiOperation({ summary: "Get all signals for a specific device" })
  @ApiResponse({ status: 200, description: "Return signals for the device." })
  async findByDevice(@Param("deviceId") deviceId: string) {
    return this.signalsService.getSignalsByDevice(deviceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a signal by ID" })
  @ApiResponse({ status: 200, description: "Return the signal." })
  @ApiResponse({ status: 404, description: "Signal not found." })
  async findOne(@Param("id") id: string) {
    return this.signalsService.findSignalById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a signal" })
  @ApiResponse({
    status: 200,
    description: "The signal has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Signal not found." })
  async update(
    @Param("id") id: string,
    @Body() updateSignalDto: UpdateSignalDto
  ) {
    return this.signalsService.updateSignal(id, updateSignalDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a signal" })
  @ApiResponse({
    status: 204,
    description: "The signal has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Signal not found." })
  async remove(@Param("id") id: string) {
    return this.signalsService.deleteSignal(id);
  }
}
