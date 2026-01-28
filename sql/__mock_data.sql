INSERT INTO organizations (id, name, type, size, website, status) VALUES
                                                                      (1, 'NatureX Lab', 'COMPANY', 'SMALL', 'https://naturex.example', 'ACTIVE'),
                                                                      (2, 'BlueRiver City Hall', 'PUBLIC', 'ENTERPRISE', 'https://blueriver.go.kr', 'ACTIVE'),
                                                                      (3, 'GreenSteps NGO', 'NGO', 'MEDIUM', 'https://greensteps.org', 'ACTIVE'),
                                                                      (4, 'Haneul Asset Management', 'COMPANY', 'MEDIUM', 'https://haneulam.example', 'INACTIVE'),
                                                                      (5, 'EcoPark Facilities', 'COMPANY', 'SMALL', 'https://ecoparkfac.example', 'ACTIVE'),
                                                                      (6, 'Sejong Research Institute', 'PUBLIC', 'MEDIUM', 'https://sri.example', 'ACTIVE'),
                                                                      (7, 'UrbanPulse Analytics', 'COMPANY', 'SMALL', 'https://urbanpulse.example', 'ACTIVE'),
                                                                      (8, 'Mirae BioDiversity Center', 'PUBLIC', 'MEDIUM', 'https://mbdc.example', 'ACTIVE'),
                                                                      (9, 'Solitary Consultant Office', 'COMPANY', 'SOLO', NULL, 'ACTIVE'),
                                                                      (10, 'Archived Demo Org', 'NGO', 'SMALL', 'https://archived-demo.example', 'ARCHIVED');

INSERT INTO users (id, email, password, role, name, phone_number, bio, organization_id, language, timezone) VALUES
                                                                                                                (1, 'admin@naturex.example', 'pw_hash_admin_01', ARRAY['ADMIN']::USER_ROLE[], '김관리', '010-1000-0001', '시스템 관리자', 1, 'ko', 'Asia/Seoul'),
                                                                                                                (2, 'pm@naturex.example', 'pw_hash_user_02', ARRAY['USER']::USER_ROLE[], '이프로', '010-1000-0002', '프로젝트 매니저', 1, 'ko', 'Asia/Seoul'),
                                                                                                                (3, 'analyst@urbanpulse.example', 'pw_hash_user_03', ARRAY['USER']::USER_ROLE[], '박분석', '010-1000-0003', '데이터 분석 담당', 7, 'ko', 'Asia/Seoul'),
                                                                                                                (4, 'field@ecoparkfac.example', 'pw_hash_user_04', ARRAY['USER']::USER_ROLE[], '최현장', '010-1000-0004', '현장 운영 담당', 5, 'ko', 'Asia/Seoul'),
                                                                                                                (5, 'ops@blueriver.go.kr', 'pw_hash_user_05', ARRAY['USER']::USER_ROLE[], '정운영', '010-1000-0005', '지자체 시설 운영', 2, 'ko', 'Asia/Seoul'),
                                                                                                                (6, 'planner@blueriver.go.kr', 'pw_hash_user_06', ARRAY['USER']::USER_ROLE[], '윤기획', '010-1000-0006', '정책/기획', 2, 'ko', 'Asia/Seoul'),
                                                                                                                (7, 'researcher@sri.example', 'pw_hash_user_07', ARRAY['USER']::USER_ROLE[], '오연구', '010-1000-0007', '연구 담당', 6, 'en', 'Asia/Seoul'),
                                                                                                                (8, 'bd@mbdc.example', 'pw_hash_user_08', ARRAY['USER']::USER_ROLE[], '한생태', '010-1000-0008', '생물다양성 센터', 8, 'ko', 'Asia/Seoul'),
                                                                                                                (9, 'volunteer@greensteps.org', 'pw_hash_user_09', ARRAY['USER']::USER_ROLE[], '서봉사', '010-1000-0009', 'NGO 자원봉사자', 3, 'ko', 'Asia/Seoul'),
                                                                                                                (10, 'lead@greensteps.org', 'pw_hash_user_10', ARRAY['USER']::USER_ROLE[], '문리드', '010-1000-0010', '캠페인 리드', 3, 'en', 'Asia/Seoul'),
                                                                                                                (11, 'asset@haneulam.example', 'pw_hash_user_11', ARRAY['USER']::USER_ROLE[], '배자산', '010-1000-0011', '자산 가치 개선 담당', 4, 'ko', 'Asia/Seoul'),
                                                                                                                (12, 'consultant@solo.example', 'pw_hash_user_12', ARRAY['USER']::USER_ROLE[], '장컨설턴트', '010-1000-0012', '1인 컨설팅', 9, 'ko', 'Asia/Seoul'),
                                                                                                                (13, 'qa@naturex.example', 'pw_hash_user_13', ARRAY['USER']::USER_ROLE[], '고테스트', '010-1000-0013', '품질/검증', 1, 'ko', 'Asia/Seoul'),
                                                                                                                (14, 'support@urbanpulse.example', 'pw_hash_user_14', ARRAY['USER']::USER_ROLE[], '신지원', '010-1000-0014', '고객 지원', 7, 'ko', 'Asia/Seoul'),
                                                                                                                (15, 'archived@archived-demo.example', 'pw_hash_user_15', ARRAY['USER']::USER_ROLE[], '폐기계정', '010-1000-0015', '아카이브 조직 사용자', 10, 'ko', 'Asia/Seoul');

INSERT INTO consents (user_id, notification_email, notification_sns, marketing_email, marketing_sns) VALUES
                                                                                                         (1, TRUE, TRUE, FALSE, FALSE),
                                                                                                         (2, TRUE, TRUE, TRUE, FALSE),
                                                                                                         (3, TRUE, FALSE, FALSE, FALSE),
                                                                                                         (4, TRUE, TRUE, FALSE, TRUE),
                                                                                                         (5, TRUE, TRUE, FALSE, FALSE),
                                                                                                         (6, FALSE, TRUE, FALSE, FALSE),
                                                                                                         (7, TRUE, FALSE, TRUE, TRUE),
                                                                                                         (8, TRUE, TRUE, FALSE, FALSE),
                                                                                                         (9, FALSE, FALSE, TRUE, FALSE),
                                                                                                         (10, TRUE, FALSE, FALSE, FALSE),
                                                                                                         (11, TRUE, TRUE, TRUE, TRUE),
                                                                                                         (12, FALSE, TRUE, FALSE, TRUE);

INSERT INTO projects (id, name, description, location, theme, organization_id, manager_id, current_status) VALUES
                                                                                                               (1, '시설 에너지 최적화 1차', '전력 사용 패턴 분석 기반 운영비 절감', '충북 청주 A캠퍼스', '운영비 절감', 2, 5, NULL),
                                                                                                               (2, '도시 공원 생물다양성 모니터링', '종 다양성 지표 수집·시각화', '세종 중앙공원', '생물 다양성', 8, 8, NULL),
                                                                                                               (3, '자산 가치 향상 리모델링 우선순위', '시설물 상태 점검 데이터를 기반으로 투자 우선순위 도출', '서울 강남 B빌딩', '자산 가치 향상', 4, 11, NULL),
                                                                                                               (4, '현장 민원 대응 자동화', '이메일/AI 문의 분류 및 응답 자동화', '대전 시청', '운영비 절감', 2, 6, NULL),
                                                                                                               (5, '녹지 관리 비용 절감', '잔디/관목 관리 주기 최적화', '인천 C공원', '운영비 절감', 5, 4, NULL),
                                                                                                               (6, '데이터 대시보드 PoC', '조직별 프로젝트 KPI 대시보드 구축', '원격(온라인)', '자산 가치 향상', 7, 3, NULL),
                                                                                                               (7, '유휴자산 활용 컨설팅', '유휴 공간 활용 시나리오 작성', '부산 D센터', '자산 가치 향상', 9, 12, NULL),
                                                                                                               (8, 'NGO 캠페인 성과 분석', '참여자 데이터 기반 성과 측정', '서울', '생물 다양성', 3, 10, NULL),
                                                                                                               (9, '시설 안전 점검 고도화', '보안/안전 관련 알림 체계 정비', '청주 산업단지', '운영비 절감', 1, 2, NULL),
                                                                                                               (10, '생태 데이터 표준화', '현장 수집 데이터 스키마 통합', '강원 E보호구역', '생물 다양성', 6, 7, NULL),
                                                                                                               (11, '에너지 절감 시뮬레이션', '설비 교체 시나리오별 비용 추정', '광주 F단지', '운영비 절감', 1, 13, NULL),
                                                                                                               (12, '아카이브 데모 프로젝트', '테스트/아카이브 용도', '테스트 지역', '운영비 절감', 10, 15, NULL);

INSERT INTO project_status_logs (id, project_id, changed_by, description, created_at) VALUES
                                                                                          (1, 1, 5, '요청 접수 및 범위 정의 완료', '2026-01-03 10:15:00+09'),
                                                                                          (2, 1, 2, '데이터 수집 채널 확정(전력계/EMS)', '2026-01-05 14:20:00+09'),
                                                                                          (3, 2, 8, '현장 조사 일정 수립 및 협업기관 확정', '2026-01-04 09:00:00+09'),
                                                                                          (4, 2, 8, '1차 샘플링 구간 선정 및 기준 합의', '2026-01-10 16:40:00+09'),
                                                                                          (5, 3, 11, '시설 점검 체크리스트 공유 및 검토', '2026-01-06 11:05:00+09'),
                                                                                          (6, 3, 11, '리모델링 후보군 1차 산출', '2026-01-12 18:10:00+09'),
                                                                                          (7, 4, 6, '문의 유형 정의 및 라벨링 규칙 작성', '2026-01-08 13:30:00+09'),
                                                                                          (8, 4, 14, '응답 템플릿 초안 작성(FAQ 포함)', '2026-01-14 09:25:00+09'),
                                                                                          (9, 5, 4, '유지관리 주기 데이터 정리 완료', '2026-01-07 15:00:00+09'),
                                                                                          (10, 6, 3, '대시보드 KPI 초안 합의', '2026-01-09 10:50:00+09'),
                                                                                          (11, 6, 3, '시각화 컴포넌트 PoC 완료', '2026-01-16 17:35:00+09'),
                                                                                          (12, 7, 12, '현장 인터뷰 진행 및 요구사항 수집', '2026-01-11 12:00:00+09'),
                                                                                          (13, 8, 10, '참여자 데이터 정제(중복 제거)', '2026-01-13 14:45:00+09'),
                                                                                          (14, 9, 2, '보안 알림 채널 정책 검토 시작', '2026-01-15 09:10:00+09'),
                                                                                          (15, 10, 7, '표준 스키마 v0.1 작성 및 공유', '2026-01-17 16:00:00+09');

UPDATE projects SET current_status = 1 where id = 1;
UPDATE projects SET current_status = 3 where id = 2;
UPDATE projects SET current_status = 6 where id = 3;
UPDATE projects SET current_status = 14 where id = 9;
UPDATE projects SET current_status = 15 where id = 10;

INSERT INTO questions (id, type, status, questioner_id, content, responder_id, respond, responded_at, created_at) VALUES
                                                                                                                      (1, 'AI', 'REGISTERED', 5, '운영비 절감 프로젝트에서 어떤 지표를 먼저 수집해야 하나요?', NULL, NULL, NULL, '2026-01-02 09:00:00+09'),
                                                                                                                      (2, 'EMAIL', 'CHECKING', 6, '프로젝트 안내 메일 템플릿에 필수 포함 항목이 있나요?', 14, NULL, NULL, '2026-01-03 11:20:00+09'),
                                                                                                                      (3, 'AI', 'RESPONDED', 2, '생물다양성 모니터링에서 데이터 표준을 어떻게 잡는 게 좋을까요?', 7, '관측 단위(종/개체/서식지)와 메타데이터(좌표/시간/관측자)를 먼저 고정하고, 수집 채널별 변환 규칙을 정의하는 것을 권장합니다.', '2026-01-04 17:10:00+09', '2026-01-04 16:40:00+09'),
                                                                                                                      (4, 'EMAIL', 'PENDING', 10, '캠페인 성과 보고서 목차 샘플을 받을 수 있을까요?', NULL, NULL, NULL, '2026-01-05 10:05:00+09'),
                                                                                                                      (5, 'AI', 'RESPONDED', 3, '대시보드 KPI는 어떤 기준으로 묶는 게 합리적인가요?', 3, '조직 관점(비용/가치/생태)과 프로젝트 단계 관점(요청/분석/제공/완료)을 교차 축으로 두고, 핵심지표는 5~7개로 제한하는 것이 좋습니다.', '2026-01-06 13:00:00+09', '2026-01-06 12:20:00+09'),
                                                                                                                      (6, 'EMAIL', 'REGISTERED', 4, '현장 공지용 안내문에 안전 수칙 문구를 넣어야 합니다. 예시가 있나요?', NULL, NULL, NULL, '2026-01-07 08:50:00+09'),
                                                                                                                      (7, 'AI', 'CHECKING', 11, '자산 가치 향상 과제에서 점검 항목 가중치는 어떻게 설정하죠?', 13, NULL, NULL, '2026-01-08 14:15:00+09'),
                                                                                                                      (8, 'AI', 'PENDING', 8, '종 다양성 지표로 Shannon 지수를 써도 되나요?', NULL, NULL, NULL, '2026-01-09 09:30:00+09'),
                                                                                                                      (9, 'EMAIL', 'RESPONDED', 14, '사용자 문의 응답 SLA를 어떻게 정의하면 좋을까요?', 14, '업무시간 내 1차 응답(예: 4시간), 24시간 내 해결/대안 제시 등 단계형 SLA로 정의하는 것을 권장합니다.', '2026-01-10 18:05:00+09', '2026-01-10 17:40:00+09'),
                                                                                                                      (10, 'AI', 'REGISTERED', 7, '표준 스키마 버전 관리 방식 추천해 주세요.', NULL, NULL, NULL, '2026-01-11 10:10:00+09'),
                                                                                                                      (11, 'EMAIL', 'CHECKING', 12, '컨설팅 결과물을 이메일로 전달할 때 첨부 구조를 추천해 주세요.', 2, NULL, NULL, '2026-01-12 15:55:00+09'),
                                                                                                                      (12, 'AI', 'RESPONDED', 1, '보안 알림은 기본 ON이 좋은가요?', 1, '보안/안전 성격의 알림은 사용자 보호 목적이므로 기본 ON이 일반적이며, 법/정책 고지와 수신거부(범위 제한) 정책을 함께 제공하는 것이 좋습니다.', '2026-01-13 11:45:00+09', '2026-01-13 11:20:00+09');
