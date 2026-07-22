/* ============================================================
   Views 1 — 홈 대시보드 · 농장관리 · 장비관리 · 작업관리
   ============================================================ */
const Views = {};

/* ---------- shared bits ---------- */
function jobChip(st){ const [t,c]=JOB_STATUS[st]; return `<span class="chip chip-${c}"><span class="cd" style="background:currentColor"></span>${t}</span>`; }
function typeChip(t){ return `<span class="chip ${JOB_TYPE[t]}">${t}</span>`; }
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
    const todayJobs = JOBS.filter(j=>j.date==='07.22'||j.status==='run'||j.status==='issue');
    const running = JOBS.filter(j=>j.status==='run').length;
    const cnt = { work:EQUIP.filter(e=>e.status==='work').length, move:EQUIP.filter(e=>e.status==='move').length,
                  idle:EQUIP.filter(e=>e.status==='idle').length, maint:EQUIP.filter(e=>e.status==='maint').length };
    return `<div class="page-enter">
      <div class="page-head">
        <div>
          <div class="eyebrow">OPERATIONS · 2026.07.22 (수)</div>
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
        <div class="card-head"><h3>오늘의 농장</h3><span class="chip chip-gray mono" style="font-size:10px">1.1.1</span>
          <button class="more" onclick="App.go('work',{tab:'status'})">작업관리로 이동 →</button></div>
        <div class="card-pad" style="padding-top:12px">
          <div class="today-strip">
            ${todayJobs.map(j=>{ const f=FIELDS.find(x=>x.id===j.field);
              return `<div class="today-card" onclick="App.go('work',{tab:'status'})">
                <div style="display:flex;align-items:center;gap:6px">${typeChip(j.type)}${jobChip(j.status)}</div>
                <b>${j.name}</b><small>${f?f.name+' · ':''}${fmt(j.area)}평 · ${j.date}</small>
                ${j.status==='run'?`<div class="prog" style="margin-top:9px"><i style="width:${j.prog}%"></i></div>`:''}
                ${j.issue?`<small style="color:var(--red);font-weight:700;display:block;margin-top:6px">⚠ ${j.issue.split('—')[0]}</small>`:''}
              </div>`; }).join('')}
          </div>
        </div>
      </div>

      <div class="grid" style="grid-template-columns:1.1fr 1fr 1fr">
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
            <button class="more" onclick="App.toast('모든 알림을 읽음 처리했습니다')">모두 읽음</button></div>
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
        <div class="perm-note" style="margin:14px 0 0">${App.icon('rain')} <div><b>내일 새벽 시간당 20mm 예보</b> — 07.23 예정된 '윗배미 예초' 작업의 일정 조정을 검토하세요. <a style="color:var(--red);font-weight:700;cursor:pointer" onclick="App.go('work',{tab:'plan'})">캘린더 열기</a></div></div>
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
      <div class="f-search">${App.icon('search')}<input placeholder="이름·연락처 검색"></div>
      <select class="f-select"><option>공유 상태 전체</option><option>농협 공유</option><option>SPC 공유</option></select>
      <div style="margin-left:auto" class="deep-note">${App.icon('link')} 고객-농장-필지-장비 권한 매핑 구조</div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>고객명</th><th>연락처</th><th>소유 농장</th><th class="t-num">필지</th><th class="t-num">등록 장비</th><th>데이터 공유</th><th>가입</th><th></th></tr></thead>
      <tbody>${(isFarmer?CUSTOMERS.slice(0,1):CUSTOMERS).map(c=>`
        <tr onclick="Views.farm.custDrawer('${c.name}')">
          <td class="t-strong">${c.name}</td><td class="mono" style="font-size:12px">${c.ph}</td><td>${c.farms}</td>
          <td class="t-num">${c.plots}</td><td class="t-num">${c.equip}</td>
          <td>${c.share==='-'?'<span class="chip chip-gray">미공유</span>':c.share.split('·').map(s=>`<span class="chip chip-blue" style="margin-right:3px">${s}</span>`).join('')}</td>
          <td class="mono" style="font-size:11.5px;color:var(--ink-3)">${c.since}</td>
          <td><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();App.toast('권한 위임 설정 (데모)')">권한</button></td>
        </tr>`).join('')}</tbody>
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
    return `<div class="filter-bar">
      <div class="f-search">${App.icon('search')}<input placeholder="필지명·ID·주소 검색"></div>
      <select class="f-select"><option>작물 전체</option><option>벼</option><option>콩</option><option>밀</option><option>사과</option></select>
      <div style="margin-left:auto">${mapBtn('전체 필지 맵에서 보기',{layers:['LY-10']})}</div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>필지</th><th>주소</th><th class="t-num">면적(평)</th><th>작물</th><th>농장/소유</th><th>최근 진단</th><th>경계</th><th></th></tr></thead>
      <tbody>${FIELDS.map(f=>`
        <tr onclick="Views.farm.plotDrawer('${f.id}')">
          <td><span class="t-strong">${f.name}</span><span class="t-sub mono">${f.id}</span></td>
          <td style="font-size:12.5px">${f.addr}</td><td class="t-num t-strong">${fmt(f.area)}</td>
          <td>${f.crop}</td><td style="font-size:12.5px">${f.farm} · ${f.owner}</td>
          <td><span class="chip chip-green">생육 06.28</span></td>
          <td><span class="chip chip-blue">등록됨</span></td>
          <td><button class="btn btn-sm btn-map" onclick='event.stopPropagation();App.go("map",{focus:"${f.id}",layers:["LY-10","LY-01","LY-02"]})'>${App.icon('map',13)} 맵</button></td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  },
  plotDrawer(fid){
    const f=FIELDS.find(x=>x.id===fid);
    App.drawer(`필지 상세 — ${f.name}`, `
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <span class="chip chip-gray mono">${f.id}</span><span class="chip chip-green">${f.crop}</span><span class="chip chip-blue">경계 등록</span>
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
        ${mapBtn('맵에서 보기',{focus:fid,layers:['LY-10','LY-02']},false)}
        <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="App.go('precision',{tab:'diag'})">진단·처방 이력</button>
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
    const tabs=[['status','차량 현황','5.2'],['mgmt','차량관리','5.1'],['rent','임대/배차','5.3'],['impl','작업기','5.4']];
    if(isAdmin) tabs.push(['term','단말기','5.5'],['fota','FOTA','5.6']);
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">EQUIPMENT · IA 5</div><h1>장비관리</h1>
        <div class="sub">등록·정비·공유는 여기서, 실시간 위치는 통합 모니터링 딥링크로</div></div>
        <div class="actions">${permBadge('5.2')}
          ${mapBtn('실시간 위치 맵에서 보기',{layers:['LY-01','LY-10']},false)}
          <button class="btn btn-primary" onclick="App.toast('차량 등록 — 시리얼/QR 매칭 (데모)')">${App.icon('plus')} 차량 등록</button></div>
      </div>
      <div class="tabs">${tabs.map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('equip',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}</div>
      ${this['tab_'+T]()}
    </div>`;
  },
  tab_status(){
    return `<div class="grid cols-4" style="margin-bottom:16px">
      ${Object.entries(EQUIP_STATUS).map(([k,[t,c]])=>{
        const n=EQUIP.filter(e=>e.status===k).length;
        return `<div class="card kpi" style="padding:14px 18px"><div class="k-label"><span class="chip chip-${c}">${t}</span></div>
          <div class="k-value" style="font-size:24px">${n}<small>대</small></div></div>`; }).join('')}
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>장비</th><th>상태</th><th>소유/공유</th><th class="t-num">연료</th><th class="t-num">DEF</th><th class="t-num">가동(h)</th><th>DTC</th><th>현재 작업</th><th></th></tr></thead>
      <tbody>${EQUIP.map(v=>{
        const [st,c]=EQUIP_STATUS[v.status]; const job=JOBS.find(j=>j.id===v.job);
        return `<tr onclick="Views.equip.vehDrawer('${v.id}')">
          <td><span class="t-strong">${v.nick}</span><span class="t-sub mono">${v.id} · ${v.tmu}</span></td>
          <td><span class="chip chip-${c}"><span class="cd" style="background:currentColor"></span>${st}</span>${v.amotion?' <span class="chip chip-purple">A-Motion</span>':''}</td>
          <td style="font-size:12.5px">${v.owner}</td>
          <td class="t-num">${v.fuel==null?'-':`<div style="display:flex;align-items:center;gap:6px;justify-content:flex-end"><div class="prog ${v.fuel<50?'amber':'green'}" style="width:44px"><i style="width:${v.fuel}%"></i></div>${v.fuel}%</div>`}</td>
          <td class="t-num">${v.def==null?'-':v.def+'%'}</td>
          <td class="t-num">${fmt(v.hours)}</td>
          <td>${v.dtc?`<span class="chip chip-red">${v.dtcCode}</span>`:'<span class="chip chip-gray">정상</span>'}</td>
          <td style="font-size:12.5px">${job?job.name:'-'}</td>
          <td><button class="btn btn-sm btn-map" onclick='event.stopPropagation();App.go("map",{layers:["LY-01","LY-02","LY-10"],focus:${JSON.stringify(v.field)}})'>${App.icon('map',13)} 맵</button></td>
        </tr>`; }).join('')}</tbody>
    </table></div>`;
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
          <h3 style="margin-bottom:4px">차량등록 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.1.2</span></h3>
          <p style="font-size:12px;color:var(--ink-2);margin-bottom:10px">자사 장비 외 <b>브랜드별 농기계·DJI 드론·농업용 로봇</b> 등 본기를 등록할 수 있습니다.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${REGISTER_BRANDS.map((b,i)=>`
              <div class="radio-tile ${i===0?'sel':''}" onclick="this.closest('.grid,.card').querySelectorAll('.radio-tile').forEach(t=>t.classList.remove('sel'));this.classList.add('sel')" style="display:flex;align-items:center;gap:9px">
                <div class="lr-swatch" style="background:${b.tone};width:30px;height:30px;border-radius:9px;flex-shrink:0">${App.icon(b.icon,15)}</div>
                <div><b style="font-size:12.5px">${b.name}</b><small style="display:block;font-size:10.5px">${b.type}</small></div>
              </div>`).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <div class="radio-tile sel" style="flex:1;text-align:center;padding:8px"><b style="font-size:12px">QR/시리얼 스캔</b></div>
            <div class="radio-tile" style="flex:1;text-align:center;padding:8px"><b style="font-size:12px">수동 등록</b></div>
          </div>
          <button class="btn btn-primary" style="margin-top:12px;width:100%;justify-content:center" onclick="App.toast('본기 등록 절차 시작 — DJI/로봇 API 연동 (데모)')">등록 진행</button>
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
    return `<div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">차량 임대 관리 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.3.1</span></h3>
        ${[['HX1400AI','김철수 (안들농장)','07.10 ~ 08.10','chip-green','임대중'],['DSC85 콤바인','미배정','10월 수확기 예약 3건','chip-amber','예약'],['DRP80 이앙기','-','임대 가능','chip-gray','대기']].map(([m,w,p,c,s])=>`
          <div style="display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--line)">
            <div style="flex:1"><b style="font-size:13px">${m}</b><br><small style="color:var(--ink-3);font-size:11.5px">${w} · ${p}</small></div>
            <span class="chip ${c}">${s}</span></div>`).join('')}
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">차량 배차 관리 <span class="mono" style="font-size:10px;color:var(--ink-3)">5.3.2</span></h3>
        <p style="font-size:12px;color:var(--ink-2);margin-bottom:10px">작업 계획·농작업 대행과 연계 — AI 배차 최적화 적용 시 이동 동선 <b>-18%</b></p>
        ${JOBS.filter(j=>j.veh&&j.status!=='done').map(j=>{const v=EQUIP.find(e=>e.id===j.veh);
          return `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px">
            <span class="mono" style="color:var(--ink-3);font-size:10.5px">${j.date}</span>
            <b style="flex:1">${j.name}</b><span class="chip chip-gray">${v.model}</span>${jobChip(j.status)}</div>`;}).join('')}
      </div>
    </div>`;
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
  tab:'status', view:'kanban', agencySub:'intake', selApplicants:new Set(), selTeam:'T1', selPlot:0,
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    if(params&&params.sub) this.agencySub=params.sub;
    const T=this.tab;
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">WORK · IA 6</div><h1>작업관리</h1>
        <div class="sub">계획 → 실행 → 기록 라이프사이클 · 지도 확인은 통합 모니터링 딥링크</div></div>
        <div class="actions">${permBadge('6.1')}
          <button class="btn btn-primary" onclick="App.go('work',{tab:'plan'})">${App.icon('plus')} 작업 계획 추가</button></div>
      </div>
      <div class="tabs">
        ${[['status','작업현황','6.1'],['plan','작업 캘린더','6.2'],['amotion','A-Motion','6.4'],['history','작업이력','6.3'],['datahist','데이터 히스토리','6.3.2'],['agency','농작업 대행','6.5']]
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
      <select class="f-select"><option>작업유형 전체</option><option>대행</option><option>A-Motion</option><option>일반</option></select>
      <div style="margin-left:auto">${mapBtn('작업 진행 레이어 맵에서 보기',{layers:['LY-02','LY-01','LY-10']})}</div>
    </div>
    ${this.view==='kanban'? `<div class="kanban">
      ${Object.entries(JOB_STATUS).map(([k,[t,c]])=>{
        const items=JOBS.filter(j=> k==='issue'? j.status==='issue' : j.status===k);
        return `<div class="kan-col">
          <div class="kc-head"><span class="chip chip-${c}">${t}</span><span class="kc-n">${items.length}</span></div>
          ${items.map(j=>{const f=FIELDS.find(x=>x.id===j.field);
            return `<div class="kan-card" onclick="Views.work.jobDrawer('${j.id}')">
              ${typeChip(j.type)}
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
          <td>${typeChip(j.type)}</td><td>${f?f.name:'-'}</td><td class="t-num">${fmt(j.area)}</td>
          <td style="font-size:12.5px">${v?v.model:'-'}</td>
          <td><div style="display:flex;align-items:center;gap:7px"><div class="prog ${j.status==='issue'?'red':''}" style="width:70px"><i style="width:${j.prog}%"></i></div><span style="font-size:11.5px;font-variant-numeric:tabular-nums">${j.prog}%</span></div></td>
          <td>${jobChip(j.status)}</td>
          <td><button class="btn btn-sm btn-map" onclick='event.stopPropagation();App.go("map",{layers:["LY-02","LY-01"],focus:${JSON.stringify(j.field)}})'>${App.icon('map',13)} 맵</button></td>
        </tr>`;}).join('')}</tbody>
    </table></div>`}`;
  },
  jobDrawer(jid){
    const j=JOBS.find(x=>x.id===jid), f=FIELDS.find(x=>x.id===j.field), v=EQUIP.find(e=>e.id===j.veh);
    App.drawer(`작업 상세 — ${j.name}`,`
      <div style="display:flex;gap:6px;margin-bottom:16px">${typeChip(j.type)}${jobChip(j.status)}<span class="chip chip-gray mono">${j.id}</span></div>
      ${j.status==='run'?`<div style="background:var(--surface-2);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:7px"><b>실시간 진행률</b><b style="color:var(--blue)">${j.prog}%</b></div>
        <div class="prog" style="height:8px"><i style="width:${j.prog}%"></i></div>
        <small style="color:var(--ink-3);font-size:11px;display:block;margin-top:6px">잔여 면적 ${fmt(Math.round(j.area*(1-j.prog/100)))}평 · 예상 완료 16:40</small>
      </div>`:''}
      ${[['필지',f?`${f.name} (${f.id})`:'-'],['면적',fmt(j.area)+'평'],['장비',v?v.nick:'-'],['대행단',j.team||'-'],['작업시간',j.hours+'h'],['연료 사용',j.fuel+'L']]
        .map(([k,val])=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px"><span style="color:var(--ink-3)">${k}</span><b>${val}</b></div>`).join('')}
      ${j.issue?`<div class="perm-note" style="margin-top:12px">${App.icon('sos')} <div><b>이슈</b> — ${j.issue}</div></div>`:''}
      ${j.status==='done'?`<div style="background:linear-gradient(120deg,#FDEEEC,#FFF6F5);border:1px solid #F6D3CE;border-radius:12px;padding:13px 15px;margin-top:14px">
        <div style="display:flex;align-items:center;gap:8px">
          <div class="lr-swatch" style="background:var(--red);width:30px;height:30px;border-radius:9px">${App.icon('bot',15)}</div>
          <div style="flex:1"><b style="font-size:13px">AI 영농일지 <span class="mono" style="font-size:9px;color:var(--ink-3)">6.2.3</span></b><br><small style="font-size:11px;color:var(--ink-3)">작업계획·차량·작업기 데이터로 자동 작성</small></div>
          <button class="btn btn-sm btn-primary" onclick="App.closeDrawer();Views.work.diaryModal('${jid}')">${App.icon('edit')} 영농일지 생성</button>
        </div></div>`:''}
      <div style="display:flex;gap:8px;margin-top:16px">
        ${mapBtn('맵에서 보기',{layers:['LY-02','LY-01'],focus:j.field},false)}
        ${j.status==='done'?mapBtn('작업기록(As-Applied)',{layers:['LY-04','LY-10'],focus:j.field},false):''}
        <button class="btn btn-navy" style="flex:1;justify-content:center" onclick="App.toast('이해관계자 공유 링크 생성됨')">${App.icon('share')} 공유</button>
      </div>
    `);
  },

  /* ---- 6.2.3 AI 영농일지 ---- */
  diaryModal(jid){
    const j=JOBS.find(x=>x.id===jid), f=FIELDS.find(x=>x.id===j.field);
    const d=FARM_DIARY[jid] || {
      title:`${j.name} 영농일지`, date:`2026-${j.date.replace('.','-')}`, field:j.field, area:j.area,
      weather:'맑음 · 27℃ · 습도 64%', veh:(EQUIP.find(e=>e.id===j.veh)||{}).nick||'-', impl:'-', team:j.team||'자가작업',
      body:`${j.date}, ${f?f.name:''} 필지(${fmt(j.area)}평)에서 ${j.name} 작업을 수행했습니다. 총 ${j.hours}시간이 소요되었으며 연료 ${j.fuel}L를 사용했습니다. 매칭된 작업계획과 차량·작업기 데이터를 기반으로 자동 작성된 일지입니다.`,
      kpi:[['작업면적',fmt(j.area)+'평'],['작업시간',j.hours+'시간'],['연료',j.fuel+'L'],['작업유형',j.type]],
      photos:['작업 전 (BEFORE)','작업 후 (AFTER)'],
    };
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
    // animate steps then reveal
    const steps=[...document.querySelectorAll('.diary-step')];
    steps.forEach((st,i)=>setTimeout(()=>{
      st.style.opacity='1'; st.querySelector('.ds-ico').innerHTML=App.icon('check',13);
      st.querySelector('.ds-ico').style.cssText='width:20px;height:20px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;flex-shrink:0';
    }, 400+i*420));
    setTimeout(()=>{
      const stage=document.getElementById('diaryStage'); if(!stage) return;
      stage.innerHTML=`
        <div style="padding:22px 26px;max-height:64vh;overflow-y:auto">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span class="chip chip-red">${App.icon('bot',12)} AI 자동 작성</span>
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
          <div class="perm-note" style="margin-top:14px">${App.icon('info')} <div>AI 초안입니다 — 내용을 검토·수정 후 확정하세요. 확정 시 <b>작업이력·보조금 증빙 리포트(10.2)</b>에 자동 연계됩니다.</div></div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--line);display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost" onclick="App.toast('일지를 수정 모드로 전환 (데모)')">${App.icon('edit')} 수정</button>
          <button class="btn btn-ghost" onclick="App.toast('PDF로 내보냈습니다 (데모)')">${App.icon('download')} PDF</button>
          <button class="btn btn-primary" onclick="App.closeModal();App.toast('영농일지가 확정·저장되었습니다 — 작업이력 연계 완료')">${App.icon('check')} 확정·저장</button>
        </div>`;
    }, 400+steps.length*420+300);
  },

  /* ---- 6.2.1 과거 작업 등록 (데이터 히스토리 불러오기) ---- */
  pastJobModal(){
    App.modal(`과거 작업 등록`, `
      <div style="padding:22px 26px">
        <p style="font-size:12.5px;color:var(--ink-2);margin-bottom:16px">이미 완료한 작업을 캘린더에 소급 등록합니다. 차량·작업기 <b>데이터 히스토리(6.3.2)</b>가 있으면 불러와 자동 채웁니다.</p>
        <div class="grid cols-2" style="gap:12px">
          <div class="field-row"><label>필지</label><select><option>안들 3 (GJ-R3)</option><option>큰들 (GJ-R8)</option></select></div>
          <div class="field-row"><label>작업일</label><input type="text" value="2026-04-08"></div>
          <div class="field-row"><label>작업 유형</label><select><option>경운/로터리</option><option>이앙</option><option>방제</option><option>수확</option></select></div>
          <div class="field-row"><label>투입 차량</label><select id="pastVeh"><option value="VH-001">HX1400AI 1호기</option><option value="VH-002">GX7510ATC</option></select></div>
        </div>
        <div style="background:var(--blue-soft);border:1px solid #C4D6F7;border-radius:12px;padding:13px 15px;margin-top:6px">
          <div style="display:flex;align-items:center;gap:9px">
            <div class="lr-swatch" style="background:var(--blue);width:30px;height:30px;border-radius:9px">${App.icon('route',15)}</div>
            <div style="flex:1"><b style="font-size:12.5px">데이터 히스토리에서 불러오기</b><br><small style="font-size:11px;color:var(--ink-2)">선택 차량의 해당일 운행 데이터(가동시간·면적·연료·경심)를 자동 입력</small></div>
            <button class="btn btn-sm btn-primary" id="pullHist" onclick="Views.work.pullHistory()">불러오기</button>
          </div>
          <div id="histResult" style="margin-top:10px"></div>
        </div>
        <div style="padding:16px 0 0;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost" onclick="App.closeModal()">취소</button>
          <button class="btn btn-primary" onclick="App.closeModal();App.toast('과거 작업이 등록되었습니다 — 작업이력·데이터 히스토리 연계 완료')">${App.icon('check')} 등록</button>
        </div>
      </div>`);
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
      <select class="f-select"><option>작업기 전체</option><option>로터리 WJ2000</option><option>붐스프레이어</option></select>
      <div style="margin-left:auto">${mapBtn('주행경로 이력 맵',{layers:['LY-05','LY-04','LY-10']})}</div>
    </div>
    <div class="grid cols-4" style="margin-bottom:16px">
      ${[['누적 가동시간',totH.toFixed(1),'h'],['누적 작업면적',fmt(totA),'평'],['누적 연료',fmt(totF),'L'],['기록 건수',rows.length,'건']]
        .map(([l,v,u])=>`<div class="card kpi" style="padding:14px 18px"><div class="k-label">${l}</div><div class="k-value" style="font-size:23px">${v}<small>${u}</small></div></div>`).join('')}
    </div>
    <div class="grid" style="grid-template-columns:1.3fr .7fr">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>작업일</th><th>작업</th><th>작업기</th><th class="t-num">가동(h)</th><th class="t-num">면적(평)</th><th class="t-num">연료(L)</th><th class="t-num">평균속도</th><th>출처</th></tr></thead>
        <tbody>${rows.map(r=>`
          <tr onclick="App.toast('${r.date} 상세 운행 데이터 — 경로·속도 프로파일 (데모)')">
            <td class="mono" style="font-size:12px">${r.date}</td><td class="t-strong">${r.job}</td><td style="font-size:12px">${r.impl}</td>
            <td class="t-num">${r.hours}</td><td class="t-num">${fmt(r.area)}</td><td class="t-num">${r.fuel}</td><td class="t-num">${r.avgSpeed}km/h</td>
            <td><span class="chip ${r.src==='A-Motion'?'chip-purple':r.src==='대행'?'chip-blue':r.src==='과거 등록'?'chip-amber':'chip-gray'}">${r.src}</span></td>
          </tr>`).join('')}</tbody>
      </table></div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">월별 가동시간</h3>
        ${Charts.bars(['4월','5월','6월','7월'],[2.8,5.5,2.9,1.6],{h:130,color:'#2E6BE6'})}
        <div class="deep-note" style="margin-top:10px">${App.icon('route')} 차량 운행·작업기 데이터는 TMU/ISOBUS에서 수집되어 차량별로 축적됩니다</div>
      </div>
    </div>`;
  },

  /* ---- 6.2 캘린더 ---- */
  tab_plan(){
    const evts={ 3:[['부식리들 밀 수확 시작','e-blue']], 8:[['자재 입고 — 비료','e-amber']], 14:[['모산들 물꼬 점검','e-green']],
      18:[['안들 1 로터리 (대행)','e-blue']], 21:[['부식리들 수확 (대행)','e-blue']], 22:[['안들 3 심경 로터리','e-purple'],['큰들 방제 (대행)','e-blue']],
      23:[['윗배미 예초','e-green']], 24:[['아랫배미 VRT 시비','e-blue']], 28:[['생육진단 드론 촬영','e-amber']] };
    let cells=''; const firstDow=3, days=31;
    for(let i=0;i<firstDow;i++) cells+=`<div class="cal-cell dim"><span class="cd-num">${28+i}</span></div>`;
    for(let d=1;d<=days;d++){
      cells+=`<div class="cal-cell ${d===22?'today':''}" onclick="App.toast('${d}일 작업 계획 편집 (데모)')">
        <span class="cd-num">${d}</span>
        ${(evts[d]||[]).map(([t,c])=>`<div class="cal-evt ${c}">${t}</div>`).join('')}
      </div>`;
    }
    return `<div class="grid" style="grid-template-columns:1fr 300px">
      <div>
        <div class="filter-bar" style="margin-bottom:12px">
          <div class="seg"><button class="active">월</button><button onclick="App.toast('주간 뷰 (데모)')">주</button></div>
          <b style="font-size:15px;margin-left:6px">2026년 7월</b>
          <button class="btn btn-sm btn-ghost" style="margin-left:auto" onclick="Views.work.pastJobModal()">${App.icon('plus')} 과거 작업 등록</button>
          <div class="deep-note">${App.icon('bot')} AI to-do 제안: 3건 <span style="color:var(--red);font-weight:800;cursor:pointer" onclick="App.openAI('todo')">보기</span></div>
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
          <h3 style="margin-bottom:8px">A-Motion 작업 설정 <span class="mono" style="font-size:10px;color:var(--ink-3)">6.2.2</span></h3>
          <p style="font-size:12px;color:var(--ink-2);margin-bottom:10px">HX1400AI 투입 계획 시 경작지·경로·작업기·경심·단수 세팅 단계가 추가됩니다.</p>
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="App.go('work',{tab:'amotion'})">설정 마법사 열기</button>
        </div>
      </div>
    </div>`;
  },

  /* ---- 6.4 A-Motion ---- */
  amStep:2,
  tab_amotion(){
    const steps=['경작지 선택','경로 생성','작업기·경심 설정','검토·전송'];
    return `<div class="grid" style="grid-template-columns:1.15fr .85fr">
      <div class="card card-pad">
        <h3 style="margin-bottom:14px">A-Motion 작업 설정 마법사 <span class="mono" style="font-size:10px;color:var(--ink-3)">6.2.2 · 6.4.1</span></h3>
        <div class="wiz-steps">
          ${steps.map((s,i)=>`<div class="wiz-step ${i<this.amStep?'done':i===this.amStep?'active':''}">
            <span class="ws-n">${i<this.amStep?'✓':i+1}</span>${s}</div>${i<steps.length-1?'<div class="wiz-conn"></div>':''}`).join('')}
        </div>
        <div class="field-row"><label>경작지 (경계 연계 4.4)</label>
          <select><option>안들 3 (GJ-R3) — 1,230평 · Vertex 52</option><option>큰들 (GJ-R8)</option></select></div>
        <div class="grid cols-2">
          <div class="field-row"><label>작업기</label><select><option>로터리 WJ2000 (ISOBUS)</option></select></div>
          <div class="field-row"><label>작업 패턴</label><select><option>왕복 (U-turn 자동)</option><option>나선</option></select></div>
          <div class="field-row"><label>경심 깊이</label><input type="text" value="22 cm"></div>
          <div class="field-row"><label>작업 단수</label><input type="text" value="14 단"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:6px">
          <button class="btn btn-ghost" onclick="Views.work.amStep=Math.max(0,Views.work.amStep-1);App.rerender()">이전</button>
          <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="Views.work.amStep=Math.min(3,Views.work.amStep+1);App.rerender();if(Views.work.amStep===3)App.toast('작업 계획이 HX1400AI 1호기로 전송되었습니다')">다음 단계</button>
        </div>
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:14px">
          <h3 style="margin-bottom:8px">진행중 자율작업 관제</h3>
          <div style="display:flex;align-items:center;gap:10px;background:var(--purple-soft);border-radius:12px;padding:12px 14px;margin-bottom:10px">
            <span class="live-dot"></span><b style="flex:1;font-size:13px">안들 3 심경 로터리 — 42%</b>
            ${mapBtn('관제 모드',{layers:['LY-03','LY-01','LY-02'],focus:'GJ-R3',amotion:true})}
          </div>
          <div class="perm-note" style="margin:0">${App.icon('phone')} <div><b>제어권 이전(6.4.3)은 App 전용</b> — 무인작업 제어권은 현장 모바일 단말에 종속됩니다. Web에서는 관제·일시정지만 가능합니다.</div></div>
        </div>
        <div class="card card-pad">
          <h3 style="margin-bottom:8px">이상감지 이벤트 <span class="mono" style="font-size:10px;color:var(--ink-3)">6.4.2</span> ${App.role.id==='admin'?'<span class="chip chip-red">정의 관리</span>':'<span class="chip chip-gray">조회</span>'}</h3>
          ${[['장애물 인식 정지','07.18 14:22','GJ-R3','재개'],['가이드라인 이탈 >15cm','07.12 10:05','GJ-R8','보정'],['RTK 신호 저하','07.02 16:40','GJ-R3','자동 복구']].map(([e,t,f,r])=>`
            <div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--line);font-size:12px">
              <span class="chip chip-amber">${e}</span><span class="mono" style="color:var(--ink-3);font-size:10.5px">${t}</span>
              <span style="margin-left:auto" class="chip chip-gray">${f}</span><span class="chip chip-green">${r}</span></div>`).join('')}
        </div>
      </div>
    </div>`;
  },

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
          <td><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();Views.work.diaryModal('${j.id}')">${App.icon('bot',13)} 일지</button></td>
        </tr>`;}).join('')}</tbody>
    </table></div>
    <div class="deep-note" style="margin-top:12px">${App.icon('map')} 주행경로·As-Applied 지도는 통합 모니터링의 기록 레이어(LY-04·05)에서 표시됩니다 — 본 화면은 목록·분석 전담</div>`;
  },

  /* ---- 6.5 농작업 대행 ---- */
  tab_agency(){
    const sub=this.agencySub;
    return `<div class="filter-bar" style="margin-bottom:16px">
      <div class="seg">
        ${[['intake','신청접수','6.5.1'],['progress','대행현황','6.5.2'],['settle','정산','6.5.3']]
          .map(([k,n])=>`<button class="${sub===k?'active':''}" onclick="App.go('work',{tab:'agency',sub:'${k}'})">${n}</button>`).join('')}
      </div>
      <span class="chip chip-blue">${CONTRACT.title}</span>
      <span class="deep-note" style="margin-left:auto">${App.icon('phone')} App 분기: 대행단/팀장/고객별 기능 분리 (v2.1 비고)</span>
    </div>
    ${sub==='intake'?this.agIntake(): sub==='progress'?this.agProgress():this.agSettle()}`;
  },
  agIntake(){
    const sel=this.selApplicants;
    return `<div class="card" style="margin-bottom:14px">
      <div class="card-pad" style="display:flex;gap:26px;align-items:center;flex-wrap:wrap">
        ${[['신청 농가',`${CONTRACT.farms}명`,'전체 33,500평'],['우선순위 대상',`${CONTRACT.priority}명`,'65↑ 여성·유공 우선'],['매칭 완료',`${CONTRACT.plots}필지`,'20.5%'],['전체 매칭 예상 정산',fmtW(CONTRACT.amount),`/ ${fmtW(CONTRACT.expect).slice(1)}`]]
          .map(([l,v,s],i)=>`<div style="${i===3?'margin-left:auto;text-align:right':''}">
            <div style="font-size:11.5px;color:var(--ink-3);font-weight:600">${l}</div>
            <div style="font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;${i===3?'color:var(--red)':''}">${v}</div>
            <div style="font-size:11px;color:var(--ink-3)">${s}</div></div>`).join('')}
        <button class="btn btn-primary" onclick="App.toast('정산서 확인 화면 (데모)')">정산서 확인하기</button>
      </div>
      <div style="padding:0 20px 14px"><div class="prog green" style="height:7px"><i style="width:${CONTRACT.doneRate}%"></i></div>
        <small style="font-size:11px;color:var(--ink-3)">매칭 진행률 ${CONTRACT.doneRate}% · 관할 김제시 부량면·백산면</small></div>
    </div>
    <div class="filter-bar">
      <div class="seg"><button class="active">전체 ${APPLICANTS.length}</button><button>대기 0</button><button>반려 1</button><button>매칭완료 ${CONTRACT.plots}</button></div>
      <span class="chip chip-blue">온라인 ${APPLICANTS.filter(a=>a.ch==='온라인').length}</span>
      <span class="chip chip-amber">오프라인 ${APPLICANTS.filter(a=>a.ch==='오프라인').length}</span>
      <button class="btn btn-sm btn-ghost" style="margin-left:auto" onclick="App.toast('엑셀 다운로드 (데모)')">${App.icon('download')} 엑셀 다운로드</button>
      <button class="btn btn-sm btn-primary" onclick="Views.work.ocrModal()">${App.icon('bot')} 오프라인 접수 AI OCR</button>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th style="width:36px"></th><th>상태</th><th>농가</th><th>필지 정보</th><th class="t-num">면적(평)</th><th>작업</th><th>매칭 대행단</th><th class="t-num">예상가격</th></tr></thead>
      <tbody>${APPLICANTS.map((a,i)=>{
        const stc = a.st==='확정'?'chip-green':a.st==='반려'?'chip-red':'chip-blue';
        return `<tr class="${sel.has(i)?'sel':''}" onclick="Views.work.toggleApplicant(${i})">
          <td><input type="checkbox" ${sel.has(i)?'checked':''} style="accent-color:var(--red);pointer-events:none"></td>
          <td><span class="chip ${stc}"><span class="cd" style="background:currentColor"></span>${a.st}</span></td>
          <td><span class="t-strong">${a.name}</span><span class="t-sub">${[a.age,a.gender,a.ch].filter(Boolean).join(' · ')}</span></td>
          <td><span class="t-strong" style="font-weight:600">${a.plot}</span><span class="t-sub">${a.addr}</span></td>
          <td class="t-num t-strong">${fmt(a.area)}</td><td>${a.work}</td>
          <td>${a.team?`<span class="chip chip-blue">${a.team}</span>`:'<span style="color:var(--ink-3)">미배정</span>'}</td>
          <td class="t-num t-strong">${a.price?fmtW(a.price):`<span class="chip chip-red">반려</span> <small style="color:var(--ink-3)">${a.memo||''}</small>`}</td>
        </tr>`;}).join('')}</tbody>
    </table></div>
    <div class="action-bar ${sel.size?'show':''}">
      <span class="ab-chip">선택 ${sel.size}</span>
      <span class="ab-info">농가 <b>${sel.size}명</b> · 필지 ${sel.size}건 · 합계 <b>${fmt([...sel].reduce((s,i)=>s+APPLICANTS[i].area,0))}평</b> · 예상 정산 <b>${fmtW([...sel].reduce((s,i)=>s+APPLICANTS[i].price,0))}</b></span>
      <div class="spacer"></div>
      <button class="btn btn-ghost" style="border-color:#46505C;color:#C9D1DB" onclick="App.toast('선택 해제');Views.work.selApplicants.clear();App.rerender()">선택 해제</button>
      <button class="btn btn-navy" style="background:#39424E" onclick="App.toast('선택 필지 반려 처리 (데모)')">선택 필지 반려</button>
      <button class="btn btn-primary" onclick="App.toast('AI 배차 최적화 — 대행단 매칭 완료 (이동거리 -18%)');Views.work.selApplicants.clear();App.rerender()">${App.icon('bot')} 선택 필지 수락 및 매칭</button>
    </div>`;
  },
  toggleApplicant(i){ const s=this.selApplicants; s.has(i)?s.delete(i):s.add(i); App.rerender(); },
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
  bind(root){ Charts.arm(root); }
};
