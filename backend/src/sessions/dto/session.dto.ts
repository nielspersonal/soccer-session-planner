import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsInt()
  totalDuration: number;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsInt()
  totalDuration?: number;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddDrillToSessionDto {
  @IsInt()
  drillId: number;

  @IsOptional()
  @IsInt()
  durationOverride?: number;

  @IsOptional()
  @IsString()
  sessionNotes?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
