export interface IMessageQueue {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publishMessage(queue: string, data: any): Promise<void>;
  consumeMessages(
    queue: string,
    callback: (data: any) => Promise<void>
  ): Promise<void>;
  isConnected(): boolean;
}
