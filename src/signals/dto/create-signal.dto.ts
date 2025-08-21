import {
  IsString,
  IsDate,
  IsNumber,
  IsArray,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSignalDto {
  @ApiProperty({ description: "Device identifier" })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: "Timestamp of the signal" })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({ description: "Length of the data array" })
  @IsNumber()
  dataLength: number;

  @ApiProperty({ description: "Volume/size of the x-ray data" })
  @IsNumber()
  dataVolume: number;

  @ApiProperty({
    description: "Raw x-ray data points",
    type: "array",
    items: {
      type: "array",
      items: { type: "number" },
      example: [1, 2, 3],
    },
    example: [
      [1, 2, 3],
      [4, 5, 6],
    ],
  })
  @IsArray()
  rawData: number[][];
}
