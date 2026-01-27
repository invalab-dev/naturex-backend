import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AreaGroup {
  @IsNotEmpty()
  feature_id!: string; // feature.id 문자열 (TerraDraw id 등)

  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  visible!: boolean;

  // Feature<Polygon, Properties>
  feature!: any; // 엄밀히 하려면 타입 선언(geojson)을 추가
}

export class UpsertAreaGroupsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaGroup)
  items!: AreaGroup[];
}
