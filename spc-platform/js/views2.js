/* ============================================================
   Views 2 — 자재 · 정밀농업 · 재무 · 통계 · 시스템
   ============================================================ */

/* ============================================================ 7. 자재관리 */
Views.material = {
  tab:'mat',
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    const T=this.tab;
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">MATERIAL · IA 7</div><h1>자재관리</h1>
        <div class="sub">재료 마스터와 재고 흐름 — 작업계획·처방과 연계된 필지별 사용량 추적</div></div>
        <div class="actions">${permBadge('7.1')}
          <button class="btn btn-primary" onclick="App.toast('자재 등록 (데모)')">${App.icon('plus')} 자재 등록</button></div>
      </div>
      <div class="tabs">
        ${[['mat','재료관리','7.1'],['stock','재고관리','7.2']].map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('material',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}
      </div>
      ${T==='mat'?this.tabMat():this.tabStock()}
    </div>`;
  },
  tabMat(){
    return `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>품목</th><th>분류</th><th>규격</th><th class="t-num">단가</th><th>공급업체</th><th>유통기한</th><th>보관위치</th><th>사용 추적</th></tr></thead>
      <tbody>${MATERIALS.map(m=>`
        <tr onclick="App.toast('재료 상세 — 필지별 사용 이력 (데모)')">
          <td><span class="t-strong">${m.name}</span><span class="t-sub mono">${m.id}</span></td>
          <td><span class="chip ${{종자:'chip-green',비료:'chip-blue',농약:'chip-red',연료:'chip-amber'}[m.cat]}">${m.cat}</span></td>
          <td>${m.spec}</td><td class="t-num">${fmtW(m.price)}</td><td style="font-size:12.5px">${m.vendor}</td>
          <td class="mono" style="font-size:12px;${m.exp==='2026-09'?'color:var(--amber);font-weight:700':''}">${m.exp}</td>
          <td style="font-size:12.5px">${m.loc}</td>
          <td><span class="chip chip-gray">처방 8.3 연계</span></td>
        </tr>`).join('')}</tbody>
    </table></div>
    <div class="deep-note" style="margin-top:12px">${App.icon('link')} 처방맵(VRT) 확정 시 소요 자재가 자동 산출되어 재고와 대사됩니다</div>`;
  },
  tabStock(){
    const low=MATERIALS.filter(m=>m.stock<m.min);
    return `${low.length?`<div class="perm-note">${App.icon('sos')} <div><b>재고 부족 ${low.length}건</b> — ${low.map(m=>m.name).join(', ')} · 최소보유량 미달. <a style="color:var(--red);font-weight:700;cursor:pointer" onclick="App.toast('발주서 생성 (데모)')">발주서 생성 →</a></div></div>`:''}
    <div class="grid" style="grid-template-columns:1.2fr .8fr">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>품목</th><th class="t-num">현재고</th><th class="t-num">최소보유</th><th>상태</th><th>회전율</th></tr></thead>
        <tbody>${MATERIALS.map(m=>{
          const short=m.stock<m.min;
          return `<tr>
            <td><span class="t-strong">${m.name}</span><span class="t-sub">${m.loc}</span></td>
            <td class="t-num t-strong">${fmt(m.stock)}${m.cat==='연료'?'L':'개'}</td>
            <td class="t-num" style="color:var(--ink-3)">${m.min}</td>
            <td>${short?'<span class="chip chip-red">부족</span>':m.exp==='2026-09'?'<span class="chip chip-amber">기한 임박</span>':'<span class="chip chip-green">정상</span>'}</td>
            <td><div class="prog ${short?'red':'green'}" style="width:76px"><i style="width:${Math.min(100,m.stock/m.min*50)}%"></i></div></td>
          </tr>`;}).join('')}</tbody>
      </table></div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">입출고 이력 <small style="color:var(--ink-3);font-weight:600">작업·필지 투입 추적</small></h3>
        ${STOCK_LOG.map(l=>`
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px">
            <span class="mono" style="color:var(--ink-3);font-size:10.5px">${l.d}</span>
            <div style="flex:1"><b>${l.item}</b><br><small style="color:var(--ink-3);font-size:11px">→ ${l.to}</small></div>
            <b style="color:${l.qty>0?'var(--blue)':'var(--red)'};font-variant-numeric:tabular-nums">${l.qty>0?'+':''}${l.qty}</b>
          </div>`).join('')}
      </div>
    </div>`;
  },
  bind(){}
};

/* ============================================================ 8. 정밀농업 솔루션 */
Views.precision = {
  tab:'req',
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    const T=this.tab;
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">PRECISION AG · IA 8</div><h1>정밀농업 솔루션</h1>
        <div class="sub">토양진단 → 생육진단 → 처방 → 수확분석 — 맵 시각화는 통합 모니터링 정밀농업 레이어(2.4)</div></div>
        <div class="actions">${permBadge('8.2')}
          ${App.role.id==='farmer'?`<button class="btn btn-primary" onclick="App.toast('정밀농업 서비스 신청 (데모)')">${App.icon('plus')} 서비스 신청</button>`:''}
        </div>
      </div>
      <div class="tabs">
        ${[['req','서비스 신청','8.1'],['diag','진단정보','8.2'],['rx','처방정보','8.3'],['perf','이력/성과','8.4']]
          .map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('precision',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}
      </div>
      ${this['tab_'+T]()}
    </div>`;
  },
  tab_req(){
    const isAdmin=App.role.id==='admin';
    return `${!isAdmin?`<div class="perm-note">${App.icon('info')} <div>진단 데이터 등록·접수 관리는 <b>SPC Admin(솔루션팀)</b> 권한입니다. 현재 역할은 신청·조회가 가능합니다.</div></div>`:''}
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>접수번호</th><th>필지</th><th>서비스</th><th>신청일</th><th>우선순위</th><th>상태</th><th></th></tr></thead>
      <tbody>${PRECISION_REQ.map(r=>{const f=FIELDS.find(x=>x.id===r.field);
        const sc=r.state==='완료'?'chip-green':r.state==='진행'?'chip-blue':'chip-amber';
        return `<tr onclick="App.go('precision',{tab:'diag'})">
          <td class="mono" style="font-size:12px">${r.id}</td>
          <td><span class="t-strong">${f.name}</span><span class="t-sub mono">${r.field}</span></td>
          <td>${r.svc}</td><td class="mono" style="font-size:12px">${r.date}</td>
          <td><span class="chip ${r.pri==='상'?'chip-red':r.pri==='중'?'chip-amber':'chip-gray'}">${r.pri}</span></td>
          <td><span class="chip ${sc}"><span class="cd" style="background:currentColor"></span>${r.state}</span></td>
          <td>${isAdmin?`<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();App.toast('접수 상태 변경 (데모)')">상태 변경</button>`:''}</td>
        </tr>`;}).join('')}</tbody>
    </table></div>
    <h3 style="margin:20px 0 10px">등록필지 <span class="mono" style="font-size:10px;color:var(--ink-3)">8.1.2</span></h3>
    <div class="grid cols-4">
      ${FIELDS.slice(0,4).map(f=>`
        <div class="card card-pad" style="cursor:pointer" onclick="App.go('precision',{tab:'diag'})">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="lr-swatch" style="background:${f.tone};width:30px;height:30px;border-radius:9px">${App.icon('leaf',15)}</div>
            <div><b style="font-size:13px">${f.name}</b><br><small class="mono" style="font-size:10px;color:var(--ink-3)">${f.id}</small></div></div>
          <small style="font-size:11.5px;color:var(--ink-2)">${f.crop} · ${fmt(f.area)}평<br>진단 2회 · 처방 1회</small>
        </div>`).join('')}
    </div>`;
  },
  tab_diag(){
    return `<div class="grid" style="grid-template-columns:1.05fr .95fr">
      <div class="card card-pad">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
          <h3>토양진단 리포트 <span class="mono" style="font-size:10px;color:var(--ink-3)">8.2.1</span></h3>
          <span class="chip chip-gray">안들 3 (GJ-R3)</span><span class="chip chip-gray mono">${SOIL_REPORT.date}</span>
          <div style="margin-left:auto">${Views._mapBtn('토양 맵',{layers:['LY-06','LY-10'],focus:'GJ-R3',stop:'soil'})}</div>
        </div>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>항목</th><th class="t-num">측정값</th><th class="t-num">적정범위</th><th>판정</th></tr></thead>
          <tbody>${SOIL_REPORT.rows.map(([n,v,r,j])=>`
            <tr><td class="t-strong">${n}</td><td class="t-num">${v}</td><td class="t-num" style="color:var(--ink-3)">${r}</td>
            <td><span class="chip ${j==='적정'?'chip-green':j==='높음'?'chip-blue':'chip-amber'}">${j}</span></td></tr>`).join('')}</tbody>
        </table></div>
        <div class="perm-note" style="margin-top:12px">${App.icon('bot')} <div><b>AI 소견</b> — pH·유기물·규산 보정 필요. 규산질 비료 250kg/10a 시용 후 심경 로터리를 권장합니다. → <a style="color:var(--red);font-weight:700;cursor:pointer" onclick="App.go('precision',{tab:'rx'})">처방맵 생성으로 이동</a></div></div>
      </div>
      <div>
        <div class="card card-pad" style="margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
            <h3>생육진단 (NDVI) <span class="mono" style="font-size:10px;color:var(--ink-3)">8.2.2</span></h3>
            <div style="margin-left:auto">${Views._mapBtn('생육 맵',{layers:['LY-07','LY-10'],focus:'GJ-R5',stop:'growth2'})}</div>
          </div>
          <div style="display:flex;gap:16px;align-items:center">
            <div id="ndviDonut">${Charts.donut(71,{label:'평균 NDVI',color:'#0E9F5A',size:96})}</div>
            <div style="flex:1;font-size:12.5px;color:var(--ink-2)">
              드론 촬영 06.28 · 아랫배미(GJ-R5)<br><b style="color:var(--green)">전회(05.18) 대비 +0.09 개선</b><br>
              병반 의심 구역 <b>2개소</b> — 남서측 배수 불량 추정
            </div>
          </div>
        </div>
        <div class="card card-pad">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
            <h3>수확분석 <span class="mono" style="font-size:10px;color:var(--ink-3)">8.2.3</span></h3>
            <span class="chip chip-amber">10월 수확 예정</span>
            <div style="margin-left:auto">${Views._mapBtn('수확량 맵',{layers:['LY-08','LY-10'],stop:'harvest'})}</div>
          </div>
          <p style="font-size:12.5px;color:var(--ink-2);margin-bottom:10px">스마트콤바인(DSC85) 수확량 센서 데이터 기반 — '25년 결과:</p>
          ${Charts.bars(['안들1','안들2','안들3','큰들','옥산'],[498,512,563,540,585],{h:120,color:'#C7A008'})}
          <small style="font-size:11px;color:var(--ink-3)">'25년 필지별 수확량 (kg/10a) · 습도 보정 완료</small>
        </div>
      </div>
    </div>`;
  },
  tab_rx(){
    const canSend=permOf('8.3',App.role.id)!=='-';
    return `<div class="grid" style="grid-template-columns:1fr .9fr">
      <div class="card card-pad">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
          <h3>시비처방 (VRT 처방맵) <span class="mono" style="font-size:10px;color:var(--ink-3)">8.3.1</span></h3>
          <span class="chip chip-gray">안들 3 (GJ-R3)</span>
          <div style="margin-left:auto">${Views._mapBtn('처방맵 보기',{layers:['LY-09','LY-10'],focus:'GJ-R3',stop:'vrt'})}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;border-radius:12px;overflow:hidden;margin-bottom:12px">
          ${ZONES['GJ-R3'].vrt.map(t=>{
            const kg=(16+t*17).toFixed(0);
            const c=t<.33?'#CDEFEA':t<.66?'#3FB2A1':'#0F5E54';
            return `<div style="background:${c};aspect-ratio:2.4/1;display:grid;place-items:center;color:${t<.33?'#0F5E54':'#fff'};font-size:11px;font-weight:800">${kg}kg</div>`;}).join('')}
        </div>
        <div style="display:flex;gap:18px;font-size:12.5px;color:var(--ink-2);margin-bottom:12px">
          <span>자재 <b>${VRT_PLAN.mat}</b></span><span>평균 <b>${VRT_PLAN.avg}kg/10a</b></span>
          <span>범위 <b>${VRT_PLAN.min}~${VRT_PLAN.max}kg</b></span><span style="color:var(--green)">균일 살포 대비 <b>-${VRT_PLAN.saving}%</b></span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" style="flex:1;justify-content:center" ${canSend?'':'disabled style="opacity:.5"'}
            onclick="App.toast('처방맵을 스마트 작업기(ISOBUS)로 전송했습니다 — 가변 살포 준비 완료')">${App.icon('send')} 스마트 작업기로 전송</button>
          <button class="btn btn-ghost" onclick="App.toast('처방 PDF 리포트 생성 (10.2 연계)')">${App.icon('download')} 처방서</button>
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">처방 근거 데이터 융합</h3>
        ${[['토양진단 (04.02)','pH 5.8 · 유기물 23g/kg','LY-06','soil'],['생육진단 ① (05.18)','NDVI 평균 0.62','LY-07','growth1'],['생육진단 ② (06.28)','NDVI 평균 0.71','LY-07','growth2'],["'25 수확량 맵",'563kg/10a · 구역편차 18%','LY-08',null]]
          .map(([t,s,ly,stop])=>`
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)">
            <div class="lr-swatch" style="background:${LAYERS.find(l=>l.id===ly).color};width:30px;height:30px;border-radius:9px">${App.icon('layers',14)}</div>
            <div style="flex:1"><b style="font-size:12.5px">${t}</b><br><small style="font-size:11px;color:var(--ink-3)">${s}</small></div>
            ${stop?Views._mapBtn('맵',{layers:[ly,'LY-10'],focus:'GJ-R3',stop}):''}
          </div>`).join('')}
        <div class="deep-note" style="margin-top:12px">${App.icon('map')} 시계열 비교는 통합 모니터링 타임라인(2.1.3)에서 — 진단→처방→수확을 한 화면에서 탐색</div>
      </div>
    </div>`;
  },
  tab_perf(){
    return `<div class="grid" style="grid-template-columns:.9fr 1.1fr">
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">처방이력 <span class="mono" style="font-size:10px;color:var(--ink-3)">8.4.1</span></h3>
        ${[['2026.07.05','안들 3','시비처방 (VRT)','적용 대기','chip-amber'],['2026.05.20','아랫배미','생육기 추비 처방','적용 완료','chip-green'],['2025.10.02','안들 3','토양개량 처방','적용 완료','chip-green'],['2025.06.11','큰들','VRT 시비','적용 완료','chip-green']].map(([d,f,t,s,c])=>`
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:12.5px">
            <span class="mono" style="color:var(--ink-3);font-size:10.5px">${d}</span>
            <div style="flex:1"><b>${t}</b><br><small style="color:var(--ink-3);font-size:11px">${f}</small></div>
            <span class="chip ${c}">${s}</span></div>`).join('')}
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:4px">처방 성과분석 <span class="mono" style="font-size:10px;color:var(--ink-3)">8.4.2</span></h3>
        <p style="font-size:12px;color:var(--ink-2);margin-bottom:12px">처방 적용 필지 vs 미적용 필지 — '25년 결과</p>
        ${Charts.bars(['수확량(kg/10a)','비료비(만원/ha)','품질(완전미%)'],[563,42,94.2],{h:150,color:'#0E9F5A',values2:[498,55,90.1],color2:'#C6CCD4'})}
        <div style="display:flex;gap:14px;font-size:11.5px;color:var(--ink-2);margin-top:4px">
          <span><i style="display:inline-block;width:9px;height:9px;background:#0E9F5A;border-radius:2px"></i> 처방 적용</span>
          <span><i style="display:inline-block;width:9px;height:9px;background:#C6CCD4;border-radius:2px"></i> 미적용</span>
          <b style="margin-left:auto;color:var(--green)">수확 +13% · 비료비 -24%</b>
        </div>
      </div>
    </div>`;
  },
  bind(root){ Charts.arm(root); }
};

/* ============================================================ 9. 재무관리 */
Views.finance = {
  tab:'cost',
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    if(App.role.id==='admin') return `<div class="page-enter">
      <div class="page-head"><div><div class="eyebrow">FINANCE · IA 9</div><h1>재무관리</h1></div></div>
      <div class="card card-pad">
        <div class="empty-state">${App.icon('lock')}
          <b>SPC Admin은 개별 농가·법인의 재무 데이터에 접근할 수 없습니다</b>
          <small>재무는 민감 정보 영역 — 데이터 소유자(법인/농민)만 접근하며, Admin에게는 비식별 통계만 제공됩니다 (v2.1 설계 원칙)</small>
          <div style="margin-top:14px"><button class="btn btn-ghost" onclick="App.go('stats')">비식별 통계 보기</button></div>
        </div>
      </div></div>`;
    if(App.role.id==='op') return `<div class="page-enter"><div class="card card-pad"><div class="empty-state">${App.icon('lock')}<b>접근 권한이 없습니다</b><small>재무관리는 법인 관리자·농민 권한입니다</small></div></div></div>`;
    const T=this.tab;
    const totCost=[...FIN.labor,...FIN.mat,...FIN.equip].reduce((s,x)=>s+x.cost,0);
    const totRev=FIN.rev.reduce((s,x)=>s+x.amt,0);
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">FINANCE · IA 9</div><h1>재무관리</h1>
        <div class="sub">${App.role.id==='corp'?'김제 농협 조직 범위':'안들농장'} · 2026 영농 시즌</div></div>
        <div class="actions">${permBadge('9')}
          <button class="btn btn-ghost" onclick="App.go('stats',{tab:'report'})">${App.icon('download')} 손익 리포트</button></div>
      </div>
      <div class="grid cols-3" style="margin-bottom:16px">
        <div class="card kpi"><div class="k-label">총 수익</div><div class="k-value">${fmtW(totRev)}</div><div class="k-delta up">▲ +7.2% 전년</div></div>
        <div class="card kpi"><div class="k-label">총 비용</div><div class="k-value">${fmtW(totCost)}</div><div class="k-delta down">▼ 자재비 상승</div></div>
        <div class="card kpi" style="border-color:var(--green);background:var(--green-soft)"><div class="k-label">순손익 <span class="mono" style="font-size:9px">9.5.1</span></div>
          <div class="k-value" style="color:var(--green)">${fmtW(totRev-totCost)}</div><div class="k-delta up">이익률 ${Math.round((totRev-totCost)/totRev*100)}%</div></div>
      </div>
      <div class="tabs">
        ${[['cost','비용관리','9.1~9.3'],['rev','수익현황','9.4'],['pl','손익분석','9.5']].map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('finance',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}
      </div>
      ${T==='cost'?this.tabCost():T==='rev'?this.tabRev():this.tabPL(totRev,totCost)}
    </div>`;
  },
  tabCost(){
    const sec=(title,id,rows,cols)=>`<div class="card card-pad">
      <h3 style="margin-bottom:10px">${title} <span class="mono" style="font-size:10px;color:var(--ink-3)">${id}</span></h3>
      ${rows.map(r=>`<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px">
        <div style="flex:1"><b>${r[0]}</b><br><small style="color:var(--ink-3);font-size:11px">${r[1]}</small></div>
        <b style="font-variant-numeric:tabular-nums">${r[2]}</b></div>`).join('')}
    </div>`;
    return `<div class="grid cols-3">
      ${sec('인원비용','9.1.1',FIN.labor.map(l=>[l.who,`${l.role} · ${l.h}h`,l.cost?fmtW(l.cost):'자가노동']))}
      ${sec('자재비용','9.2.1',FIN.mat.map(m=>[m.name,m.qty,fmtW(m.cost)]))}
      ${sec('장비비용','9.3.1',FIN.equip.map(e=>[e.name,`가동 ${e.h}h`,fmtW(e.cost)]))}
    </div>
    <div class="deep-note" style="margin-top:12px">${App.icon('link')} 작업이력(6.3)·자재관리(7)·장비관리(5) 데이터가 작업 단위로 자동 집계됩니다</div>`;
  },
  tabRev(){
    return `<div class="grid" style="grid-template-columns:1fr .9fr">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>수익 항목</th><th>수량</th><th class="t-num">금액</th><th>구분</th></tr></thead>
        <tbody>${FIN.rev.map(r=>`<tr><td class="t-strong">${r.name}</td><td>${r.qty}</td>
          <td class="t-num t-strong">${fmtW(r.amt)}</td><td><span class="chip ${r.name.includes('대행')?'chip-blue':'chip-green'}">${r.name.includes('대행')?'서비스':'판매'}</span></td></tr>`).join('')}</tbody>
      </table></div>
      <div class="card card-pad">
        <h3 style="margin-bottom:8px">필지별 수익성</h3>
        ${STAT_BENCH.slice(0,4).map(b=>`
          <div class="bench-bar"><span class="bb-lab">${b.name}</span>
            <div class="bb-track"><div class="bb-fill" style="width:${b.v/b.max*100}%;background:${b.color}">${fmt(b.v*38)}원/평</div></div></div>`).join('')}
        <small style="font-size:11px;color:var(--ink-3)">평당 순수익 환산 — 처방 적용 필지(안들 3)가 최고</small>
      </div>
    </div>`;
  },
  tabPL(rev,cost){
    return `<div class="grid" style="grid-template-columns:.8fr 1.2fr">
      <div class="card card-pad" style="text-align:center">
        <h3 style="margin-bottom:12px">비용 구성</h3>
        <div style="display:flex;justify-content:center" id="plDonut">${Charts.donut(Math.round(cost/rev*100),{label:'수익 대비 비용',color:'#DE9207',size:130})}</div>
        <div style="display:flex;justify-content:center;gap:12px;margin-top:12px;font-size:11.5px;color:var(--ink-2)">
          <span><i style="display:inline-block;width:9px;height:9px;background:#2E6BE6;border-radius:2px"></i> 인건 24%</span>
          <span><i style="display:inline-block;width:9px;height:9px;background:#0E9F5A;border-radius:2px"></i> 자재 27%</span>
          <span><i style="display:inline-block;width:9px;height:9px;background:#DE9207;border-radius:2px"></i> 장비 38%</span>
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">월별 손익 추이</h3>
        ${Charts.line(['2월','3월','4월','5월','6월','7월'],[ -180, -420, -160, 240, 890, 1420 ],{h:180,color:'#0E9F5A'})}
        <small style="font-size:11px;color:var(--ink-3)">누적 손익 (만원) — 수확기 전 선급 비용 구조가 뚜렷합니다. 대행 수익이 6월 흑자 전환을 견인.</small>
      </div>
    </div>`;
  },
  bind(root){ Charts.arm(root); }
};

/* ============================================================ 10. 통계/리포트 */
Views.stats = {
  tab:'stat',
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    const T=this.tab;
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">ANALYTICS · IA 10</div><h1>통계/리포트</h1>
        <div class="sub">${App.role.id==='admin'?'플랫폼 전체 (비식별)':'내 데이터 범위'} · 교차 통계와 벤치마킹</div></div>
        <div class="actions">${permBadge('10.1')}</div>
      </div>
      <div class="tabs">
        ${[['stat','교차 통계','10.1'],['report','리포트 생성','10.2']].map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('stats',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}
      </div>
      ${T==='stat'?this.tabStat():this.tabReport()}
    </div>`;
  },
  tabStat(){
    return `<div class="filter-bar">
      ${['기간: 2026 시즌','농장 전체','장비 전체','작업유형 전체'].map(f=>`<select class="f-select"><option>${f}</option></select>`).join('')}
      <button class="btn btn-sm btn-ghost" style="margin-left:auto" onclick="App.openAI('stats')">${App.icon('bot')} 자연어로 질문하기</button>
    </div>
    <div class="grid cols-2" style="margin-bottom:16px">
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">월별 작업면적 (백 평)</h3>
        ${Charts.bars(STAT_MONTHLY.labels,STAT_MONTHLY.work,{h:170,color:'#2E6BE6'})}
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">월별 연료 사용량 (L)</h3>
        ${Charts.line(STAT_MONTHLY.labels,STAT_MONTHLY.fuel,{h:170,color:'#DE9207'})}
      </div>
    </div>
    <div class="card card-pad">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <h3>필지 간 벤치마킹 — 수확량 (kg/10a)</h3><span class="chip chip-gray">JD Benchmarking 참조</span>
        <div class="seg" style="margin-left:auto"><button class="active">필지 간</button><button onclick="App.toast('연도 간 비교 (데모)')">연도 간</button><button onclick="App.toast('장비 간 비교 (데모)')">장비 간</button></div>
      </div>
      ${STAT_BENCH.map(b=>`
        <div class="bench-bar"><span class="bb-lab">${b.name}</span>
          <div class="bb-track"><div class="bb-fill" style="width:0%;background:${b.color}" data-w="${b.v/b.max*100}">${b.v}</div></div></div>`).join('')}
      <small style="font-size:11px;color:var(--ink-3)">처방 적용 필지(안들 3)가 최고 — 윗배미는 배수 개선 검토 대상 (비효율 영역 탐색)</small>
    </div>`;
  },
  tabReport(){
    const canGen=permOf('10.2',App.role.id)==='●';
    return `<div class="grid cols-3">
      ${[['월간 영농 종합 리포트','작업·장비·자재·손익 요약','Excel · PDF','doc'],
         ['보조금 신청 증빙 리포트','작업일지·투입내역 자동 구성 — 정부 보조사업 양식','PDF','won'],
         ['대행 정산 명세서','공고·팀·필지별 정산 내역','Excel','chart']]
        .map(([t,s,f,ic])=>`
        <div class="card card-pad">
          <div class="lr-swatch" style="background:var(--navy);width:38px;height:38px;border-radius:11px;margin-bottom:10px">${App.icon(ic,18)}</div>
          <b style="font-size:14px">${t}</b>
          <p style="font-size:12px;color:var(--ink-2);margin:6px 0 12px">${s}</p>
          <div style="display:flex;gap:8px;align-items:center">
            <span class="chip chip-gray mono" style="font-size:10px">${f}</span>
            <button class="btn btn-sm btn-primary" style="margin-left:auto" ${canGen?'':'disabled style="opacity:.5"'}
              onclick="Views.stats.genReport('${t}')">${App.icon('download')} 생성</button>
          </div>
        </div>`).join('')}
    </div>
    <div class="perm-note" style="margin-top:16px">${App.icon('bot')} <div><b>AI 추천</b> — '2026 농기계 임대료 지원사업' 공고에 내 필지 조건이 부합합니다. 보조금 증빙 리포트를 생성하면 신청 양식에 맞춰 자동 구성됩니다. (3.2.2 연계)</div></div>`;
  },
  genReport(t){
    App.toast(`'${t}' 생성 중...`);
    setTimeout(()=>App.toast(`${t} 생성 완료 — 다운로드 폴더 저장 (데모)`),1200);
  },
  bind(root){
    Charts.arm(root);
    requestAnimationFrame(()=>root.querySelectorAll('.bb-fill[data-w]').forEach(b=>b.style.width=b.dataset.w+'%'));
  }
};

/* ============================================================ 11. 시스템/운영 관리 */
Views.system = {
  tab:'org',
  render(params){
    if(params&&params.tab) this.tab=params.tab;
    const r=App.role.id;
    if(r==='farmer'||r==='op') return `<div class="page-enter">
      <div class="page-head"><div><div class="eyebrow">SYSTEM · IA 11</div><h1>시스템/운영 관리</h1></div></div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">내 프로필 <span class="mono" style="font-size:10px;color:var(--ink-3)">11.1.1 (△ 프로필 관리)</span></h3>
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">
          <div class="role-avatar" style="width:52px;height:52px;font-size:19px;background:${App.role.color}">${App.role.initial}</div>
          <div><b style="font-size:16px">${App.role.name}</b><br><small style="color:var(--ink-3)">${App.role.org} · ${App.role.title}</small></div>
          <button class="btn btn-ghost" style="margin-left:auto" onclick="App.toast('프로필 수정 (데모)')">수정</button>
        </div>
        <div class="perm-note">${App.icon('lock')} <div>조직·권한·공지·코드 관리는 <b>SPC Admin / 법인 관리자</b> 권한입니다. 역할 전환으로 확인해 보세요.</div></div>
      </div></div>`;
    const T=this.tab, isAdmin=r==='admin';
    const tabs=[['org','조직·구성원','11.1'],['perm','권한 정책','11.2'],['notice','공지/알림','11.3']];
    if(isAdmin) tabs.push(['code','코드 관리','11.4'],['api','외부 연계','11.5']);
    return `<div class="page-enter">
      <div class="page-head">
        <div><div class="eyebrow">SYSTEM · IA 11</div><h1>시스템/운영 관리</h1>
        <div class="sub">사용자·조직·역할(Role)과 데이터 공유 정책 — 권한 체계의 운영 기반</div></div>
        <div class="actions">${permBadge('11.2')}
          <button class="btn btn-primary" onclick="App.toast('구성원 초대 메일 발송 (데모)')">${App.icon('plus')} 구성원 초대</button></div>
      </div>
      <div class="tabs">${tabs.map(([k,n,id])=>`<button class="tab ${T===k?'active':''}" onclick="App.go('system',{tab:'${k}'})">${n}<span class="tc mono">${id}</span></button>`).join('')}</div>
      ${this['tab_'+T]()}
    </div>`;
  },
  tab_org(){
    return `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>구성원</th><th>역할(Role)</th><th>소속</th><th>상태</th><th></th></tr></thead>
      <tbody>${ORG_MEMBERS.map(m=>`
        <tr><td class="t-strong">${m.name}</td>
        <td><span class="chip ${{'법인 관리자':'chip-blue','대행 오퍼레이터':'chip-purple'}[m.role]||'chip-gray'}">${m.role}</span></td>
        <td>${m.org}</td>
        <td>${m.state==='활성'?'<span class="chip chip-green">활성</span>':'<span class="chip chip-amber">초대 대기</span>'}</td>
        <td><button class="btn btn-sm btn-ghost" onclick="App.toast('역할 변경 (데모)')">역할 변경</button></td></tr>`).join('')}</tbody>
    </table></div>`;
  },
  tab_perm(){
    const rows=[['통합 모니터링 (2)','○','○','○','○'],['농장관리 (4)','●','●','●','-'],['장비관리 (5)','●','●','●','○'],
      ['작업관리 (6)','●','●','●','○'],['정밀농업 (8)','●','○','△','-'],['재무관리 (9)','-','●','●','-'],['시스템 관리 (11)','●','△','△','△']];
    return `<div class="perm-note">${App.icon('info')} <div>기능정의서 <b>[권한·채널 매트릭스]</b> 시트가 기준 정책입니다 — 화면의 메뉴 노출·버튼 활성화가 이 매트릭스로 제어됩니다.</div></div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>메뉴 (L1)</th><th style="text-align:center">SPC Admin</th><th style="text-align:center">법인 관리자</th><th style="text-align:center">개인 농민</th><th style="text-align:center">대행 오퍼레이터</th></tr></thead>
      <tbody>${rows.map(r=>`<tr><td class="t-strong">${r[0]}</td>${r.slice(1).map(p=>`
        <td style="text-align:center;font-size:15px;color:${p==='●'?'var(--green)':p==='-'?'var(--line-2)':p==='△'?'var(--amber)':'var(--ink-2)'}">${p}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>
    <div style="display:flex;gap:14px;margin-top:10px;font-size:11.5px;color:var(--ink-3)">
      <span>● 관리(등록·수정·삭제)</span><span>○ 조회</span><span>△ 신청/제한 실행</span><span>- 접근 불가</span>
      <span style="margin-left:auto">데이터 범위: Admin=전체(재무 제외) · 법인=소속 조직 · 농민=본인 · 오퍼레이터=배정 작업</span>
    </div>`;
  },
  tab_notice(){
    return `<div class="grid" style="grid-template-columns:1fr .9fr">
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">공지 발송 이력</h3>
        ${[['호우주의보 대비 안내','전체 농가','07.22 · Push+App',true],['플랫폼 정기점검 (07.28 02시)','전체','07.20 · Push',false],['춘계 대행 정산 확인 요청','대행 참여 농가','07.18 · Push+SMS',false]].map(([t,to,d,hot])=>`
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:12.5px">
            ${hot?'<span class="live-dot"></span>':''}<div style="flex:1"><b>${t}</b><br><small style="color:var(--ink-3);font-size:11px">대상: ${to} · ${d}</small></div>
            <button class="btn btn-sm btn-ghost" onclick="App.toast('발송 상세 (데모)')">상세</button></div>`).join('')}
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">새 공지 작성</h3>
        <div class="field-row"><label>대상</label><select><option>전체 농가</option><option>김제 농협 조직</option><option>대행단</option></select></div>
        <div class="field-row"><label>제목</label><input type="text" placeholder="공지 제목"></div>
        <div class="field-row"><label>채널</label>
          <div style="display:flex;gap:8px"><span class="chip chip-red">App Push</span><span class="chip chip-gray">SMS</span><span class="chip chip-gray">이메일</span></div></div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="App.toast('공지가 발송되었습니다 (데모)')">발송</button>
      </div>
    </div>`;
  },
  tab_code(){
    return `<div class="grid cols-3">
      ${[['작물 코드','벼(신동진·참동진), 콩, 밀, 사과 외 42종'],['작업유형 코드','경운·이앙·방제·수확·시비 외 18종'],['장비모델 코드','HX·GX·DK·DSC·DRP 시리즈 + 3rd party 31종']].map(([t,s])=>`
        <div class="card card-pad"><b style="font-size:14px">${t}</b>
          <p style="font-size:12px;color:var(--ink-2);margin:6px 0 12px">${s}</p>
          <button class="btn btn-sm btn-ghost" onclick="App.toast('코드 편집 (데모)')">편집</button></div>`).join('')}
    </div>`;
  },
  tab_api(){
    return `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>외부 연계</th><th>상태</th><th class="t-num">응답속도</th><th>최근 수신</th><th></th></tr></thead>
      <tbody>${API_LINKS.map(a=>`
        <tr><td class="t-strong">${a.name}</td>
        <td>${a.state==='정상'?'<span class="chip chip-green"><span class="cd" style="background:currentColor"></span>정상</span>':'<span class="chip chip-amber"><span class="cd" style="background:currentColor"></span>지연</span>'}</td>
        <td class="t-num mono" style="font-size:12px">${a.latency}</td><td style="font-size:12.5px;color:var(--ink-3)">${a.last}</td>
        <td><button class="btn btn-sm btn-ghost" onclick="App.toast('연계 로그 (데모)')">로그</button></td></tr>`).join('')}</tbody>
    </table></div>`;
  },
  bind(){}
};

/* helper reused by precision */
Views._mapBtn=(label,preset)=>`<button class="btn btn-sm btn-map" onclick='App.go("map",${JSON.stringify(preset)})'>${App.icon('map',13)} ${label}</button>`;
