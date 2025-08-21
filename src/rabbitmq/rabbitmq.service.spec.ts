import { Test, TestingModule } from "@nestjs/testing";
import { RabbitMQService } from "./rabbitmq.service";
import { IMessageQueue } from "./interfaces/message-queue.interface";
import { MESSAGE_QUEUE_TOKEN } from "./constants/tokens";

describe("RabbitMQService", () => {
  let service: RabbitMQService;
  let mockMessageQueue: jest.Mocked<IMessageQueue>;

  beforeEach(async () => {
    const mockQueue = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      publishMessage: jest.fn(),
      consumeMessages: jest.fn(),
      isConnected: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        {
          provide: MESSAGE_QUEUE_TOKEN,
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
    mockMessageQueue = module.get<IMessageQueue>(
      MESSAGE_QUEUE_TOKEN
    ) as jest.Mocked<IMessageQueue>;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("onModuleInit", () => {
    it("should connect to message queue", async () => {
      mockMessageQueue.connect.mockResolvedValue();

      await service.onModuleInit();

      expect(mockMessageQueue.connect).toHaveBeenCalled();
    });
  });

  describe("publishToXRayQueue", () => {
    it("should publish message to x-ray queue", async () => {
      const testData = { test: "data" };
      mockMessageQueue.publishMessage.mockResolvedValue();

      await service.publishToXRayQueue(testData);

      expect(mockMessageQueue.publishMessage).toHaveBeenCalledWith(
        "xray-data",
        testData
      );
    });
  });

  describe("consumeXRayQueue", () => {
    it("should start consuming x-ray queue", async () => {
      const callback = jest.fn();
      mockMessageQueue.consumeMessages.mockResolvedValue();

      await service.consumeXRayQueue(callback);

      expect(mockMessageQueue.consumeMessages).toHaveBeenCalledWith(
        "xray-data",
        callback
      );
    });
  });

  describe("onModuleDestroy", () => {
    it("should disconnect from message queue", async () => {
      mockMessageQueue.disconnect.mockResolvedValue();

      await service.onModuleDestroy();

      expect(mockMessageQueue.disconnect).toHaveBeenCalled();
    });
  });
});
