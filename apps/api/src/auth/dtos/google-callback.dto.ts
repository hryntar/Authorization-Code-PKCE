import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleCallbackDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  codeVerifier?: string;
}
