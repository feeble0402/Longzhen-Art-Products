import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { PriceMode, SaleStatus } from '../../generated/prisma/enums';

export class CreateProductDto {
  @IsString()
  @Length(1, 64)
  sku!: string;

  @IsString()
  @Length(1, 160)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsString()
  @Length(1, 200)
  name!: string;

  @IsString()
  @Length(1, 500)
  shortDescription!: string;

  @IsString()
  @Length(1, 20000)
  description!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  categoryIds!: string[];

  @IsEnum(PriceMode)
  priceMode!: PriceMode;

  @IsOptional()
  @IsNumberString()
  publicPrice?: string;

  @IsOptional()
  @IsNumberString()
  originalPrice?: string;

  @IsOptional()
  @IsEnum(SaleStatus)
  saleStatus?: SaleStatus;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  shopeeUrl?: string;

  @IsOptional()
  @IsBoolean()
  acceptsShopee?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptsLine?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  lineInquiryTemplate?: string;

  @IsOptional()
  @IsBoolean()
  showOnHome?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  homeSortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;
}
