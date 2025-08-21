export interface XRayDataPoint {
  time: number;
  coordinates: [number, number, number]; // [x, y, speed]
}

export interface XRayDeviceData {
  data: XRayDataPoint[];
  time: number; // timestamp
}

export interface XRayMessage {
  [deviceId: string]: XRayDeviceData;
}

export interface ProcessedSignalData {
  deviceId: string;
  timestamp: Date;
  dataLength: number;
  dataVolume: number;
  rawData: number[][];
}
