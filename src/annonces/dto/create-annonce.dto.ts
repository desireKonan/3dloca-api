import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAnnonceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  category?: string;
} 