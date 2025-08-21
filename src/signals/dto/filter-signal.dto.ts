import { IsOptional, IsString, IsDateString, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterSignalDto {
  @ApiPropertyOptional({ description: "Filter by device ID" })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({ description: "Filter by start date (ISO string)" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "Filter by end date (ISO string)" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: "Minimum data length" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minDataLength?: number;

  @ApiPropertyOptional({ description: "Maximum data length" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDataLength?: number;

  @ApiPropertyOptional({
    description: "Page number for pagination",
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: "Number of items per page", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
