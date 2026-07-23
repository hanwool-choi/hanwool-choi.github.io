/* ============================================================
   Views 1 — 홈 대시보드 · 농장관리 · 장비관리 · 작업관리
   ============================================================ */
const Views = {};

/* ---------- shared bits ---------- */
function jobChip(st){ const [t,c]=JOB_STATUS[st]; return `<span class="chip chip-${c}"><span class="cd" style="background:currentColor"></span>${t}</span>`; }
/* 대분류(일반/대행) + 작업유형(10종). A-Motion은 작업유형이 아니라 자율작업 특성 → 작업 상세에서 표기 */
function typeChip(j){
  if(typeof j==='string') return `<span class="chip chip-gray">${j}</span>`;
  return `<span class="chip ${j.cat==='대행'?'chip-blue':'chip-gray'}">${j.cat}</span> <span class="chip ${WT_CHIP[j.type]||'chip-gray'}">${j.type}</span>`;
}
function mapBtn(label, preset, small=true){
  return `<button class="btn ${small?'btn-sm':''} btn-map" onclick='App.go("map",${JSON.stringify(preset)})'>${App.icon('map',13)} ${label}</button>`;
}
function permBadge(key){
  const p = permOf(key, App.role.id);
  const m = {'●':['관리','chip-green'],'○':['조회 전용','chip-gray'],'△':['신청/제한','chip-amber'],'-':['접근 불가','chip-red']}[p];
  return `<span class="chip ${m[1]}" title="현재 역할 권한">${m[0]}</span>`;
}

/* ============================================================ 1. 대시보드 */
Views.dashboard = {
  render(){
    const r = App.role;
    const todayJobs = JOBS.filter(j=>j.date===DEMO_TODAY.md||j.status==='run'||j.status==='issue');
    const running = JOBS.filter(j=>j.status==='run').length;
    const cnt = { work:EQUIP.filter(e=>e.status==='work').length, move:EQUIP.filter(e=>e.status==='move').length,
                  idle:EQUIP.filter(e=>e.status==='idle').length, maint:EQUIP.filter(e=>e.status==='maint').length };
    return `<div class="page-enter">
      <div class="page-head">
        <div>
          <div class="eyebrow">OPERATIONS · ${DEMO_TODAY.label}</div>
          <h1>${r.name}님, 오늘 ${todayJobs.length}건의 작업이 잡혀 있습니다</h1>
          <div class="sub">${r.org} · ${WEATHER.desc} ${WEATHER.temp}° · ${WEATHER.rain} <span class="chip chip-amber" style="margin-left:6px">호우 예비특보</span></div>
        </div>
        <div class="actions">
          ${mapBtn('통합 모니터링 열기',{},false)}
          <button class="btn btn-primary" onclick="App.go('work',{tab:'plan'})">${App.icon('plus')} 작업 계획 추가</button>
        </div>
      </div>

      <div class="grid cols-4" style="margin-bottom:16px">
        ${[['금주 작업면적','8,420','평','+12.4% 전주 대비','up',[42,55,48,70,66,84],'#0E9F5A'],
           ['장비 가동시간','11.1','h · 금일','정상 범위','up',[3,5,4,7,6,8],'#2E6BE6'],
           ['연료 사용량','182','L · 금주','-8.2% 효율 개선','up',[40,38,35,30,33,28],'#DE9207'],
           ['진행중 작업',String(running),'건','이슈 1건 포함','down',[1,2,2,3,2,3],'#E5352C']]
          .map(([l,v,u,d,dir,sp,c])=>`
          <div class="card kpi">
            <div class="k-label">${l}</div>
            <div class="k-value" data-count="${v.replace(/,/g,'')}">${v}<small>${u}</small></div>
            <div class="k-delta ${dir}">${dir==='up'?'▲':'▼'} ${d}</div>
            <div class="k-spark">${Charts.spark(sp,84,30,c)}</div>
          </div>`).join('')}
      </div>

      <div class="card" style="margin-bottom:16px">
        <div class="card-head"><h3>오늘의 작업</h3><span class="chip chip-gray mono" style="font-size:10px">1.1.1</span>
          <button class="more" onclick="App.go('work',{tab:'status'})">작업관리로 이동 →</button></div>
        <div class="card-pad" style="padding-top:12px">
          <div class="today-strip">
            ${todayJobs.map(j=>{ const f=FIELDS.find(x=>x.id===j.field);
              return `<div class="today-card" onclick="App.go('work',{tab:'status',job:'${j.id}'})">
                <div style="display:flex;align-items:center;gap:6px">${typeChip(j)}${jobChip(j.status)}</div>
                <b>${j.name}</b><small>${f?f.name+' · ':''}${fmt(j.area)}평 · ${j.date}</small>
                ${j.status==='run'?`<div class="prog" style="margin-top:9px"><i style="width:${j.prog}%"></i></div>`:''}
                ${j.issue?`<small style="color:var(--red);font-weight:700;display:block;margin-top:6px">⚠ ${j.issue.split('—')[0]}</small>`:''}
              </div>`; }).join('')}
          </div>
          ${this.briefing()}
        </div>
      </div>

      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
        <div class="card">
          <div class="card-head"><h3>장비 상태 요약</h3><span class="chip chip-gray mono" style="font-size:10px">1.1.2</span>
            ${mapBtn('맵에서 보기',{layers:['LY-01','LY-10']})}</div>
          <div class="card-pad" style="display:flex;gap:18px;align-items:center">
            <div id="equipDonut">${Charts.donut(Math.round((cnt.work+cnt.move)/EQUIP.length*100),{label:'가동률',color:'#0E9F5A',size:100})}</div>
            <div style="flex:1">
              ${Object.entries(EQUIP_STATUS).map(([k,[t,c]])=>`
                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12.5px">
                  <span class="chip chip-${c}" style="min-width:70px;justify-content:center">${t}</span>
                  <div class="prog" style="flex:1"><i style="width:${cnt[k]/EQUIP.length*100}%;background:currentColor" class="pc-${c}"></i></div>
                  <b style="width:26px;text-align:right;font-variant-numeric:tabular-nums">${cnt[k]}대</b>
                </div>`).join('')}
              <button class="btn btn-sm btn-ghost" style="margin-top:8px;width:100%" onclick="App.go('equip')">장비관리 바로가기</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>알림 센터</h3><span class="chip chip-gray mono" style="font-size:10px">1.1.4</span>
            <button class="more" onclick="NOTIS.forEach(n=>n.unread=false);App.toast('모든 알림을 읽음 처리했습니다');App.rerender()">모두 읽음</button></div>
          <div class="card-pad" style="padding-top:8px">
            ${NOTIS.slice(0,4).map(n=>`
              <div class="alert-row ${n.unread?'unread':''}" style="cursor:pointer" onclick="App.go('${n.link}')">
                <div class="alert-ico" style="background:var(--${n.color}-soft);color:var(--${n.color})">${App.icon(n.icon,15)}</div>
                <div style="min-width:0"><b>${n.title}</b><small>${n.sub}</small></div>
                <span class="al-time">${n.time}</span>
              </div>`).join('')}
          </div>
        </div>

        ${this.orgCard()}
      </div>
    </div>`;
  },
  briefing(){
    const warn=FIELDS.filter(f=>f.hazard&&f.hazard.level==='경고');
    const dtc=EQUIP.filter(e=>e.dtc>0);
    const todos=[
      { ico:'bot', color:'purple', pri:'', t:'HX1400AI 1호기 안들 3 심경 로터리 자율작업 감독', sub:'현재 42% 진행 · 이상감지 0건 — 관제 모드에서 확인', act:()=>`App.go('map',{layers:['LY-03','LY-01','LY-02'],focus:'GJ-R3',amotion:true})` },
      warn.length?{ ico:'sos', color:'red', pri:'긴급', t:`${warn[0].farm} 재해경보 — ${warn[0].hazard.type}`, sub:`${warn[0].hazard.eta} 예상 · 배수로 정비 및 방제 일정 조정 검토`, act:()=>`App.go('farm',{tab:'plot'})` }:null,
      dtc.length?{ ico:'wrench', color:'amber', pri:'우선', t:`${dtc.map(e=>e.model).join(', ')} 고장 코드 확인`, sub:`DTC ${dtc[0].dtcCode} 발생 — 서비스 예약 권장`, act:()=>`App.go('equip')` }:null,
      { ico:'won', color:'green', pri:'', t:'아랫배미 VRT 시비 처방 검토·전송', sub:'처방맵 생성 완료(-12.4% 절감) · 스마트 작업기 전송 대기', act:()=>`App.go('precision',{tab:'rx'})` },
      { ico:'doc', color:'blue', pri:'', t:'춘계 대행 정산 3팀 확인 요청', sub:'14일 내 미확정 시 자동 확정 처리 — 1팀 보완 요청 있음', act:()=>`App.go('work',{tab:'agency',sub:'settle'})` },
    ].filter(Boolean);
    return `<div style="margin-top:16px;border-top:1px dashed var(--line);padding-top:14px">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
        <div class="lr-swatch" style="background:linear-gradient(135deg,#E5352C,#C22A22);width:32px;height:32px;border-radius:10px">${App.icon('bot',16)}</div>
        <div style="flex:1"><b style="font-size:14px">AI 브리핑</b> <span class="chip chip-red" style="font-size:9.5px">오늘 할 일 ${todos.length}</span>
          <div style="font-size:11.5px;color:var(--ink-3)">${App.role.name}님, 오늘 우선 처리할 작업을 중요도 순으로 정리했습니다</div></div>
        <button class="btn btn-sm btn-ghost" onclick="App.openAI('todo')">${App.icon('bot',13)} AI에게 브리핑 받기</button>
      </div>
      <div style="display:grid;gap:8px">
        ${todos.map((b,i)=>`
          <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border:1px solid var(--line);border-radius:12px;cursor:pointer;transition:all .15s var(--ease);background:${b.pri?'var(--'+b.color+'-soft)':'var(--surface)'}"
            onmouseover="this.style.transform='translateX(3px)';this.style.boxShadow='var(--shadow-sm)'" onmouseout="this.style.transform='';this.style.boxShadow=''"
            onclick="${b.act()}">
            <div style="font-size:13px;font-weight:800;color:var(--ink-3);width:16px;text-align:center;font-variant-numeric:tabular-nums">${i+1}</div>
            <div class="alert-ico" style="background:var(--${b.color}-soft);color:var(--${b.color});width:34px;height:34px;flex-shrink:0">${App.icon(b.ico,16)}</div>
            <div style="flex:1;min-width:0"><b style="font-size:13px">${b.pri?`<span class="chip chip-${b.color==='red'?'red':b.color==='amber'?'amber':'gray'}" style="font-size:9.5px;margin-right:5px">${b.pri}</span>`:''}${b.t}</b>
              <div style="font-size:11.5px;color:var(--ink-3);margin-top:1px">${b.sub}</div></div>
            ${App.icon('chev',15)}
          </div>`).join('')}
      </div>
    </div>`;
  },
  orgCard(){
    const r=App.role.id;
    if(r==='admin') return `<div class="card">
      <div class="card-head"><h3>서비스 운영 현황</h3><span class="chip chip-gray mono" style="font-size:10px">1.2.2</span><span class="chip chip-red">SPC Admin</span></div>
      <div class="card-pad">
        ${[['플랫폼 가입 농가','1,248','+36 이번 달'],['연결 장비 (TMU)','892','가동률 71%'],['진행중 대행 공고','14','신청 214건'],['정밀농업 신청 대기','9','우선순위 상 3건']]
          .map(([l,v,s])=>`<div style="display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line)">
            <span style="font-size:12.5px;color:var(--ink-2);font-weight:600">${l}</span>
            <span><b style="font-size:16px;font-variant-numeric:tabular-nums">${v}</b> <small style="color:var(--ink-3);font-size:11px">${s}</small></span></div>`).join('')}
        <button class="btn btn-sm btn-ghost" style="margin-top:10px;width:100%" onclick="App.go('stats')">플랫폼 통계 보기</button>
      </div></div>`;
    if(r==='corp') return `<div class="card">
      <div class="card-head"><h3>조직 운영 현황</h3><span class="chip chip-gray mono" style="font-size:10px">1.2.1</span><span class="chip chip-blue">김제 농협</span></div>
      <div class="card-pad">
        ${[['소속 농가','86','활성 74'],['조합 보유 장비','12','임대중 7'],['이번 주 대행 작업','9건','완료 5건'],['미정산 대행','2건','₩784,000']]
          .map(([l,v,s])=>`<div style="display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line)">
            <span style="font-size:12.5px;color:var(--ink-2);font-weight:600">${l}</span>
            <span><b style="font-size:16px;font-variant-numeric:tabular-nums">${v}</b> <small style="color:var(--ink-3);font-size:11px">${s}</small></span></div>`).join('')}
        <button class="btn btn-sm btn-ghost" style="margin-top:10px;width:100%" onclick="App.go('work',{tab:'agency'})">대행 관리 바로가기</button>
      </div></div>`;
    return `<div class="card">
      <div class="card-head"><h3>이번 주 기상</h3><span class="chip chip-gray mono" style="font-size:10px">기상청 연계</span></div>
      <div class="card-pad">
        <div class="weather-wrap">
          <div class="weather-temp">${WEATHER.temp}°</div>
          <div style="font-size:12px;color:var(--ink-2)"><b>${WEATHER.desc}</b><br>습도 ${WEATHER.hum}% · 풍속 ${WEATHER.wind}m/s</div>
          <div class="weather-days">${WEATHER.days.map(([d,t])=>`<div class="weather-day">${d}<b>${t}</b></div>`).join('')}</div>
        </div>
        <div class="perm-note" style="margin:14px 0 0">${App.icon('rain')} <div><b>내일 새벽 시간당 20mm 예보</b> — 07.23 예정된 '윗배미 잡초 방제' 작업의 일정 조정을 검토하세요. <a style="color:var(--red);font-weight:700;cursor:pointer" onclick="App.go('work',{tab:'plan'})">캘린더 열기</a></div></div>
      </div></div>`;
  },
  bind(root){
    Charts.arm(root);
    /* count-up */
    root.querySelectorAll('[data-count]').forEach(el=>{
      const target=parseFloat(el.dataset.count); if(isNaN(target))return;
      const unit=el.querySelector('small'); const dec=String(el.dataset.count).includes('.')?1:0;
      const t0=performance.now(), dur=900;
      const tick=t=>{ const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
        el.childNodes[0].textContent=(target*e).toLocaleString('ko-KR',{maximumFractionDigits:dec,minimumFractionDigits:dec});
        if(p<1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    root.querySelectorAll('.pc-green').forEach(e=>e.style.color='var(--green)');
    root.querySelectorAll('.pc-blue').forEach(e=>e.style.color='var(--blue)');
    root.querySelectorAll('.pc-gray').forEach(e=>e.style.color='#9AA3AF');
    root.querySelectorAll('.pc-red').forEach(e=>e.style.color='var(--red)');
  }
};

/* ============================================================ 4. 농장관리 */
Views.farm = {
  tab:'customer',
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    const T=this.tab;
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">FARM · IA 4</div><h1>농장관리</h1>
        <div class="sub">고객 — 농장 — 필지 — 경작지 경계로 이어지는 기준정보 체계</div></div>
        <div class="actions">${permBadge('4.2')}
          <button class="btn btn-primary" onclick="App.toast('등록 양식 (프로토타입 데모)')">${App.icon('plus')} 신규 등록</button></div>
      </div>
      <div class="tabs">
        ${[['customer','고객정보','4.1'],['farm','농장정보','4.2'],['plot','필지정보','4.3'],['boundary','경작지 경계','4.4']]
          .map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('farm',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}
      </div>
      ${this['tab_'+T]()}
    </div>`;
  },
  tab_customer(){
    const isFarmer=App.role.id==='farmer';
    return `${isFarmer?`<div class="perm-note">${App.icon('info')} <div>개인 농민 권한에서는 <b>본인 정보만 조회</b>됩니다. 소속 농가 전체 관리는 법인 관리자·SPC Admin 권한입니다.</div></div>`:''}
    <div class="filter-bar">
      <div class="f-search">${App.icon('search')}<input id="custSearch" placeholder="이름·연락처 검색" oninput="Views.farm.filterCust()"></div>
      <select class="f-select" id="custShare" onchange="Views.farm.filterCust()">
        <option value="">공유 상태 전체</option><option value="농협">농협 공유</option><option value="SPC">SPC 공유</option><option value="-">미공유</option></select>
      <div style="margin-left:auto" class="deep-note">${App.icon('link')} 고객-농장-필지-장비 권한 매핑 구조</div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>고객명</th><th>연락처</th><th>소유 농장</th><th class="t-num">필지</th><th class="t-num">등록 장비</th><th>데이터 공유</th><th>가입</th><th></th></tr></thead>
      <tbody id="custBody">${(isFarmer?CUSTOMERS.slice(0,1):CUSTOMERS).map(c=>`
        <tr data-row data-name="${c.name}" data-ph="${c.ph}" data-share="${c.share}" onclick="Views.farm.custDrawer('${c.name}')">
          <td class="t-strong">${c.name}</td><td class="mono" style="font-size:12px">${c.ph}</td><td>${c.farms}</td>
          <td class="t-num">${c.plots}</td><td class="t-num">${c.equip}</td>
          <td>${c.share==='-'?'<span class="chip chip-gray">미공유</span>':c.share.split('·').map(s=>`<span class="chip chip-blue" style="margin-right:3px">${s}</span>`).join('')}</td>
          <td class="mono" style="font-size:11.5px;color:var(--ink-3)">${c.since}</td>
          <td><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();App.toast('권한 위임 설정 (데모)')">권한</button></td>
        </tr>`).join('')}
        <tr id="custEmpty" style="display:none"><td colspan="8" style="text-align:center;color:var(--ink-3);padding:24px">검색 결과가 없습니다</td></tr></tbody>
    </table></div>`;
  },
  custDrawer(name){
    const c=CUSTOMERS.find(x=>x.name===name);
    App.drawer(`고객 상세 — ${c.name}`, `
      <div class="grid cols-2" style="margin-bottom:16px">
        <div class="card card-pad"><div class="k-label">소유 농장</div><div class="k-value" style="font-size:20px">${c.farms}</div></div>
        <div class="card card-pad"><div class="k-label">필지 / 장비</div><div class="k-value" style="font-size:20px">${c.plots} / ${c.equip}</div></div>
      </div>
      <h3 style="margin-bottom:10px">권한·공유 매핑</h3>
      ${['농장·필지 데이터','장비 운행 데이터','정밀농업 진단 결과'].map((t,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13px">
          ${App.icon('link')} <b style="flex:1">${t}</b>
          <span class="chip ${i<2?'chip-blue':'chip-gray'}">${i<2?'농협 공유중':'미공유'}</span>
        </div>`).join('')}
      <h3 style="margin:18px 0 10px">서비스 이력</h3>
      ${[['2026.07.02','정밀농업 토양진단+처방 신청 (GJ-R3)'],['2026.06.05','춘계 로터리 대행 신청 — 확정'],['2026.03.14','HX1400AI 임대 계약']].map(([d,t])=>`
        <div style="display:flex;gap:12px;padding:8px 0;font-size:12.5px"><span class="mono" style="color:var(--ink-3)">${d}</span><span>${t}</span></div>`).join('')}
    `);
  },
  tab_farm(){
    const farms={};
    FIELDS.forEach(f=>{ (farms[f.farm]=farms[f.farm]||{owner:f.owner,fields:[],area:0}).fields.push(f); farms[f.farm].area+=f.area; });
    return `<div class="grid cols-3">
      ${Object.entries(farms).map(([name,d])=>`
        <div class="card card-pad" style="cursor:pointer" onclick="App.go('farm',{tab:'plot'})">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div class="lr-swatch" style="background:${d.fields[0].tone};width:38px;height:38px;border-radius:11px">${App.icon('farm',18)}</div>
            <div><b style="font-size:14.5px">${name}</b><br><small style="color:var(--ink-3);font-size:11.5px">${d.owner} · ${d.fields[0].addr.split(' ').slice(0,2).join(' ')}</small></div>
            <span class="chip chip-gray" style="margin-left:auto">자경</span>
          </div>
          <div style="display:flex;gap:14px;font-size:12px;color:var(--ink-2)">
            <span>필지 <b>${d.fields.length}</b></span><span>합계 <b>${fmt(d.area)}평</b></span>
            <span>작물 <b>${[...new Set(d.fields.map(f=>f.crop.split('(')[0]))].join('·')}</b></span>
          </div>
        </div>`).join('')}
    </div>`;
  },
  tab_plot(){
    const warn=FIELDS.filter(f=>f.hazard.level!=='정상');
    return `${warn.length?`<div class="perm-note" style="background:var(--red-soft);border-color:#F6D3CE;color:#8A2A22">${App.icon('sos')} <div><b>재해경보 ${warn.length}건</b> — ${warn.map(f=>`${f.name}(${f.hazard.level})`).join(', ')}. 국립농업과학원 농업기상재해 조기경보서비스 연계. <a style="color:var(--red);font-weight:700;cursor:pointer" onclick='App.go("map",{layers:["LY-11","LY-10"]})'>통합 맵에서 보기 →</a></div></div>`:''}
    <div class="filter-bar">
      <div class="f-search">${App.icon('search')}<input id="plotSearch" placeholder="필지명·ID·주소 검색" oninput="Views.farm.filterPlot()"></div>
      <select class="f-select" id="plotCrop" onchange="Views.farm.filterPlot()"><option value="">작물 전체</option><option value="벼">벼</option><option value="콩">콩</option><option value="밀">밀</option><option value="사과">사과</option></select>
      <select class="f-select" id="plotHazard" onchange="Views.farm.filterPlot()"><option value="">재해경보 전체</option><option value="정상">정상</option><option value="주의">주의</option><option value="경고">경고</option></select>
      <div style="margin-left:auto">${mapBtn('전체 필지 맵에서 보기',{layers:['LY-10']})}</div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>필지</th><th>주소</th><th class="t-num">면적(평)</th><th>작물</th><th>재해경보</th><th>농장/소유</th><th>경계</th><th></th></tr></thead>
      <tbody id="plotBody">${FIELDS.map(f=>{ const [hc]=HAZARD_META[f.hazard.level];
        return `<tr data-row data-name="${f.name}" data-id="${f.id}" data-addr="${f.addr}" data-crop="${f.crop}" data-hazard="${f.hazard.level}" onclick="Views.farm.plotDrawer('${f.id}')">
          <td><span class="t-strong">${f.name}</span><span class="t-sub mono">${f.id}</span></td>
          <td style="font-size:12.5px">${f.addr}</td><td class="t-num t-strong">${fmt(f.area)}</td>
          <td>${f.crop}</td>
          <td><span class="chip ${hc}"><span class="cd" style="background:currentColor"></span>${f.hazard.level}</span>${f.hazard.type?`<span class="t-sub">${f.hazard.type}</span>`:''}</td>
          <td style="font-size:12.5px">${f.farm} · ${f.owner}</td>
          <td><span class="chip chip-blue">등록됨</span></td>
          <td><button class="btn btn-sm btn-map" onclick='event.stopPropagation();App.go("map",{focus:"${f.id}",layers:["LY-11","LY-10","LY-01"]})'>${App.icon('map',13)} 맵</button></td>
        </tr>`;}).join('')}
        <tr id="plotEmpty" style="display:none"><td colspan="8" style="text-align:center;color:var(--ink-3);padding:24px">검색 결과가 없습니다</td></tr></tbody>
    </table></div>`;
  },
  filterCust(){
    const q=(document.getElementById('custSearch').value||'').trim().toLowerCase();
    const share=document.getElementById('custShare').value;
    let shown=0;
    document.querySelectorAll('#custBody tr[data-row]').forEach(tr=>{
      const okQ=!q||tr.dataset.name.toLowerCase().includes(q)||tr.dataset.ph.includes(q);
      const okS=!share||(share==='-'?tr.dataset.share==='-':tr.dataset.share.includes(share));
      const vis=okQ&&okS; tr.style.display=vis?'':'none'; if(vis)shown++;
    });
    const empty=document.getElementById('custEmpty'); if(empty) empty.style.display=shown?'none':'';
  },
  filterPlot(){
    const q=(document.getElementById('plotSearch').value||'').trim().toLowerCase();
    const crop=document.getElementById('plotCrop').value, hz=document.getElementById('plotHazard').value;
    let shown=0;
    document.querySelectorAll('#plotBody tr[data-row]').forEach(tr=>{
      const okQ=!q||tr.dataset.name.toLowerCase().includes(q)||tr.dataset.id.toLowerCase().includes(q)||tr.dataset.addr.includes(q);
      const okC=!crop||tr.dataset.crop.includes(crop);
      const okH=!hz||tr.dataset.hazard===hz;
      const vis=okQ&&okC&&okH; tr.style.display=vis?'':'none'; if(vis)shown++;
    });
    const empty=document.getElementById('plotEmpty'); if(empty) empty.style.display=shown?'none':'';
  },
  plotDrawer(fid){
    const f=FIELDS.find(x=>x.id===fid);
    const h=f.hazard, [hc,hcolor]=HAZARD_META[h.level];
    App.drawer(`필지 상세 — ${f.name}`, `
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <span class="chip chip-gray mono">${f.id}</span><span class="chip chip-green">${f.crop}</span>
        <span class="chip ${hc}"><span class="cd" style="background:currentColor"></span>재해경보 ${h.level}</span>
      </div>
      <div style="border:1.5px solid ${h.level==='정상'?'var(--line)':hcolor};border-radius:14px;overflow:hidden;margin-bottom:16px">
        <div style="background:${h.level==='정상'?'var(--surface-2)':hcolor};color:${h.level==='정상'?'var(--ink)':'#fff'};padding:11px 15px;display:flex;align-items:center;gap:9px">
          ${App.icon('sos',16)}<b style="font-size:13.5px;flex:1">재해경보 — ${h.level}${h.type?' · '+h.type:''}</b>
          ${h.prob?`<span style="font-size:11px;font-weight:700;opacity:.9">발생확률 ${h.prob}%</span>`:''}
        </div>
        <div style="padding:13px 15px">
          ${h.level==='정상'
            ? `<div style="font-size:12.5px;color:var(--ink-2)">현재 기상재해 위험이 낮습니다. 국립농업과학원 농업기상재해 조기경보서비스로 실시간 모니터링 중입니다.</div>`
            : `<div style="display:flex;gap:14px;font-size:12px;color:var(--ink-2);margin-bottom:9px">
                 <span>예상 시점 <b style="color:var(--ink)">${h.eta}</b></span>
               </div>
               <div style="font-size:12.5px;color:var(--ink-2);line-height:1.6;margin-bottom:11px">${h.detail}</div>
               <div style="background:var(--surface-2);border-radius:10px;padding:11px 13px">
                 <b style="font-size:11.5px;color:${hcolor};display:block;margin-bottom:5px">${App.icon('check',11)} 대응 방침</b>
                 <div style="font-size:12px;color:var(--ink-2);line-height:1.7">${h.action}</div>
               </div>`}
          <div style="font-size:10.5px;color:var(--ink-3);margin-top:9px">출처: 국립농업과학원 농업기상재해정보시스템 · 필지 맞춤 조기경보</div>
        </div>
      </div>
      <div class="grid cols-3" style="margin-bottom:16px">
        <div class="card card-pad" style="padding:12px"><div class="k-label">면적</div><b style="font-size:17px">${fmt(f.area)}평</b></div>
        <div class="card card-pad" style="padding:12px"><div class="k-label">'26 작업</div><b style="font-size:17px">${JOBS.filter(j=>j.field===fid).length}건</b></div>
        <div class="card card-pad" style="padding:12px"><div class="k-label">예상 수확</div><b style="font-size:17px">612kg<small style="font-size:10px">/10a</small></b></div>
      </div>
      <h3 style="margin-bottom:8px">필지 메타데이터</h3>
      ${[['토양유형','미사질양토 (양토성)'],['작물력','벼-벼-콩 (3개년)'],['비료력','규산 118mg/kg · 유기물 23g/kg'],['수리','수리안전답 · 관정 1']].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px"><span style="color:var(--ink-3)">${k}</span><b>${v}</b></div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:16px">
        ${mapBtn('맵에서 보기',{focus:fid,layers:['LY-11','LY-10','LY-02']},false)}
        <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="App.go('precision',{tab:'diag',field:'${fid}'})">진단·처방 이력</button>
      </div>
    `);
  },
  tab_boundary(){
    return `<div class="grid" style="grid-template-columns:1.2fr .8fr">
      <div class="card card-pad">
        <h3 style="margin-bottom:6px">경작지경계 생성 (Boundaries)</h3>
        <p style="font-size:12.5px;color:var(--ink-2);margin-bottom:14px">정사영상(드론) 또는 기준 맵서비스 기반으로 Polygon을 생성·편집합니다. 정점(Vertex) 최대 <b>128개</b>, 생성된 경계는 <b>A-Motion·정밀농업</b>과 연계됩니다. 편집 툴은 통합 맵 엔진을 재사용합니다.</p>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button class="btn btn-primary" onclick="Views.farm.boundaryModal()">${App.icon('edit')} 경계 편집기 열기</button>
          ${mapBtn('통합 맵 경계 레이어',{layers:['LY-10']},false)}
        </div>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>필지</th><th class="t-num">면적(평)</th><th class="t-num">정점 수</th><th>생성 기준</th><th>연계</th></tr></thead>
          <tbody>${FIELDS.slice(0,6).map((f,i)=>`
            <tr><td><span class="t-strong">${f.name}</span><span class="t-sub mono">${f.id}</span></td>
            <td class="t-num">${fmt(f.area)}</td><td class="t-num">${[46,38,52,44,61,40][i]}</td>
            <td style="font-size:12px">${i%2?'드론 정사영상':'위성지도'}</td>
            <td><span class="chip chip-purple">A-Motion</span> <span class="chip chip-green">정밀농업</span></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">경계 상태 요약</h3>
        <div style="display:flex;justify-content:center;padding:8px 0" id="bdDonut">${Charts.donut(80,{label:'등록 완료',color:'#2E6BE6',size:120})}</div>
        ${[['등록 완료','8필지','chip-blue'],['주소 등록 필요','1필지','chip-amber'],['미생성','1필지','chip-gray']].map(([t,v,c])=>`
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px">
            <span class="chip ${c}">${t}</span><b>${v}</b></div>`).join('')}
        <div class="perm-note" style="margin-top:14px">${App.icon('info')} <div><b>GJ-R4</b> 필지에 주소 등록이 필요합니다. 경계 편집기에서 확인하세요.</div></div>
      </div>
    </div>`;
  },
  boundaryModal(){
    App.modal(`농장 경계 편집`, `
      <div style="display:flex;height:520px">
        <div style="width:230px;background:var(--navy);color:#fff;overflow-y:auto;padding:12px;flex-shrink:0">
          ${FIELDS.slice(0,6).map((f,i)=>`
            <div style="padding:10px 10px;border-radius:10px;cursor:pointer;margin-bottom:4px;${i===2?'background:rgba(255,255,255,.1)':''}"
                 onmouseover="this.style.background='rgba(255,255,255,.08)'" onmouseout="this.style.background='${i===2?'rgba(255,255,255,.1)':''}'">
              <b style="font-size:12.5px">${f.id}</b>
              <div style="font-size:10.5px;color:#98A2B0;margin-top:2px">${fmt(f.area)}평 | 노지<br>${f.addr}</div>
              ${i===1?'<div style="font-size:10px;color:#FF8A80;margin-top:3px">▲ 주소 등록 필요</div>':''}
            </div>`).join('')}
        </div>
        <div style="flex:1;position:relative;background:#4A5B3E">
          <svg viewBox="100 40 620 560" style="width:100%;height:100%">
            <rect x="0" y="0" width="900" height="700" fill="#55673F"/>
            ${[[110,60],[110,250],[110,420],[300,80],[300,290],[490,100],[490,300]].map(([x,y],i)=>
              `<rect x="${x}" y="${y}" width="150" height="150" fill="${['#7FA96B','#8FB377','#6E9C5E','#A3B96F'][i%4]}" opacity=".9"/>`).join('')}
            ${FIELDS.slice(0,5).map((f,i)=>{
              const cls=i===2?'stroke:#D6FF3E;stroke-width:3':'stroke:#fff;stroke-width:2';
              return `<polygon points="${f.poly.map(p=>p.join(',')).join(' ')}" fill="${i===2?'rgba(214,255,62,.18)':'rgba(255,255,255,.08)'}" style="${cls};cursor:pointer"/>`+
                (i===2? f.poly.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff" stroke="#D6FF3E" stroke-width="2" style="cursor:grab"/>`).join(''):'');
            }).join('')}
          </svg>
          <div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);display:flex;gap:6px;background:#fff;border-radius:999px;padding:5px 6px 5px 16px;box-shadow:var(--shadow-md);width:320px">
            <input placeholder="주소를 입력해주세요" style="border:none;outline:none;flex:1;font-size:12.5px">
            <button class="btn btn-sm btn-navy" style="border-radius:999px">검색</button>
          </div>
          <div style="position:absolute;left:14px;top:14px;background:rgba(32,39,47,.85);color:#fff;border-radius:8px;padding:5px 10px;font-size:11px;font-family:var(--mono)">1,230.57㎡ (372평) · Vertex 4/128</div>
        </div>
      </div>
      <div style="padding:14px 24px;border-top:1px solid var(--line);display:flex;justify-content:center">
        <button class="btn btn-primary" style="width:300px;justify-content:center" onclick="App.closeModal();App.toast('경계가 저장되었습니다 — A-Motion·정밀농업 연계 반영')">확인</button>
      </div>
    `);
  },
  bind(root){ Charts.arm(root); }
};

/* ============================================================ 5. 장비관리 */
Views.equip = {
  tab:'status', selVeh:null,
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    if(params&&params.veh){ this.tab='status'; setTimeout(()=>this.vehDrawer(params.veh),350); }
    const T=this.tab, isAdmin=App.role.id==='admin';
    const tabs=[['status','차량 현황','5.2'],['mgmt','모델관리','5.1'],['rent','임대/배차','5.3'],['impl','작업기','5.4']];
    if(isAdmin) tabs.push(['term','단말기','5.5'],['fota','FOTA','5.6']);
    /* 탭별 주요 액션 버튼 */
    const primaryBtn = {
      rent: `<button class="btn btn-primary" onclick="Views.equip.rentModal()">${App.icon('plus')} 차량 임대 등록</button>`,
      impl: `<button class="btn btn-primary" onclick="Views.equip.implModal()">${App.icon('plus')} 작업기 등록</button>`,
    }[T] || `<button class="btn btn-primary" onclick="Views.equip.registerModal()">${App.icon('plus')} 차량 등록</button>`;
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">EQUIPMENT · IA 5</div><h1>장비관리</h1>
        <div class="sub">등록·정비·공유는 여기서, 실시간 위치는 통합 모니터링 딥링크로</div></div>
        <div class="actions">${permBadge('5.2')}
          ${mapBtn('실시간 위치 맵에서 보기',{layers:['LY-01','LY-10']},false)}
          ${primaryBtn}</div>
      </div>
      <div class="tabs">${tabs.map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('equip',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}</div>
      ${this['tab_'+T]()}
    </div>`;
  },

  /* ---- 5.1.2 차량 등록 (시리얼/바코드 스캔) ---- */
  regNick:'HX1400 3호기',
  registerModal(){
    App.modal(`차량 등록`, `
      <div style="padding:22px 26px">
        <p style="font-size:12.5px;color:var(--ink-2);margin-bottom:14px">시리얼넘버 입력 또는 바코드 이미지 업로드로 차량 정보를 자동 매칭합니다. 브랜드별 농기계·DJI·로봇 등 3rd party 본기도 등록 가능합니다.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:6px">
          <div class="radio-tile sel" style="padding:16px">
            <b style="font-size:13px">${App.icon('edit',14)} 시리얼넘버 입력</b>
            <div style="display:flex;gap:8px;margin-top:10px">
              <input type="text" id="regSerial" value="SPC-0001" class="mono" style="flex:1;border:1px solid var(--line-2);border-radius:9px;padding:8px 12px;font-size:13px;outline:none">
              <button class="btn btn-sm btn-navy" onclick="Views.equip.regLookup('serial')">조회</button>
            </div>
          </div>
          <div class="radio-tile" style="padding:16px;cursor:pointer" onclick="Views.equip.regLookup('barcode')">
            <b style="font-size:13px">${App.icon('photo',14)} 바코드 이미지 업로드</b>
            <small style="display:block;margin-top:6px">차대 바코드 촬영본을 업로드하면 AI가 스캔합니다</small>
            <div id="regBarcode" style="margin-top:10px;height:52px;border:1.5px dashed var(--line-2);border-radius:9px;display:grid;place-items:center;color:var(--ink-3);font-size:11px;font-weight:700">클릭하여 업로드</div>
          </div>
        </div>
        <div id="regResult" style="min-height:60px"></div>
      </div>`);
  },
  regLookup(method){
    const box=document.getElementById('regResult');
    if(method==='barcode'){
      /* 바코드 + 스캔라인 애니메이션 */
      const bc=document.getElementById('regBarcode');
      bc.style.border='none'; bc.style.position='relative'; bc.style.overflow='hidden';
      let bars=''; for(let i=0;i<46;i++){ const w=[1,1,2,1,3,1,2][i%7]; bars+=`<rect x="${i*5.4}" y="4" width="${w*1.6}" height="36" fill="#20272F"/>`; }
      bc.innerHTML=`<svg width="250" height="52" viewBox="0 0 250 52">${bars}
        <text x="125" y="50" text-anchor="middle" font-size="8" font-family="monospace" fill="#5A6472">S P C - 0 0 0 1</text></svg>
        <div id="bcScan" style="position:absolute;left:0;right:0;top:0;height:2.5px;background:#E5352C;box-shadow:0 0 10px #E5352C"></div>`;
      const scan=document.getElementById('bcScan');
      let y=0; const iv=setInterval(()=>{ y=(y+5)%100; if(scan) scan.style.top=y+'%'; },28);
      box.innerHTML=`<div style="text-align:center;padding:14px;color:var(--ink-3);font-size:12px">바코드 스캔 중...</div>`;
      setTimeout(()=>{ clearInterval(iv); if(scan) scan.remove(); this.regReveal(); },1700);
    } else {
      box.innerHTML=`<div style="text-align:center;padding:14px;color:var(--ink-3);font-size:12px">제조 정보 조회 중...</div>`;
      setTimeout(()=>this.regReveal(),700);
    }
  },
  regReveal(){
    const box=document.getElementById('regResult'); if(!box) return;
    box.innerHTML=`
      <div style="border:1.5px solid var(--green);background:var(--green-soft);border-radius:14px;padding:16px 18px;animation:popIn .3s var(--ease)">
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:150px;flex-shrink:0;background:#fff;border-radius:12px;padding:8px">${this.tractorSVG()}</div>
          <div style="flex:1">
            <div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip chip-green">${App.icon('check',11)} 매칭 성공</span><span class="chip chip-gray mono">TMU 연동 확인</span></div>
            ${[['제조사','대동 (DAEDONG)'],['모델명','HX1400AI · 자율주행 트랙터'],['시리얼넘버','SPC-0001'],['제조년도','2026 · A-Motion 지원']].map(([k,v])=>`
              <div style="display:flex;font-size:12.5px;padding:3px 0"><span style="width:84px;color:var(--ink-3);font-weight:600">${k}</span><b>${v}</b></div>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:14px;align-items:flex-end">
          <div style="flex:1"><label style="font-size:11.5px;font-weight:700;color:var(--ink-2);display:block;margin-bottom:5px">차량 별명</label>
            <input type="text" id="regNick" value="${this.regNick}" style="width:100%;border:1px solid var(--line-2);border-radius:9px;padding:9px 12px;font-size:13px;outline:none"></div>
          <button class="btn btn-primary" onclick="Views.equip.regComplete()">${App.icon('check')} 차량 등록</button>
        </div>
      </div>`;
  },
  regComplete(){
    const nick=document.getElementById('regNick').value||this.regNick;
    const n=EQUIP.filter(e=>e.model==='HX1400AI').length+1;
    const nextNum=Math.max(0,...EQUIP.map(e=>parseInt((e.id.match(/\d+/)||[0])[0],10)))+1;
    EQUIP.push({ id:'VH-'+String(nextNum).padStart(3,'0'), model:'HX1400AI', type:'트랙터', nick, owner:'SPC 공용', status:'idle', amotion:true,
      fuel:100, def:100, hours:0, todayH:0, field:null, job:null, speed:0, dtc:0, fw:'v2.4.1', tmu:'TMU-'+(8800+n) });
    App.closeModal(); App.toast(`'${nick}' 등록 완료 — 차량 현황 목록에 추가되었습니다`);
    App.go('equip',{tab:'status'});
  },
  /* HX1400AI 측면 일러스트 (제품 사진은 라이선스 확인 후 assets/hx1400.png 교체 권장) */
  tractorSVG(){
    return `<svg viewBox="0 0 160 100" width="100%">
      <ellipse cx="80" cy="92" rx="70" ry="5" fill="#E8EAED"/>
      <rect x="18" y="52" width="70" height="22" rx="5" fill="#C22A22"/>
      <rect x="22" y="44" width="40" height="14" rx="4" fill="#E5352C"/>
      <path d="M84 52 h28 l8 22 h-36 z" fill="#E5352C"/>
      <rect x="86" y="26" width="34" height="30" rx="5" fill="#2A323D"/>
      <rect x="90" y="30" width="26" height="16" rx="3" fill="#9FC2DE"/>
      <rect x="12" y="58" width="10" height="8" rx="2" fill="#2A323D"/>
      <circle cx="42" cy="80" r="13" fill="#20272F"/><circle cx="42" cy="80" r="6.5" fill="#5A6472"/>
      <circle cx="112" cy="74" r="19" fill="#20272F"/><circle cx="112" cy="74" r="10" fill="#5A6472"/>
      <circle cx="112" cy="74" r="3.5" fill="#B4BAC4"/>
      <rect x="126" y="38" width="4" height="14" rx="2" fill="#8B94A3"/>
      <circle cx="128" cy="35" r="4" fill="#6E56CF"/>
      <text x="50" y="68" font-size="8.5" font-weight="800" fill="#fff" font-family="sans-serif">HX1400AI</text>
    </svg>`;
  },
  tab_status(){
    return `<div class="grid cols-4" style="margin-bottom:16px">
      ${Object.entries(EQUIP_STATUS).map(([k,[t,c]])=>{
        const n=EQUIP.filter(e=>e.status===k).length;
        return `<div class="card kpi" style="padding:14px 18px"><div class="k-label"><span class="chip chip-${c}">${t}</span></div>
          <div class="k-value" style="font-size:24px">${n}<small>대</small></div></div>`; }).join('')}
    </div>
    <div class="filter-bar">
      <div class="f-search">${App.icon('search')}<input id="eqSearch" placeholder="장비명·ID·모델 검색" oninput="Views.equip.filterStatus()"></div>
      <select class="f-select" id="eqStatus" onchange="Views.equip.filterStatus()"><option value="">상태 전체</option>${Object.entries(EQUIP_STATUS).map(([k,[t]])=>`<option value="${k}">${t}</option>`).join('')}</select>
      <select class="f-select" id="eqAmotion" onchange="Views.equip.filterStatus()"><option value="">자율작업 전체</option><option value="1">A-Motion만</option></select>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>장비</th><th>상태</th><th>소유/공유</th><th class="t-num">연료</th><th class="t-num">DEF</th><th class="t-num">가동(h)</th><th>DTC</th><th>현재 작업</th><th></th></tr></thead>
      <tbody id="eqBody">${EQUIP.map(v=>{
        const [st,c]=EQUIP_STATUS[v.status]; const job=JOBS.find(j=>j.id===v.job);
        return `<tr data-row data-search="${(v.nick+' '+v.id+' '+v.model).toLowerCase()}" data-status="${v.status}" data-amotion="${v.amotion?1:0}" onclick="Views.equip.vehDrawer('${v.id}')">
          <td><span class="t-strong">${v.nick}</span><span class="t-sub mono">${v.id} · ${v.tmu}</span></td>
          <td><span class="chip chip-${c}"><span class="cd" style="background:currentColor"></span>${st}</span>${v.amotion?' <span class="chip chip-purple">A-Motion</span>':''}</td>
          <td style="font-size:12.5px">${v.owner}</td>
          <td class="t-num">${v.fuel==null?'-':`<div style="display:flex;align-items:center;gap:6px;justify-content:flex-end"><div class="prog ${v.fuel<50?'amber':'green'}" style="width:44px"><i style="width:${v.fuel}%"></i></div>${v.fuel}%</div>`}</td>
          <td class="t-num">${v.def==null?'-':v.def+'%'}</td>
          <td class="t-num">${fmt(v.hours)}</td>
          <td>${v.dtc?`<span class="chip chip-red">${v.dtcCode}</span>`:'<span class="chip chip-gray">정상</span>'}</td>
          <td style="font-size:12.5px">${job?job.name:'-'}</td>
          <td><button class="btn btn-sm btn-map" onclick='event.stopPropagation();App.go("map",{layers:["LY-01","LY-02","LY-10"],focus:${JSON.stringify(v.field)}})'>${App.icon('map',13)} 맵</button></td>
        </tr>`; }).join('')}
        <tr id="eqEmpty" style="display:none"><td colspan="9" style="text-align:center;color:var(--ink-3);padding:24px">검색 결과가 없습니다</td></tr></tbody>
    </table></div>`;
  },
  filterStatus(){
    const q=(document.getElementById('eqSearch').value||'').trim().toLowerCase();
    const st=document.getElementById('eqStatus').value, am=document.getElementById('eqAmotion').value;
    let shown=0;
    document.querySelectorAll('#eqBody tr[data-row]').forEach(tr=>{
      const okQ=!q||tr.dataset.search.includes(q);
      const okS=!st||tr.dataset.status===st;
      const okA=!am||tr.dataset.amotion==='1';
      const vis=okQ&&okS&&okA; tr.style.display=vis?'':'none'; if(vis)shown++;
    });
    const empty=document.getElementById('eqEmpty'); if(empty) empty.style.display=shown?'none':'';
  },
  vehDrawer(vid){
    const v=EQUIP.find(x=>x.id===vid); const [st,c]=EQUIP_STATUS[v.status];
    App.drawer(`${v.nick}`, `
      <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">
        <span class="chip chip-${c}"><span class="cd" style="background:currentColor"></span>${st}</span>
        ${v.amotion?'<span class="chip chip-purple">A-Motion</span>':''}
        <span class="chip chip-gray mono">${v.id}</span><span class="chip chip-gray mono">FW ${v.fw}</span>
      </div>
      <div class="grid cols-3" style="margin-bottom:14px">
        <div class="card card-pad" style="padding:12px"><div class="k-label">연료</div><b style="font-size:17px">${v.fuel??'-'}%</b></div>
        <div class="card card-pad" style="padding:12px"><div class="k-label">DEF <span class="mono" style="font-size:9px">5.2.6</span></div><b style="font-size:17px">${v.def??'-'}%</b></div>
        <div class="card card-pad" style="padding:12px"><div class="k-label">누적 가동</div><b style="font-size:17px">${fmt(v.hours)}h</b></div>
      </div>
      <h3 style="margin-bottom:6px">장비 성능 KPI <span class="mono" style="font-size:10px;color:var(--ink-3)">5.2.10</span></h3>
      <div style="display:flex;gap:16px;align-items:center;background:var(--surface-2);border-radius:12px;padding:12px 14px;margin-bottom:14px">
        ${Charts.spark([5.1,6.2,4.8,7.0,6.4,8.1,7.2],120,36,'#0E9F5A')}
        <div style="font-size:12px;color:var(--ink-2)">주간 가동시간 추이<br><b style="color:var(--green)">부하율 정상 · 고장 예측 위험 낮음</b></div>
      </div>
      <h3 style="margin-bottom:8px">소모품 잔여수명 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.2.2</span></h3>
      ${[['엔진오일',v.id==='VH-002'?8:62],['에어필터',44],['유압오일',71],['타이어',85]].map(([n,p])=>`
        <div style="display:flex;align-items:center;gap:10px;padding:5px 0;font-size:12.5px">
          <span style="width:70px;font-weight:600">${n}</span>
          <div class="prog ${p<20?'red':p<50?'amber':'green'}" style="flex:1"><i style="width:${p}%"></i></div>
          <b style="width:36px;text-align:right">${p}%</b>
          ${p<20?`<button class="btn btn-sm btn-primary" onclick="App.toast('부품 Shop 주문서로 이동 (5.2.9)')">주문</button>`:''}
        </div>`).join('')}
      <h3 style="margin:16px 0 8px">원격 기능</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn btn-ghost" onclick="App.toast('원격 디스플레이 접근(RDA) — 소유자 승인 요청 전송')">${App.icon('screen')} RDA 접속 <span class="mono" style="font-size:9px">5.2.7</span></button>
        <button class="btn btn-ghost" onclick="App.toast('UDS 원격진단 시작 — ECU·DCU·DHCU 스캔')">${App.icon('stetho')} 원격진단 <span class="mono" style="font-size:9px">5.2.8</span></button>
        <button class="btn btn-ghost" onclick="App.toast('Geofence 설정 — 등록 지역 2, 야간 시동 알림 ON')">${App.icon('shield')} 도난방지 <span class="mono" style="font-size:9px">5.2.5</span></button>
        <button class="btn btn-ghost" onclick="App.toast('서비스 예약 신청 — 김제 대리점 07.25 오전 가능')">${App.icon('wrench')} 서비스 예약 <span class="mono" style="font-size:9px">5.2.11</span></button>
        <button class="btn btn-ghost" onclick="App.toast('차량 데이터 공유 — 김제 농협·대리점과 공유중')">${App.icon('share')} 데이터 공유 <span class="mono" style="font-size:9px">5.1.4</span></button>
        <button class="btn btn-ghost" onclick="App.toast('소유권 이전 신청서 작성 (승인: Admin/법인)')">${App.icon('swap')} 소유권 이전 <span class="mono" style="font-size:9px">5.1.3</span></button>
      </div>
      ${v.dtc?`<div class="perm-note" style="margin-top:14px">${App.icon('sos')} <div><b>DTC ${v.dtcCode}</b> — 요소수 품질 센서 이상. 고장/수리 이력에 자동 기록되었습니다 (5.2.3). <a style="color:var(--red);font-weight:700;cursor:pointer" onclick="App.toast('서비스 예약으로 이동')">예약 진행 →</a></div></div>`:''}
      <div style="display:flex;gap:8px;margin-top:16px">
        ${mapBtn('맵에서 위치 보기',{layers:['LY-01'],focus:v.field},false)}
        <button class="btn btn-navy" style="flex:1;justify-content:center" onclick="App.toast('SOS 관제 이력 조회 (5.2.4)')">${App.icon('sos')} SOS 이력</button>
      </div>
    `);
  },
  tab_mgmt(){
    const isAdmin=App.role.id==='admin';
    return `<div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card card-pad">
        <h3 style="margin-bottom:4px">모델관리 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.1.1</span> ${isAdmin?'<span class="chip chip-red">Admin 전용</span>':'<span class="chip chip-gray">조회 불가</span>'}</h3>
        ${isAdmin?`
        <p style="font-size:12px;color:var(--ink-2);margin-bottom:10px">3rd party(Buy&Sell·드론 등) 포함 모델 마스터 관리</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>모델</th><th>구분</th><th>제조</th><th>등록 대수</th></tr></thead>
        <tbody>${[['HX1400AI','트랙터(자율)','대동','14'],['GX7510ATC','트랙터','대동','86'],['DSC85','콤바인','대동','31'],['T25','방제드론','3rd party','12']].map(r=>`<tr>${r.map((c,i)=>`<td class="${i===0?'t-strong':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
        :`<div class="empty-state">${App.icon('lock')}<b>SPC Admin 전용 기능입니다</b><small>모델 마스터는 플랫폼 운영자가 관리합니다</small></div>`}
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:14px">
          <h3 style="margin-bottom:8px">등록 가능 본기 카테고리 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.1.2 연계</span></h3>
          <p style="font-size:12px;color:var(--ink-2);margin-bottom:10px">차량 등록(상단 버튼)에서 <b>브랜드별 농기계·DJI 드론·농업용 로봇</b> 등 3rd party 본기를 시리얼/바코드로 등록합니다.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${REGISTER_BRANDS.map(b=>`
              <div style="display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid var(--line);border-radius:12px">
                <div class="lr-swatch" style="background:${b.tone};width:30px;height:30px;border-radius:9px;flex-shrink:0">${App.icon(b.icon,15)}</div>
                <div><b style="font-size:12.5px">${b.name}</b><small style="display:block;font-size:10.5px;color:var(--ink-3)">${b.type}</small></div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card card-pad">
          <h3 style="margin-bottom:8px">소유권 이전·권한공유 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.1.3</span></h3>
          ${[['DK6020 → 이명희','승인 대기','chip-amber'],['GX7510 권한공유 (조수리 정비사)','공유중','chip-blue']].map(([t,s,c])=>`
            <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px">
              <b style="flex:1">${t}</b><span class="chip ${c}">${s}</span></div>`).join('')}
        </div>
      </div>
    </div>`;
  },
  tab_rent(){
    /* 기본 뷰: 등록된 전체 차량 리스트별 임대/배차 상태 조회 */
    return `<div class="grid cols-4" style="margin-bottom:16px">
      ${[['전체 차량',EQUIP.length+'대',''],['임대중',Object.values(RENTALS).filter(r=>r.state==='임대중').length+'대','chip-green'],
         ['임대 예약',Object.values(RENTALS).filter(r=>r.state==='예약').length+'대','chip-amber'],
         ['배차중',JOBS.filter(j=>j.veh&&(j.status==='run'||j.status==='issue')).length+'대','chip-blue']]
        .map(([l,v])=>`<div class="card kpi" style="padding:14px 18px"><div class="k-label">${l}</div><div class="k-value" style="font-size:24px">${v}</div></div>`).join('')}
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>장비</th><th>차량 상태</th><th>임대 상태 <span class="mono" style="font-size:9px">5.3.1</span></th><th>배차 상태 <span class="mono" style="font-size:9px">5.3.2</span></th><th></th></tr></thead>
      <tbody>${EQUIP.map(v=>{
        const [st,c]=EQUIP_STATUS[v.status];
        const rent=RENTALS[v.id];
        const job=JOBS.find(j=>j.veh===v.id&&(j.status==='run'||j.status==='issue'||j.status==='wait'));
        return `<tr>
          <td><span class="t-strong">${v.nick}</span><span class="t-sub mono">${v.id} · ${v.owner}</span></td>
          <td><span class="chip chip-${c}"><span class="cd" style="background:currentColor"></span>${st}</span></td>
          <td>${rent? `<span class="chip ${rent.state==='임대중'?'chip-green':'chip-amber'}">${rent.state}</span>
              <span class="t-sub">${rent.to} · ${rent.mgr} · ${rent.period}</span>`
            : '<span class="chip chip-gray">임대 가능</span>'}</td>
          <td>${job? `<span class="chip chip-blue">배차중</span><span class="t-sub">${job.name} (${job.date})</span>` : '<span style="color:var(--ink-3)">-</span>'}</td>
          <td>${rent? `<button class="btn btn-sm btn-ghost" onclick="Views.equip.rentReturn('${v.id}')">반납 처리</button>`
            : `<button class="btn btn-sm btn-primary" onclick="Views.equip.rentModal('${v.id}')">임대 등록</button>`}</td>
        </tr>`;}).join('')}</tbody>
    </table></div>
    <div class="deep-note" style="margin-top:12px">${App.icon('link')} 배차 상태는 작업관리(6)·농작업 대행(6.5)의 진행/대기 작업과 자동 연계됩니다 — AI 배차 최적화 적용 시 이동 동선 -18%</div>`;
  },
  rentReturn(vid){
    delete RENTALS[vid];
    App.toast(`${EQUIP.find(e=>e.id===vid).nick} 반납 처리 완료 — 임대 가능 상태로 전환`);
    App.rerender();
  },
  /* ---- 5.3.1 차량 임대 등록 (차량 선택 → 임대 정보 입력) ---- */
  rentSel:null,
  rentModal(pre){
    this.rentSel = pre||null;
    App.modal(`차량 임대 등록`, `<div style="padding:22px 26px" id="rentStage">${this.rentStep()}</div>`);
  },
  rentStep(){
    const sel=this.rentSel;
    if(!sel) return `
      <p style="font-size:12.5px;color:var(--ink-2);margin-bottom:14px">임대할 차량을 선택하세요. <b>임대중·배차중 차량은 선택할 수 없습니다.</b></p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        ${EQUIP.map(v=>{
          const rent=RENTALS[v.id];
          const job=JOBS.find(j=>j.veh===v.id&&(j.status==='run'||j.status==='issue'));
          const blocked=rent||job;
          const why=rent?(rent.state==='임대중'?'임대중':'임대 예약'):job?'배차중':'';
          return `<div class="radio-tile" style="${blocked?'opacity:.45;cursor:not-allowed;background:var(--surface-2)':''}"
            ${blocked?'':`onclick="Views.equip.rentSel='${v.id}';document.getElementById('rentStage').innerHTML=Views.equip.rentStep()"`}>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="lr-swatch" style="background:${blocked?'#9AA3AF':'var(--navy)'};width:30px;height:30px;border-radius:9px;flex-shrink:0">${App.icon(v.type==='콤바인'?'combine':v.type==='방제드론'?'drone':'tractor',15)}</div>
              <div style="min-width:0"><b style="font-size:12.5px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.nick}</b>
              <small style="font-size:10.5px;color:var(--ink-3)">${v.id}${why?' · '+why:''}</small></div>
            </div>
          </div>`;}).join('')}
      </div>`;
    const v=EQUIP.find(e=>e.id===sel);
    return `
      <div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border-radius:12px;padding:11px 14px;margin-bottom:16px">
        <div class="lr-swatch" style="background:var(--navy);width:32px;height:32px;border-radius:9px">${App.icon('tractor',16)}</div>
        <b style="font-size:13.5px;flex:1">${v.nick} <span class="mono" style="font-size:10px;color:var(--ink-3)">${v.id}</span></b>
        <button class="btn btn-sm btn-ghost" onclick="Views.equip.rentSel=null;document.getElementById('rentStage').innerHTML=Views.equip.rentStep()">차량 변경</button>
      </div>
      <div class="grid cols-2" style="gap:12px">
        <div class="field-row"><label>임대 시작일</label><input type="text" id="rentFrom" value="2026-07-25"></div>
        <div class="field-row"><label>임대 종료일</label><input type="text" id="rentTo" value="2026-08-25"></div>
        <div class="field-row"><label>임대받는 법인</label><select id="rentOrg"><option>김제 농협</option><option>서산 농협</option><option>B2B 파트너</option><option>개인 농가</option></select></div>
        <div class="field-row"><label>담당자 이름</label><input type="text" id="rentMgr" placeholder="담당자명"></div>
        <div class="field-row" style="grid-column:1/-1"><label>연락처</label><input type="text" id="rentPhone" placeholder="010-0000-0000"></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
        <button class="btn btn-ghost" onclick="App.closeModal()">취소</button>
        <button class="btn btn-primary" onclick="Views.equip.rentComplete()">${App.icon('check')} 임대 등록</button>
      </div>`;
  },
  rentComplete(){
    const v=EQUIP.find(e=>e.id===this.rentSel);
    const org=document.getElementById('rentOrg').value, mgr=document.getElementById('rentMgr').value||'미입력';
    RENTALS[v.id]={ state:'임대중', to:org, mgr, phone:document.getElementById('rentPhone').value||'-',
      period:`${document.getElementById('rentFrom').value.replaceAll('-','.')} ~ ${document.getElementById('rentTo').value.slice(5).replaceAll('-','.')}` };
    App.closeModal(); App.toast(`${v.nick} 임대 등록 완료 — ${org} · ${mgr}`);
    App.go('equip',{tab:'rent'});
  },
  /* ---- 5.4 작업기 등록 ---- */
  implModal(){
    App.modal(`작업기 등록`, `
      <div style="padding:22px 26px">
        <div class="grid cols-2" style="gap:12px">
          <div class="field-row"><label>작업기명</label><input type="text" id="impName" placeholder="예: 로터리 WJ2400"></div>
          <div class="field-row"><label>유형</label><select id="impType"><option>로터리</option><option>파종기</option><option>살포기</option><option>균평기</option><option>수확기</option><option>센서</option></select></div>
          <div class="field-row"><label>제조사</label><select id="impMaker"><option>대동</option><option>FJD</option><option>Soiloptix</option><option>3rd party</option></select></div>
          <div class="field-row"><label>스마트(ISOBUS)</label><select id="impSmart"><option value="1">지원</option><option value="0">미지원</option></select></div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost" onclick="App.closeModal()">취소</button>
          <button class="btn btn-primary" onclick="Views.equip.implComplete()">${App.icon('check')} 등록</button>
        </div>
      </div>`);
  },
  implComplete(){
    const name=document.getElementById('impName').value||'신규 작업기';
    IMPLEMENTS.push({ id:'IM-0'+(IMPLEMENTS.length+1), name, type:document.getElementById('impType').value,
      maker:document.getElementById('impMaker').value, linked:null, smart:document.getElementById('impSmart').value==='1' });
    App.closeModal(); App.toast(`'${name}' 작업기 등록 완료`);
    App.go('equip',{tab:'impl'});
  },
  tab_impl(){
    return `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>작업기</th><th>유형</th><th>제조</th><th>스마트(ISOBUS)</th><th>연결 차량</th><th>상태</th></tr></thead>
      <tbody>${IMPLEMENTS.map(im=>{const v=EQUIP.find(e=>e.id===im.linked);
        return `<tr onclick="App.toast('작업기 상세 — 매칭·사용 이력 (데모)')">
          <td><span class="t-strong">${im.name}</span><span class="t-sub mono">${im.id}</span></td>
          <td>${im.type}</td><td>${im.maker==='대동'?im.maker:`<span class="chip chip-blue">${im.maker}</span>`}</td>
          <td>${im.smart?'<span class="chip chip-green">지원</span>':'<span class="chip chip-gray">미지원</span>'}</td>
          <td>${v?v.model:'-'}</td>
          <td>${v?'<span class="chip chip-blue">장착중</span>':'<span class="chip chip-gray">보관</span>'}</td></tr>`;}).join('')}</tbody>
    </table></div>
    <div class="deep-note" style="margin-top:12px">${App.icon('link')} FJD·Soiloptix 등 3rd party 작업기 등록 관리 — 작업기록은 통합 맵 As-Applied 레이어(LY-04)로 표시</div>`;
  },
  tab_term(){
    return `<div class="perm-note">${App.icon('info')} <div><b>SPC Admin 전용</b> — SPC 向 단말기 서버 분기 trigger 검토(MES 판매처 추가 등), 장착 방식 고려 필요 (v2.1 비고)</div></div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>단말기</th><th>모델</th><th>장착 장비</th><th>펌웨어</th><th>설치일</th><th>통신</th></tr></thead>
      <tbody>${EQUIP.map(v=>`<tr><td class="t-strong mono" style="font-size:12px">${v.tmu}</td><td>${v.tmu.startsWith('TMU-8')?'ADCU-2':'TMU-C1'}</td>
        <td>${v.nick}</td><td class="mono" style="font-size:12px">${v.fw}</td><td class="mono" style="font-size:11.5px;color:var(--ink-3)">2025.0${(v.id.charCodeAt(5)%9)+1}</td>
        <td>${v.status!=='maint'?'<span class="chip chip-green">정상</span>':'<span class="chip chip-red">점검</span>'}</td></tr>`).join('')}</tbody>
    </table></div>`;
  },
  tab_fota(){
    return `<div class="grid" style="grid-template-columns:1.2fr .8fr">
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">FOTA 배포 관리 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.6.1</span> <span class="chip chip-red">Admin 전용</span></h3>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>패키지</th><th>대상</th><th>배포율</th><th>상태</th><th></th></tr></thead>
          <tbody>
            <tr><td><span class="t-strong">ADCU v2.4.2</span><span class="t-sub">A-Motion 경로보정 개선</span></td><td>HX1400AI (14대)</td>
              <td><div style="display:flex;align-items:center;gap:8px"><div class="prog green" style="width:80px"><i style="width:71%"></i></div>71%</div></td>
              <td><span class="chip chip-blue">배포중</span></td>
              <td><button class="btn btn-sm btn-ghost" onclick="App.toast('롤백 이력 조회 (데모)')">롤백</button></td></tr>
            <tr><td><span class="t-strong">TMU-C1 v1.9.1</span><span class="t-sub">절전 로직 개선</span></td><td>GX 시리즈 (86대)</td>
              <td><div style="display:flex;align-items:center;gap:8px"><div class="prog" style="width:80px"><i style="width:12%"></i></div>12%</div></td>
              <td><span class="chip chip-amber">단계 배포</span></td>
              <td><button class="btn btn-sm btn-ghost" onclick="App.toast('배포 일정·대상 필터 (데모)')">일정</button></td></tr>
            <tr><td><span class="t-strong">DSC85 v2.2.0</span><span class="t-sub">수확량 센서 보정</span></td><td>DSC85 (31대)</td>
              <td><div style="display:flex;align-items:center;gap:8px"><div class="prog green" style="width:80px"><i style="width:100%"></i></div>100%</div></td>
              <td><span class="chip chip-green">완료</span></td><td></td></tr>
          </tbody></table></div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:8px">버전업 영향 분석</h3>
        <p style="font-size:12px;color:var(--ink-2);margin-bottom:12px">하드웨어 사양·운행이력 연계 신뢰성 분석</p>
        ${Charts.bars(['v2.2','v2.3','v2.4','v2.4.1'],[3.1,2.2,1.4,0.6],{h:130,color:'#6E56CF'})}
        <small style="font-size:11px;color:var(--ink-3)">버전별 1,000시간당 오류 발생 건수 — v2.4.1에서 최저</small>
      </div>
    </div>`;
  },
  bind(root){ Charts.arm(root); }
};

/* ============================================================ 6. 작업관리 */
Views.work = {
  tab:'status', view:'kanban', agencySub:'intake', selTeam:'T1', selPlot:0,
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    if(params&&params.sub) this.agencySub=params.sub;
    if(params&&params.job){ this.tab='status'; setTimeout(()=>this.jobDrawer(params.job),280); }
    const T=this.tab;
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">WORK · IA 6</div><h1>작업관리</h1>
        <div class="sub">계획 → 실행 → 기록 라이프사이클 · A-Motion 설정은 작업 계획에서 HX1400AI 선택 시 진행</div></div>
        <div class="actions">${permBadge('6.1')}
          <button class="btn btn-primary" onclick="Views.work.planModal()">${App.icon('plus')} 작업 계획 추가</button></div>
      </div>
      <div class="tabs">
        ${[['status','작업현황','6.1'],['plan','작업 캘린더','6.2'],['history','작업이력','6.3'],['datahist','데이터 히스토리','6.3.2'],['agency','농작업 대행','6.5']]
          .map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('work',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}
      </div>
      ${this['tab_'+T]()}
    </div>`;
  },

  /* ---- 6.1 작업현황 (칸반/목록) ---- */
  tab_status(){
    return `<div class="filter-bar">
      <div class="seg">
        <button class="${this.view==='kanban'?'active':''}" onclick="Views.work.view='kanban';App.rerender()">칸반</button>
        <button class="${this.view==='list'?'active':''}" onclick="Views.work.view='list';App.rerender()">목록</button>
      </div>
      <select class="f-select"><option>대분류 전체</option><option>일반</option><option>대행</option></select>
      <select class="f-select"><option>작업유형 전체</option>${WORKTYPES.map(w=>`<option>${w}</option>`).join('')}</select>
      <div style="margin-left:auto">${mapBtn('작업 진행 레이어 맵에서 보기',{layers:['LY-02','LY-01','LY-10']})}</div>
    </div>
    ${this.view==='kanban'? `<div class="kanban">
      ${Object.entries(JOB_STATUS).map(([k,[t,c]])=>{
        const items=JOBS.filter(j=> k==='issue'? j.status==='issue' : j.status===k);
        return `<div class="kan-col">
          <div class="kc-head"><span class="chip chip-${c}">${t}</span><span class="kc-n">${items.length}</span></div>
          ${items.map(j=>{const f=FIELDS.find(x=>x.id===j.field);
            return `<div class="kan-card" onclick="Views.work.jobDrawer('${j.id}')">
              ${typeChip(j)}
              <b>${j.name}</b>
              <div class="kk-meta"><span>${f?f.name:''}</span><span>${fmt(j.area)}평</span><span class="mono">${j.date}</span></div>
              ${j.status==='run'?`<div class="kk-foot"><div class="prog" style="flex:1"><i style="width:${j.prog}%"></i></div><b style="font-size:11px">${j.prog}%</b></div>`:''}
              ${j.issue?`<div class="kk-foot" style="color:var(--red);font-size:11px;font-weight:700">⚠ ${j.issue.split('—')[0]}</div>`:''}
            </div>`;}).join('')||'<div style="padding:14px;text-align:center;color:var(--ink-3);font-size:12px">없음</div>'}
        </div>`;}).join('')}
    </div>`
    : `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>작업</th><th>유형</th><th>필지</th><th class="t-num">면적(평)</th><th>장비</th><th>진행</th><th>상태</th><th></th></tr></thead>
      <tbody>${JOBS.map(j=>{const f=FIELDS.find(x=>x.id===j.field), v=EQUIP.find(e=>e.id===j.veh);
        return `<tr onclick="Views.work.jobDrawer('${j.id}')">
          <td><span class="t-strong">${j.name}</span><span class="t-sub mono">${j.id} · ${j.date}</span></td>
          <td>${typeChip(j)}</td><td>${f?f.name:'-'}</td><td class="t-num">${fmt(j.area)}</td>
          <td style="font-size:12.5px">${v?v.model:'-'}</td>
          <td><div style="display:flex;align-items:center;gap:7px"><div class="prog ${j.status==='issue'?'red':''}" style="width:70px"><i style="width:${j.prog}%"></i></div><span style="font-size:11.5px;font-variant-numeric:tabular-nums">${j.prog}%</span></div></td>
          <td>${jobChip(j.status)}</td>
          <td><button class="btn btn-sm btn-map" onclick='event.stopPropagation();App.go("map",{layers:["LY-02","LY-01"],focus:${JSON.stringify(j.field)}})'>${App.icon('map',13)} 맵</button></td>
        </tr>`;}).join('')}</tbody>
    </table></div>`}`;
  },
  setStatus(jid, st){
    const j=JOBS.find(x=>x.id===jid);
    j.status=st;
    if(st==='done') j.prog=100; else if(st==='wait') j.prog=0; else if(st==='run'&&j.prog===0) j.prog=5;
    App.toast(`'${j.name}' 상태 변경 → ${JOB_STATUS[st][0]}`);
    App.rerender();
    this.jobDrawer(jid);
  },
  jobDrawer(jid){
    const j=JOBS.find(x=>x.id===jid); if(!j) return;
    const f=FIELDS.find(x=>x.id===j.field), v=EQUIP.find(e=>e.id===j.veh);
    App.drawer(`작업 상세 — ${j.name}`,`
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">${typeChip(j)}${jobChip(j.status)}<span class="chip chip-gray mono">${j.id}</span></div>
      <div style="background:var(--surface-2);border-radius:12px;padding:11px 14px;margin-bottom:14px">
        <div style="font-size:11.5px;font-weight:700;color:var(--ink-3);margin-bottom:7px">작업 상태 수동 변경</div>
        <div class="seg" style="width:100%;display:flex">
          ${Object.entries(JOB_STATUS).map(([k,[t]])=>`<button style="flex:1" class="${j.status===k?'active':''}" onclick="Views.work.setStatus('${jid}','${k}')">${t}</button>`).join('')}
        </div>
      </div>
      ${j.status==='run'?`<div style="background:var(--surface-2);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:7px"><b>실시간 진행률</b><b style="color:var(--blue)">${j.prog}%</b></div>
        <div class="prog" style="height:8px"><i style="width:${j.prog}%"></i></div>
        <small style="color:var(--ink-3);font-size:11px;display:block;margin-top:6px">잔여 면적 ${fmt(Math.round(j.area*(1-j.prog/100)))}평 · 예상 완료 16:40</small>
      </div>`:''}
      ${[['필지',f?`${f.name} (${f.id})`:'-'],['면적',fmt(j.area)+'평'],['장비',v?v.nick:'-'],['대행단',j.team||'-'],['작업시간',j.hours+'h'],['연료 사용',j.fuel+'L']]
        .map(([k,val])=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px"><span style="color:var(--ink-3)">${k}</span><b>${val}</b></div>`).join('')}
      ${j.issue?`<div class="perm-note" style="margin-top:12px">${App.icon('sos')} <div><b>이슈</b> — ${j.issue}</div></div>`:''}
      ${j.amotion?`<div style="background:var(--purple-soft);border:1px solid #D8CFF5;border-radius:12px;padding:13px 15px;margin-top:14px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="lr-swatch" style="background:var(--purple);width:30px;height:30px;border-radius:9px">${App.icon('bot',15)}</div>
          <b style="font-size:13px;flex:1">A-Motion 자율작업 <span class="mono" style="font-size:9px;color:var(--ink-3)">6.4</span></b>
          ${mapBtn('관제 모드',{layers:['LY-03','LY-01','LY-02'],focus:j.field,amotion:true})}
        </div>
        ${j.depth?`<div style="font-size:12px;color:var(--ink-2);margin-bottom:6px">경심 ${j.depth} · ${j.rows}단 · RTK 경로이탈 ±4cm</div>`:''}
        <div style="font-size:11.5px;color:var(--ink-2)">최근 이상감지: 07.18 장애물 인식 정지(재개) · 07.12 가이드라인 이탈(보정)</div>
        <div style="font-size:11px;color:var(--ink-3);margin-top:5px">${App.icon('phone',11)} 제어권 이전(6.4.3)은 현장 모바일 단말 전용</div>
      </div>`:''}
      ${j.status==='done'?(Views.work.diaryDone.has(jid)
        ?`<div style="background:var(--green-soft);border:1px solid #BFE8D2;border-radius:12px;padding:13px 15px;margin-top:14px">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="lr-swatch" style="background:var(--green);width:30px;height:30px;border-radius:9px">${App.icon('check',15)}</div>
            <div style="flex:1"><b style="font-size:13px">영농일지 작성 완료 <span class="mono" style="font-size:9px;color:var(--ink-3)">6.2.3</span></b><br><small style="font-size:11px;color:var(--ink-3)">확정된 일지는 작업이력·리포트에 연계됩니다</small></div>
            <button class="btn btn-sm btn-ghost" onclick="App.closeDrawer();Views.work.diaryModal('${jid}')">${App.icon('doc')} 일지 보기</button>
          </div></div>`
        :`<div style="background:linear-gradient(120deg,#FDEEEC,#FFF6F5);border:1px solid #F6D3CE;border-radius:12px;padding:13px 15px;margin-top:14px">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="lr-swatch" style="background:var(--red);width:30px;height:30px;border-radius:9px">${App.icon('bot',15)}</div>
            <div style="flex:1"><b style="font-size:13px">AI 영농일지 <span class="mono" style="font-size:9px;color:var(--ink-3)">6.2.3</span></b><br><small style="font-size:11px;color:var(--ink-3)">작업계획·차량·작업기 데이터로 자동 작성</small></div>
            <button class="btn btn-sm btn-primary" onclick="App.closeDrawer();Views.work.diaryModal('${jid}')">${App.icon('edit')} 영농일지 생성</button>
          </div></div>`):''}
      <div style="display:flex;gap:8px;margin-top:16px">
        ${mapBtn('맵에서 보기',{layers:['LY-02','LY-01'],focus:j.field},false)}
        ${j.status==='done'?mapBtn('작업기록(As-Applied)',{layers:['LY-04','LY-10'],focus:j.field},false):''}
        <button class="btn btn-navy" style="flex:1;justify-content:center" onclick="App.toast('이해관계자 공유 링크 생성됨')">${App.icon('share')} 공유</button>
      </div>
    `);
  },

  /* ---- 6.2.3 AI 영농일지 ---- */
  diaryDone:new Set(),
  diaryModal(jid){
    const j=JOBS.find(x=>x.id===jid), f=FIELDS.find(x=>x.id===j.field);
    const isView=this.diaryDone.has(jid);
    const d=FARM_DIARY[jid] || {
      title:`${j.name} 영농일지`, date:`2026-${j.date.replace('.','-')}`, field:j.field, area:j.area,
      weather:'맑음 · 27℃ · 습도 64%', veh:(EQUIP.find(e=>e.id===j.veh)||{}).nick||'-', impl:'-', team:j.team||'자가작업',
      body:`${j.date}, ${f?f.name:''} 필지(${fmt(j.area)}평)에서 ${j.name} 작업을 수행했습니다. 총 ${j.hours}시간이 소요되었으며 연료 ${j.fuel}L를 사용했습니다. 매칭된 작업계획과 차량·작업기 데이터를 기반으로 자동 작성된 일지입니다.`,
      kpi:[['작업면적',fmt(j.area)+'평'],['작업시간',j.hours+'시간'],['연료',j.fuel+'L'],['작업유형',j.type]],
      photos:['작업 전 (BEFORE)','작업 후 (AFTER)'],
    };
    const revealHTML=`
        <div style="padding:22px 26px;max-height:64vh;overflow-y:auto">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            ${isView?`<span class="chip chip-green">${App.icon('check',12)} 작성 완료</span>`:`<span class="chip chip-red">${App.icon('bot',12)} AI 자동 작성</span>`}
            <span class="chip chip-gray mono">${d.date}</span>
            <span class="chip chip-gray">${f?f.name:d.field}</span>
          </div>
          <h2 style="font-size:18px;font-weight:800;margin:8px 0 14px">${d.title}</h2>
          <div class="grid cols-4" style="gap:8px;margin-bottom:16px">
            ${(d.kpi||[]).map(([k,v])=>`<div style="background:var(--surface-2);border-radius:11px;padding:11px 13px">
              <div style="font-size:11px;color:var(--ink-3);font-weight:600">${k}</div><b style="font-size:15px">${v}</b></div>`).join('')}
          </div>
          <div style="display:flex;gap:16px;font-size:12px;color:var(--ink-2);margin-bottom:14px;flex-wrap:wrap">
            <span>${App.icon('rain',13)} ${d.weather}</span><span>${App.icon('tractor',13)} ${d.veh}</span>
            <span>${App.icon('work',13)} ${d.impl}</span><span>${App.icon('farm',13)} ${d.team}</span>
          </div>
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;font-size:13.5px;line-height:1.75;color:var(--ink)">${d.body}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
            ${d.photos.map(p=>`<div class="photo-ph filled" style="aspect-ratio:16/7">${App.icon('photo',18)} ${p}</div>`).join('')}
          </div>
          ${isView?'':`<div class="perm-note" style="margin-top:14px">${App.icon('info')} <div>AI 초안입니다 — 내용을 검토·수정 후 확정하세요. 확정 시 <b>작업이력·보조금 증빙 리포트(10.2)</b>에 자동 연계됩니다.</div></div>`}
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--line);display:flex;gap:8px;justify-content:flex-end">
          ${isView?`
            <button class="btn btn-ghost" onclick="App.toast('PDF로 내보냈습니다 (데모)')">${App.icon('download')} PDF</button>
            <button class="btn btn-navy" onclick="App.closeModal()">닫기</button>`
          :`
            <button class="btn btn-ghost" onclick="App.toast('일지를 수정 모드로 전환 (데모)')">${App.icon('edit')} 수정</button>
            <button class="btn btn-ghost" onclick="App.toast('PDF로 내보냈습니다 (데모)')">${App.icon('download')} PDF</button>
            <button class="btn btn-primary" onclick="Views.work.diaryConfirm('${jid}')">${App.icon('check')} 확정·저장</button>`}
        </div>`;
    if(isView){
      /* 작성 완료 일지 — 생성 애니메이션 없이 바로 조회 */
      App.modal(`영농일지 조회`, `<div id="diaryStage" style="padding:0">${revealHTML}</div>`);
      return;
    }
    App.modal(`AI 영농일지`, `
      <div id="diaryStage" style="padding:0">
        <div id="diaryGen" style="padding:40px 30px;text-align:center">
          <div class="lr-swatch" style="background:var(--red);width:52px;height:52px;border-radius:15px;margin:0 auto 16px">${App.icon('bot',26)}</div>
          <b style="font-size:15px;display:block;margin-bottom:6px">AI가 영농일지를 작성하고 있습니다</b>
          <small style="color:var(--ink-3)">작업계획 · 차량 운행 데이터 · 작업기 데이터를 분석 중...</small>
          <div style="max-width:320px;margin:20px auto 0">
            ${['작업 계획 매칭','차량 운행 데이터 수집','작업기·기상 데이터 결합','일지 초안 생성'].map((s,i)=>`
              <div class="diary-step" data-i="${i}" style="display:flex;align-items:center;gap:10px;padding:7px 0;font-size:12.5px;color:var(--ink-3);opacity:.4;transition:opacity .3s">
                <span class="ds-ico" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--line-2);display:grid;place-items:center;flex-shrink:0"></span>${s}</div>`).join('')}
          </div>
        </div>
      </div>`);
    const steps=[...document.querySelectorAll('.diary-step')];
    steps.forEach((st,i)=>setTimeout(()=>{
      st.style.opacity='1'; st.querySelector('.ds-ico').innerHTML=App.icon('check',13);
      st.querySelector('.ds-ico').style.cssText='width:20px;height:20px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;flex-shrink:0';
    }, 400+i*420));
    setTimeout(()=>{
      const stage=document.getElementById('diaryStage'); if(!stage) return;
      stage.innerHTML=revealHTML;
    }, 400+steps.length*420+300);
  },
  diaryConfirm(jid){
    this.diaryDone.add(jid);
    App.closeModal();
    App.toast('영농일지가 확정·저장되었습니다 — 작성 완료 상태로 변경');
    App.rerender();
  },

  /* ---- 6.2.1 작업 계획 추가 (일정·유형·작업자·장비·작업기 → 캘린더 등록, 과거 작업은 히스토리 불러오기) ---- */
  planModal(preDate){
    App.modal(`작업 계획 추가`, `
      <div style="padding:22px 26px">
        <div class="grid cols-2" style="gap:12px">
          <div class="field-row"><label>작업 일정</label><input type="text" id="plDate" value="${preDate||'2026-07-25'}" onchange="Views.work.planSync()"></div>
          <div class="field-row"><label>대분류</label>
            <div style="display:flex;gap:8px">
              <div class="radio-tile sel" id="plCat일반" style="padding:9px;text-align:center" onclick="Views.work.planCat('일반')"><b style="font-size:12.5px">일반</b></div>
              <div class="radio-tile" id="plCat대행" style="padding:9px;text-align:center" onclick="Views.work.planCat('대행')"><b style="font-size:12.5px">대행</b></div>
            </div></div>
          <div class="field-row"><label>작업 유형</label><select id="plType">${WORKTYPES.map(w=>`<option>${w}</option>`).join('')}</select></div>
          <div class="field-row"><label>필지</label><select id="plField">${FIELDS.map(f=>`<option value="${f.id}">${f.name} (${f.id}) · ${fmt(f.area)}평</option>`).join('')}</select></div>
          <div class="field-row"><label>작업자</label><input type="text" id="plWorker" value="${App.role.name}"></div>
          <div class="field-row"><label>장비</label><select id="plVeh" onchange="Views.work.planSync()">
            <option value="">선택 안 함</option>
            ${EQUIP.filter(e=>e.type!=='방제드론').map(e=>`<option value="${e.id}">${e.nick} (${e.model})</option>`).join('')}
          </select></div>
          <div class="field-row" style="grid-column:1/-1"><label>작업기</label><select id="plImpl">
            <option value="">선택 안 함</option>
            ${IMPLEMENTS.map(im=>`<option>${im.name} (${im.type}${im.smart?' · ISOBUS':''})</option>`).join('')}
          </select></div>
        </div>
        <div id="plAmotion"></div>
        <div id="plPast"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
          <button class="btn btn-ghost" onclick="App.closeModal()">취소</button>
          <button class="btn btn-primary" onclick="Views.work.planComplete()">${App.icon('check')} 캘린더에 등록</button>
        </div>
      </div>`);
    this._plCat='일반';
    this.planSync();
  },
  planCat(c){
    this._plCat=c;
    document.getElementById('plCat일반').classList.toggle('sel',c==='일반');
    document.getElementById('plCat대행').classList.toggle('sel',c==='대행');
  },
  planSync(){
    /* 6.4 → 장비에서 HX1400AI 선택 시 A-Motion 설정 프로세스 등장 */
    const vehSel=document.getElementById('plVeh'); if(!vehSel) return;
    const veh=EQUIP.find(e=>e.id===vehSel.value);
    const am=document.getElementById('plAmotion');
    am.innerHTML = (veh&&veh.amotion) ? `
      <div style="background:var(--purple-soft);border:1px solid #D8CFF5;border-radius:12px;padding:14px 16px;margin-top:4px;animation:popIn .25s var(--ease)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div class="lr-swatch" style="background:var(--purple);width:28px;height:28px;border-radius:8px">${App.icon('bot',14)}</div>
          <b style="font-size:13px">A-Motion 자율작업 설정</b>
          <span class="mono" style="font-size:9px;color:var(--ink-3)">6.2.2 · 6.4.1</span>
          <span class="chip chip-purple" style="margin-left:auto">${veh.model}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          <div class="field-row" style="margin:0"><label>작업 패턴</label><select><option>왕복 (U-turn 자동)</option><option>나선</option></select></div>
          <div class="field-row" style="margin:0"><label>경심 깊이</label><input type="text" value="22 cm"></div>
          <div class="field-row" style="margin:0"><label>작업 단수</label><input type="text" value="14 단"></div>
        </div>
        <small style="font-size:11px;color:var(--ink-2);display:block;margin-top:8px">${App.icon('map',11)} 경작지 경계(4.4) 기반 RTK 경로가 자동 생성됩니다 · 제어권 이전은 현장 App 전용(6.4.3)</small>
      </div>`:'';
    /* 과거 날짜 → 데이터 히스토리 불러오기 (6.3.2 연계) */
    const dv=document.getElementById('plDate').value;
    const isPast = dv < DEMO_TODAY.iso;
    document.getElementById('plPast').innerHTML = isPast ? `
      <div style="background:var(--blue-soft);border:1px solid #C4D6F7;border-radius:12px;padding:13px 15px;margin-top:10px;animation:popIn .25s var(--ease)">
        <div style="display:flex;align-items:center;gap:9px">
          <div class="lr-swatch" style="background:var(--blue);width:30px;height:30px;border-radius:9px">${App.icon('route',15)}</div>
          <div style="flex:1"><b style="font-size:12.5px">과거 작업 — 데이터 히스토리 불러오기 <span class="mono" style="font-size:9px;color:var(--ink-3)">6.3.2</span></b><br>
          <small style="font-size:11px;color:var(--ink-2)">선택 장비의 해당일 운행 데이터(가동시간·면적·연료·경심)를 자동 입력해 소급 기록합니다</small></div>
          <button class="btn btn-sm btn-primary" onclick="Views.work.pullHistory()">불러오기</button>
        </div>
        <div id="histResult" style="margin-top:10px"></div>
      </div>`:'';
  },
  planComplete(){
    const date=document.getElementById('plDate').value;
    const fid=document.getElementById('plField').value;
    const f=FIELDS.find(x=>x.id===fid);
    const type=document.getElementById('plType').value;
    const vehId=document.getElementById('plVeh').value||null;
    const veh=EQUIP.find(e=>e.id===vehId);
    const isPast=date<DEMO_TODAY.iso;
    const mmdd=date.slice(5).replace('-','.');
    JOBS.push({ id:'JOB-'+(108+JOBS.length-7), name:`${f.name} ${type}`, cat:this._plCat, type,
      amotion:!!(veh&&veh.amotion), status:isPast?'done':'wait', field:fid, veh:vehId,
      prog:isPast?100:0, date:mmdd, area:f.area, team:this._plCat==='대행'?'배차 대기':null, hours:isPast?2.8:0, fuel:isPast?21:0 });
    /* 등록한 날짜(7월)를 캘린더에서 하이라이트 */
    this._justAddedDay = date.slice(0,7)==='2026-07' ? parseInt(date.slice(8,10),10) : null;
    App.closeModal();
    App.toast(`'${f.name} ${type}' 계획이 캘린더에 등록되었습니다${isPast?' (과거 작업 소급 기록)':''}`);
    App.go('work',{tab:'plan'});
  },
  pullHistory(){
    const box=document.getElementById('histResult');
    box.innerHTML=`<div class="ai-typing" style="background:#fff"><i></i><i></i><i></i></div>`;
    setTimeout(()=>{
      const h=WORK_HISTORY['VH-001'].find(x=>x.src==='과거 등록')||WORK_HISTORY['VH-001'][3];
      box.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
        ${[['가동시간',h.hours+'h'],['작업면적',fmt(h.area)+'평'],['연료',h.fuel+'L'],['경심',h.depth],['평균속도',h.avgSpeed+'km/h']]
          .map(([k,v])=>`<span class="chip chip-blue">${k} ${v}</span>`).join('')}</div>
        <small style="font-size:11px;color:var(--green);font-weight:700;display:block;margin-top:6px">✓ TMU 운행 데이터를 불러와 자동 입력했습니다</small>`;
    },900);
  },

  /* ---- 6.3.2 작업 데이터 히스토리 ---- */
  histVeh:'VH-001',
  tab_datahist(){
    const list=EQUIP.filter(v=>WORK_HISTORY[v.id]);
    const rows=WORK_HISTORY[this.histVeh]||[];
    const totH=rows.reduce((s,r)=>s+r.hours,0), totA=rows.reduce((s,r)=>s+r.area,0), totF=rows.reduce((s,r)=>s+r.fuel,0);
    return `<div class="perm-note">${App.icon('info')} <div>차량·작업기별 <b>운행/작업 데이터 히스토리</b>를 시계열로 조회합니다. 과거 작업 등록(6.2.1) 시 이 데이터를 불러올 수 있습니다.</div></div>
    <div class="filter-bar">
      <div class="seg">
        ${list.map(v=>`<button class="${this.histVeh===v.id?'active':''}" onclick="Views.work.histVeh='${v.id}';App.rerender()">${v.model}</button>`).join('')}
      </div>
      <select class="f-select" id="dhImpl" onchange="Views.work.filterDataHist()"><option value="">작업기 전체</option>${[...new Set(rows.map(r=>r.impl).filter(i=>i&&i!=='-'))].map(i=>`<option value="${i}">${i}</option>`).join('')}</select>
      <div style="margin-left:auto">${mapBtn('주행경로 이력 맵',{layers:['LY-05','LY-04','LY-10']})}</div>
    </div>
    <div class="grid cols-4" style="margin-bottom:16px">
      ${[['누적 가동시간',totH.toFixed(1),'h'],['누적 작업면적',fmt(totA),'평'],['누적 연료',fmt(totF),'L'],['기록 건수',rows.length,'건']]
        .map(([l,v,u])=>`<div class="card kpi" style="padding:14px 18px"><div class="k-label">${l}</div><div class="k-value" style="font-size:23px">${v}<small>${u}</small></div></div>`).join('')}
    </div>
    <div class="grid" style="grid-template-columns:1.3fr .7fr">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>작업일</th><th>작업</th><th>작업기</th><th class="t-num">가동(h)</th><th class="t-num">면적(평)</th><th class="t-num">연료(L)</th><th class="t-num">평균속도</th><th>출처</th></tr></thead>
        <tbody id="dhBody">${rows.map(r=>`
          <tr data-row data-impl="${r.impl}" onclick="App.toast('${r.date} 상세 운행 데이터 — 경로·속도 프로파일 (데모)')">
            <td class="mono" style="font-size:12px">${r.date}</td><td class="t-strong">${r.job}</td><td style="font-size:12px">${r.impl}</td>
            <td class="t-num">${r.hours}</td><td class="t-num">${fmt(r.area)}</td><td class="t-num">${r.fuel}</td><td class="t-num">${r.avgSpeed}km/h</td>
            <td><span class="chip ${r.src==='A-Motion'?'chip-purple':r.src==='대행'?'chip-blue':r.src==='과거 등록'?'chip-amber':'chip-gray'}">${r.src}</span></td>
          </tr>`).join('')}
          <tr id="dhEmpty" style="display:none"><td colspan="8" style="text-align:center;color:var(--ink-3);padding:24px">선택한 작업기의 기록이 없습니다</td></tr></tbody>
      </table></div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">월별 가동시간</h3>
        ${Charts.bars(['4월','5월','6월','7월'],[2.8,5.5,2.9,1.6],{h:130,color:'#2E6BE6'})}
        <div class="deep-note" style="margin-top:10px">${App.icon('route')} 차량 운행·작업기 데이터는 TMU/ISOBUS에서 수집되어 차량별로 축적됩니다</div>
      </div>
    </div>`;
  },
  filterDataHist(){
    const impl=document.getElementById('dhImpl').value;
    let shown=0;
    document.querySelectorAll('#dhBody tr[data-row]').forEach(tr=>{
      const vis=!impl||tr.dataset.impl===impl; tr.style.display=vis?'':'none'; if(vis)shown++;
    });
    const empty=document.getElementById('dhEmpty'); if(empty) empty.style.display=shown?'none':'';
  },

  /* ---- 6.2 캘린더 (JOBS 연동 — 계획 추가 시 자동 표출, 클릭 시 작업 상세) ---- */
  tab_plan(){
    /* 작업 데이터에서 이벤트 파생 */
    const evts={};
    JOBS.filter(j=>j.date&&j.date.startsWith('07')).forEach(j=>{
      const d=parseInt(j.date.split('.')[1]); if(!d) return;
      const cls=j.amotion?'e-purple':j.cat==='대행'?'e-blue':'e-green';
      (evts[d]=evts[d]||[]).push([j.name, cls, j.id]);
    });
    [[8,'자재 입고 — 비료','e-amber'],[28,'생육진단 드론 촬영 (예약)','e-amber']].forEach(([d,t,c])=>{ (evts[d]=evts[d]||[]).push([t,c,null]); });
    const added=this._justAddedDay;
    let cells=''; const firstDow=3, days=31;
    for(let i=0;i<firstDow;i++) cells+=`<div class="cal-cell dim"><span class="cd-num">${28+i}</span></div>`;
    for(let d=1;d<=days;d++){
      const dd=String(d).padStart(2,'0');
      cells+=`<div class="cal-cell ${d===DEMO_TODAY.dom?'today':''} ${d===added?'just-added':''}" ${d===added?'data-added="1"':''} onclick="Views.work.planModal('2026-07-${dd}')" title="클릭하여 작업 계획 추가">
        <span class="cd-num">${d}</span>
        ${(evts[d]||[]).map(([t,c,jid])=>`<div class="cal-evt ${c}" ${jid?`onclick="event.stopPropagation();App.go('work',{tab:'status',job:'${jid}'})" title="작업 상세 보기"`:''}>${t}</div>`).join('')}
      </div>`;
    }
    this._justAddedDay=null;   /* 하이라이트는 1회성 */
    return `<div class="grid" style="grid-template-columns:minmax(0,1fr) 300px">
      <div style="min-width:0">
        <div class="filter-bar" style="margin-bottom:12px">
          <div class="seg"><button class="active">월</button><button onclick="App.toast('주간 뷰 (데모)')">주</button></div>
          <b style="font-size:15px;margin-left:6px">2026년 7월</b>
          <span class="deep-note" style="margin-left:8px">${App.icon('info',12)} 날짜 클릭 → 계획 추가 · 작업 클릭 → 상세</span>
          <div class="deep-note" style="margin-left:auto">${App.icon('bot')} AI to-do 제안: 3건 <span style="color:var(--red);font-weight:800;cursor:pointer" onclick="App.openAI('todo')">보기</span></div>
        </div>
        <div class="cal">
          <div class="cal-head">${['일','월','화','수','목','금','토'].map(d=>`<div>${d}</div>`).join('')}</div>
          <div class="cal-grid">${cells}</div>
        </div>
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:14px">
          <h3 style="margin-bottom:8px">계획 대비 실행</h3>
          <div style="display:flex;justify-content:center" id="planDonut">${Charts.donut(78,{label:'7월 이행률',color:'#0E9F5A',size:110})}</div>
          <small style="font-size:11.5px;color:var(--ink-3);display:block;text-align:center;margin-top:6px">지연 1건 · 기상 조정 권고 1건</small>
        </div>
        <div class="card card-pad">
          <h3 style="margin-bottom:8px">작업 계획 추가 <span class="mono" style="font-size:10px;color:var(--ink-3)">6.2.1</span></h3>
          <p style="font-size:12px;color:var(--ink-2);margin-bottom:10px">일정·유형·작업자·장비·작업기를 선택해 등록합니다. <b>HX1400AI 선택 시 A-Motion 설정</b>이, <b>과거 날짜 선택 시 데이터 히스토리 불러오기</b>가 나타납니다.</p>
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="Views.work.planModal()">${App.icon('plus')} 작업 계획 추가</button>
        </div>
      </div>
    </div>`;
  },

  /* 6.4 A-Motion: 별도 탭 제거 — 작업 계획 추가에서 HX1400AI 선택 시 설정 프로세스 등장,
     관제·이상감지는 작업 상세(A-Motion 작업)와 통합 모니터링 관제 모드에서 제공 */

  /* ---- 6.3 작업이력 ---- */
  tab_history(){
    const done=JOBS.filter(j=>j.status==='done');
    return `<div class="grid cols-3" style="margin-bottom:16px">
      <div class="card kpi"><div class="k-label">7월 완료 작업</div><div class="k-value">${done.length+9}<small>건</small></div><div class="k-spark">${Charts.spark([2,4,3,6,5,8],84,30,'#0E9F5A')}</div></div>
      <div class="card kpi"><div class="k-label">평균 작업효율</div><div class="k-value">356<small>평/h</small></div><div class="k-delta up">▲ +9% 전월</div></div>
      <div class="card kpi"><div class="k-label">연료 원단위</div><div class="k-value">0.026<small>L/평</small></div><div class="k-delta up">▲ 개선</div></div>
    </div>
    <div class="card card-pad" style="margin-bottom:16px;display:flex;align-items:center;gap:14px;background:linear-gradient(120deg,#FFF6F5,#FCFBFA)">
      <div class="lr-swatch" style="background:var(--red);width:40px;height:40px;border-radius:12px">${App.icon('bot',20)}</div>
      <div style="flex:1"><b style="font-size:14px">AI 영농일지 <span class="mono" style="font-size:10px;color:var(--ink-3)">6.2.3</span></b>
        <p style="font-size:12px;color:var(--ink-2);margin-top:2px">완료된 작업의 계획·차량·작업기 데이터를 결합해 영농일지를 자동 작성합니다. 아래 목록의 <b>[일지]</b> 버튼으로 생성하세요.</p></div>
      <button class="btn btn-primary" onclick="Views.work.diaryModal('JOB-101')">${App.icon('edit')} 샘플 영농일지 보기</button>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>작업</th><th>필지</th><th>일자</th><th>장비/작업기</th><th class="t-num">시간</th><th class="t-num">연료(L)</th><th class="t-num">효율(평/h)</th><th>기록</th><th>영농일지</th></tr></thead>
      <tbody>${done.concat([{id:'JOB-098',name:'큰들 이앙',field:'GJ-R8',date:'06.12',veh:'VH-005',hours:5.5,fuel:24,area:2210},
        {id:'JOB-092',name:'안들 2 로터리',field:'GJ-R2',date:'05.28',veh:'VH-001',hours:3.1,fuel:19,area:1216}]).map(j=>{
        const f=FIELDS.find(x=>x.id===j.field), v=EQUIP.find(e=>e.id===j.veh);
        return `<tr onclick="App.toast('작업결과 상세 — 경로·속도·커버리지 분석 (데모)')">
          <td><span class="t-strong">${j.name}</span><span class="t-sub mono">${j.id}</span></td>
          <td>${f?f.name:'-'}</td><td class="mono" style="font-size:12px">${j.date}</td>
          <td style="font-size:12.5px">${v?v.model:'-'}</td>
          <td class="t-num">${j.hours}h</td><td class="t-num">${j.fuel}</td>
          <td class="t-num t-strong">${j.hours?fmt(Math.round(j.area/j.hours)):'-'}</td>
          <td><button class="btn btn-sm btn-map" onclick='event.stopPropagation();App.go("map",{layers:["LY-04","LY-05","LY-10"],focus:${JSON.stringify(j.field)}})'>${App.icon('map',13)} 기록 맵</button></td>
          <td>${Views.work.diaryDone.has(j.id)
            ?`<button class="btn btn-sm btn-ghost" style="color:var(--green);border-color:#BFE8D2" onclick="event.stopPropagation();Views.work.diaryModal('${j.id}')">${App.icon('check',13)} 작성 완료</button>`
            :`<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();Views.work.diaryModal('${j.id}')">${App.icon('bot',13)} 일지 생성</button>`}</td>
        </tr>`;}).join('')}</tbody>
    </table></div>
    <div class="deep-note" style="margin-top:12px">${App.icon('map')} 주행경로·As-Applied 지도는 통합 모니터링의 기록 레이어(LY-04·05)에서 표시됩니다 — 본 화면은 목록·분석 전담</div>`;
  },

  /* ---- 6.5 농작업 대행 ---- */
  tab_agency(){
    const sub=this.agencySub;
    return `
    <div class="card" style="margin-bottom:14px">
      <div style="padding:12px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <span class="chip chip-green"><span class="cd" style="background:currentColor"></span>모집중</span>
        <b style="font-size:15px">${CONTRACT.title}</b>
        <span style="font-size:12px;color:var(--ink-2)">${CONTRACT.period}</span>
        <span style="font-size:12px;color:var(--ink-2)">${CONTRACT.crops}</span>
        <span style="font-size:12px;color:var(--ink-3)">${CONTRACT.region}</span>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <div class="seg">
            ${[['intake','통합 매칭','6.5.1'],['progress','대행현황','6.5.2'],['settle','정산','6.5.3']]
              .map(([k,n])=>`<button class="${sub===k?'active':''}" onclick="App.go('work',{tab:'agency',sub:'${k}'})">${n}</button>`).join('')}
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.toast('공고 상세 (데모)')">공고 상세</button>
        </div>
      </div>
    </div>
    ${sub==='intake'?this.agIntake(): sub==='progress'?this.agProgress():this.agSettle()}`;
  },

  /* ===== 6.5.1 통합 매칭 — Figma '관리자 web 대행단 매칭(26.06.22)' 농가→필지 흐름 ===== */
  agFarmer:'F1', agSel:new Set(), agTab:'전체',
  agIntake(){
    const F=AG_FARMERS.find(f=>f.id===this.agFarmer)||AG_FARMERS[0];
    const allPlots=AG_FARMERS.flatMap(f=>f.plots);
    const cnt=st=>allPlots.filter(p=>p.st===st).length;
    const matched=allPlots.filter(p=>p.st==='확정');
    const matchedAmt=matched.reduce((s,p)=>s+p.price,0);
    const totalAmt=allPlots.reduce((s,p)=>s+p.price,0);
    /* 농가 헤더 KPI */
    const fArea=F.plots.reduce((s,p)=>s+p.area,0);
    const fAcc=F.plots.filter(p=>p.st==='확정');
    const fAccArea=fAcc.reduce((s,p)=>s+p.area,0);
    const fAccAmt=fAcc.reduce((s,p)=>s+p.price,0);
    const fTotAmt=F.plots.reduce((s,p)=>s+p.price,0);
    const rate=Math.round(fAccArea/F.limit*1000)/10;
    /* 필지 탭 필터 */
    const shown=F.plots.filter(p=>this.agTab==='전체'||p.st===this.agTab);
    const fcnt=st=>F.plots.filter(p=>p.st===st).length;
    return `<div style="display:grid;grid-template-columns:236px minmax(0,1fr) 320px;gap:14px;align-items:start">

      <!-- 좌: 농가 리스트 사이드 -->
      <div>
        <div class="card card-pad" style="padding:14px 16px;margin-bottom:10px">
          <div style="font-size:11px;color:var(--ink-3);font-weight:700">현재 매칭 예상 정산 / 전체 예상 단가</div>
          <div style="font-size:16px;font-weight:800;margin-top:3px"><span style="color:var(--red)">${fmtW(matchedAmt)}</span> <span style="color:var(--ink-3);font-weight:600">/ ${fmtW(totalAmt).slice(1)}</span></div>
          <small style="font-size:10.5px;color:var(--ink-3)">매칭된 ${matched.length}/${allPlots.length}필지 기준</small>
        </div>
        <div class="card card-pad" style="padding:13px 15px;margin-bottom:10px">
          <div style="display:flex;align-items:center;margin-bottom:7px"><b style="font-size:12px">농가 필터</b>
            <button style="margin-left:auto;font-size:10.5px;color:var(--ink-3)" onclick="App.toast('필터 초기화')">↺ 초기화</button></div>
          ${[['우대',['전체','65↑','여성','영세']],['출처',['전체','온','오']],['상태',['전체','대기','반려','확정']]].map(([k,ops])=>`
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:5px;flex-wrap:wrap">
              <span style="font-size:10.5px;color:var(--ink-3);width:26px;font-weight:700">${k}</span>
              ${ops.map((o,i)=>`<button class="preset-pill ${i===0?'active':''}" style="padding:2px 8px;font-size:10px" onclick="App.toast('${k} 필터: ${o} (데모)')">${o}</button>`).join('')}
            </div>`).join('')}
          <button class="btn btn-sm" style="width:100%;justify-content:center;margin-top:7px;border:1.5px solid var(--red);color:var(--red);border-radius:9px" onclick="Views.work.ocrModal()">+ 오프라인 일괄 업로드</button>
        </div>
        <div class="card" style="overflow:hidden">
          <div style="padding:12px 15px;border-bottom:1px solid var(--line)">
            <b style="font-size:12.5px">신청 농가(${CONTRACT.farms})</b>
            <div style="display:flex;gap:8px;font-size:10.5px;color:var(--ink-2);margin-top:5px">
              <span>필지 ${allPlots.length}</span>
              <span style="color:var(--blue)">● 대기 ${cnt('대기')}</span>
              <span style="color:var(--red)">● 반려 ${cnt('반려')}</span>
              <span style="color:var(--green)">● 확정 ${cnt('확정')}</span>
            </div>
          </div>
          ${AG_FARMERS.map(fm=>{
            const sel=fm.id===this.agFarmer;
            return `<div style="padding:10px 15px;border-bottom:1px solid var(--line);cursor:pointer;${sel?'background:var(--red-soft)':''}"
              onclick="Views.work.agFarmer='${fm.id}';Views.work.agSel.clear();Views.work.agTab='전체';App.rerender()">
              <div style="display:flex;align-items:center;gap:6px">
                <b style="font-size:12.5px">${fm.name}</b>
                <small style="color:var(--ink-3);font-size:10.5px">(${fm.gender}, ${fm.age})</small>
                <small style="margin-left:auto;font-size:10px;color:var(--ink-3)">${fm.on?'온 '+fm.on:''} ${fm.off?'오 '+fm.off:''} · ${fm.date}</small>
              </div>
              <div style="display:flex;gap:3px;margin-top:4px;align-items:center">
                ${fm.tags.map(t=>`<span class="chip chip-gray" style="font-size:9px;padding:1px 6px">${t}</span>`).join('')}
                <small style="margin-left:auto;font-size:10px;color:var(--ink-2)">필지 ${fm.plots.length} ·
                  <span style="color:var(--blue)">대기 ${fm.plots.filter(p=>p.st==='대기').length}</span>
                  ${fm.plots.some(p=>p.st==='반려')?`<span style="color:var(--red)"> 반려 ${fm.plots.filter(p=>p.st==='반려').length}</span>`:''}
                  <span style="color:var(--green)"> 확정 ${fm.plots.filter(p=>p.st==='확정').length}</span></small>
              </div>
            </div>`;}).join('')}
        </div>
      </div>

      <!-- 중: 농가 헤더 + 필지 테이블 -->
      <div style="min-width:0">
        <div class="card card-pad" style="margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">
            <span class="role-avatar" style="width:36px;height:36px;background:var(--red);font-size:14px">${F.name[0]}</span>
            <div><b style="font-size:15px">${F.name}</b> <small style="color:var(--ink-2)">(${F.gender}, ${F.age}세)</small>
              ${F.tags.map(t=>`<span class="chip chip-red" style="font-size:9.5px;margin-left:3px">${t}</span>`).join('')}
              <div style="font-size:11px;color:var(--ink-3);margin-top:1px">${App.icon('phone',10)} ${F.phone} · ID ${F.uid} · 신청일 2026.${F.date}</div></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
            <div><div style="font-size:10.5px;color:var(--ink-3);font-weight:700">신청 필지</div>
              <b style="font-size:16px">${F.plots.length}필지</b><small style="display:block;font-size:10px;color:var(--ink-3)">${fmt(fArea)}평</small></div>
            <div><div style="font-size:10.5px;color:var(--ink-3);font-weight:700">수락 필지</div>
              <b style="font-size:16px">${fAcc.length}필지 <small style="font-size:10px;color:var(--ink-3)">${fAcc.length}/${F.plots.length}</small></b>
              <div class="prog red" style="height:4px;margin-top:4px"><i style="width:${F.plots.length?fAcc.length/F.plots.length*100:0}%"></i></div>
              <small style="font-size:10px;color:var(--ink-3)">${fmt(fAccArea)}평</small></div>
            <div><div style="font-size:10.5px;color:var(--ink-3);font-weight:700">수락 면적률</div>
              <b style="font-size:16px;color:${rate>80?'var(--red)':'var(--ink)'}">${rate}%</b>
              <div class="prog red" style="height:4px;margin-top:4px"><i style="width:${Math.min(100,rate)}%"></i></div>
              <small style="font-size:10px;color:var(--ink-3)">${fmt(F.limit)}평 한도</small></div>
            <div><div style="font-size:10.5px;color:var(--ink-3);font-weight:700">현재 매칭 예상 정산</div>
              <b style="font-size:16px;color:var(--red)">${fmtW(fAccAmt)}</b>
              <small style="display:block;font-size:10px;color:var(--ink-3)">/ ${fmt(fTotAmt)} · 매칭 ${fAcc.length}/${F.plots.length}필지 기준</small></div>
          </div>
        </div>
        <div class="filter-bar" style="margin-bottom:10px">
          <div class="seg">
            ${['전체','대기','반려','확정'].map(t=>{
              const n=t==='전체'?F.plots.length:fcnt(t);
              return `<button class="${this.agTab===t?'active':''}" onclick="Views.work.agTab='${t}';App.rerender()">${t} <span style="font-variant-numeric:tabular-nums">${n}</span></button>`;}).join('')}
          </div>
          <span class="chip chip-blue">☑ 온라인 ${F.plots.filter(p=>p.src==='온').length}</span>
          <span class="chip chip-amber">☑ 오프라인 ${F.plots.filter(p=>p.src==='오').length}</span>
          <button class="btn btn-sm btn-ghost" style="margin-left:auto" onclick="App.toast('엑셀 다운로드 (데모)')">${App.icon('download')} 엑셀 다운로드</button>
        </div>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th style="width:34px"></th><th>상태</th><th>농가</th><th>필지 정보</th><th class="t-num">면적</th><th>작업</th><th>매칭 대행단</th><th class="t-num">예상가격 ▾</th></tr></thead>
          <tbody>${shown.map(p=>{
            const stc=p.st==='확정'?'chip-green':p.st==='반려'?'chip-red':'chip-blue';
            const selectable=p.st==='대기';
            const isSel=this.agSel.has(p.pid);
            return `<tr class="${isSel?'sel':''}" style="${selectable?'':'cursor:default'}" ${selectable?`onclick="Views.work.togglePlot('${p.pid}')"`:''}>
              <td><input type="checkbox" ${isSel?'checked':''} ${selectable?'':'disabled'} style="accent-color:var(--red);pointer-events:none"></td>
              <td><span class="chip ${stc}"><span class="cd" style="background:currentColor"></span>${p.st}</span></td>
              <td><span class="t-strong" style="font-size:12px">${F.name}</span><span class="t-sub">(${F.gender}, ${F.age}) ${F.tags[0]||''} <span class="chip ${p.src==='온'?'chip-blue':'chip-amber'}" style="font-size:9px;padding:0 5px">${p.src}</span></span></td>
              <td><span class="t-strong" style="font-weight:700">${p.name}</span><span class="t-sub">${p.addr}</span></td>
              <td class="t-num t-strong">${fmt(p.area)}평</td>
              <td><span class="chip ${WT_CHIP[p.work]||'chip-gray'}" style="font-size:10px">${p.work}</span></td>
              <td>${p.team?`<span class="chip chip-blue">${p.team}</span>`:'<span style="color:var(--ink-3);font-size:12px">미배정</span>'}</td>
              <td class="t-num t-strong">${p.st==='반려'?`<span style="color:var(--red);font-size:11px">${p.memo||'반려'}</span>`:fmtW(p.price)}</td>
            </tr>`;}).join('')}</tbody>
        </table></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-3);margin-top:7px">
          <span>페이지당 10 · 총 ${shown.length}건</span><span>1</span></div>
      </div>

      <!-- 우: 필지 상태 지도 (통합 맵 엔진 재사용) -->
      <div class="card" style="overflow:hidden;position:sticky;top:0">
        <div style="padding:11px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center">
          <b style="font-size:12.5px">신청 필지 지도</b>
          <div style="margin-left:auto">${mapBtn('통합 맵',{layers:['LY-10','LY-02']})}</div>
        </div>
        <div style="position:relative">
          <svg viewBox="90 40 600 640" style="width:100%;display:block;background:#4A5B3E">
            <rect x="0" y="0" width="900" height="800" fill="#55673F"/>
            <path d="M 470 20 C 500 150, 445 300, 480 480 C 500 560, 460 620, 480 700" stroke="#39566B" stroke-width="16" fill="none" opacity=".8"/>
            ${F.plots.slice(0,8).map((p,i)=>{
              const f=FIELDS[i%FIELDS.length];
              const col=this.agSel.has(p.pid)?'#F2933D':{'대기':'#2E6BE6','확정':'#0E9F5A','반려':'#E5352C'}[p.st];
              const b={x:Math.min(...f.poly.map(q=>q[0])),y:Math.min(...f.poly.map(q=>q[1]))};
              return `<polygon points="${f.poly.map(q=>q.join(',')).join(' ')}" fill="${col}" opacity="${this.agSel.has(p.pid)?.4:.2}" stroke="${col}" stroke-width="2.4"
                style="cursor:${p.st==='대기'?'pointer':'default'}" ${p.st==='대기'?`onclick="Views.work.togglePlot('${p.pid}')"`:''}/>
                <g transform="translate(${b.x+8},${b.y+15})" pointer-events="none">
                  <rect x="-3" y="-11" width="${(F.name.length+p.name.length)*10+26}" height="19" rx="4" fill="${this.agSel.has(p.pid)?'#F2933D':col}"/>
                  <text x="5" y="3" font-size="10" font-weight="700" fill="#fff" font-family="var(--font)">${F.name}_${p.name}${this.agSel.has(p.pid)?' ✓':''}</text></g>`;
            }).join('')}
          </svg>
          <div style="position:absolute;left:10px;bottom:10px;background:rgba(32,39,47,.88);border-radius:9px;padding:7px 11px;display:flex;gap:9px;font-size:10px;color:#DFE5EC;font-weight:600">
            ${[['대기','#2E6BE6'],['확정','#0E9F5A'],['반려','#E5352C'],['선택','#F2933D'],['작업완료','#20272F']].map(([t,c])=>`<span><i style="display:inline-block;width:8px;height:8px;background:${c};border-radius:2px;margin-right:3px;border:1px solid rgba(255,255,255,.4)"></i>${t}</span>`).join('')}
          </div>
        </div>
        <div style="padding:9px 14px;font-size:10.5px;color:var(--ink-3)">${App.icon('info',11)} 필지 클릭으로도 선택할 수 있습니다 · 통합 맵 엔진 재사용</div>
      </div>
    </div>`;
  },
  togglePlot(pid){ const s=this.agSel; s.has(pid)?s.delete(pid):s.add(pid); App.rerender(); },
  agAccept(){
    const F=AG_FARMERS.find(f=>f.id===this.agFarmer);
    let n=0;
    F.plots.forEach(p=>{ if(this.agSel.has(p.pid)){ p.st='확정'; p.team='코코대행단'; n++; } });
    this.agSel.clear();
    App.toast(`${n}개 필지 수락 및 매칭 완료 — AI 배차 최적화 적용 (이동거리 -18%)`);
    App.rerender();
  },
  agReject(){
    const F=AG_FARMERS.find(f=>f.id===this.agFarmer);
    let n=0;
    F.plots.forEach(p=>{ if(this.agSel.has(p.pid)){ p.st='반려'; p.memo='관리자 반려'; p.team=null; n++; } });
    this.agSel.clear();
    App.toast(`${n}개 필지를 반려 처리했습니다`);
    App.rerender();
  },
  syncActionBar(){
    const sel=this.agSel;
    if(!(this.tab==='agency'&&this.agencySub==='intake'&&sel.size)){ App.hideActionBar(); return; }
    const F=AG_FARMERS.find(f=>f.id===this.agFarmer);
    const plots=F.plots.filter(p=>sel.has(p.pid));
    const area=plots.reduce((s,p)=>s+p.area,0), amt=plots.reduce((s,p)=>s+p.price,0);
    const maxAmt=AG_FARMERS.flatMap(f=>f.plots).reduce((s,p)=>s+p.price,0);
    App.actionBar(`
      <div style="display:flex;flex-direction:column;width:100%;gap:7px">
        <div style="display:flex;align-items:center;gap:16px;width:100%">
          <span class="ab-chip">선택 ${sel.size}</span>
          <span class="ab-info"><b>${F.name} 농가</b> · 필지 ${sel.size}개 · 합계 ${fmt(area)}평 · 예상 정산 <b>${fmtW(amt)}</b></span>
          <div class="spacer"></div>
          <button class="btn btn-ghost" style="border-color:#46505C;color:#C9D1DB" onclick="Views.work.agSel.clear();App.rerender()">선택 해제</button>
          <button class="btn btn-navy" style="background:#39424E" onclick="Views.work.agReject()">⊘ 선택 필지 반려</button>
          <button class="btn btn-primary" onclick="Views.work.agAccept()">${App.icon('check')} 선택 필지 수락 및 매칭</button>
        </div>
        <div style="display:flex;gap:14px;width:100%;font-size:11px;color:#8D97A5;border-top:1px solid #39424E;padding-top:7px;align-items:center">
          <span style="font-weight:700">선택 필지 합계</span>
          ${plots.slice(0,3).map(p=>`<span><i style="display:inline-block;width:6px;height:6px;background:#5BE49B;border-radius:50%;margin-right:4px"></i>${p.pid} ${p.addr} · ${fmt(p.area)}평 <b style="color:#C9D1DB">${fmtW(p.price)}</b></span>`).join('')}
          ${plots.length>3?`<span>외 ${plots.length-3}건</span>`:''}
          <span style="margin-left:auto">잠정 최대 <b style="color:#C9D1DB">${fmtW(maxAmt)}</b></span>
        </div>
      </div>`);
  },
  /* ---- 6.5.1 오프라인 접수 AI OCR ---- */
  ocrModal(){
    const o=OCR_EXTRACT;
    App.modal(`오프라인 접수 AI OCR 자동 등록`, `
      <div style="display:grid;grid-template-columns:1fr 1fr;min-height:440px">
        <div style="background:var(--navy);padding:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
          <div style="width:100%;max-width:260px;aspect-ratio:3/4;background:linear-gradient(160deg,#F4EFE4,#E6DECB);border-radius:10px;position:relative;box-shadow:var(--shadow-lg);overflow:hidden">
            <div style="padding:16px 18px;color:#5A5340;font-size:10px;line-height:2.1">
              <div style="text-align:center;font-weight:800;font-size:13px;color:#3A3527;margin-bottom:10px;border-bottom:1.5px solid #9A917A;padding-bottom:6px">농작업대행 신청서</div>
              ${o.fields.map(([k,v])=>`<div style="display:flex;gap:6px;margin-bottom:7px"><span style="color:#8A8068;width:64px">${k}</span><span style="border-bottom:1px solid #B5AC93;flex:1;font-family:cursive;color:#2E2A1E">${v.replace(/#/g,'○')}</span></div>`).join('')}
            </div>
            <div id="ocrScan" style="position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,transparent,#5BE49B,transparent);box-shadow:0 0 12px #5BE49B"></div>
          </div>
          <div style="color:#A6B1BF;font-size:11.5px;font-weight:600">${o.doc}</div>
        </div>
        <div style="padding:22px 24px;display:flex;flex-direction:column">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:4px">
            <div class="lr-swatch" style="background:var(--red);width:32px;height:32px;border-radius:10px">${App.icon('bot',16)}</div>
            <div><b style="font-size:14px">AI OCR 인식 결과</b><br><small style="font-size:11px;color:var(--ink-3)">서면 신청서를 자동 인식해 접수 필드로 구조화</small></div>
            <span class="chip chip-green" style="margin-left:auto" id="ocrConf">인식률 —</span>
          </div>
          <div id="ocrFields" style="flex:1;margin-top:12px"></div>
          <div class="perm-note" style="margin:12px 0 0;font-size:11.5px">${App.icon('info')} <div>낮은 신뢰도(&lt;95%) 필드는 <b style="color:var(--amber)">주황색</b>으로 표시됩니다 — 확인 후 등록하세요.</div></div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
            <button class="btn btn-ghost" onclick="App.closeModal()">취소</button>
            <button class="btn btn-primary" id="ocrReg" disabled style="opacity:.5" onclick="App.closeModal();App.toast('신청 1건이 접수 목록에 자동 등록되었습니다 (정순금 · 옥동리 145)')">${App.icon('check')} 접수 등록</button>
          </div>
        </div>
      </div>`);
    // scan animation
    const scan=document.getElementById('ocrScan');
    let y=0; const iv=setInterval(()=>{ y=(y+4)%100; if(scan) scan.style.top=y+'%'; },30);
    setTimeout(()=>{
      clearInterval(iv); if(scan) scan.style.display='none';
      const box=document.getElementById('ocrFields'); if(!box) return;
      box.innerHTML=o.fields.map(([k,v,c],i)=>{
        const low=parseInt(c)<95;
        return `<div class="ocr-field" style="opacity:0;transform:translateY(6px);display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);transition:all .3s ${i*0.08}s">
          <span style="width:74px;font-size:11.5px;color:var(--ink-3);font-weight:600">${k}</span>
          <b style="flex:1;font-size:13px">${v}</b>
          <span class="chip ${low?'chip-amber':'chip-green'}" style="font-size:10px">${c}</span>
        </div>`;
      }).join('');
      requestAnimationFrame(()=>box.querySelectorAll('.ocr-field').forEach(f=>{f.style.opacity='1';f.style.transform='none';}));
      const conf=document.getElementById('ocrConf'); if(conf) conf.textContent=`인식률 ${o.confidence}%`;
      const reg=document.getElementById('ocrReg'); if(reg){ reg.disabled=false; reg.style.opacity='1'; }
    }, 1600);
  },
  agProgress(){
    return `<div class="grid" style="grid-template-columns:.9fr 1.1fr">
      <div>
        <div class="card card-pad" style="margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <div><b style="font-size:15px">${CONTRACT.title}</b><br>
            <small style="color:var(--ink-3);font-size:11.5px">필지 16건 · 총 1,231평 · 대행단 3팀</small></div>
            <div style="margin-left:auto;text-align:right"><small style="font-size:10.5px;color:var(--ink-3);font-weight:700">전체 진행률</small>
              <div style="font-size:23px;font-weight:800;color:var(--blue)">65%</div></div>
          </div>
          <div class="prog" style="height:7px;margin-top:10px"><i style="width:65%"></i></div>
        </div>
        ${AGENT_TEAMS.map(t=>`
          <div class="card card-pad" style="margin-bottom:10px;cursor:pointer" onclick="App.go('work',{tab:'agency',sub:'settle'})">
            <div style="display:flex;align-items:center;gap:9px">
              <span class="chip chip-gray">${{'확인 대기':'수확','확인 완료':'수확','보완 요청':'방제'}[t.state]||'작업'}</span>
              <b style="font-size:13.5px">${t.name}</b>
              <small style="color:var(--ink-3);font-size:11px">${t.lead}</small>
              <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
                <small style="font-size:10.5px;color:var(--ink-3);font-weight:700">진행률</small><b style="color:${t.prog===100?'var(--green)':'var(--blue)'}">${t.prog}%</b></div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
              <div class="prog ${t.prog===100?'green':''}" style="flex:1"><i style="width:${t.prog}%"></i></div>
              <small style="font-size:11px;color:var(--ink-3)">필지 ${t.plots}건 · ${fmt(t.area)}평</small>
            </div>
            <div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap">
              ${t.fields.map(f=>{const c=f.st==='완료'?'chip-blue':f.st==='진행중'?'chip-green':'chip-gray';
                return `<span class="chip ${c}">${f.n} ${f.a}평 · ${f.st}</span>`;}).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div class="card" style="overflow:hidden">
        <div class="card-head"><h3>필지 지도</h3>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <span style="font-size:11px;color:var(--ink-2)"><i style="display:inline-block;width:9px;height:9px;background:#9AA3AF;border-radius:2px;margin-right:4px"></i>대기
            <i style="display:inline-block;width:9px;height:9px;background:#0E9F5A;border-radius:2px;margin:0 4px 0 10px"></i>진행중
            <i style="display:inline-block;width:9px;height:9px;background:#2E6BE6;border-radius:2px;margin:0 4px 0 10px"></i>완료</span>
            ${mapBtn('통합 맵',{layers:['LY-02','LY-01','LY-10']})}
          </div></div>
        <div style="padding:14px 18px 18px">
          <svg viewBox="80 40 620 560" style="width:100%;border-radius:12px;background:#4A5B3E">
            <rect x="80" y="40" width="620" height="560" fill="#55673F"/>
            <path d="M 470 20 C 500 150, 445 300, 480 480 C 500 560, 460 600, 480 640" stroke="#39566B" stroke-width="18" fill="none" opacity=".8"/>
            ${FIELDS.slice(0,8).map((f,i)=>{
              const states=['done','run','wait','run','done','wait','run','done'];
              const col={done:'#2E6BE6',run:'#0E9F5A',wait:'#C6CCD4'}[states[i]];
              const b={x:Math.min(...f.poly.map(p=>p[0])),y:Math.min(...f.poly.map(p=>p[1]))};
              return `<polygon points="${f.poly.map(p=>p.join(',')).join(' ')}" fill="${col}" opacity=".22" stroke="${col}" stroke-width="2.4" style="cursor:pointer"
                onmouseover="this.style.opacity=.45" onmouseout="this.style.opacity=.22"/>
                <g transform="translate(${b.x+22},${b.y+16})"><rect x="-4" y="-11" width="${f.name.length*11+30}" height="20" rx="10" fill="#fff" opacity=".95"/>
                <circle cx="6" cy="-1" r="3.5" fill="${col}"/><text x="14" y="3" font-size="10.5" font-weight="700" fill="#333">${f.name}</text></g>`;
            }).join('')}
          </svg>
        </div>
      </div>
    </div>`;
  },
  agSettle(){
    const team=AGENT_TEAMS.find(t=>t.id===this.selTeam);
    const plot=SETTLE_PLOTS[this.selPlot];
    return `<div class="card card-pad" style="margin-bottom:14px;display:flex;align-items:center;gap:20px">
      <div><b style="font-size:15px">${CONTRACT.title}</b><br><small style="color:var(--ink-3);font-size:11.5px">방제·수확 · 작업 06/05~06/12 · 대행단 3팀 · 필지 16건</small></div>
      <div style="margin-left:auto;display:flex;gap:18px;text-align:center">
        ${[['확인 완료','1팀','var(--green)'],['보완 요청','1팀','var(--red)'],['확인 대기','1팀','var(--amber)']].map(([l,v,c])=>`
          <div><small style="font-size:10.5px;color:var(--ink-3);font-weight:700">${l}</small><div style="font-size:17px;font-weight:800;color:${c}">${v}</div></div>`).join('')}
        <div style="border-left:1px solid var(--line);padding-left:18px"><small style="font-size:10.5px;color:var(--ink-3);font-weight:700">전체 공고 정산액</small>
          <div style="font-size:17px;font-weight:800">₩1,484,500</div></div>
      </div>
    </div>
    <div class="perm-note">${App.icon('info')} <div>3개 대행단의 정산서를 모두 확인해주세요. <b>14일 내 미확정 시 자동으로 [확정 완료] 처리</b>됩니다.</div></div>
    <div class="settle-grid">
      <div>
        <div style="font-size:12px;font-weight:800;color:var(--ink-3);margin-bottom:8px">대행단 3팀</div>
        ${AGENT_TEAMS.map(t=>{
          const stc=t.state==='확인 완료'?'chip-green':t.state==='보완 요청'?'chip-red':'chip-blue';
          return `<div class="team-card ${this.selTeam===t.id?'sel':''}" onclick="Views.work.selTeam='${t.id}';Views.work.selPlot=0;App.rerender()">
            <div class="tm-row"><b>${t.name}</b><span class="chip ${stc}" style="margin-left:auto">${t.state}</span></div>
            <small>${t.lead}</small><small>필지 ${t.plots}건 · ${fmt(t.area)}평</small>
            <div style="margin-top:7px;font-weight:800;font-size:14px">${fmtW(t.amount)}</div>
          </div>`;}).join('')}
        <div class="perm-note" style="margin-top:6px;font-size:11.5px">${App.icon('info')} <div>검토 기한 안내 — 14일 내 미확정 시 자동 [확정 완료] 처리</div></div>
      </div>
      <div>
        <div style="background:var(--green-soft);border:1px solid #BFE8D2;border-radius:12px;padding:11px 15px;margin-bottom:12px;display:flex;align-items:center;gap:9px">
          <b style="font-size:13px">${team.name} — 최종 정산액 ${fmtW(team.amount)}</b>
          <button class="btn btn-sm btn-primary" style="margin-left:auto" onclick="App.toast('정산 확인 완료 처리되었습니다')">확인 완료</button>
        </div>
        <div style="font-size:12px;font-weight:800;color:var(--ink-3);margin-bottom:8px">배정 필지 ${SETTLE_PLOTS.length}건</div>
        <div class="filter-bar" style="margin-bottom:8px"><div class="seg" style="font-size:11px">
          <button class="active">전체 ${SETTLE_PLOTS.length}</button><button>감액 ${SETTLE_PLOTS.filter(p=>p.cut).length}</button><button>정상 ${SETTLE_PLOTS.filter(p=>!p.cut).length}</button></div></div>
        ${SETTLE_PLOTS.map((p,i)=>`
          <div class="plot-card ${this.selPlot===i?'sel':''}" onclick="Views.work.selPlot=${i};App.rerender()">
            <span class="chip ${p.cut?'chip-red':'chip-green'}">${p.tag}</span>
            <div style="flex:1"><b style="font-size:13px">${p.name}</b><br><small style="color:var(--ink-3);font-size:11px">${p.addr} · ${fmt(p.area)}평 · ${p.work}</small></div>
            <div style="text-align:right">${p.cut?`<small style="color:var(--red);font-weight:700;font-size:11px">${fmtW(p.cut).replace('₩-','-₩')}</small><br>`:''}
              <b style="font-size:13.5px">${fmtW(p.amount)}</b></div>
          </div>`).join('')}
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span class="chip ${plot.cut?'chip-red':'chip-green'}">${plot.tag}</span><b style="font-size:14px">${plot.name}</b>
            <b style="margin-left:auto;color:var(--red);font-size:15px">${fmtW(plot.amount)}</b></div>
          <h3 style="font-size:12.5px;margin-bottom:8px">영농일지 <small style="color:var(--ink-3);font-weight:600">작업 26/06/10 08:00 ~ 14:30</small></h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:6px">
            ${['BEFORE 1','BEFORE 2','BEFORE 3'].map(t=>`<div class="photo-ph filled">${App.icon('photo')} ${t}</div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">
            ${['AFTER 1','AFTER 2','AFTER 3'].map(t=>`<div class="photo-ph filled" style="background:linear-gradient(135deg,#C8B99A,#B3A17E);color:#6E6046">${App.icon('photo')} ${t}</div>`).join('')}
          </div>
          <h3 style="font-size:12.5px;margin-bottom:6px">작업 차량</h3>
          <div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border-radius:10px;padding:9px 12px;margin-bottom:12px">
            <div class="lr-swatch" style="background:var(--red);width:32px;height:32px;border-radius:9px">${App.icon('tractor',16)}</div>
            <div><b style="font-size:12.5px">GX7510ATC (모델봉)</b><br><small style="font-size:10.5px;color:var(--ink-3)">DDAT 나권용놀이 · 로터리 WJ2000</small></div>
          </div>
          <h3 style="font-size:12.5px;margin-bottom:6px">농약 & 비료</h3>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px">
            <span class="chip chip-gray" style="font-size:10.5px">가스케미칼 살균살충제 액제 / 1,000mL</span>
            <span class="chip chip-gray" style="font-size:10.5px">가스케미칼 발아억제 액제 / 1,000mL</span>
          </div>
          <h3 style="font-size:12.5px;margin-bottom:6px">정산서</h3>
          ${[['신청 면적',fmt(plot.area)+'평'],['단가','평당 ₩270'],['소계',fmtW(Math.round(plot.area*270/10)*10)]].map(([k,v])=>`
            <div style="display:flex;justify-content:space-between;font-size:12.5px;padding:4px 0"><span style="color:var(--ink-3)">${k}</span><b>${v}</b></div>`).join('')}
          ${plot.cut?`<div style="background:var(--red-soft);border-radius:9px;padding:9px 12px;margin-top:8px;font-size:11.5px">
            <div style="display:flex;justify-content:space-between;font-weight:800;color:var(--red)"><span>감액 사유</span><span>${fmtW(plot.cut).replace('₩-','-₩')}</span></div>
            <div style="color:#8A4A44;margin-top:4px;line-height:1.5">${plot.cutWhy}</div></div>`:''}
          <div style="display:flex;justify-content:space-between;border-top:2px solid var(--ink);margin-top:10px;padding-top:9px">
            <b>필지 최종 정산액</b><b style="color:var(--red);font-size:16px">${fmtW(plot.amount)}</b></div>
        </div>
        <button class="btn btn-navy" style="width:100%;justify-content:center" onclick="App.toast('보완 요청이 대행단에 전송되었습니다')">보완 요청</button>
      </div>
    </div>`;
  },
  bind(root){ Charts.arm(root); this.syncActionBar();
    const added=root.querySelector('.cal-cell[data-added]');
    if(added) requestAnimationFrame(()=>added.scrollIntoView({block:'center',behavior:'smooth'}));
  }
};
