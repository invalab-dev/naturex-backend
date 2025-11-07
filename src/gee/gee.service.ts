import { Injectable, OnModuleInit } from '@nestjs/common';
import * as ee from '@google/earthengine';

@Injectable()
export class GeeService implements OnModuleInit {

  async onModuleInit() {
    // const b64 = process.env.GEE_SA_KEY_B64!;
    // const json = Buffer.from(b64, 'base64').toString('utf-8');
    // const saKey = JSON.parse(json);
    //
    // // 계정 로그인
    // await new Promise<void>((resolve, reject) => {
    //   ee.data.authenticateViaPrivateKey(
    //     saKey,
    //     () => resolve(),
    //     (e: any) => reject(e),
    //   );
    // });
    //
    // // 프로젝트 연결
    // await new Promise<void>((resolve, reject) => {
    //   ee.initialize(
    //     null, // baseUrl (기본)
    //     null, // tileUrl (기본)
    //     () => resolve(),
    //     (e: any) => reject(e),
    //     process.env.GEE_PROJECT_ID, // Cloud Project
    //   );
    // });
  }

  // Sentinel-2 합성 이미지 만들기
  buildSentinel2Composite(params: {
    polygonGeoJSON: any;         // GeoJSON Polygon/MultiPolygon
    start: string;               // 'YYYY-MM-DD'
    end: string;                 // 'YYYY-MM-DD'
    cloudPct?: number;           // 장면 레벨 필터(기본 40)
    cloudProb?: number;          // s2cloudless 확률 임계(기본 40)
  }) {
    const { polygonGeoJSON, start, end, cloudPct = 40, cloudProb = 40 } = params;
    const roi = ee.Geometry(polygonGeoJSON); // GeoJSON 그대로 사용

    const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(roi)
      .filterDate(start, end)
      .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', cloudPct));

    // s2cloudless 조인 -> 구름 확률로 마스킹
    const cld = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
      .filterBounds(roi)
      .filterDate(start, end);

    const joined = ee.Join.saveFirst('cloud_prob').apply({
      primary: s2,
      secondary: cld,
      condition: ee.Filter.equals({
        leftField: 'system:index',
        rightField: 'system:index',
      }),
    });

    const masked = ee.ImageCollection(joined).map((img: any) => {
      const prob = ee.Image(img.get('cloud_prob')).select('probability');
      const isNotCloud = prob.lt(cloudProb);
      return ee.Image(img).updateMask(isNotCloud);
    });

    // 중앙값 합성 후 관심영역으로 clip
    return masked.median().clip(roi);
  }
}