import { IsInt, IsOptional } from 'class-validator';

export class SegmentationDto {
  @IsInt()
  group: number;

  @IsOptional()
  @IsInt()
  subgroup?: number;

  @IsOptional()
  @IsInt()
  skill?: number;
}