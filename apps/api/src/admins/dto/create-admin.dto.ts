import { IsBoolean, IsEmail, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @Length(1, 100)
  displayName!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(200)
  password!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
