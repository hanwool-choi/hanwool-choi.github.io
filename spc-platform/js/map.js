/* ============================================================
   통합 모니터링 — Single Map, Multi-Layer 엔진
   SVG 기반 위성 질감 맵 + 레이어 시스템 + 실시간 장비 애니메이션
   ============================================================ */
const MapView = (() => {
  let state = null, raf = null, host = null;

  const bboxOf = poly => {
    const xs = poly.map(p=>p[0]), ys = poly.map(p=>p[1]);
    return { x:Math.min(...xs), y:Math.min(...ys), w:Math.max(...xs)-Math.min(...xs), h:Math.max(...ys)-Math.min(...ys) };
  };
  const ptsStr = poly => poly.map(p=>p.join(',')).join(' ');
  const lerp=(a,b,t)=>a+(b-a)*t;
  const hexLerp=(c1,c2,t)=>{
    const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const [r1,g1,b1]=p(c1),[r2,g2,b2]=p(c2);
    return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`;
  };
  const RAMPS = {
    soil:  t=> t<.5? hexLerp('#C9A227','#9C6B3F',t*2) : hexLerp('#9C6B3F','#5C3D22',(t-.5)*2),
    ndvi:  t=> t<.5? hexLerp('#D9534F','#E8D44D',t*2) : hexLerp('#E8D44D','#1E8F4E',(t-.5)*2),
    /* 면적당 수확량: 낮음(빨강)→주황→연두(중간)→파랑(높음) */
    yield: t=> t<.33? hexLerp('#D6392E','#F2933D',t/.33) : t<.66? hexLerp('#F2933D','#BFDCA1',(t-.33)/.33) : hexLerp('#BFDCA1','#4C86C6',(t-.66)/.34),
    vrt:   t=> t<.5? hexLerp('#CDEFEA','#3FB2A1',t*2) : hexLerp('#3FB2A1','#0F5E54',(t-.5)*2),
  };
  const RAMP_LABEL = { soil:['유기물 낮음','높음','soil'], ndvi:['NDVI 0.2','0.9','ndvi'], yield:['낮음','높음','yield'], vrt:['16kg/10a','33kg','vrt'] };

  /* serpentine work path inside field bbox */
  function serpentine(f, rows=6){
    const b = bboxOf(f.poly), inset=12, pts=[];
    const x0=b.x+inset, x1=b.x+b.w-inset, y0=b.y+inset, dh=(b.h-inset*2)/(rows-1);
    for(let i=0;i<rows;i++){ const y=y0+i*dh; if(i%2===0){pts.push([x0,y],[x1,y]);}else{pts.push([x1,y],[x0,y]);} }
    return pts;
  }
  function pathLength(pts){ let L=0; for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);} return L; }
  function pointAt(pts, d){
    for(let i=1;i<pts.length;i++){
      const seg=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
      if(d<=seg){ const t=d/seg; return { x:lerp(pts[i-1][0],pts[i][0],t), y:lerp(pts[i-1][1],pts[i][1],t), ang:Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0])*180/Math.PI }; }
      d-=seg;
    }
    const l=pts[pts.length-1]; return {x:l[0],y:l[1],ang:0};
  }

  /* road network path for moving vehicle */
  const ROAD = [[60,760],[60,60],[480,60],[480,700],[720,700],[720,80],[1140,80],[1140,760]];

  function defaults(){
    return {
      layers: Object.fromEntries(LAYERS.map(l=>[l.id, l.on])),
      opacity: Object.fromEntries(LAYERS.map(l=>[l.id, 100])),
      stop: 'vrt',
      playing:false, compare:false,
      view:{x:0,y:0,w:1200,h:800},
      selField:null, selVeh:null, amotionFocus:false, amPaused:false, amReturning:false,
      base:'sat', recPeriod:'season',
      vehProg:{ 'VH-001':0.42, 'VH-002':0.65 },
      vehDist:{}, movDist:0,
    };
  }

  function init(container, preset){
    host = container;
    state = defaults();
    if (preset){
      if (preset.layers){ LAYERS.forEach(l=>state.layers[l.id]=preset.layers.includes(l.id)); }
      if (preset.stop) state.stop = preset.stop;
      if (preset.focus) state.selField = preset.focus;
      if (preset.amotion){ state.layers['LY-03']=true; state.amotionFocus=true; }
    } else {
      const rp = LAYER_PRESETS[App.role.id]; LAYERS.forEach(l=>state.layers[l.id]=rp.on.includes(l.id));
    }
    if (state.selField){ focusField(state.selField, false); }
    render();
    loop();
  }
  function destroy(){ cancelAnimationFrame(raf); raf=null; state=null; host=null; }

  function anyTimelineOn(){ return LAYERS.some(l=>l.timeline && state.layers[l.id]); }
  function activeAgroLayer(){
    const stop = TIME_STOPS.find(s=>s.id===state.stop);
    return stop ? stop.layer : null;
  }

  function focusField(fid, rerender=true){
    const f = FIELDS.find(x=>x.id===fid); if(!f) return;
    const b = bboxOf(f.poly), pad=140;
    state.view = { x:b.x-pad, y:b.y-pad, w:b.w+pad*2, h:(b.w+pad*2)*(2/3) };
    state.selField = fid;
    if(rerender) render();
  }

  /* ---------------- render ---------------- */
  function render(){
    const s = state;
    const tlOn = anyTimelineOn();
    host.innerHTML = `
    <div class="map-shell">
      <div class="map-stage" id="mapStage">
        ${renderSVG()}
        <div class="map-topbar">
          <div class="map-search">${App.icon('search')}<input placeholder="필지·장비·주소 검색" id="mapSearch"></div>
          <div class="map-mode">
            <button class="${s.base==='sat'?'active':''}" data-base="sat">위성</button>
            <button class="${s.base==='plain'?'active':''}" data-base="plain">일반</button>
          </div>
          <div class="map-live"><span class="live-dot"></span> LIVE <span class="mono" style="color:#8D97A5;font-size:10px" id="liveClock">--:--:--</span></div>
          <button class="btn btn-sm map-views" style="background:rgba(255,255,255,.96);box-shadow:var(--shadow-md);border-radius:999px" id="saveView">${App.icon('bookmark')} 맵 뷰 저장</button>
        </div>
        ${renderLegend()}
        <div class="map-zoom">
          <button id="zin">+</button><div class="mz-div"></div><button id="zout">−</button><div class="mz-div"></div><button id="zfit" title="전체 보기">${App.icon('fit')}</button>
        </div>
        <div class="timeline ${tlOn?'show':''}" id="timeline">
          <button class="tl-play" id="tlPlay">${App.icon(s.playing?'pause':'play')}</button>
          <div class="tl-track" id="tlTrack">
            <div class="tl-line"></div><div class="tl-fill" id="tlFill"></div>
            ${TIME_STOPS.map((st,i)=>{
              const x = 6+ i*(88/(TIME_STOPS.length-1));
              const idx = TIME_STOPS.findIndex(t=>t.id===s.stop);
              return `<div class="tl-stop ${i<idx?'passed':''} ${st.id===s.stop?'active':''} ${st.future?'future':''}" style="left:${x}%" data-stop="${st.id}">
                <div class="ts-lab">${st.label}</div><div class="ts-dot"></div><div class="ts-date">${st.date}</div></div>`;
            }).join('')}
          </div>
          <button class="tl-compare ${s.compare?'active':''}" id="tlCompare">2분할 비교</button>
        </div>
        <div class="map-left-stack">
          ${s.amotionFocus && s.layers['LY-03'] ? renderAmotionStrip() : ''}
          ${(s.layers['LY-04']||s.layers['LY-05']) ? renderRecordPanel() : ''}
        </div>
        <div id="mapPop"></div>
      </div>
      ${renderDock()}
    </div>`;
    bind();
    positionTlFill();
    tickClock();
  }

  function renderLegend(){
    const s=state; const rows=[];
    if(s.layers['LY-01']) rows.push(`<div class="ml-row"><i style="background:#0E9F5A"></i>작업중</div><div class="ml-row"><i style="background:#2E6BE6"></i>이동중</div><div class="ml-row"><i style="background:#9AA3AF"></i>유휴</div><div class="ml-row"><i style="background:#E5352C"></i>정비필요</div>`);
    const agro = activeAgroLayer();
    if (agro && agro!=='LY-08' && s.layers[agro]){
      const key = {'LY-06':'soil','LY-07':'ndvi','LY-09':'vrt'}[agro];
      const [lo,hi]=RAMP_LABEL[key];
      const grad = `linear-gradient(90deg, ${RAMPS[key](0)}, ${RAMPS[key](.5)}, ${RAMPS[key](1)})`;
      rows.push(`<div class="ml-title" style="margin-top:4px">${LAYERS.find(l=>l.id===agro).name}</div>
        <div class="ml-grad" style="background:${grad}"></div><div class="ml-grad-lab"><span>${lo}</span><span>${hi}</span></div>`);
    }
    if (s.layers['LY-08']){
      const grad = `linear-gradient(90deg, ${RAMPS.yield(0)}, ${RAMPS.yield(.33)}, ${RAMPS.yield(.66)}, ${RAMPS.yield(1)})`;
      rows.push(`<div class="ml-title" style="margin-top:4px">면적당 수확량</div>
        <div class="ml-grad" style="background:${grad}"></div><div class="ml-grad-lab"><span>낮음</span><span>중간</span><span>높음</span></div>`);
    }
    if (s.layers['LY-11']){
      rows.push(`<div class="ml-title" style="margin-top:4px">AI 재해경보</div>
        <div class="ml-row"><i style="background:#0E9F5A"></i>정상</div><div class="ml-row"><i style="background:#DE9207"></i>주의</div><div class="ml-row"><i style="background:#E5352C"></i>경고</div>`);
    }
    if(!rows.length) return '';
    return `<div class="map-legend"><div class="ml-title">범례</div>${rows.join('')}</div>`;
  }

  function renderAmotionStrip(){
    const j = JOBS.find(j=>j.id==='JOB-104'), v = EQUIP.find(e=>e.id==='VH-001');
    const paused = state.amPaused, ret = state.amReturning;
    const d = AMOTION_DETAIL;
    const f = FIELDS.find(x=>x.id==='GJ-R3'), b=bboxOf(f.poly);
    /* 경로 미니맵 (설정된 경로 이미지) */
    const pts=serpentine(f,7);
    const vb=`${b.x-6} ${b.y-6} ${b.w+12} ${b.h+12}`;
    const stName = ret?'입구 복귀 중':paused?'일시정지':'자율작업 중';
    const stChip = ret?'chip-blue':paused?'chip-amber':'chip-green';
    return `<div class="amotion-strip" style="width:320px">
      <div class="as-head">${App.icon('bot')} A-Motion 관제 — ${v.nick}
        <button class="as-x" onclick="MapView.closeAmotion()" title="관제 팝업 닫기">${App.icon('x',14)}</button></div>
      <div class="as-body" style="max-height:calc(100vh - 220px);overflow-y:auto">
        <div class="as-stat"><span>상태</span><b><span class="chip ${stChip}"><span class="cd" style="background:currentColor"></span>${stName}</span></b></div>
        <div class="as-stat"><span>작업 / 진행률</span><b>${j.type} · <span id="amProg">${Math.round(state.vehProg['VH-001']*100)}%</span></b></div>
        <div class="as-stat"><span>작업자</span><b>${d.worker}</b></div>
        <div class="as-stat"><span>작업기</span><b>${d.impl}</b></div>
        <div class="as-stat"><span>운행 시간 / 연료 잔량</span><b>${d.runTime} · ${v.fuel}%</b></div>
        <div class="as-stat"><span>부하율 / RPM</span><b>${d.load}% · ${fmt(d.rpm)}</b></div>
        <div class="as-stat"><span>경심 / 단수 · 경로 이탈</span><b>${j.depth}·${j.rows}단 / ±4cm</b></div>
        <!-- 설정된 경로 이미지 -->
        <div style="margin:9px 0 4px"><div style="font-size:10.5px;font-weight:700;color:var(--ink-3);margin-bottom:4px">설정된 경로 (RTK)</div>
          <div style="background:#2E4A33;border-radius:8px;overflow:hidden;position:relative">
            <svg viewBox="${vb}" style="width:100%;height:78px;display:block">
              <rect x="${b.x-6}" y="${b.y-6}" width="${b.w+12}" height="${b.h+12}" fill="#3E5B44"/>
              <polygon points="${ptsStr(f.poly)}" fill="#4C7A4E" stroke="#D6FF3E" stroke-width="2"/>
              <path d="M ${pts.map(p=>p.join(' ')).join(' L ')}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 3" opacity=".9"/>
              ${d.events.map(ev=>`<g transform="translate(${b.x+ev.x*b.w},${b.y+ev.y*b.h})"><path d="M0 -6 L5 4 L-5 4 Z" fill="#E5352C" stroke="#fff" stroke-width="1"/><text y="3.5" text-anchor="middle" font-size="6" font-weight="900" fill="#fff">!</text></g>`).join('')}
              <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="3.5" fill="#5BE49B" stroke="#fff" stroke-width="1"/>
            </svg>
            <span style="position:absolute;left:6px;bottom:4px;font-size:8.5px;color:#D6FF3E;font-weight:700">● 입구</span>
          </div>
        </div>
        <!-- 발생 이벤트 -->
        <div style="margin-top:6px"><div style="display:flex;align-items:center;font-size:10.5px;font-weight:700;color:var(--ink-3);margin-bottom:4px">
          발생 이벤트 <span style="margin-left:auto;color:var(--red)">${d.events.length}건</span></div>
          ${d.events.map(ev=>`<div style="display:flex;align-items:center;gap:7px;padding:5px 0;border-top:1px solid var(--line);font-size:11px">
            <span class="mono" style="color:var(--ink-3);font-size:10px">${ev.t}</span>
            <span class="chip chip-amber" style="font-size:9.5px">${ev.type}</span>
            <span style="margin-left:auto;color:var(--ink-3);font-size:10px">${ev.act}</span></div>`).join('')}
        </div>
        <button class="btn btn-sm btn-ghost" style="width:100%;justify-content:center;margin-top:9px" onclick="MapView.snapshot()">${App.icon('photo',13)} Snapshot 확인</button>
        <div class="as-actions" style="margin-top:9px">
          <button class="btn btn-sm ${paused?'btn-navy':'btn-primary'}" style="flex:1" onclick="MapView.toggleAmPause()" ${ret?'disabled style="opacity:.5;flex:1"':''}>${App.icon(paused?'play':'pause')} ${paused?'재개':'일시정지'}</button>
          <button class="btn btn-sm ${ret?'btn-navy':'btn-ghost'}" style="flex:1" onclick="MapView.amReturn()">${App.icon('route')} ${ret?'복귀 중':'복귀'}</button>
        </div>
        <button class="btn btn-sm btn-navy" style="width:100%;justify-content:center;margin-top:7px" onclick="App.go('equip',{veh:'VH-001'})">${App.icon('chev',13)} 상세보기 (장비 현황)</button>
      </div>
    </div>`;
  }

  /* 기록 레이어(LY-04/05) 기간 조회 패널 */
  const REC_PERIODS = [ ['7d','최근 7일','07.15'], ['30d','최근 30일','06.22'], ['season',"'26 시즌",'02.01'] ];
  function recCutoff(){ return REC_PERIODS.find(p=>p[0]===state.recPeriod)[2]; }
  function recJobs(){
    const cut=recCutoff();
    return JOBS.filter(j=>j.status==='done' && j.veh && j.date>=cut);
  }
  function renderRecordPanel(){
    const jobs=recJobs();
    return `<div class="amotion-strip" style="width:290px">
      <div class="as-head" style="background:linear-gradient(120deg,#8A6D1C,#6E570F)">${App.icon('layers')} 작업·주행 기록 조회
        <span style="margin-left:auto;font-size:10px;font-weight:600;color:rgba(255,255,255,.7)">LY-04 · LY-05</span></div>
      <div class="as-body">
        <div style="display:flex;gap:5px;margin-bottom:9px">
          ${REC_PERIODS.map(([k,l])=>`<button class="preset-pill ${state.recPeriod===k?'active':''}" style="flex:1" onclick="MapView.setRecPeriod('${k}')">${l}</button>`).join('')}
        </div>
        <div class="as-stat"><span>기간 내 기록</span><b>작업 ${jobs.length}건 · 경로 ${jobs.length}건</b></div>
        <div style="max-height:150px;overflow-y:auto;margin-top:5px">
        ${jobs.length? jobs.map(j=>{const f=FIELDS.find(x=>x.id===j.field);
          return `<div style="display:flex;align-items:center;gap:7px;padding:6px 0;border-top:1px solid var(--line);font-size:11.5px;cursor:pointer" onclick="MapView.focusField('${j.field}')">
            <span class="mono" style="color:var(--ink-3);font-size:10px">${j.date}</span>
            <b style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${j.name}</b>
            <span style="color:var(--ink-3);font-size:10.5px">${f?f.name:''}</span>${App.icon('chev',11)}
          </div>`;}).join('')
        : `<div style="padding:10px 0;text-align:center;color:var(--ink-3);font-size:11.5px">선택 기간에 기록이 없습니다</div>`}
        </div>
      </div>
    </div>`;
  }

  function renderDock(){
    const s=state;
    const groups=['실시간','기록','정밀농업','기준정보'];
    return `<aside class="layer-dock" id="layerDock">
      <div class="dock-head">
        <h2>${App.icon('layers')} 레이어</h2>
        <div class="preset-row">
          ${Object.entries(LAYER_PRESETS).map(([rid,p])=>`<button class="preset-pill ${App.role.id===rid?'active':''}" data-preset="${rid}">${p.label}</button>`).join('')}
        </div>
      </div>
      <div class="dock-body">
        ${groups.map(g=>`
          <div class="layer-group">
            <div class="lg-title">${g==='실시간'?'<span class="live-dot" style="width:5px;height:5px"></span>':''}${g} 레이어</div>
            ${LAYERS.filter(l=>l.group===g).map(l=>`
              <div class="layer-row ${s.layers[l.id]?'on':''}" data-layer="${l.id}">
                <div class="lr-swatch" style="background:${l.color}">${App.icon(l.icon,14)}</div>
                <div class="lr-txt"><b>${l.name}</b><small>${l.id} · ${l.refresh}</small></div>
                <div class="lr-toggle"></div>
              </div>
              <div class="layer-opacity"><input type="range" min="20" max="100" value="${s.opacity[l.id]}" data-op="${l.id}"><span>${s.opacity[l.id]}%</span></div>
            `).join('')}
          </div>`).join('')}
      </div>
      <div class="dock-foot">
        <button class="btn btn-ghost btn-sm" style="flex:1" id="dockShare">${App.icon('share')} 뷰 공유</button>
        <button class="btn btn-navy btn-sm" style="flex:1" onclick="App.go('farm',{tab:'boundary'})">${App.icon('edit')} 경계 편집</button>
      </div>
    </aside>`;
  }

  /* ------------ SVG scene ------------ */
  function renderSVG(){
    const s=state, v=s.view;
    const sat = s.base==='sat';
    return `<svg class="mapviz" id="mapSvg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="terr" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="7" result="n"/>
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.32, 0 0 0 0 0.38, 0 0 0 0 0.26, 0 0 0 0.35 0" result="tint"/>
          <feComposite in="tint" in2="SourceGraphic" operator="atop"/>
        </filter>
        <filter id="croprow" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.9 0.06" numOctaves="1" seed="3" result="rows"/>
          <feColorMatrix in="rows" type="matrix" values="0 0 0 0 1, 0 0 0 0 1, 0 0 0 0 1, 0 0 0 0.10 0" result="rw"/>
          <feComposite in="rw" in2="SourceGraphic" operator="atop"/>
        </filter>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/></filter>
        <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#39566B"/><stop offset="1" stop-color="#2A4356"/>
        </linearGradient>
      </defs>
      <!-- base terrain -->
      <rect x="-200" y="-200" width="1600" height="1200" fill="${sat?'#4A5B3E':'#EDEAE2'}"/>
      ${sat?`<rect x="-200" y="-200" width="1600" height="1200" fill="#55673F" filter="url(#terr)" opacity=".9"/>`:''}
      <!-- stream -->
      <path d="M 470 -100 C 500 100, 445 300, 480 480 C 505 620, 460 720, 490 900" fill="none" stroke="${sat?'url(#water)':'#BFD5E4'}" stroke-width="26" opacity="${sat?.85:1}"/>
      <!-- roads -->
      <g stroke="${sat?'#C9C2AE':'#D8D4C8'}" stroke-width="10" fill="none" opacity="${sat?.75:1}">
        <path d="M 60 -100 V 900"/><path d="M -100 60 H 1300"/><path d="M 720 -100 V 900"/><path d="M -100 700 H 1300"/><path d="M 960 -100 V 900"/>
      </g>
      <g stroke="${sat?'#8E8A76':'#C4C0B4'}" stroke-width="1.2" stroke-dasharray="14 10" fill="none" opacity=".7">
        <path d="M 60 -100 V 900"/><path d="M 720 -100 V 900"/>
      </g>
      <!-- non-field paddies (ambience) -->
      ${ambient(sat)}
      <!-- managed fields -->
      ${FIELDS.map(f=>fieldSVG(f,sat)).join('')}
      <!-- layers -->
      ${s.layers['LY-11']? hazardSVG() : ''}
      ${s.layers['LY-05']? routeSVG() : ''}
      ${s.layers['LY-02']? coverageSVG() : ''}
      ${s.layers['LY-03']? amotionSVG() : ''}
      ${s.layers['LY-01']? vehiclesSVG() : ''}
      <!-- village marker -->
      <g transform="translate(495,585)" opacity=".95">
        <rect x="-26" y="-11" width="52" height="20" rx="10" fill="rgba(32,39,47,.85)"/>
        <text x="0" y="4" text-anchor="middle" font-size="10.5" fill="#fff" font-weight="700" font-family="var(--font)">안들</text>
      </g>
      <!-- scale -->
      <g transform="translate(${v.x+v.w-160},${v.y+v.h-28})">
        <rect x="0" y="0" width="60" height="4" fill="#fff" opacity=".9"/><rect x="0" y="0" width="30" height="4" fill="#20272F" opacity=".8"/>
        <text x="66" y="6" font-size="11" fill="#fff" font-weight="600" style="paint-order:stroke;stroke:rgba(0,0,0,.4);stroke-width:2">100m</text>
      </g>
    </svg>`;
  }

  function ambient(sat){
    if(!sat) return '';
    const cells=[];
    const cols=[[-140,20],[80,300],[990,60],[990,420],[520,560],[760,660]];
    cols.forEach(([cx,cy],ci)=>{
      for(let i=0;i<3;i++){
        const y=cy+i*88, tone=['#5F7A4A','#6B854F','#577245','#728C55'][(ci+i)%4];
        cells.push(`<rect x="${cx}" y="${y}" width="150" height="78" fill="${tone}" opacity=".55" filter="url(#croprow)"/>`);
      }
    });
    return cells.join('');
  }

  function fieldSVG(f, sat){
    const s=state, sel=s.selField===f.id;
    const agro = activeAgroLayer();
    const showZones = agro && agro!=='LY-08' && s.layers[agro];
    const b=bboxOf(f.poly);
    let zones='';
    if (showZones){
      const key={'LY-06':'soil','LY-07':'ndvi','LY-09':'vrt'}[agro];
      const dataKey = key==='ndvi' && state.stop==='growth2' ? 'ndvi2' : key;
      const vals = ZONES[f.id][dataKey] || ZONES[f.id][key];
      const op = s.opacity[agro]/100;
      const gw=b.w/4, gh=b.h/4;
      vals.forEach((t,i)=>{
        const gx=b.x+(i%4)*gw, gy=b.y+Math.floor(i/4)*gh;
        zones+=`<rect class="zone" x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${RAMPS[key](t)}" opacity="${op}"/>`;
      });
    }
    /* 수확량 그리드맵 (LY-08) — 모산들(GJ-R6) 전용 5×5m 셀 그래픽 */
    if (s.layers['LY-08'] && f.id==='GJ-R6'){
      const op=s.opacity['LY-08']/100;
      const COLS=13, ROWS=10, gw=b.w/COLS, gh=b.h/ROWS;
      zones+=`<clipPath id="yclip"><polygon points="${ptsStr(f.poly)}"/></clipPath><g clip-path="url(#yclip)">`;
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
        /* 중심 높음(파랑) → 가장자리 낮음(빨강) + 노이즈 */
        const nx=(c+0.5)/COLS-0.5, ny=(r+0.5)/ROWS-0.5;
        const edge=Math.max(Math.abs(nx)*2, Math.abs(ny)*2);            // 0 center → 1 edge
        const noise=(Math.sin(c*3.7+r*5.1)+Math.sin(c*1.3-r*2.9))*0.09;
        const t=Math.max(0,Math.min(1, 1-Math.pow(edge,1.6)+noise));
        zones+=`<rect x="${b.x+c*gw}" y="${b.y+r*gh}" width="${gw}" height="${gh}" fill="${RAMPS.yield(t)}" opacity="${op}" stroke="rgba(255,255,255,.35)" stroke-width="0.5" pointer-events="none"/>`;
      }
      zones+=`</g>
      <polygon points="${ptsStr(f.poly)}" fill="none" stroke="#fff" stroke-width="2.2" pointer-events="none"/>
      <g transform="translate(${b.x},${b.y-14})" pointer-events="none">
        <rect x="0" y="-11" width="64" height="20" rx="6" fill="#fff" filter="url(#soft)"/>
        <text x="32" y="3" text-anchor="middle" font-size="10" font-weight="800" fill="#181C22" font-family="var(--font)">5 × 5 (m)</text></g>
      <g transform="translate(${b.x+b.w},${b.y-14})" pointer-events="none">
        <rect x="-142" y="-11" width="142" height="20" rx="6" fill="#fff" filter="url(#soft)"/>
        <text x="-71" y="3" text-anchor="middle" font-size="9.5" font-weight="800" fill="#181C22" font-family="var(--font)">총 수확량 : 4,030.4 kg</text></g>`;
    }
    const boundary = s.layers['LY-10'];
    return `<g>
      <polygon class="fld ${sel?'sel':''}" data-field="${f.id}" points="${ptsStr(f.poly)}"
        fill="${sat? f.tone : '#E3EED9'}" ${sat?'filter="url(#croprow)"':''}
        style="${boundary?'':'stroke:transparent'}" ${sel?'stroke="#fff"':''}/>
      ${zones}
      ${boundary?`<polygon points="${ptsStr(f.poly)}" fill="none" stroke="${sel?'#FFFFFF':'rgba(255,255,255,.75)'}" stroke-width="${sel?3:1.6}" pointer-events="none" ${sel?'stroke-dasharray="6 4" style="animation:march 1.2s linear infinite"':''}/>`:''}
      <text class="fld-label" x="${b.x+b.w/2}" y="${b.y+18}" text-anchor="middle">${f.name}</text>
      <text x="${b.x+b.w/2}" y="${b.y+31}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.75)" font-family="var(--mono)" pointer-events="none">${f.id} · ${fmt(f.area)}평</text>
    </g>
    <style>@keyframes march{to{stroke-dashoffset:-20}}</style>`;
  }

  function coverageSVG(){
    const s=state; let out='';
    JOBS.filter(j=>j.status==='run'||j.status==='issue').forEach(j=>{
      const f=FIELDS.find(x=>x.id===j.field); if(!f) return;
      const b=bboxOf(f.poly);
      const prog = s.vehProg[j.veh] ?? j.prog/100;
      const color = j.amotion ? '#6E56CF' : (j.status==='issue'?'#E5352C':'#2E6BE6');
      const op=s.opacity['LY-02']/100;
      out+=`<g class="cov-poly">
        <clipPath id="clip-${j.id}"><polygon points="${ptsStr(f.poly)}"/></clipPath>
        <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h*prog}" fill="${color}" opacity="${.32*op}" clip-path="url(#clip-${j.id})"/>
        <line x1="${b.x}" x2="${b.x+b.w}" y1="${b.y+b.h*prog}" y2="${b.y+b.h*prog}" stroke="${color}" stroke-width="1.6" opacity="${.8*op}" clip-path="url(#clip-${j.id})"/>
        <g transform="translate(${b.x+b.w-14},${b.y+14})">
          <rect x="-38" y="-10" width="52" height="19" rx="9.5" fill="${color}" filter="url(#soft)"/>
          <text x="-12" y="4" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" id="covlab-${j.id}">${Math.round(prog*100)}%</text>
        </g>
      </g>`;
    });
    /* as-applied 기록 레이어 — 기간 필터 적용 */
    if (s.layers['LY-04']){
      recJobs().forEach(j=>{
        const f=FIELDS.find(x=>x.id===j.field); if(!f)return;
        const b=bboxOf(f.poly); const op=s.opacity['LY-04']/100;
        for(let i=0;i<6;i++){
          const t=(Math.sin(i*2.7+j.id.length)+1)/2;
          out+=`<rect x="${b.x+4}" y="${b.y+4+i*(b.h-8)/6}" width="${b.w-8}" height="${(b.h-8)/6-1.5}" rx="2"
            fill="${hexLerp('#F2C14E','#C56A1D',t)}" opacity="${.5*op}" pointer-events="none"/>`;
        }
        out+=`<g transform="translate(${b.x+b.w/2},${b.y+b.h-12})" pointer-events="none">
          <rect x="-42" y="-9" width="84" height="16" rx="8" fill="rgba(32,39,47,.82)"/>
          <text y="3" text-anchor="middle" font-size="8.5" font-weight="700" fill="#F2C14E" font-family="var(--font)">${j.date} ${j.type||''}</text></g>`;
      });
    }
    return out;
  }

  function amotionSVG(){
    const f=FIELDS.find(x=>x.id==='GJ-R3'); const pts=serpentine(f,7), b=bboxOf(f.poly);
    const d='M '+pts.map(p=>p.join(' ')).join(' L ');
    /* 이벤트 발생 기록 마커 (느낌표 표지판) */
    const markers=AMOTION_DETAIL.events.map(ev=>{
      const x=b.x+ev.x*b.w, y=b.y+ev.y*b.h;
      return `<g transform="translate(${x},${y})" style="cursor:pointer" class="am-event"><title>${ev.t} ${ev.type} — ${ev.act}</title>
        <path d="M0 -14 L12 8 L-12 8 Z" fill="#E5352C" stroke="#fff" stroke-width="2" filter="url(#soft)"/>
        <text y="6" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="var(--font)">!</text></g>`;
    }).join('');
    return `<g>
      <path class="route-line" d="${d}" stroke="#6E56CF" stroke-width="2" stroke-dasharray="5 4" opacity=".85"/>
      ${pts.filter((_,i)=>i%2===0).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.2" fill="#6E56CF"/>`).join('')}
      <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="4" fill="#5BE49B" stroke="#fff" stroke-width="1.5"/>
      ${markers}
    </g>`;
  }

  /* LY-11 AI 재해경보 — 경보 필지 강조 + 경보 배지 */
  function hazardSVG(){
    const op=state.opacity['LY-11']/100;
    return FIELDS.filter(f=>f.hazard.level!=='정상').map(f=>{
      const b=bboxOf(f.poly);
      const col={'주의':'#DE9207','경고':'#E5352C'}[f.hazard.level];
      const pulse=f.hazard.level==='경고';
      return `<g pointer-events="none">
        <polygon points="${ptsStr(f.poly)}" fill="${col}" opacity="${.22*op}"/>
        <polygon points="${ptsStr(f.poly)}" fill="none" stroke="${col}" stroke-width="2.6" opacity="${op}"
          ${pulse?'stroke-dasharray="8 5" style="animation:march 1s linear infinite"':''}/>
        <g transform="translate(${b.x+b.w/2},${b.y+b.h/2})">
          ${pulse?`<circle r="20" fill="${col}" opacity=".3"><animate attributeName="r" values="16;30;16" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".4;0;.4" dur="1.8s" repeatCount="indefinite"/></circle>`:''}
          <path d="M0 -15 L14 12 L-14 12 Z" fill="${col}" stroke="#fff" stroke-width="1.6"/>
          <text y="9" text-anchor="middle" font-size="15" font-weight="900" fill="#fff" font-family="var(--font)">!</text>
        </g>
        <g transform="translate(${b.x+b.w/2},${b.y+b.h/2+30})">
          <rect x="-52" y="-9" width="104" height="18" rx="9" fill="${col}"/>
          <text y="4" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" font-family="var(--font)">${f.hazard.level} · ${f.hazard.type||''}</text></g>
      </g>`;
    }).join('');
  }

  function routeSVG(){
    const op=state.opacity['LY-05']/100;
    /* 기간 내 완료 작업의 필지 내 주행 트랙 표시 */
    return recJobs().map(j=>{
      const f=FIELDS.find(x=>x.id===j.field); if(!f) return '';
      const pts=serpentine(f,6);
      const d='M '+pts.map(p=>p.join(' ')).join(' L ');
      return `<path class="route-line" d="${d}" stroke="#E8EDF2" stroke-width="1.6" opacity="${.75*op}" stroke-dasharray="3 5"/>
        <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="3" fill="#5BE49B" opacity="${op}"/>
        <circle cx="${pts[pts.length-1][0]}" cy="${pts[pts.length-1][1]}" r="3" fill="#E5352C" opacity="${op}"/>`;
    }).join('');
  }

  function vehiclesSVG(){
    return `<g id="vehLayer">${EQUIP.map(v=>{
      const st=EQUIP_STATUS[v.status];
      const col={work:'#0E9F5A',move:'#2E6BE6',idle:'#9AA3AF',maint:'#E5352C'}[v.status];
      return `<g class="veh-marker" data-veh="${v.id}" id="vm-${v.id}">
        <g class="vm-body">
          ${v.status==='work'||v.status==='move'?`<circle r="14" fill="${col}" opacity=".25"><animate attributeName="r" values="10;20;10" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".3;0;.3" dur="2.2s" repeatCount="indefinite"/></circle>`:''}
          <circle r="11" fill="${col}" stroke="#fff" stroke-width="2" filter="url(#soft)"/>
          ${v.amotion?`<circle r="14.5" fill="none" stroke="#6E56CF" stroke-width="1.6" stroke-dasharray="3 3"/>`:''}
          <g transform="translate(-6,-6) scale(0.5)" fill="#fff">${App.iconRaw(v.type==='콤바인'?'combine':v.type==='방제드론'?'drone':'tractor')}</g>
        </g>
        <g transform="translate(0,-24)">
          <rect x="-34" y="-11" width="68" height="17" rx="8.5" fill="rgba(32,39,47,.88)"/>
          <text y="2" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="var(--font)">${v.model}</text>
        </g>
      </g>`;
    }).join('')}</g>`;
  }

  /* ---------------- animation loop ---------------- */
  let last=0;
  function loop(ts){
    raf=requestAnimationFrame(loop);
    if(!state||!host) return;
    if(ts-last<50) return; const dt=Math.min(0.2,(ts-last)/1000||0.05); last=ts;
    /* A-Motion 복귀: VH-001 진행률을 입구(0)로 되돌림 */
    if(state.amReturning){
      state.vehProg['VH-001']=Math.max(0,(state.vehProg['VH-001']??0.4)-dt*0.12);
      if(state.vehProg['VH-001']<=0.001){ state.amReturning=false; state.amPaused=true; App.toast('HX1400AI 1호기가 경작지 입구로 복귀했습니다'); if(state.amotionFocus) render(); }
    }
    /* progress working vehicles (A-Motion 일시정지·복귀 시 VH-001 정지) */
    ['VH-001','VH-002'].forEach(id=>{
      if(!state.layers['LY-01']&&!state.layers['LY-02'])return;
      if(id==='VH-001'&&(state.amPaused||state.amReturning))return;
      state.vehProg[id]=Math.min(0.995, (state.vehProg[id]??0.4)+dt*0.004);
    });
    state.movDist=state.movDist+dt*34;
    positionVehicles();
    /* timeline autoplay */
    if(state.playing){
      state._pt=(state._pt||0)+dt;
      if(state._pt>1.8){ state._pt=0; stepStop(1); }
    }
  }

  function positionVehicles(){
    if(!host) return;
    EQUIP.forEach(v=>{
      const el=host.querySelector(`#vm-${v.id}`); if(!el) return;
      let x,y,ang=0;
      if(v.status==='work'&&v.field){
        const f=FIELDS.find(ff=>ff.id===v.field);
        const pts=serpentine(f, v.amotion?7:6);
        const L=pathLength(pts);
        const p=pointAt(pts, L*(state.vehProg[v.id]??0.4)); x=p.x;y=p.y;ang=p.ang;
      } else if (v.status==='move'){
        /* DK6020: 옥산 대전(GJ-R10) 필지 내부를 순환 이동 */
        const f=FIELDS.find(ff=>ff.id===(v.field||'GJ-R10'));
        const pts=serpentine(f,5);
        const L=pathLength(pts);
        const p=pointAt(pts, state.movDist%L); x=p.x;y=p.y;ang=p.ang;
      } else {
        /* 유휴/정비 차량 — 고정 주기장 위치 (프레임마다 흔들리지 않도록 상수) */
        const spots={ 'VH-004':[985,235],'VH-005':[1010,300],'VH-006':[985,365],'VH-007':[1010,430] };
        [x,y]=spots[v.id]||[1000,300];
      }
      el.setAttribute('transform',`translate(${x},${y})`);
      const lab=host.querySelector(`#covlab-${v.job}`);
      if(lab) lab.textContent=Math.round((state.vehProg[v.id]??0)*100)+'%';
      const am=host.querySelector('#amProg');
      if(am&&v.id==='VH-001') am.textContent=Math.round((state.vehProg['VH-001'])*100)+'%';
    });
  }

  function tickClock(){
    const el=host&&host.querySelector('#liveClock'); if(!el) return;
    const u=()=>{ if(!host)return; const d=new Date(); el.textContent=d.toTimeString().slice(0,8); };
    u(); clearInterval(state._clk); state._clk=setInterval(u,1000);
  }

  /* ---------------- interactions ---------------- */
  function stepStop(dir){
    const avail=TIME_STOPS.filter(s=>!s.future);
    let i=avail.findIndex(s=>s.id===state.stop); i=(i+dir+avail.length)%avail.length;
    setStop(avail[i].id);
  }
  function setStop(id){
    const stop=TIME_STOPS.find(s=>s.id===id);
    if(stop.future){ App.toast('수확 데이터는 10월 수확 후 제공됩니다'); return; }
    state.stop=id;
    /* auto-switch agronomy layer to the stop's layer */
    LAYERS.filter(l=>l.timeline).forEach(l=>state.layers[l.id]=(l.id===stop.layer));
    render();
  }
  function positionTlFill(){
    const idx=TIME_STOPS.findIndex(t=>t.id===state.stop);
    const fill=host.querySelector('#tlFill');
    if(fill) fill.style.width=(6+idx*(88/(TIME_STOPS.length-1)))+'%';
  }

  function bind(){
    const stage=host.querySelector('#mapStage'), svg=host.querySelector('#mapSvg');
    /* base toggle */
    host.querySelectorAll('[data-base]').forEach(b=>b.onclick=()=>{ state.base=b.dataset.base; render(); });
    /* zoom */
    const zoom=f=>{ const v=state.view, cx=v.x+v.w/2, cy=v.y+v.h/2;
      v.w=Math.max(220,Math.min(1600,v.w*f)); v.h=v.w*(2/3); v.x=cx-v.w/2; v.y=cy-v.h/2;
      svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`); };
    host.querySelector('#zin').onclick=()=>zoom(0.8);
    host.querySelector('#zout').onclick=()=>zoom(1.25);
    host.querySelector('#zfit').onclick=()=>{ state.view={x:0,y:0,w:1200,h:800}; state.selField=null; render(); };
    svg.addEventListener('wheel',e=>{ e.preventDefault(); zoom(e.deltaY>0?1.12:0.9); },{passive:false});
    /* pan — 포인터 캡처를 쓰지 않고 임계값 기반으로만 팬(클릭 이벤트가 필지·마커로 정상 전달되도록) */
    let drag=null, panning=false;
    svg.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY,vx:state.view.x,vy:state.view.y}; panning=false; });
    svg.addEventListener('pointermove',e=>{ if(!drag)return;
      if(!panning && Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<5) return;   // 5px 이동 전까지는 클릭으로 간주
      panning=true; const sc=state.view.w/stage.clientWidth;
      state.view.x=drag.vx-(e.clientX-drag.x)*sc; state.view.y=drag.vy-(e.clientY-drag.y)*sc;
      svg.setAttribute('viewBox',`${state.view.x} ${state.view.y} ${state.view.w} ${state.view.h}`); });
    const endPan=()=>{ drag=null; setTimeout(()=>panning=false,0); };
    svg.addEventListener('pointerup',endPan);
    svg.addEventListener('pointerleave',endPan);
    /* field click */
    host.querySelectorAll('.fld').forEach(p=>p.addEventListener('click',e=>{
      if(panning)return;
      const fid=p.dataset.field; state.selField=fid; showFieldPop(fid,e);
      host.querySelectorAll('.fld').forEach(q=>q.classList.toggle('sel',q.dataset.field===fid));
    }));
    /* vehicle click */
    host.querySelectorAll('.veh-marker').forEach(m=>m.addEventListener('click',e=>{ e.stopPropagation(); if(panning)return; showVehPop(m.dataset.veh,e); }));
    /* layers */
    host.querySelectorAll('.layer-row').forEach(r=>r.addEventListener('click',e=>{
      if(e.target.closest('input'))return;
      const id=r.dataset.layer; state.layers[id]=!state.layers[id];
      if(id==='LY-03'&&state.layers[id]) state.amotionFocus=true;
      if(id==='LY-08'&&state.layers[id]){ focusField('GJ-R6', false); App.toast("수확량 맵 — 모산들(GJ-R6) '25 수확 데이터"); }
      if(LAYERS.find(l=>l.id===id).timeline && state.layers[id]){
        /* 수확량 맵은 타임라인 '수확' 시점에 싱크 (미래 스탑도 허용) */
        const stop = id==='LY-08' ? TIME_STOPS.find(s=>s.layer===id) : TIME_STOPS.find(s=>s.layer===id&&!s.future);
        if(stop) state.stop=stop.id;
        LAYERS.filter(l=>l.timeline&&l.id!==id).forEach(l=>state.layers[l.id]=false);
      }
      render();
    }));
    host.querySelectorAll('[data-op]').forEach(sl=>{
      sl.addEventListener('input',()=>{ state.opacity[sl.dataset.op]=+sl.value; sl.nextElementSibling.textContent=sl.value+'%';
        /* live update zone/coverage opacity without full re-render */
        renderPatch(); });
    });
    host.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
      const p=LAYER_PRESETS[b.dataset.preset];
      LAYERS.forEach(l=>state.layers[l.id]=p.on.includes(l.id));
      render(); App.toast(`레이어 프리셋 적용: ${p.label}`);
    });
    /* timeline */
    const tp=host.querySelector('#tlPlay');
    if(tp) tp.onclick=()=>{ state.playing=!state.playing; render(); };
    host.querySelectorAll('.tl-stop').forEach(st=>st.onclick=()=>setStop(st.dataset.stop));
    const tc=host.querySelector('#tlCompare');
    if(tc) tc.onclick=()=>{ state.compare=!state.compare; tc.classList.toggle('active'); App.toast(state.compare?'2분할 비교: 처방맵 vs 생육진단 (프로토타입 데모)':'2분할 비교 해제'); };
    /* search */
    const ms=host.querySelector('#mapSearch');
    ms.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      const q=ms.value.trim();
      const f=FIELDS.find(f=>f.name.includes(q)||f.id.toLowerCase().includes(q.toLowerCase())||f.addr.includes(q));
      const v=EQUIP.find(v=>v.model.toLowerCase().includes(q.toLowerCase())||v.nick.includes(q));
      if(f){ focusField(f.id); App.toast(`${f.name} (${f.id})로 이동`); }
      else if(v){ App.toast(`${v.nick} 위치로 이동`); }
      else App.toast('검색 결과가 없습니다');
    });
    host.querySelector('#saveView').onclick=()=>App.toast('현재 맵 뷰가 저장되었습니다 — 조직 공유 가능');
    host.querySelector('#dockShare').onclick=()=>App.toast('맵 뷰 공유 링크가 복사되었습니다');
  }

  function renderPatch(){
    /* light refresh of zone opacity: full render is cheap enough */
    const scroll=host.querySelector('.dock-body')?.scrollTop||0;
    render();
    const db=host.querySelector('.dock-body'); if(db) db.scrollTop=scroll;
  }

  function showFieldPop(fid, e){
    const f=FIELDS.find(x=>x.id===fid);
    const jobs=JOBS.filter(j=>j.field===fid);
    const run=jobs.find(j=>j.status==='run');
    /* A-Motion 작업중 필지 선택 시 → 관제 팝업 열기 */
    if(run && run.amotion){ state.layers['LY-03']=true; state.amotionFocus=true; render(); return; }
    const pop=host.querySelector('#mapPop');
    const stage=host.querySelector('#mapStage').getBoundingClientRect();
    const x=Math.min(e.clientX-stage.left+14, stage.width-310), y=Math.min(e.clientY-stage.top-20, stage.height-280);
    const [hc,hcolor]=({'정상':['chip-green','#0E9F5A'],'주의':['chip-amber','#DE9207'],'경고':['chip-red','#E5352C']})[f.hazard.level];
    pop.innerHTML=`<div class="map-pop" style="left:${Math.max(10,x)}px;top:${Math.max(10,y)}px">
      <div class="mp-head">
        <div class="lr-swatch" style="background:${f.tone};width:30px;height:30px;border-radius:9px">${App.icon('map',15)}</div>
        <div><b>${f.name}</b><small>${f.id} · ${f.addr}</small></div>
        <button class="mp-x" onclick="this.closest('.map-pop').remove()">${App.icon('x',14)}</button>
      </div>
      <div class="mp-body">
        <div class="mp-row"><span>면적 / 작물</span><b>${fmt(f.area)}평 · ${f.crop}</b></div>
        <div class="mp-row"><span>농장 / 소유</span><b>${f.farm} · ${f.owner}</b></div>
        <div class="mp-row"><span>진행 작업</span><b>${run? run.name+' ('+Math.round((state.vehProg[run.veh]??run.prog/100)*100)+'%)' : '없음'}</b></div>
        <div class="mp-row"><span>재해경보</span><b><span class="chip ${hc}">${f.hazard.level}${f.hazard.type?' · '+f.hazard.type:''}</span></b></div>
      </div>
      ${f.hazard.level!=='정상'?`<div style="margin:0 15px 10px;padding:9px 11px;background:${hcolor}15;border-radius:9px;font-size:11px;color:var(--ink-2);line-height:1.5">${App.icon('sos',11)} ${f.hazard.eta} 예상 · ${f.hazard.action.split('②')[0].replace('①','').trim()}</div>`:''}
      <div class="mp-actions">
        <button class="btn btn-sm btn-ghost" onclick="App.go('farm',{tab:'plot'})">필지 상세</button>
        <button class="btn btn-sm btn-primary" onclick="App.go('precision',{tab:'diag',field:'${fid}'})">진단·처방 이력</button>
      </div>
    </div>`;
  }

  function showVehPop(vid,e){
    const v=EQUIP.find(x=>x.id===vid);
    /* A-Motion 작업중 차량 클릭 → 관제 팝업 */
    if(v.amotion && v.status==='work'){ state.layers['LY-03']=true; state.amotionFocus=true; render(); return; }
    const [stName,stColor]=EQUIP_STATUS[v.status];
    const job=JOBS.find(j=>j.id===v.job);
    const pop=host.querySelector('#mapPop');
    const stage=host.querySelector('#mapStage').getBoundingClientRect();
    const x=Math.min(e.clientX-stage.left+14, stage.width-310), y=Math.min(e.clientY-stage.top-20, stage.height-320);
    /* 이동중/작업중 차량은 운영 상세(작업자·작업·작업기·연료·부하율·RPM·운행시간) */
    const active = v.status==='move'||v.status==='work';
    const load = v.status==='move'?38:68, rpm=v.status==='move'?1450:1920;
    const impl = IMPLEMENTS.find(im=>im.linked===v.id);
    pop.innerHTML=`<div class="map-pop" style="left:${Math.max(10,x)}px;top:${Math.max(10,y)}px">
      <div class="mp-head">
        <div class="lr-swatch" style="background:var(--navy);width:30px;height:30px;border-radius:9px">${App.icon(v.type==='콤바인'?'combine':v.type==='방제드론'?'drone':'tractor',15)}</div>
        <div><b>${v.nick}</b><small>${v.id} · TMU ${v.tmu}</small></div>
        <button class="mp-x" onclick="this.closest('.map-pop').remove()">${App.icon('x',14)}</button>
      </div>
      <div class="mp-body">
        <div class="mp-row"><span>상태</span><b><span class="chip chip-${stColor}"><span class="cd" style="background:currentColor"></span>${stName}</span></b></div>
        ${active?`
          <div class="mp-row"><span>작업자</span><b>${v.owner==='김철수'?'김철수':'배정 오퍼레이터'}</b></div>
          <div class="mp-row"><span>작업 / 작업기</span><b>${job?job.type:(v.status==='move'?'필지 이동':'-')} · ${impl?impl.name.split(' ')[0]:'-'}</b></div>
          <div class="mp-row"><span>연료 잔량</span><b>${v.fuel}%</b></div>
          <div class="mp-row"><span>부하율 / RPM</span><b>${load}% · ${fmt(rpm)}</b></div>
          <div class="mp-row"><span>금일 운행 시간</span><b>${v.todayH}h</b></div>
        `:`
          <div class="mp-row"><span>연료 / DEF</span><b>${v.fuel??'-'}% · ${v.def??'-'}%</b></div>
          <div class="mp-row"><span>금일 가동 / 누적</span><b>${v.todayH}h · ${fmt(v.hours)}h</b></div>
          <div class="mp-row"><span>현재 작업</span><b>${job? job.name : '-'}</b></div>
        `}
        ${v.dtc?`<div class="mp-row"><span>DTC</span><b style="color:var(--red)">${v.dtcCode} 외 ${v.dtc-1>0?v.dtc-1+'건':'0건'}</b></div>`:''}
      </div>
      <div class="mp-actions">
        <button class="btn btn-sm btn-ghost" onclick="App.go('equip',{veh:'${v.id}'})">장비 상세</button>
        <button class="btn btn-sm btn-primary" onclick="App.toast('트랙 리플레이 (프로토타입 데모)')">경로 재생</button>
      </div>
    </div>`;
  }

  function enterAmotion(){
    state.layers['LY-03']=true; state.amotionFocus=true; focusField('GJ-R3',false); render();
    App.toast('A-Motion 관제 모드 진입');
  }

  function closeAmotion(){ state.amotionFocus=false; render(); }
  function toggleAmPause(){
    if(state.amReturning) return;
    state.amPaused=!state.amPaused;
    App.toast(state.amPaused?'HX1400AI 1호기 원격 일시정지 — 차량이 정지했습니다':'자율작업을 재개했습니다');
    render();
  }
  function amReturn(){
    if(state.amReturning){ state.amReturning=false; render(); return; }
    state.amReturning=true; state.amPaused=false;
    App.toast('복귀 명령 전송 — HX1400AI 1호기가 경작지 입구로 이동합니다');
    render();
  }
  function setRecPeriod(p){ state.recPeriod=p; render(); }

  /* ---------------- A-Motion Snapshot — 트랙터 지붕 4방향 카메라 뷰 ---------------- */
  function camView(dir){
    /* dir: front / rear / left / right — 트랙터 루프캠 시점의 필지 주행 사진(일러스트) */
    const rows = n => { let s=''; for(let i=0;i<n;i++) s+=i; return s; };
    const SK=`skg-${dir}`, SL=`soil-${dir}`;
    let scene='';
    if(dir==='front'){
      /* 전방: 지평선으로 수렴하는 작물 이랑 + 보닛 */
      let conv=''; for(let i=-7;i<=7;i++){ conv+=`<line x1="160" y1="86" x2="${160+i*46}" y2="210" stroke="#3C6B3F" stroke-width="${1.4+Math.abs(i)*0.15}" opacity=".55"/>`; }
      let crop=''; for(let i=-7;i<=7;i++){ crop+=`<line x1="160" y1="86" x2="${160+i*46}" y2="210" stroke="#8FBE6B" stroke-width="2.4" opacity=".5" transform="translate(${i*1.5},0)"/>`; }
      scene=`<rect width="320" height="88" fill="url(#${SK})"/>
        <ellipse cx="250" cy="40" rx="26" ry="24" fill="#FFF4CE" opacity=".7"/>
        <rect y="78" width="320" height="12" fill="#5E7A4C"/>
        <rect y="86" width="320" height="124" fill="#6F9A55"/>
        ${conv}${crop}
        <path d="M0 210 L0 176 Q160 150 320 176 L320 210 Z" fill="#1E2A22"/>
        <path d="M60 210 L86 180 L234 180 L260 210 Z" fill="#20272F"/>
        <rect x="120" y="176" width="80" height="7" rx="3" fill="#E5352C"/><text x="160" y="182" text-anchor="middle" font-size="5.5" fill="#fff" font-family="var(--font)">HX1400AI</text>`;
    } else if(dir==='rear'){
      /* 후방: 경운된 어두운 흙 이랑 + 로터리 작업기 바 */
      let fur=''; for(let i=0;i<11;i++){ const y=96+i*10.4; fur+=`<line x1="${-20+i*2}" y1="${y}" x2="${340-i*2}" y2="${y}" stroke="#5A4327" stroke-width="${1+i*0.35}" opacity=".65"/>`; }
      scene=`<rect width="320" height="90" fill="url(#${SK})"/>
        <rect y="72" width="320" height="8" fill="#6E8B5A"/>
        <rect y="80" width="320" height="14" fill="#7FA865"/>
        <rect y="94" width="320" height="116" fill="url(#${SL})"/>
        ${fur}
        <rect y="188" width="320" height="22" fill="#20272F"/>
        <rect y="184" width="320" height="6" fill="#E5352C" opacity=".85"/>
        ${Array.from({length:22},(_,i)=>`<rect x="${8+i*14}" y="190" width="7" height="18" rx="2" fill="#39424E"/>`).join('')}
        <text x="160" y="203" text-anchor="middle" font-size="6" fill="#B9C2CE" font-family="var(--font)">로터리 WJ2000 · 경심 22cm</text>`;
    } else {
      /* 좌/우 측면: 나란한 이랑 + 필지 경계(두렁) */
      const mir = dir==='left' ? 1 : -1;
      let side=''; for(let i=0;i<9;i++){ const y=104+i*12; side+=`<path d="M${mir>0?0:320} ${y} Q160 ${y-14} ${mir>0?320:0} ${y+22}" fill="none" stroke="#4C7A4E" stroke-width="${1.6+i*0.2}" opacity=".5"/>`; }
      scene=`<rect width="320" height="96" fill="url(#${SK})"/>
        <rect y="80" width="320" height="10" fill="#6E8B5A"/>
        <rect y="90" width="320" height="120" fill="#729A56"/>
        <!-- 두렁(경계) -->
        <path d="M${mir>0?0:320} 96 Q160 90 ${mir>0?320:0} 132 L${mir>0?320:0} 120 Q160 80 ${mir>0?0:320} 90 Z" fill="#8A9B5E" opacity=".9"/>
        ${side}
        <!-- 인접 필지 원경 -->
        <rect y="86" width="320" height="8" fill="#7EA363" opacity=".7"/>
        <!-- 바퀴 일부 -->
        <ellipse cx="${mir>0?36:284}" cy="205" rx="40" ry="30" fill="#20272F"/><ellipse cx="${mir>0?36:284}" cy="205" rx="19" ry="14" fill="#4A5560"/>`;
    }
    const LABEL={front:'전방 FRONT',rear:'후방 REAR',left:'좌측면 LEFT',right:'우측면 RIGHT'}[dir];
    return `<div style="position:relative;border-radius:12px;overflow:hidden;box-shadow:var(--shadow-sm);border:1px solid var(--line)">
      <svg viewBox="0 0 320 210" style="width:100%;display:block" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="${SK}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9EC2E4"/><stop offset="1" stop-color="#DCE9DA"/></linearGradient>
          <linearGradient id="${SL}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B5334"/><stop offset="1" stop-color="#3E2F1B"/></linearGradient>
        </defs>
        ${scene}
        <!-- HUD -->
        <rect x="0" y="0" width="320" height="210" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
        <line x1="150" y1="105" x2="170" y2="105" stroke="rgba(255,255,255,.5)" stroke-width="1"/><line x1="160" y1="95" x2="160" y2="115" stroke="rgba(255,255,255,.5)" stroke-width="1"/>
        <g transform="translate(8,8)"><rect width="86" height="16" rx="3" fill="rgba(20,25,32,.7)"/><circle cx="9" cy="8" r="3" fill="#E5352C"/><text x="17" y="11.5" font-size="8" font-weight="700" fill="#fff" font-family="var(--font)">${LABEL}</text></g>
        <g transform="translate(232,8)"><rect width="80" height="16" rx="3" fill="rgba(20,25,32,.7)"/><text x="40" y="11.5" text-anchor="middle" font-size="7.5" fill="#5BE49B" font-family="var(--mono)">26/07/23 10:14</text></g>
      </svg>
    </div>`;
  }
  function snapshot(){
    const v=EQUIP.find(e=>e.id==='VH-001'), j=JOBS.find(x=>x.id==='JOB-104');
    App.modal(`Snapshot — ${v.nick}`, `
      <div style="padding:18px 22px">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:14px">
          <span class="chip chip-purple">${App.icon('bot',12)} A-Motion 관제</span>
          <span style="font-size:12.5px;color:var(--ink-2)">${j.name} · 진행 ${Math.round(state.vehProg['VH-001']*100)}%</span>
          <span style="margin-left:auto;font-size:11px;color:var(--ink-3)">루프캠 4방향 · 2026-07-23 10:14:02</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${['front','rear','left','right'].map(camView).join('')}
        </div>
        <div class="perm-note" style="margin-top:14px">${App.icon('info')} <div>트랙터 지붕에 설치된 4방향 카메라의 실시간 스냅샷입니다. 전방(진행 경로·작업기), 후방(경운 상태), 좌·우 측면(필지 경계·인접 이랑)을 확인해 무인 자율작업 상태를 원격 점검할 수 있습니다.</div></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
          <button class="btn btn-ghost" onclick="App.toast('스냅샷 4장을 저장했습니다 (데모)')">${App.icon('download')} 저장</button>
          <button class="btn btn-navy" onclick="App.closeModal()">닫기</button>
        </div>
      </div>`);
  }

  return { init, destroy, focusField, enterAmotion, closeAmotion, toggleAmPause, amReturn, setRecPeriod, snapshot,
    applyPreset(p){ if(!state) return; init(host,p); } };
})();
