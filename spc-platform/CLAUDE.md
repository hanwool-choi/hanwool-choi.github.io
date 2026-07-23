# SPC 오퍼레이션 플랫폼 — Web 프로토타입

대동 SPC 통합 오퍼레이션 플랫폼(장비·농작업·정밀농업·데이터)의 클릭 가능한 Web 프로토타입.
기능정의서 `../SPC 오퍼레이션 플랫폼 기능도출_v2.2.xlsx`(IA·권한·맵레이어) 기반. 외부 라이브러리 없이 순수 HTML/CSS/JS.

## 파일 구조
- `index.html` — 앱 셸. 자산은 `?v=DEPLOYVER` 캐시버스팅 (deploy 시 타임스탬프로 치환)
- `css/main.css` — 디자인 토큰 + 전체 스타일 (Pretendard, Daedong 레드 #E5352C, 다크 네이비 컨트롤)
- `js/data.js` — 모든 목데이터. **여기가 상태의 원천** (FIELDS·EQUIP·JOBS·PA_FIELDS·RENTALS·LAYERS·NOTIS 등)
- `js/map.js` — 통합 모니터링 맵 엔진 (SVG, 레이어, 실시간 마커 애니메이션, A-Motion 관제, 스냅샷). `MapView` 모듈
- `js/views.js` — 대시보드·농장·장비·작업 화면. `Views.{dashboard,farm,equip,work}`
- `js/views2.js` — 자재·정밀농업·재무·통계·시스템. `Views.{material,precision,finance,stats,system}`
- `js/charts.js` — SVG 차트 헬퍼 (`Charts.bars/line/donut/spark`)
- `js/app.js` — 라우터·역할전환·AI Agent·커맨드팔레트·알림팝업·토스트·모달·드로어. `App` 객체
- `server.js` — 무의존 정적 서버 (로컬 프리뷰용)
- `deploy.ps1` — GitHub Pages 배포 스크립트

## 실행 & 배포
- 로컬 프리뷰: `node server.js` → http://localhost:5173  (또는 index.html 직접 열기)
- **배포**: prototype 폴더에서 `powershell -ExecutionPolicy Bypass -File .\deploy.ps1 "커밋 메시지"`
  - pull → `C:\dev\hanwool-choi.github.io\spc-platform\`로 robocopy 미러 → 캐시버스팅 스탬프 → commit → push
  - 공개 URL: **https://hanwool-choi.github.io/spc-platform/**  (반영 1~2분)
  - 인증: PC의 Git Credential Manager (별도 로그인 불필요). 커밋 저자 hanwool-choi / daedongconnected@gmail.com

## 아키텍처 규칙
- **역할 4종** (App.role): SPC Admin / 법인 관리자(corp) / 개인 농민(farmer) / 대행 오퍼레이터(op). 우상단에서 전환. 권한은 `PERMS`/`permOf()`로 제어 — 메뉴 노출·버튼 활성화가 여기 종속
- **Single Map, Multi-Layer**: 지도는 통합 모니터링(map) 한 곳. 업무 화면은 `[맵에서 보기]` 딥링크(`App.go('map',{layers,focus,stop,amotion})`)로 호출. 레이어 LY-01~11
- **재해경보 싱크**: `FIELDS[].hazard`(정상/주의/경고)가 원천 → 대시보드 브리핑·필지목록·필지상세·통합맵(LY-11)·맵팝업이 공유
- **정밀농업 필지 싱크**: `PA_FIELDS`(필지별 토양/생육/처방) ↔ `PRECISION_REQ`(서비스 신청). 진단·처방 탭은 필지 선택 바로 조회
- 렌더는 문자열 템플릿 → innerHTML. 상태변경 후 `App.rerender()`(현재 뷰) 또는 `App.go()`(라우팅). 맵은 `render()` 재호출

## 검증 방식 (중요 — 이 환경 특성)
- 브라우저 패널이 hidden 상태라 **screenshot이 타임아웃**됨. 대신 `mcp__Claude_Browser__javascript_tool`로 DOM·상태 검증
- 표준 절차: `preview_start` → `navigate(force:true)`로 새로고침 → JS로 전 라우트 순회하며 `content.scrollWidth-clientWidth`(가로 overflow), `window.onerror`(JS 에러), 신규 기능 상태 확인
- 4개 역할 × 주요 화면 회귀를 매 배포 전 실행. 에러 0·overflow 0 확인 후 배포
- 애니메이션/트랜지션(0.3s) 도중 측정하면 좌표가 어긋나므로, 위치 검증은 트랜지션 비활성화 후 또는 충분히 대기 후 측정

## 현재 구현 상태 (v2.2 + 다수 추가)
장비 등록(바코드 스캔)·임대/배차 재설계, 작업유형 10종+대분류(일반/대행), 작업계획 모달(HX1400AI 선택 시 A-Motion 설정),
AI 영농일지·데이터 히스토리, 캘린더 양방향 연동, 농작업대행 통합매칭(Figma 관리자 web 반영),
재해경보(국립농업과학원 참조), 대시보드 AI 브리핑, AI Agent 선제알림(랜덤), A-Motion 관제 고도화(부하율·RPM·이벤트마커·복귀·4방향 루프캠 스냅샷),
알림센터 팝오버, 수확량 5×5 그리드맵. → 배포 히스토리는 git log 참조

## 하지 말 것
- 원본 소스는 이 폴더(`prototype/`). `C:\dev\hanwool-choi.github.io`는 배포 클론이므로 직접 수정하지 말 것
- 외부 CDN·라이브러리 추가 금지(오프라인/CSP). 이미지는 SVG 인라인 생성
