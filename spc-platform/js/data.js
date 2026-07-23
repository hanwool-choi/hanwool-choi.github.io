/* ============================================================
   SPC Operations Platform — Mock Data
   Source of truth: 'SPC 오퍼레이션 플랫폼 기능도출_v2.2' IA 시트
   ============================================================ */

/* 데모 기준일(단일 원천) — 시연 날짜 변경 시 여기만 수정하면 대시보드·캘린더·과거판정이 함께 갱신됨.
   내러티브(기상 '내일'·재해 eta·JOB 날짜)가 07월 하순에 맞춰져 있어 기본값은 2026-07-22로 고정. */
const DEMO_TODAY = { iso:'2026-07-22', md:'07.22', dow:'수', dom:22, ym:'2026년 7월' };
DEMO_TODAY.label = `${DEMO_TODAY.iso.replace(/-/g,'.')} (${DEMO_TODAY.dow})`;

const ROLES = [
  { id:'admin',  name:'김운영',  title:'SPC Admin',        org:'SPC 플랫폼운영팀', color:'#E5352C', initial:'S' },
  { id:'corp',   name:'박조합',  title:'법인 관리자',       org:'김제 농협 (B2B)',   color:'#2E6BE6', initial:'농' },
  { id:'farmer', name:'김철수',  title:'개인 농민',         org:'안들농장 (김제시)', color:'#0E9F5A', initial:'김' },
  { id:'op',     name:'이대행',  title:'대행 오퍼레이터',   org:'코코대행단',        color:'#6E56CF', initial:'대' },
];

/* 권한 매트릭스 (v2.1) — [admin, corp, farmer, op] / ● 관리 ○ 조회 △ 신청·제한 - 불가 */
const PERMS = {
  '1.1':'○○○○','1.2':'○○--',
  '2':'○○○○',
  '3':'●●●△',
  '4.1':'●●○-','4.2':'●●●-','4.3':'●●●-','4.4':'●●●-',
  '5.1':'●●●-','5.1.1':'●---','5.2':'●●●○','5.3':'●●△○','5.4':'●●●-','5.5':'●---','5.6':'●-△-',
  '6.1':'○○○○','6.2':'●●●○','6.3':'○○○○','6.4':'●●●○','6.5':'●●△●',
  '7.1':'●●●-','7.2':'●●●-',
  '8.1':'●●△-','8.2':'●○○-','8.3':'●○△-','8.4':'○○○-',
  '9':'-●●-',
  '10.1':'●○○-','10.2':'●●●-',
  '11.1':'●●△△','11.2':'●△--','11.3':'●△--','11.4':'●---','11.5':'●---',
};
function permOf(key, roleId){
  const idx = { admin:0, corp:1, farmer:2, op:3 }[roleId];
  // find most specific matching key
  let k = key;
  while (k && !(k in PERMS)) k = k.includes('.') ? k.slice(0, k.lastIndexOf('.')) : '';
  const s = PERMS[k] || '○○○○';
  return [...s][idx];
}

/* 메뉴 트리 (IA v2.1) — view: 라우트 키 */
const MENUS = [
  { no:'1', id:'dashboard', name:'홈 대시보드', icon:'home', perm:'1.1' },
  { no:'2', id:'map',       name:'통합 모니터링', icon:'map', perm:'2', badge:'LIVE' },
  { no:'4', id:'farm',      name:'농장관리', icon:'farm', perm:'4.2' },
  { no:'5', id:'equip',     name:'장비관리', icon:'tractor', perm:'5.2' },
  { no:'6', id:'work',      name:'작업관리', icon:'work', perm:'6.1' },
  { no:'7', id:'material',  name:'자재관리', icon:'box', perm:'7.1' },
  { no:'8', id:'precision', name:'정밀농업 솔루션', icon:'leaf', perm:'8.1' },
  { no:'9', id:'finance',   name:'재무관리', icon:'won', perm:'9' },
  { no:'10',id:'stats',     name:'통계/리포트', icon:'chart', perm:'10.1' },
  { no:'11',id:'system',    name:'시스템/운영 관리', icon:'gear', perm:'11.1' },
];

/* 커맨드 팔레트용 전체 기능 인덱스 (L3) */
const FUNCTIONS = [
  ['1.1.1','오늘의 농장 요약','홈 대시보드','dashboard'],['1.1.2','장비 상태 요약','홈 대시보드','dashboard'],
  ['1.1.3','KPI 위젯','홈 대시보드','dashboard'],['1.1.4','알림 센터','홈 대시보드','dashboard'],
  ['1.2.1','조직 운영 현황','홈 대시보드','dashboard'],['1.2.2','서비스 운영 현황','홈 대시보드','dashboard'],
  ['2.1.1','기본 맵 조회/탐색','통합 모니터링','map'],['2.1.2','레이어 컨트롤','통합 모니터링','map'],
  ['2.1.3','타임라인 탐색','통합 모니터링','map'],['2.1.4','맵 뷰 저장/공유','통합 모니터링','map'],
  ['2.2.1','장비 위치·상태 레이어','통합 모니터링','map'],['2.2.2','작업 진행 레이어','통합 모니터링','map'],
  ['2.2.3','A-Motion 관제 모드','통합 모니터링','map'],['2.3.1','작업기록 레이어','통합 모니터링','map'],
  ['2.3.2','주행경로 레이어','통합 모니터링','map'],['2.4.1','토양진단 맵 레이어','통합 모니터링','map'],
  ['2.4.2','생육진단 맵 레이어','통합 모니터링','map'],['2.4.3','수확량 맵 레이어','통합 모니터링','map'],
  ['2.4.4','처방맵(VRT) 레이어','통합 모니터링','map'],
  ['3.1.1','차량·작업 간편 조회','AI Agent','ai'],['3.1.2','자연어 통계 질의','AI Agent','ai'],
  ['3.2.1','영농 컨설팅','AI Agent','ai'],['3.2.2','보조금 정책 추천','AI Agent','ai'],
  ['3.2.3','AI 재해경보','AI Agent','ai'],['3.2.4','AI 병해충경보','AI Agent','ai'],['3.3.1','차량 유저매뉴얼 조회','AI Agent','ai'],
  ['4.1.1','고객정보 등록/조회','농장관리','farm'],['4.2.1','농장정보 등록/조회','농장관리','farm'],
  ['4.3.1','필지정보 등록/조회','농장관리','farm'],['4.4.1','경작지경계 생성','농장관리','farm'],['4.4.2','경작지정보 조회','농장관리','farm'],
  ['5.1.1','모델관리','장비관리','equip'],['5.1.2','차량등록','장비관리','equip'],['5.1.3','차량소유권 이전·권한공유','장비관리','equip'],
  ['5.1.4','차량데이터 공유','장비관리','equip'],['5.2.1','차량 현황 조회','장비관리','equip'],['5.2.2','소모품관리','장비관리','equip'],
  ['5.2.3','고장/수리관리','장비관리','equip'],['5.2.4','SOS관리','장비관리','equip'],['5.2.5','도난방지(Geofence)','장비관리','equip'],
  ['5.2.6','DEF 모니터링','장비관리','equip'],['5.2.7','원격 디스플레이 접근(RDA)','장비관리','equip'],['5.2.8','스마트원격진단','장비관리','equip'],
  ['5.2.9','부품/소모품 Shop','장비관리','equip'],['5.2.10','장비 성능 KPI','장비관리','equip'],['5.2.11','서비스 예약신청','장비관리','equip'],
  ['5.3.1','차량 임대 관리','장비관리','equip'],['5.3.2','차량 배차 관리','장비관리','equip'],['5.4.1','작업기정보 등록/조회','장비관리','equip'],
  ['5.5.1','단말기정보 등록/조회','장비관리','equip'],['5.6.1','FOTA 소프트웨어 관리','장비관리','equip'],
  ['6.1.1','작업현황 조회','작업관리','work'],['6.2.1','작업 캘린더','작업관리','work'],['6.2.2','A-Motion 작업 설정','작업관리','work'],
  ['6.2.3','AI 영농일지','작업관리','work'],
  ['6.3.1','작업결과 조회','작업관리','work'],['6.3.2','작업 데이터 히스토리','장비관리','equip'],
  ['6.4.1','자율주행 설정관리','작업관리','work'],['6.4.2','이상감지 이벤트 관리','작업관리','work'],
  ['6.4.3','제어권 이전관리','작업관리','work'],['6.5.1','대행 신청접수관리(AI OCR)','작업관리','work'],['6.5.2','대행현황관리','작업관리','work'],
  ['6.5.3','대행 정산관리','작업관리','work'],
  ['7.1.1','재료 등록/조회','자재관리','material'],['7.2.1','재고 등록/조회','자재관리','material'],
  ['8.1.1','서비스 신청접수 관리','정밀농업','precision'],['8.1.2','등록필지 조회','정밀농업','precision'],
  ['8.2.1','토양진단','정밀농업','precision'],['8.2.2','생육진단','정밀농업','precision'],['8.2.3','수확분석','정밀농업','precision'],
  ['8.3.1','시비처방(처방맵 생성)','정밀농업','precision'],['8.4.1','처방이력','정밀농업','precision'],['8.4.2','처방 성과분석','정밀농업','precision'],
  ['9.1.1','투입인원 등록/조회','재무관리','finance'],['9.2.1','투입자재 등록/조회','재무관리','finance'],
  ['9.3.1','투입장비 등록/조회','재무관리','finance'],['9.4.1','수익 등록/조회','재무관리','finance'],['9.5.1','손익 조회','재무관리','finance'],
  ['10.1.1','교차 통계 조회','통계/리포트','stats'],['10.2.1','표준 리포트 생성','통계/리포트','stats'],
  ['11.1.1','조직·구성원 관리','시스템 관리','system'],['11.2.1','역할별 권한 관리','시스템 관리','system'],
  ['11.3.1','공지·알림 발송 관리','시스템 관리','system'],['11.4.1','코드 관리','시스템 관리','system'],['11.5.1','외부 API 연계 모니터링','시스템 관리','system'],
];

/* ---------- 필지 (김제 부량면 신용리 일대 가상 좌표, viewBox 1200x800) ---------- */
function rectPoly(x,y,w,h,j=3){
  const r=(n)=>n+(Math.sin(x*y+n)*j);
  return [[r(x),r(y)],[r(x+w),r(y)+1],[x+w+Math.sin(y)*j, y+h],[x-Math.sin(x)*j, y+h-1]];
}
/* hazard(재해경보): 국립농업과학원 농업기상재해 조기경보서비스 참조 — 정상/주의/경고 */
const FIELDS = [
  { id:'GJ-R1', name:'안들 1',   poly:rectPoly(120, 70,150,150), area:1216, crop:'벼(신동진)', farm:'안들농장',  owner:'김철수', addr:'김제시 부량면 신용리 12',   tone:'#7FA96B', hazard:{level:'정상'} },
  { id:'GJ-R2', name:'안들 2',   poly:rectPoly(120,240,150,130), area:1216, crop:'벼(신동진)', farm:'안들농장',  owner:'김철수', addr:'김제시 부량면 신용리 12-1', tone:'#8FB377', hazard:{level:'정상'} },
  { id:'GJ-R3', name:'안들 3',   poly:rectPoly(120,390,150,160), area:1230, crop:'벼(참동진)', farm:'안들농장',  owner:'김철수', addr:'김제시 부량면 신용리 12-2', tone:'#6E9C5E', hazard:{level:'정상'} },
  { id:'GJ-R4', name:'윗배미',   poly:rectPoly(300, 90,140,190), area:987,  crop:'콩(대원)',   farm:'햇살농장',  owner:'이명희', addr:'김제시 부량면 신용리 18',   tone:'#A3B96F',
    hazard:{ level:'경고', type:'습해(지발성)', eta:'약 4일 후 (07.27경)', prob:82,
      detail:'최근 강우 누적과 배수 불량으로 콩(조생종) 생육기 습해가 예상됩니다. 근권부 산소 부족으로 뿌리 활력 저하·황화 우려.',
      action:'① 배수로 정비·명거배수 확보 ② 습해 예상 구역 요소 엽면시비 ③ 강우 예보 시 방제 일정 순연' } },
  { id:'GJ-R5', name:'아랫배미', poly:rectPoly(300,300,140,180), area:1054, crop:'벼(신동진)', farm:'햇살농장',  owner:'이명희', addr:'김제시 부량면 신용리 18-3', tone:'#7FA96B',
    hazard:{ level:'주의', type:'고온해(등숙기)', eta:'금주 후반', prob:54,
      detail:'일 최고기온 33℃ 이상 지속 시 등숙 불량·백수 우려가 있습니다.',
      action:'① 물 걸러대기로 지온 조절 ② 규산질 비료 시용으로 도복·고온 저항성 강화' } },
  { id:'GJ-R6', name:'모산들',   poly:rectPoly(300,500,140,170), area:1192, crop:'벼(신동진)', farm:'모산농장',  owner:'박민수', addr:'김제시 부량면 옥동리 6',    tone:'#88AE72', hazard:{level:'정상'} },
  { id:'GJ-R7', name:'사과과수원',poly:rectPoly(520,110,170,170), area:870,  crop:'사과(부사)', farm:'사과농장',  owner:'최정자', addr:'김제시 부량면 옥동리 21',   tone:'#5E8C52', hazard:{level:'정상'} },
  { id:'GJ-R8', name:'큰들',     poly:rectPoly(520,320,170,200), area:2210, crop:'벼(참동진)', farm:'큰들농장',  owner:'정대호', addr:'김제시 부량면 옥동리 33',   tone:'#79A465', hazard:{level:'정상'} },
  { id:'GJ-R9', name:'부식리들', poly:rectPoly(760,150,180,210), area:1875, crop:'밀(금강)',   farm:'부식농장',  owner:'한미경', addr:'김제시 부량면 부식리 8',    tone:'#B4AF6A',
    hazard:{ level:'주의', type:'붉은곰팡이병', eta:'개화기 강우 시', prob:47,
      detail:'출수·개화기 강우와 다습 조건에서 붉은곰팡이병(적미병) 발생 위험이 높아집니다.',
      action:'① 개화 초기 적기 방제(1주 간격 2회) ② 수확 후 조기 건조로 독소 축적 방지' } },
  { id:'GJ-R10',name:'옥산 대전',poly:rectPoly(760,400,180,230), area:2540, crop:'벼(신동진)', farm:'옥산농장',  owner:'서경수', addr:'김제시 부량면 옥산리 41',   tone:'#749F62', hazard:{level:'정상'} },
];
const HAZARD_META = { '정상':['chip-green','#0E9F5A'], '주의':['chip-amber','#DE9207'], '경고':['chip-red','#E5352C'] };

/* ---------- 장비 ---------- */
const EQUIP = [
  { id:'VH-001', model:'HX1400AI', type:'트랙터', nick:'HX1400 A-Motion 1호기', owner:'SPC 공용', status:'work', amotion:true,
    fuel:72, def:64, hours:1240, todayH:5.2, field:'GJ-R3', job:'JOB-104', speed:6.8, dtc:0, fw:'v2.4.1', tmu:'TMU-8812' },
  { id:'VH-002', model:'GX7510ATC', type:'트랙터', nick:'GX7510 (모델봉)', owner:'코코대행단', status:'work', amotion:false,
    fuel:58, def:71, hours:2107, todayH:4.1, field:'GJ-R8', job:'JOB-102', speed:7.4, dtc:0, fw:'v1.9.0', tmu:'TMU-5521' },
  { id:'VH-003', model:'DK6020', type:'트랙터', nick:'DK6020 (김철수)', owner:'김철수', status:'move', amotion:false,
    fuel:81, def:55, hours:864, todayH:1.8, field:'GJ-R10', job:null, speed:8.4, dtc:0, fw:'v1.7.2', tmu:'TMU-3308' },
  { id:'VH-004', model:'DSC85', type:'콤바인', nick:'DSC85 스마트콤바인', owner:'김제 농협', status:'idle', amotion:false,
    fuel:44, def:38, hours:655, todayH:0, field:null, job:null, speed:0, dtc:1, dtcCode:'P2263', fw:'v2.1.0', tmu:'TMU-7745' },
  { id:'VH-005', model:'DRP80', type:'이앙기', nick:'DRP80 이앙기', owner:'김제 농협', status:'idle', amotion:false,
    fuel:90, def:null, hours:311, todayH:0, field:null, job:null, speed:0, dtc:0, fw:'v1.2.4', tmu:'TMU-1130' },
  { id:'VH-006', model:'T25', type:'방제드론', nick:'방제드론 T25', owner:'SPC 공용', status:'maint', amotion:false,
    fuel:null, def:null, hours:207, todayH:0, field:null, job:null, speed:0, dtc:2, dtcCode:'E-041', fw:'v3.0.2', tmu:'TMU-9911' },
  { id:'VH-007', model:'DJI Agras T50', type:'방제드론', nick:'DJI 드론 T50', owner:'SPC 공용', status:'idle', amotion:false, brand:'DJI',
    fuel:88, def:null, hours:96, todayH:0, field:null, job:null, speed:0, dtc:0, fw:'v8.1.0', tmu:'TMU-2050' },
];
const EQUIP_STATUS = { work:['작업중','green'], move:['이동중','blue'], idle:['유휴','gray'], maint:['정비필요','red'] };

/* 작업기 */
const IMPLEMENTS = [
  { id:'IM-01', name:'로터리 WJ2000', type:'로터리', maker:'대동', linked:'VH-001', smart:true },
  { id:'IM-02', name:'가스케미칼 붐스프레이어', type:'살포기', maker:'3rd party', linked:'VH-002', smart:true },
  { id:'IM-03', name:'FJD 균평기 AL3', type:'균평기', maker:'FJD', linked:null, smart:true },
  { id:'IM-04', name:'Soiloptix 토양센서', type:'센서', maker:'Soiloptix', linked:null, smart:true },
  { id:'IM-05', name:'파종기 DS-8', type:'파종기', maker:'대동', linked:null, smart:false },
];

/* ---------- 작업 ----------
   cat: 대분류(일반/대행) · type: 작업유형 10종 · amotion: 자율작업 여부 */
const WORKTYPES = ['경운/정지','균평','토양진단','변량시비 맵','시비','이앙','파종','방제','생육진단','수확'];
const WT_CHIP = { '경운/정지':'chip-gray','균평':'chip-gray','토양진단':'chip-green','생육진단':'chip-green',
  '변량시비 맵':'chip-teal','시비':'chip-teal','이앙':'chip-blue','파종':'chip-blue','방제':'chip-amber','수확':'chip-gold' };
const JOBS = [
  { id:'JOB-101', name:'안들 1 경운(로터리)', cat:'대행', type:'경운/정지', status:'done',  field:'GJ-R1', veh:'VH-002', prog:100, date:'07.18', area:1216, team:'코코대행단', hours:3.4, fuel:31 },
  { id:'JOB-102', name:'큰들 방제(항공)', cat:'대행', type:'방제',   status:'run',   field:'GJ-R8', veh:'VH-002', prog:65,  date:'07.22', area:2210, team:'김재용 대행단', hours:2.1, fuel:18 },
  { id:'JOB-103', name:'윗배미 잡초 방제', cat:'일반', type:'방제',    status:'wait',  field:'GJ-R4', veh:'VH-003', prog:0,   date:'07.23', area:987,  team:null, hours:0, fuel:0 },
  { id:'JOB-104', name:'안들 3 심경 로터리', cat:'일반', type:'경운/정지', amotion:true, status:'run', field:'GJ-R3', veh:'VH-001', prog:42, date:'07.22', area:1230, team:null, hours:1.6, fuel:14, depth:'22cm', rows:14 },
  { id:'JOB-105', name:'아랫배미 시비(VRT)', cat:'대행', type:'시비', status:'wait', field:'GJ-R5', veh:'VH-005', prog:0,  date:'07.24', area:1054, team:'오씨대행단', hours:0, fuel:0, vrt:true },
  { id:'JOB-106', name:'부식리들 밀 수확', cat:'대행', type:'수확',  status:'issue', field:'GJ-R9', veh:'VH-004', prog:23, date:'07.21', area:1875, team:'소망대행단', hours:1.2, fuel:9, issue:'DTC P2263 — 요소수 품질 센서' },
  { id:'JOB-107', name:'모산들 생육진단(드론)', cat:'일반', type:'생육진단', status:'done',  field:'GJ-R6', veh:null,   prog:100, date:'07.20', area:1192, team:null, hours:0.8, fuel:0 },
];
const JOB_STATUS = { wait:['대기','gray'], run:['진행중','blue'], done:['완료','green'], issue:['이슈','red'] };

/* ---------- 농작업 대행 (Figma '관리자 web 대행단 매칭 26.06.22' 기반, 농가→필지 흐름) ---------- */
const CONTRACT = {
  id:'CT-2026-031', title:'2026년 봄 논 통합 대행 공고', period:'모집 2026.03.01 ~ 2026.05.31',
  region:'관할 김제시 부량면·백산면', crops:'경운·이앙·방제·수확', mgr:'관리 김제시 부량면·백산면',
  farms:24, priority:11, plots:16, totalPlots:78, doneRate:65, amount:8180000, expect:42180000, matched:'16/78필지',
};
/* 농가별 신청 필지 (매칭 대상) */
const AG_FARMERS = [
  { id:'F1', name:'김철수', age:68, gender:'남', tags:['65↑'], uid:'kc_chulsoo', phone:'010-1234-5678', date:'03.18', on:7, off:3, limit:10000,
    plots:[
      { pid:'P-01', name:'큰논',    addr:'부량면 신용리 123-4', area:2400, work:'경운/정지', st:'대기', src:'온', team:null,     price:7030000 },
      { pid:'P-02', name:'작은논',  addr:'부량면 신용리 125-1', area:1800, work:'방제',     st:'대기', src:'온', team:null,     price:5180000 },
      { pid:'P-03', name:'본가논',  addr:'부량면 신용리 200-2', area:3200, work:'방제',     st:'확정', src:'오', team:'김제2팀', price:9750000 },
      { pid:'P-04', name:'새터논',  addr:'부량면 신용리 318-7', area:4500, work:'방제',     st:'대기', src:'온', team:null,     price:14800000 },
      { pid:'P-05', name:'산뒤논',  addr:'백산면 봉월리 88',    area:1300, work:'방제',     st:'반려', src:'오', team:null,     price:0, memo:'중복 신청' },
      { pid:'P-06', name:'봉월 큰논', addr:'백산면 봉월리 102', area:2100, work:'방제',     st:'확정', src:'온', team:'김제2팀', price:6300000 },
      { pid:'P-07', name:'봉월 윗논', addr:'백산면 봉월리 150', area:1200, work:'방제',     st:'대기', src:'온', team:null,     price:3520000 },
      { pid:'P-08', name:'백산 본논', addr:'백산면 봉월리 180', area:1800, work:'수확',     st:'확정', src:'온', team:'김제2팀', price:5400000 },
    ]},
  { id:'F2', name:'이영희', age:72, gender:'여', tags:['65↑','여성'], uid:'lee_yh', phone:'010-9081-2231', date:'03.18', on:0, off:3, limit:8000,
    plots:[
      { pid:'P-11', name:'윗배미',  addr:'부량면 신용리 18',   area:1800, work:'방제', st:'대기', src:'오', team:null, price:5180000 },
      { pid:'P-12', name:'아랫배미', addr:'부량면 신용리 18-3', area:1054, work:'시비', st:'확정', src:'오', team:'김제1팀', price:2840000 },
      { pid:'P-13', name:'텃논',    addr:'부량면 신용리 19',   area:600,  work:'이앙', st:'대기', src:'오', team:null, price:1620000 },
    ]},
  { id:'F3', name:'박민수', age:58, gender:'남', tags:[], uid:'pms_58', phone:'010-3345-1120', date:'03.20', on:2, off:0, limit:6000,
    plots:[
      { pid:'P-21', name:'모산들',  addr:'부량면 옥동리 6',    area:1192, work:'경운/정지', st:'대기', src:'온', team:null, price:3260000 },
      { pid:'P-22', name:'옥동 큰밭', addr:'부량면 옥동리 8',  area:900,  work:'파종',     st:'확정', src:'온', team:'김제1팀', price:2430000 },
    ]},
  { id:'F4', name:'최정자', age:65, gender:'여', tags:['65↑','여성'], uid:'cjj_65', phone:'010-7788-4102', date:'03.21', on:0, off:2, limit:5000,
    plots:[
      { pid:'P-31', name:'사과과수원', addr:'부량면 옥동리 21', area:870, work:'방제', st:'대기', src:'오', team:null, price:2350000 },
      { pid:'P-32', name:'과수원 아랫밭', addr:'부량면 옥동리 22', area:450, work:'방제', st:'대기', src:'오', team:null, price:1210000 },
    ]},
  { id:'F5', name:'정대호', age:71, gender:'남', tags:['65↑','영세'], uid:'jdh_71', phone:'010-5512-0093', date:'03.22', on:2, off:0, limit:9000,
    plots:[
      { pid:'P-41', name:'큰들',   addr:'부량면 옥동리 33',   area:2210, work:'수확', st:'대기', src:'온', team:null, price:6630000 },
      { pid:'P-42', name:'큰들 남측', addr:'부량면 옥동리 34', area:1100, work:'수확', st:'반려', src:'온', team:null, price:0, memo:'경계 미등록' },
    ]},
];
const AGENT_TEAMS = [
  { id:'T1', name:'코코대행단', lead:'담당 박OO · 010-1234-5678', plots:6, area:480, prog:33, state:'확인 대기', amount:540500,
    fields:[{n:'야옹농장',a:870,st:'대기'},{n:'사과농장',a:670,st:'진행중'},{n:'사과농장 2',a:670,st:'완료'}] },
  { id:'T2', name:'오씨대행단', lead:'담당 O10-2345-6789', plots:6, area:481, prog:65, state:'확인 완료', amount:544000,
    fields:[{n:'윤산농장',a:520,st:'진행중'},{n:'읍암농장',a:410,st:'완료'},{n:'부식농장',a:640,st:'대기'}] },
  { id:'T3', name:'소망대행단', lead:'담당 010-3456-7890', plots:4, area:270, prog:100, state:'보완 요청', amount:240000,
    fields:[{n:'별밭농장',a:500,st:'완료'},{n:'가월농장',a:900,st:'완료'}] },
];
const SETTLE_PLOTS = [
  { name:'사과농장', addr:'옥동리 12-3', area:1200, tag:'감액', work:'방제', amount:298600, cut:-20000, cutWhy:'북측 정부 구간의 배대상지(논두렁)로 확인되어 작업 제외(20평). 실제 작업한 면과 신청 면적에 차이 발생.' },
  { name:'튼튼농장', addr:'옥동리 12-5', area:600,  tag:'감액', work:'방제', amount:206000, cut:-10000, cutWhy:'진입로 미확보 구간 제외' },
  { name:'햇살농장', addr:'읍장면 8',    area:800,  tag:'정상', work:'수확', amount:162000, cut:0 },
  { name:'푸른농장', addr:'읍장 22',     area:500,  tag:'정상', work:'수확', amount:135000, cut:0 },
  { name:'가월농장', addr:'운산면 11-3', area:900,  tag:'정상', work:'방제', amount:243000, cut:0 },
  { name:'별밭농장', addr:'부서면 21',   area:550,  tag:'정상', work:'수확', amount:181000, cut:0 },
];

/* ---------- 자재 ---------- */
const MATERIALS = [
  { id:'MT-01', name:'신동진 종자', cat:'종자', spec:'20kg/포', price:48000, vendor:'국립종자원', stock:34, min:20, exp:'2027-02', loc:'창고 A-1' },
  { id:'MT-02', name:'맞춤형 21-17-17', cat:'비료', spec:'20kg/포', price:13200, vendor:'남해화학', stock:8, min:30, exp:'2028-05', loc:'창고 A-2' },
  { id:'MT-03', name:'가스케미칼 살균제 액제', cat:'농약', spec:'1,000mL', price:24500, vendor:'가스케미칼', stock:52, min:15, exp:'2026-09', loc:'약제고 B-1' },
  { id:'MT-04', name:'면세 경유', cat:'연료', spec:'L', price:1180, vendor:'농협주유소', stock:1250, min:500, exp:'-', loc:'유류탱크' },
  { id:'MT-05', name:'규산질 비료', cat:'비료', spec:'20kg/포', price:9800, vendor:'남해화학', stock:120, min:40, exp:'2029-01', loc:'창고 A-3' },
];
const STOCK_LOG = [
  { d:'07.21', item:'가스케미칼 살균제 액제', type:'출고', qty:-6, to:'JOB-102 큰들 방제' },
  { d:'07.20', item:'면세 경유', type:'출고', qty:-140, to:'VH-001 급유' },
  { d:'07.18', item:'맞춤형 21-17-17', type:'출고', qty:-22, to:'JOB-105 시비 준비' },
  { d:'07.15', item:'신동진 종자', type:'입고', qty:+20, to:'국립종자원 발주' },
];

/* ---------- 정밀농업 ---------- */
const PRECISION_REQ = [
  { id:'PA-2026-041', field:'GJ-R3', svc:'토양진단+처방', state:'진행', date:'07.02', pri:'상' },
  { id:'PA-2026-040', field:'GJ-R5', svc:'생육진단(드론)', state:'완료', date:'06.28', pri:'중' },
  { id:'PA-2026-039', field:'GJ-R8', svc:'수확모니터링', state:'신청', date:'06.25', pri:'중' },
  { id:'PA-2026-036', field:'GJ-R9', svc:'토양진단', state:'완료', date:'05.30', pri:'하' },
];
/* 타임라인 스탑 (통합 모니터링 시계열) */
const TIME_STOPS = [
  { id:'soil',    label:'토양진단', date:'04.02', layer:'LY-06' },
  { id:'growth1', label:'생육진단 ①', date:'05.18', layer:'LY-07' },
  { id:'growth2', label:'생육진단 ②', date:'06.28', layer:'LY-07' },
  { id:'vrt',     label:'처방맵', date:'07.05', layer:'LY-09' },
  { id:'harvest', label:'수확(예정)', date:'10월', layer:'LY-08', future:true },
];
/* 필지별 4x4 구역 값 (0~1 정규화) — soil: 유기물, ndvi, yield, vrt: 시비량 */
function zoneSeed(fi, li){ const v=[]; for(let i=0;i<16;i++){ v.push( (Math.sin(fi*7.3+i*2.1+li*3.7)+1)/2 ); } return v; }
const ZONES = {};
FIELDS.forEach((f,fi)=>{ ZONES[f.id]={ soil:zoneSeed(fi,1), ndvi:zoneSeed(fi,2), ndvi2:zoneSeed(fi,2).map(v=>Math.min(1,v*1.18+.06)), yield:zoneSeed(fi,3), vrt:zoneSeed(fi,1).map(v=>1-v) }; });

const SOIL_REPORT = { field:'GJ-R3', ph:5.8, om:23, p:86, k:0.62, si:118, date:'2026-04-02',
  rows:[['pH (산도)','5.8','6.0~6.5','낮음'],['유기물 (g/kg)','23','25~30','낮음'],['유효인산 (mg/kg)','86','80~120','적정'],['칼륨 (cmol+/kg)','0.62','0.50~0.60','높음'],['유효규산 (mg/kg)','118','157↑','낮음']] };
const VRT_PLAN = { field:'GJ-R3', mat:'맞춤형 21-17-17', avg:24.3, min:16, max:33, saving:12.4, date:'2026-07-05' };

/* 정밀농업 필지별 진단/처방 데이터 (PRECISION_REQ 신청 필지와 싱크) */
const PA_FIELDS = {
  'GJ-R3': { svc:'토양진단+처방', state:'진행',
    soil:{ date:'2026-04-02', avg:'미사질양토', rows:SOIL_REPORT.rows, note:'pH·유기물·규산 보정 필요. 규산질 비료 250kg/10a 시용 후 심경 로터리 권장' },
    growth:{ date:'2026-06-28', ndvi:0.68, note:'생육 균일, 병반 없음' },
    vrt:{ date:'2026-07-05', mat:'맞춤형 21-17-17', avg:24.3, min:16, max:33, saving:12.4, state:'적용 대기' },
    harvest:null },
  'GJ-R5': { svc:'생육진단(드론)', state:'완료',
    soil:{ date:'2026-04-05', avg:'양토', rows:[['pH (산도)','6.1','6.0~6.5','적정'],['유기물 (g/kg)','27','25~30','적정'],['유효인산 (mg/kg)','104','80~120','적정'],['칼륨 (cmol+/kg)','0.55','0.50~0.60','적정'],['유효규산 (mg/kg)','142','157↑','낮음']], note:'전반적으로 양호, 규산만 보충 권장' },
    growth:{ date:'2026-06-28', ndvi:0.71, note:'전회(05.18) 대비 +0.09 개선 · 남서측 병반 의심 2개소(배수 불량 추정)' },
    vrt:null, harvest:null },
  'GJ-R8': { svc:'수확모니터링', state:'신청',
    soil:null, growth:null, vrt:null, harvest:null, pending:true },
  'GJ-R9': { svc:'토양진단', state:'완료',
    soil:{ date:'2026-05-30', avg:'사양토', rows:[['pH (산도)','5.5','6.0~6.5','낮음'],['유기물 (g/kg)','19','25~30','낮음'],['유효인산 (mg/kg)','72','80~120','낮음'],['칼륨 (cmol+/kg)','0.48','0.50~0.60','낮음'],['유효규산 (mg/kg)','95','157↑','낮음']], note:'전반적 양분 부족 — 유기물·인산·규산 보충 및 석회 시용으로 산도 교정 필요' },
    growth:null, vrt:null, harvest:null },
};
/* A-Motion 관제 상세 (JOB-104 / HX1400AI) */
const AMOTION_DETAIL = {
  worker:'김철수 (원격 감독)', impl:'로터리 WJ2000 (ISOBUS)', runTime:'01:38', fuel:72, load:74, rpm:1980,
  events:[ {t:'14:22', type:'장애물 감지', act:'자동 정지·재개', x:0.42, y:0.55}, {t:'13:05', type:'가이드라인 이탈 8cm', act:'RTK 자동 보정', x:0.7, y:0.3} ],
};

/* ---------- 재무 ---------- */
const FIN = {
  labor:[ {who:'김철수(본인)', role:'기계작업', h:86, cost:0}, {who:'외주 오퍼레이터 2명', role:'수확 보조', h:34, cost:1360000}, {who:'일용 인부 3명', role:'물꼬·예초', h:52, cost:1560000} ],
  mat:[ {name:'맞춤형 비료', qty:'44포', cost:580800},{name:'살균제·살충제', qty:'12병', cost:294000},{name:'면세 경유', qty:'620L', cost:731600},{name:'종자(신동진)', qty:'14포', cost:672000} ],
  equip:[ {name:'HX1400AI (임대)', h:28, cost:1400000},{name:'DK6020 (보유)', h:96, cost:820000},{name:'콤바인 임대', h:12, cost:960000} ],
  rev:[ {name:'벼 판매(신동진)', qty:'32.4톤', amt:22680000},{name:'밀 판매', qty:'8.1톤', amt:4860000},{name:'농작업 대행 수익', qty:'6건', amt:3120000} ],
};

/* ---------- 통계 ---------- */
const STAT_MONTHLY = { labels:['2월','3월','4월','5월','6월','7월'], work:[12,38,86,142,120,96], fuel:[140,290,760,1240,980,820] };
const STAT_BENCH = [
  { name:'안들 3', v:612, max:650, color:'#0E9F5A' },
  { name:'큰들', v:588, max:650, color:'#2E6BE6' },
  { name:'옥산 대전', v:531, max:650, color:'#6E56CF' },
  { name:'부식리들', v:487, max:650, color:'#DE9207' },
  { name:'윗배미', v:402, max:650, color:'#8B94A3' },
];

/* ---------- 알림 ---------- */
const NOTIS = [
  { t:'긴급', icon:'sos', color:'red', title:'DSC85 콤바인 DTC 발생 (P2263)', sub:'요소수 품질 센서 이상 — 서비스 예약을 권장합니다', time:'09:12', unread:true, link:'equip' },
  { t:'기상', icon:'rain', color:'amber', title:'호우주의보 예비특보 (김제시)', sub:'내일 06시 이후 시간당 20mm — 방제 작업 일정 조정 검토', time:'08:40', unread:true, link:'work' },
  { t:'A-Motion', icon:'bot', color:'purple', title:'HX1400 1호기 자율작업 42% 진행', sub:'안들 3 심경 로터리 — 이상감지 0건', time:'08:22', unread:false, link:'map' },
  { t:'정비', icon:'wrench', color:'blue', title:'GX7510 엔진오일 잔여수명 8%', sub:'교체 주기 도래 — 부품 Shop에서 바로 주문 가능', time:'어제', unread:false, link:'equip' },
  { t:'정책', icon:'doc', color:'green', title:'2026 농기계 임대료 지원사업 공고', sub:'내 필지 조건 부합 — AI 추천 신청 대상', time:'어제', unread:false, link:'ai' },
];

/* ---------- 기상 ---------- */
const WEATHER = { temp:27, desc:'구름 조금', hum:68, wind:2.4, rain:'내일 새벽 20mm', days:[['수','27°'],['목','24°☔'],['금','26°'],['토','29°'],['일','30°']] };

/* ---------- 고객/조직 ---------- */
const CUSTOMERS = [
  { name:'김철수', ph:'010-2211-8890', farms:'안들농장', plots:3, equip:2, share:'농협·SPC', since:'2024.03' },
  { name:'이명희', ph:'010-9081-2231', farms:'햇살농장', plots:2, equip:1, share:'농협', since:'2024.11' },
  { name:'박민수', ph:'010-3345-1120', farms:'모산농장', plots:1, equip:1, share:'-', since:'2025.02' },
  { name:'최정자', ph:'010-7788-4102', farms:'사과농장', plots:1, equip:0, share:'SPC', since:'2025.06' },
  { name:'정대호', ph:'010-5512-0093', farms:'큰들농장', plots:1, equip:2, share:'농협·SPC', since:'2023.12' },
  { name:'한미경', ph:'010-1249-7761', farms:'부식농장', plots:1, equip:0, share:'-', since:'2026.01' },
  { name:'서경수', ph:'010-8890-3324', farms:'옥산농장', plots:1, equip:1, share:'농협', since:'2025.09' },
];
const ORG_MEMBERS = [
  { name:'박조합', role:'법인 관리자', org:'김제 농협', state:'활성' },
  { name:'윤지도', role:'지도사(조회)', org:'김제 농협', state:'활성' },
  { name:'이대행', role:'대행 오퍼레이터', org:'코코대행단', state:'활성' },
  { name:'조수리', role:'정비사(공유)', org:'김제 대리점', state:'초대 대기' },
];
const API_LINKS = [
  { name:'농진청 병해충 예측 API', state:'정상', latency:'420ms', last:'1분 전' },
  { name:'기상청 동네예보 API', state:'정상', latency:'180ms', last:'2분 전' },
  { name:'흙토람 토양환경 API', state:'지연', latency:'2,340ms', last:'12분 전' },
  { name:'A-Motion 관제 스트림', state:'정상', latency:'95ms', last:'실시간' },
];

/* 맵 레이어 정의 (v2.1 맵레이어 정의 시트) */
const LAYERS = [
  { id:'LY-01', name:'장비 위치·상태', group:'실시간', color:'#E5352C', icon:'tractor', refresh:'실시간', on:true },
  { id:'LY-02', name:'작업 진행(커버리지)', group:'실시간', color:'#2E6BE6', icon:'work', refresh:'준실시간', on:true },
  { id:'LY-03', name:'A-Motion 관제', group:'실시간', color:'#6E56CF', icon:'bot', refresh:'실시간', on:false },
  { id:'LY-04', name:'작업기록 (As-Applied)', group:'기록', color:'#DE9207', icon:'layers', refresh:'배치', on:false },
  { id:'LY-05', name:'주행경로 이력', group:'기록', color:'#8B94A3', icon:'route', refresh:'배치', on:false },
  { id:'LY-06', name:'토양진단 맵', group:'정밀농업', color:'#9C6B3F', icon:'leaf', refresh:'진단 시', on:false, timeline:true },
  { id:'LY-07', name:'생육진단 맵 (NDVI)', group:'정밀농업', color:'#0E9F5A', icon:'leaf', refresh:'촬영 시', on:false, timeline:true },
  { id:'LY-08', name:'수확량 맵', group:'정밀농업', color:'#C7A008', icon:'chart', refresh:'수확 시', on:false, timeline:true },
  { id:'LY-09', name:'처방맵 (VRT)', group:'정밀농업', color:'#1F9E8B', icon:'doc', refresh:'처방 시', on:false, timeline:true },
  { id:'LY-11', name:'AI 재해경보', group:'정밀농업', color:'#E5352C', icon:'sos', refresh:'조기경보', on:false },
  { id:'LY-10', name:'경작지 경계', group:'기준정보', color:'#CBD3DC', icon:'map', refresh:'수시', on:true },
];
const LAYER_PRESETS = {
  admin:  { label:'운영 전체', on:['LY-01','LY-02','LY-03','LY-10'] },
  corp:   { label:'조직 전체', on:['LY-01','LY-02','LY-10'] },
  farmer: { label:'내 농장', on:['LY-01','LY-02','LY-10'] },
  op:     { label:'배정 작업', on:['LY-01','LY-02','LY-10'] },
};

/* ============================================================
   v2.2 신규 데이터
   ============================================================ */

/* 6.3.2 작업 데이터 히스토리 — 차량별/작업기별 운행·작업 데이터 시계열 */
const WORK_HISTORY = {
  'VH-001': [
    { date:'2026-07-22', job:'안들 3 심경 로터리', impl:'로터리 WJ2000', hours:1.6, area:520, fuel:14, avgSpeed:6.8, depth:'22cm', src:'A-Motion' },
    { date:'2026-05-28', job:'안들 2 로터리', impl:'로터리 WJ2000', hours:3.1, area:1216, fuel:19, avgSpeed:7.1, depth:'18cm', src:'수동' },
    { date:'2026-05-14', job:'안들 1 균평', impl:'FJD 균평기 AL3', hours:2.4, area:1216, fuel:16, avgSpeed:5.2, depth:'-', src:'수동' },
    { date:'2026-04-08', job:'안들 3 경운(과거등록)', impl:'로터리 WJ2000', hours:2.8, area:1230, fuel:21, avgSpeed:6.4, depth:'20cm', src:'과거 등록' },
  ],
  'VH-002': [
    { date:'2026-07-22', job:'큰들 방제(항공)', impl:'붐스프레이어', hours:2.1, area:2210, fuel:18, avgSpeed:7.4, depth:'-', src:'대행' },
    { date:'2026-07-18', job:'안들 1 로터리', impl:'로터리 WJ2000', hours:3.4, area:1216, fuel:31, avgSpeed:6.9, depth:'19cm', src:'대행' },
    { date:'2026-06-30', job:'옥산 대전 방제', impl:'붐스프레이어', hours:2.9, area:2540, fuel:24, avgSpeed:7.8, depth:'-', src:'대행' },
  ],
  'VH-004': [
    { date:'2025-10-18', job:'큰들 벼 수확', impl:'-', hours:4.2, area:2210, fuel:38, avgSpeed:4.1, depth:'-', src:'수동', yield:'563kg/10a' },
    { date:'2025-10-05', job:'안들 3 벼 수확', impl:'-', hours:2.6, area:1230, fuel:22, avgSpeed:4.4, depth:'-', src:'수동', yield:'541kg/10a' },
  ],
};

/* 6.2.3 AI 영농일지 — 작업 완료 시 자동 작성된 샘플 */
const FARM_DIARY = {
  'JOB-101': {
    title:'안들 1 로터리 작업 영농일지', date:'2026-07-18', field:'GJ-R1', area:1216,
    weather:'맑음 · 28℃ · 습도 61% · 남서풍 2.1m/s',
    veh:'GX7510ATC (모델봉)', impl:'로터리 WJ2000', team:'코코대행단',
    body:'2026년 7월 18일, 안들 1 필지(1,216평)에서 로터리 경운 작업을 수행했습니다. 작업 시작 08:12, 종료 11:36으로 총 3시간 24분이 소요되었으며, 평균 작업속도 6.9km/h, 경심 19cm로 균일하게 진행되었습니다. 연료 31L를 사용했고 이는 전회 동일 작업 대비 5% 절감된 수치입니다. 필지 남서측 배수로 인접 구간에서 토양 함수율이 다소 높아 작업속도를 일시 낮췄으나 전반적으로 이상 없이 완료되었습니다.',
    mat:[['면세 경유','31L'],['-','-']],
    photos:['작업 전 (BEFORE)','작업 후 (AFTER)'],
    kpi:[['작업면적','1,216평'],['작업시간','3시간 24분'],['평균속도','6.9km/h'],['연료','31L (-5%)']],
  },
};

/* 6.5.1 오프라인 접수 AI OCR — 스캔 서류에서 추출된 필드 */
const OCR_EXTRACT = {
  doc:'농작업대행 신청서 (수기 작성본)',
  confidence:96,
  fields:[
    ['신청인 성명','정순금','98%'],
    ['연락처','010-3341-88##','92%'],
    ['필지 주소','김제시 부량면 옥동리 145','95%'],
    ['면적(평)','1,100','97%'],
    ['희망 작업','방제 (항공)','99%'],
    ['희망 시기','2026-06-08 ~ 06-12','94%'],
  ],
};

/* 5.3 임대 현황 — vehId → 임대 정보 (due: 만기일, D-day 계산 기준 오늘 2026-07-23) */
const RENTALS = {
  'VH-001': { state:'임대중', to:'안들농장 (개인)', mgr:'김철수', phone:'010-2211-8890', period:'2026.07.10 ~ 08.10', due:'2026-08-10' },
  'VH-004': { state:'예약',   to:'김제 농협',       mgr:'박조합', phone:'010-1234-5678', period:'2026.10월 수확기 (3건)', due:'2026-10-01' },
  'VH-007': { state:'임대중', to:'한울영농조합 (B2B)', mgr:'최한울', phone:'010-7788-2050', period:'2026.06.26 ~ 07.26', due:'2026-07-26' },
};

/* 5.1.2 차량등록 — 3rd party 브랜드/기기 카탈로그 */
const REGISTER_BRANDS = [
  { name:'대동 (자사)', type:'트랙터·콤바인·이앙기', icon:'tractor', tone:'#E5352C' },
  { name:'타 브랜드 농기계', type:'국내외 제조사 트랙터 등', icon:'tractor', tone:'#2E6BE6' },
  { name:'DJI 드론', type:'농업 방제·매핑 드론', icon:'drone', tone:'#6E56CF' },
  { name:'농업용 로봇', type:'자율 예초·운반 로봇', icon:'bot', tone:'#0E9F5A' },
];

const fmt = n => n==null?'-':n.toLocaleString('ko-KR');
const fmtW = n => '₩'+n.toLocaleString('ko-KR');
