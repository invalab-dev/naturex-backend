import { IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpsertMetaDto {
  @IsNotEmpty()
  stage!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  input?: any;

  @IsOptional()
  output?: any;
}