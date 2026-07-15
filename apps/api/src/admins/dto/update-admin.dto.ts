import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
