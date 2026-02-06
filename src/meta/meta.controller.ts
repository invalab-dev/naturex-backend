import { Controller, Get } from '@nestjs/common';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';
import { UserRole } from '../users/users.service.js';

@Controller('meta')
export class MetaController {
  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Get('project-themes')
  getProjectThemes() {
    // Keep BE enum values as source of truth; provide richer labels for FE.
    return [
      {
        value: '운영비 절감',
        label: '운영비 절감',
        description: '탄소배출권, 에너지 절감, 운영 효율화',
        examples: '탄소배출권 판매, 냉난방비 절감, 유지관리 효율화',
      },
      {
        value: '자산 가치 향상',
        label: '자산 가치 향상',
        description: 'ESG 평가, 부동산 가치, 브랜드 이미지',
        examples: 'ESG 등급 상승, 부동산 가치 증대, 기업 이미지 개선',
      },
      {
        value: '생물 다양성',
        label: '생물 다양성',
        description: '생태계 복원, 생물종 보전, NbS',
        examples: '서식지 복원, 종 다양성 증진, 자연기반해법 적용',
      },
    ] as const;
  }
}
