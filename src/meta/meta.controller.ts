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
        value: 'efficiency',
        label: '운영비 절감',
        description: '유지관리 효율화, 에너지 절감, 비용 최적화',
        examples: '전력 사용 최적화, 냉난방비 절감, 운영 자동화',
      },
      {
        value: 'asset',
        label: '자산 가치 향상',
        description: 'ESG 평가, 자산 가치 정량화, 포트폴리오 우선순위',
        examples: '리모델링 우선순위, 자산 가치 분석, ESG 지표 개선',
      },
      {
        value: 'biodiversity',
        label: '생물다양성',
        description: '생태복원, 서식지 분석, TNFD 대응',
        examples: '서식지 분포 분석, 종 다양성 지표, 복원 모니터링',
      },
    ] as const;
  }
}
