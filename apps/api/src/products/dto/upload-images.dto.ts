import { IsOptional, IsString } from 'class-validator';

export class UploadImagesDto {
  @IsOptional()
  @IsString({ each: true })
  altTexts?: string[] | string;
}
