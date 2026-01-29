import { IsString, IsOptional, IsInt, IsArray, IsObject } from 'class-validator';

export class CreateDrillDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  ageGroup?: string;

  @IsInt()
  durationMinutes: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsObject()
  diagramJson?: any;
}

export class UpdateDrillDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  ageGroup?: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsObject()
  diagramJson?: any;
}
