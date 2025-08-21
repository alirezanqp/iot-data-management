import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Signal, SignalDocument } from "../signal.schema";
import { CreateSignalDto } from "../dto/create-signal.dto";
import { UpdateSignalDto } from "../dto/update-signal.dto";
import { FilterSignalDto } from "../dto/filter-signal.dto";
import {
  ISignalRepository,
  PaginatedResult,
} from "../interfaces/signal-repository.interface";

@Injectable()
export class MongoSignalRepository implements ISignalRepository {
  private readonly logger = new Logger(MongoSignalRepository.name);

  constructor(
    @InjectModel(Signal.name) private signalModel: Model<SignalDocument>
  ) {}

  async create(createSignalDto: CreateSignalDto): Promise<Signal> {
    try {
      const createdSignal = new this.signalModel(createSignalDto);
      const result = await createdSignal.save();
      this.logger.log(`Signal created for device ${createSignalDto.deviceId}`);
      return result;
    } catch (error) {
      this.logger.error("Error creating signal:", error);
      throw error;
    }
  }

  async findAll(filterDto?: FilterSignalDto): Promise<PaginatedResult<Signal>> {
    try {
      const page = filterDto?.page || 1;
      const limit = filterDto?.limit || 10;
      const skip = (page - 1) * limit;

      // Build filter query
      const filter: any = {};

      if (filterDto?.deviceId) {
        filter.deviceId = filterDto.deviceId;
      }

      if (filterDto?.startDate || filterDto?.endDate) {
        filter.timestamp = {};
        if (filterDto.startDate) {
          filter.timestamp.$gte = new Date(filterDto.startDate);
        }
        if (filterDto.endDate) {
          filter.timestamp.$lte = new Date(filterDto.endDate);
        }
      }

      if (filterDto?.minDataLength || filterDto?.maxDataLength) {
        filter.dataLength = {};
        if (filterDto.minDataLength) {
          filter.dataLength.$gte = filterDto.minDataLength;
        }
        if (filterDto.maxDataLength) {
          filter.dataLength.$lte = filterDto.maxDataLength;
        }
      }

      const [data, total] = await Promise.all([
        this.signalModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ timestamp: -1 })
          .exec(),
        this.signalModel.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error("Error finding signals:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<Signal | null> {
    try {
      return await this.signalModel.findById(id).exec();
    } catch (error) {
      this.logger.error("Error finding signal by ID:", error);
      throw error;
    }
  }

  async findByDeviceId(deviceId: string): Promise<Signal[]> {
    try {
      return await this.signalModel
        .find({ deviceId })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      this.logger.error("Error finding signals by device:", error);
      throw error;
    }
  }

  async update(
    id: string,
    updateSignalDto: UpdateSignalDto
  ): Promise<Signal | null> {
    try {
      const updatedSignal = await this.signalModel
        .findByIdAndUpdate(id, updateSignalDto, { new: true })
        .exec();

      if (updatedSignal) {
        this.logger.log(`Signal ${id} updated`);
      }

      return updatedSignal;
    } catch (error) {
      this.logger.error("Error updating signal:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.signalModel.findByIdAndDelete(id).exec();
      if (result) {
        this.logger.log(`Signal ${id} deleted`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error("Error deleting signal:", error);
      throw error;
    }
  }

  async getStatistics(): Promise<any> {
    try {
      const stats = await this.signalModel
        .aggregate([
          {
            $group: {
              _id: "$deviceId",
              count: { $sum: 1 },
              avgDataLength: { $avg: "$dataLength" },
              totalDataVolume: { $sum: "$dataVolume" },
              lastSignal: { $max: "$timestamp" },
            },
          },
          {
            $sort: { count: -1 },
          },
        ])
        .exec();

      const totalSignals = await this.signalModel.countDocuments().exec();

      return {
        totalSignals,
        deviceStats: stats,
      };
    } catch (error) {
      this.logger.error("Error getting statistics:", error);
      throw error;
    }
  }
}
