import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;
}
