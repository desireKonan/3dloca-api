import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class SearchAnnonceDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;
} 