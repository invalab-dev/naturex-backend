import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class GetProjectsQuery {
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    withMeta?: boolean = false;
}