import { Injectable, NotFoundException, Logger, Inject } from "@nestjs/common";
import { CreateSignalDto } from "./dto/create-signal.dto";
import { UpdateSignalDto } from "./dto/update-signal.dto";
import { FilterSignalDto } from "./dto/filter-signal.dto";
import { Signal } from "./signal.schema";
import {
  ISignalRepository,
  PaginatedResult,
} from "./interfaces/signal-repository.interface";
import { SIGNAL_REPOSITORY_TOKEN } from "./constants/tokens";

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @Inject(SIGNAL_REPOSITORY_TOKEN)
    private readonly signalRepository: ISignalRepository
  ) {}

  async createSignal(createSignalDto: CreateSignalDto): Promise<Signal> {
    try {
      return await this.signalRepository.create(createSignalDto);
    } catch (error) {
      this.logger.error("Error creating signal:", error);
      throw error;
    }
  }

  async findAllSignals(
    filterDto?: FilterSignalDto
  ): Promise<PaginatedResult<Signal>> {
    try {
      return await this.signalRepository.findAll(filterDto);
    } catch (error) {
      this.logger.error("Error finding signals:", error);
      throw error;
    }
  }

  async findSignalById(id: string): Promise<Signal> {
    try {
      const signal = await this.signalRepository.findById(id);
      if (!signal) {
        throw new NotFoundException(`Signal with ID ${id} not found`);
      }
      return signal;
    } catch (error) {
      this.logger.error("Error finding signal by ID:", error);
      throw error;
    }
  }

  async updateSignal(
    id: string,
    updateSignalDto: UpdateSignalDto
  ): Promise<Signal> {
    try {
      const updatedSignal = await this.signalRepository.update(
        id,
        updateSignalDto
      );

      if (!updatedSignal) {
        throw new NotFoundException(`Signal with ID ${id} not found`);
      }

      return updatedSignal;
    } catch (error) {
      this.logger.error("Error updating signal:", error);
      throw error;
    }
  }

  async deleteSignal(id: string): Promise<void> {
    try {
      const deleted = await this.signalRepository.delete(id);
      if (!deleted) {
        throw new NotFoundException(`Signal with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error("Error deleting signal:", error);
      throw error;
    }
  }

  async getSignalsByDevice(deviceId: string): Promise<Signal[]> {
    try {
      return await this.signalRepository.findByDeviceId(deviceId);
    } catch (error) {
      this.logger.error("Error finding signals by device:", error);
      throw error;
    }
  }

  async getSignalsStatistics(): Promise<any> {
    try {
      return await this.signalRepository.getStatistics();
    } catch (error) {
      this.logger.error("Error getting statistics:", error);
      throw error;
    }
  }
}
