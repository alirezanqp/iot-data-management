import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { SignalsService } from "./signals.service";
import { ISignalRepository } from "./interfaces/signal-repository.interface";
import { SIGNAL_REPOSITORY_TOKEN } from "./constants/tokens";

describe("SignalsService", () => {
  let service: SignalsService;
  let mockRepository: jest.Mocked<ISignalRepository>;

  const mockSignal = {
    _id: "507f1f77bcf86cd799439011",
    deviceId: "device123",
    timestamp: new Date(),
    dataLength: 100,
    dataVolume: 1024,
    rawData: [
      [1, 2, 3],
      [4, 5, 6],
    ],
  };

  beforeEach(async () => {
    const mockSignalRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByDeviceId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getStatistics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: SIGNAL_REPOSITORY_TOKEN,
          useValue: mockSignalRepository,
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
    mockRepository = module.get<ISignalRepository>(
      SIGNAL_REPOSITORY_TOKEN
    ) as jest.Mocked<ISignalRepository>;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findSignalById", () => {
    it("should return a signal by id", async () => {
      mockRepository.findById.mockResolvedValue(mockSignal as any);

      const result = await service.findSignalById("507f1f77bcf86cd799439011");

      expect(result).toEqual(mockSignal);
      expect(mockRepository.findById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
    });

    it("should throw NotFoundException when signal not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.findSignalById("507f1f77bcf86cd799439011")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateSignal", () => {
    it("should update a signal", async () => {
      const updateDto = { dataLength: 200 };
      const updatedSignal = { ...mockSignal, dataLength: 200 };

      mockRepository.update.mockResolvedValue(updatedSignal as any);

      const result = await service.updateSignal(
        "507f1f77bcf86cd799439011",
        updateDto
      );

      expect(result).toEqual(updatedSignal);
      expect(mockRepository.update).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        updateDto
      );
    });

    it("should throw NotFoundException when signal not found", async () => {
      const updateDto = { dataLength: 200 };
      mockRepository.update.mockResolvedValue(null);

      await expect(
        service.updateSignal("507f1f77bcf86cd799439011", updateDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteSignal", () => {
    it("should delete a signal", async () => {
      mockRepository.delete.mockResolvedValue(true);

      await service.deleteSignal("507f1f77bcf86cd799439011");

      expect(mockRepository.delete).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
    });

    it("should throw NotFoundException when signal not found", async () => {
      mockRepository.delete.mockResolvedValue(false);

      await expect(
        service.deleteSignal("507f1f77bcf86cd799439011")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getSignalsByDevice", () => {
    it("should return signals for a specific device", async () => {
      const deviceSignals = [mockSignal];
      mockRepository.findByDeviceId.mockResolvedValue(deviceSignals as any);

      const result = await service.getSignalsByDevice("device123");

      expect(result).toEqual(deviceSignals);
      expect(mockRepository.findByDeviceId).toHaveBeenCalledWith("device123");
    });
  });
});
