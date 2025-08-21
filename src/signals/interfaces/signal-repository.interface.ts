import { Signal } from "../signal.schema";
import { CreateSignalDto } from "../dto/create-signal.dto";
import { UpdateSignalDto } from "../dto/update-signal.dto";
import { FilterSignalDto } from "../dto/filter-signal.dto";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ISignalRepository {
  create(createSignalDto: CreateSignalDto): Promise<Signal>;
  findAll(filterDto?: FilterSignalDto): Promise<PaginatedResult<Signal>>;
  findById(id: string): Promise<Signal | null>;
  findByDeviceId(deviceId: string): Promise<Signal[]>;
  update(id: string, updateSignalDto: UpdateSignalDto): Promise<Signal | null>;
  delete(id: string): Promise<boolean>;
  getStatistics(): Promise<any>;
}
