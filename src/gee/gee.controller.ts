import { Controller } from '@nestjs/common';
import { GeeService } from './gee.service';


type S2Body = {
  polygon: any;         // GeoJSON Polygon/MultiPolygon
  start: string;        // 'YYYY-MM-DD'
  end: string;          // 'YYYY-MM-DD'
  cloudPct?: number;    // 0~100
  cloudProb?: number;   // 0~100 (s2cloudless)
  bands?: string[];     // e.g., ['B4','B3','B2']
  scale?: number;       // 10, 20, ...
  crs?: string;         // 'EPSG:4326'
  filename?: string;    // base name
};

@Controller("gee")
export class GeeController {
  constructor(private readonly gee: GeeService) {}

}