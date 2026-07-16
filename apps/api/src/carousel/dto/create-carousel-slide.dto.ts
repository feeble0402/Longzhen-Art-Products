import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCarouselSlideDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  buttonLabel?: string | null;

  @IsOptional()
  @Transform(({ value }) => value === '' ? null : value)
  @Matches(/^(?:\/(?!\/)|https?:\/\/).+/)
  @MaxLength(2048)
  targetUrl?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === '' ? null : value)
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @Transform(({ value }) => value === '' ? null : value)
  @IsDateString()
  endsAt?: string | null;
}
