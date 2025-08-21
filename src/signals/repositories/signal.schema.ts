import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SignalDocument = Signal & Document;

@Schema({ timestamps: true })
export class Signal {
  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  dataLength: number;

  @Prop({ required: true })
  dataVolume: number;

  @Prop({ type: [[Number]], required: true })
  rawData: number[][];

  // Automatically added by @Schema({ timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const SignalSchema = SchemaFactory.createForClass(Signal);
