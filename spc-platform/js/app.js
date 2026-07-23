/* ============================================================
   App shell — router · role switch · AI Agent · command palette
   ============================================================ */
const App = {
  role: ROLES[0],
  route: 'dashboard',
  params: {},

  /* ---------- icons (inline SVG, stroke style) ---------- */
  _icons: {
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    farm:'<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-7h6v7"/>',
    tractor:'<circle cx="7" cy="17" r="3.4"/><circle cx="17.5" cy="17.5" r="2.4"/><path d="M10.4 17h4.7M4.5 13.5V9h7l1.6 4.5M11.5 9V6h4.5v7.5"/><path d="M16 6h3.5"/>',
    combine:'<rect x="3" y="8" width="10" height="7" rx="1.4"/><circle cx="7" cy="18" r="2.4"/><circle cx="15.5" cy="18" r="1.8"/><path d="M13 10h5l2.5 4v3h-3"/><path d="M6 8V5h5v3"/>',
    drone:'<circle cx="12" cy="12" r="2.6"/><path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/><circle cx="5" cy="5" r="1.8"/><circle cx="19" cy="5" r="1.8"/><circle cx="5" cy="19" r="1.8"/><circle cx="19" cy="19" r="1.8"/>',
    work:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/>',
    box:'<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    leaf:'<path d="M5 20C5 10 10 5 20 4c1 10-4 15-13 15"/><path d="M5 20c2-5 5-8 10-10"/>',
    won:'<circle cx="12" cy="12" r="9.2"/><path d="M6.8 9.5 8.6 15l1.8-5.5L12 15l1.6-5.5L15.4 15l1.8-5.5M6.5 12h11"/>',
    chart:'<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5M12 16V7M16 16v-3"/>',
    gear:'<circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.14-1.4l2-1.55-2-3.46-2.35.94A7 7 0 0 0 14 5.1L13.66 2.6h-4L9.32 5.1a7 7 0 0 0-2.51 1.43l-2.35-.94-2 3.46 2 1.55A7 7 0 0 0 4.32 12c0 .47.05.94.14 1.4l-2 1.55 2 3.46 2.35-.94a7 7 0 0 0 2.51 1.43l.34 2.5h4l.34-2.5a7 7 0 0 0 2.51-1.43l2.35.94 2-3.46-2-1.55c.09-.46.14-.93.14-1.4Z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
    bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M10 21a2.2 2.2 0 0 0 4 0"/>',
    bot:'<rect x="4.5" y="7" width="15" height="12" rx="3"/><circle cx="9.5" cy="12.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12.5" r="1.4" fill="currentColor" stroke="none"/><path d="M12 7V3.5M12 3.5h3"/><path d="M9 16h6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    check:'<path d="m4.5 12.5 5 5 10-11"/>',
    chev:'<path d="m9 6 6 6-6 6"/>',
    chevL:'<path d="m15 6-6 6 6 6"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5"/>',
    route:'<circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.6"/>',
    play:'<path d="M7 4.5v15l12-7.5L7 4.5Z" fill="currentColor" stroke="none"/>',
    pause:'<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/>',
    fit:'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    bookmark:'<path d="M6.5 3.5h11V21L12 16.8 6.5 21V3.5Z"/>',
    share:'<circle cx="6" cy="12" r="2.6"/><circle cx="17.5" cy="5.5" r="2.6"/><circle cx="17.5" cy="18.5" r="2.6"/><path d="m8.4 10.7 6.8-4M8.4 13.3l6.8 4"/>',
    edit:'<path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z"/><path d="m14.5 7 3 3"/>',
    link:'<path d="M10 13.5a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 10.5a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>',
    info:'<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.5M12 7.5v.5"/>',
    lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    sos:'<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9.5v4.5M12 17.2v.3"/>',
    rain:'<path d="M17.5 17a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.6A4 4 0 0 0 6.5 17Z"/><path d="m8 20 .8-1.8M12.5 20l.8-1.8M17 20l.8-1.8"/>',
    wrench:'<path d="M14 6.5a4.5 4.5 0 0 0-6.1 5.4L3 16.8a2 2 0 1 0 3 3l4.9-4.9A4.5 4.5 0 0 0 17 8.5l-2.6 1.2L13 8.3 14 6.5Z"/>',
    doc:'<path d="M6 3h8l4.5 4.5V21H6V3Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    screen:'<rect x="3" y="4.5" width="18" height="12.5" rx="2"/><path d="M9 21h6M12 17v4"/>',
    stetho:'<path d="M5 3.5v5a4.5 4.5 0 0 0 9 0v-5"/><path d="M9.5 13v3a4.5 4.5 0 0 0 9 0v-2"/><circle cx="18.5" cy="11.5" r="2.2"/>',
    shield:'<path d="M12 3 5 5.5v6c0 4.5 3 7.9 7 9.5 4-1.6 7-5 7-9.5v-6L12 3Z"/><path d="m9.3 11.8 2 2 3.6-3.9"/>',
    swap:'<path d="M7 8h11l-3-3M17 16H6l3 3"/>',
    download:'<path d="M12 3.5V15m0 0-4-4m4 4 4-4"/><path d="M4.5 20h15"/>',
    upload:'<path d="M12 15V3.5m0 0-4 4m4-4 4 4"/><path d="M4.5 20h15"/>',
    photo:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 3.5-3.5L20 16"/>',
    send:'<path d="m4 11 16-7-5.5 16-3-6.5L4 11Z"/>',
    mic:'<rect x="9.2" y="3" width="5.6" height="11" rx="2.8"/><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5V21"/>',
  },
  icon(name, size=17){
    const p=this._icons[name]||this._icons.info;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  },
  iconRaw(name){ return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${this._icons[name]||''}</svg>`; },

  /* ---------- boot ---------- */
  init(){
    this.renderShell();
    this.go('dashboard');
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); this.toggleCmdk(true); }
      if(e.key==='Escape'){ this.toggleCmdk(false); this.closeDrawer(); this.closeModal(); }
    });
    /* 접속 시 일정 확률로 AI Agent 선제 알림 말풍선 1개 표출 */
    setTimeout(()=>this.maybeProactive(), 2200);
  },

  /* 선제 알림 (AI Agent) — 접속 시 확률적 1건 */
  PROACTIVE:[
    { badge:'경고', color:'red', icon:'sos',
      msg:'⚠️ <b>농장 3곳에 재해경보</b>가 발생했습니다.<br>약 4일 후, <b>콩(조생종)</b> 작물에 <b>습해(지발성)</b>가 예상됩니다. 배수로 정비와 방제 일정 조정을 검토하세요.',
      link:{label:'재해경보 필지 보기', act:()=>App.go('map',{layers:['LY-11','LY-10']})} },
    { badge:'정비', color:'amber', icon:'wrench',
      msg:'보유중인 <b>GX7510, DK6020</b> 트랙터에 고장 코드가 발생했습니다. 지금 확인해보세요.',
      link:{label:'장비 현황 열기', act:()=>App.go('equip',{tab:'status'})} },
    { badge:'임대', color:'blue', icon:'route',
      msg:'<b>한울영농조합</b>에 임대중인 <b>DJI 드론(T50)</b>의 임대 만기일이 <b>3일</b> 남았습니다.',
      link:{label:'임대/배차 관리', act:()=>App.go('equip',{tab:'rent'})} },
  ],
  maybeProactive(){
    if(this.aiOpen) return;
    if(Math.random() > 0.72) return;              // 약 72% 확률로 1건 발생
    const idx = Math.floor((performance.now()/7) % this.PROACTIVE.length);
    this.proactiveShow(this.PROACTIVE[idx]);
  },
  proactiveShow(p){
    const fab=document.getElementById('aiFab');
    fab.insertAdjacentHTML('afterend', `
      <div class="ai-bubble" id="aiBubble">
        <button class="ai-bubble-x" onclick="document.getElementById('aiBubble').remove()">${this.icon('x',13)}</button>
        <div class="ab-head"><span class="chip chip-${p.color}" style="font-size:9.5px">${p.badge}</span><b>AI 대동이</b> <span style="font-size:10px;color:var(--ink-3)">선제 알림</span></div>
        <div class="ab-msg">${p.msg}</div>
        <div class="ab-act">
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('aiBubble').remove()">나중에</button>
          <button class="btn btn-sm btn-primary" onclick="App._proactiveGo()">${p.link.label}</button>
        </div>
      </div>`);
    this._proactiveAct=p.link.act;
    // fab에 알림 뱃지
    fab.querySelector('.ai-ring').style.borderColor='rgba(229,53,44,.7)';
  },
  _proactiveGo(){ const el=document.getElementById('aiBubble'); if(el) el.remove(); if(this._proactiveAct) this._proactiveAct(); },

  renderShell(){
    document.getElementById('app').innerHTML=`
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-mark">SPC</div>
          <div class="brand-name">오퍼레이션 플랫폼<small>DAEDONG · SPC OPS CENTER</small></div>
        </div>
        <nav class="nav" id="nav"></nav>
        <div class="sidebar-foot">
          <button class="collapse-btn" onclick="document.getElementById('sidebar').classList.toggle('collapsed')">${this.icon('chevL',15)}<span>메뉴 접기</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div class="crumb" id="crumb"></div>
          <button class="search-pill" onclick="App.toggleCmdk(true)">${this.icon('search',15)} 기능·필지·장비 검색 <kbd>Ctrl K</kbd></button>
          <button class="top-icon" onclick="App.toast('알림 센터는 홈 대시보드에 통합되어 있습니다 (1.1.4)');App.go('dashboard')">${this.icon('bell',18)}<span class="dot"></span></button>
          <div class="role-switch">
            <button class="role-btn" id="roleBtn" onclick="App.toggleRoleMenu()"></button>
            <div class="role-menu" id="roleMenu">
              <div class="rm-title">역할 전환 — 권한·채널 매트릭스 기반</div>
              ${ROLES.map(r=>`<button class="role-opt" data-role="${r.id}" onclick="App.setRole('${r.id}')">
                <span class="role-avatar" style="background:${r.color}">${r.initial}</span>
                <span class="ro-txt"><b>${r.title}</b><small>${r.name} · ${r.org}</small></span>
                <span class="check">${this.icon('check',15)}</span>
              </button>`).join('')}
            </div>
          </div>
        </header>
        <main class="content" id="content"><div class="content-inner" id="view"></div></main>
        <div class="action-bar" id="actionBarHost"></div>
      </div>
    </div>
    <div class="drawer-veil" id="drawerVeil" onclick="App.closeDrawer()"></div>
    <aside class="drawer" id="drawer"></aside>
    <div class="modal-veil" id="modalVeil" onclick="if(event.target===this)App.closeModal()"><div class="modal" id="modalBox"></div></div>
    <div class="cmdk-veil" id="cmdkVeil" onclick="App.toggleCmdk(false)"></div>
    <div class="cmdk" id="cmdk">
      <div class="cmdk-input">${this.icon('search',17)}<input id="cmdkInput" placeholder="기능 검색 — 예: 처방맵, FOTA, 정산, Geofence"><kbd style="font-family:var(--mono);font-size:10px;background:var(--surface-2);border:1px solid var(--line);border-radius:5px;padding:2px 7px;color:var(--ink-3)">ESC</kbd></div>
      <div class="cmdk-list" id="cmdkList"></div>
    </div>
    <button class="ai-fab" id="aiFab" onclick="App.toggleAI()" title="AI Agent (IA 3)"><span class="ai-ring"></span>${this.icon('bot',26)}</button>
    <div class="ai-panel" id="aiPanel">
      <div class="ai-head">
        <div class="ai-avatar">${this.icon('bot',19)}</div>
        <div style="flex:1"><b>AI 대동이</b><small><i></i>온라인 · 전 화면 플로팅 (IA 3)</small></div>
        <button class="drawer-x" style="color:#A6B1BF" onclick="App.toggleAI(false)">${this.icon('x',16)}</button>
      </div>
      <div class="ai-body" id="aiBody"></div>
      <div class="ai-chips" id="aiChips"></div>
      <div class="ai-input">
        <button class="ai-send" style="background:var(--surface-2);color:var(--ink-2)" onclick="App.toast('음성 명령은 App 특화 기능입니다 (3.1.3) — Web에선 데모만 제공')">${this.icon('mic',17)}</button>
        <input id="aiInput" placeholder="무엇이든 물어보세요...">
        <button class="ai-send" onclick="App.aiSend()">${this.icon('send',16)}</button>
      </div>
    </div>
    <div class="toasts" id="toasts"></div>`;
    this.renderNav();
    this.renderRoleBtn();
    this.bindCmdk();
    this.bindAI();
  },

  renderNav(){
    const nav=document.getElementById('nav');
    nav.innerHTML=`<div class="nav-label">Workspace</div>`+
      MENUS.map(m=>{
        const p=permOf(m.perm,this.role.id);
        if(p==='-') return '';
        return `<button class="nav-item ${this.route===m.id?'active':''}" onclick="App.go('${m.id}')">
          ${this.icon(m.icon,19)}<span>${m.name}</span>
          ${m.badge?`<span class="nav-num" style="color:var(--red);font-weight:800">●</span>`:`<span class="nav-num">${m.no}</span>`}
        </button>`;
      }).join('')+
      `<div class="nav-label">권한 범위</div>
      <div style="padding:4px 10px;font-size:11px;color:var(--ink-3);line-height:1.6" id="permHint">${this.permHint()}</div>`;
  },
  permHint(){
    return { admin:'플랫폼 전체 데이터<br>(재무는 비식별 통계만)', corp:'소속 조직(김제 농협) 범위', farmer:'본인 소유·공유 데이터', op:'배정된 작업 범위만' }[this.role.id];
  },
  renderRoleBtn(){
    const r=this.role;
    document.getElementById('roleBtn').innerHTML=`
      <span class="role-avatar" style="background:${r.color}">${r.initial}</span>
      <span class="role-name">${r.title}<small>${r.name} · ${r.org}</small></span>${this.icon('chev',13)}`;
    document.querySelectorAll('.role-opt').forEach(o=>o.classList.toggle('sel',o.dataset.role===r.id));
  },
  toggleRoleMenu(force){
    document.getElementById('roleMenu').classList.toggle('open',force);
  },
  setRole(id){
    this.role=ROLES.find(r=>r.id===id);
    this.toggleRoleMenu(false);
    this.renderRoleBtn(); this.renderNav();
    /* if current route not permitted, fallback to dashboard */
    const m=MENUS.find(x=>x.id===this.route);
    if(m&&permOf(m.perm,this.role.id)==='-') this.route='dashboard';
    this.go(this.route,this.params);
    this.toast(`역할 전환: ${this.role.title} — 메뉴·데이터 범위가 조정되었습니다`);
  },

  /* ---------- router ---------- */
  go(route, params={}){
    const prevRoute=this.route;
    if(prevRoute==='map'&&route!=='map') MapView.destroy();
    this.route=route; this.params=params;
    this.hideActionBar();
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    this.renderNav();
    const content=document.getElementById('content');
    const m=MENUS.find(x=>x.id===route);
    document.getElementById('crumb').innerHTML=`SPC 오퍼레이션 플랫폼 <span style="color:var(--line-2)">/</span> <b>${m?m.name:route}</b>${params.tab?` <span style="color:var(--line-2)">/</span> <span>${params.tab}</span>`:''}`;
    if(route==='map'){
      content.classList.add('full-bleed');
      content.innerHTML=`<div class="content-inner" id="view"></div>`;
      MapView.init(document.getElementById('view'), Object.keys(params).length?params:null);
      if(params.layers) this.toast('딥링크 수신 — 레이어 프리셋이 적용되었습니다');
      return;
    }
    content.classList.remove('full-bleed');
    content.innerHTML=`<div class="content-inner" id="view"></div>`;
    const view=document.getElementById('view');
    const V=Views[route];
    if(!V){ view.innerHTML='<div class="empty-state"><b>준비중</b></div>'; return; }
    view.innerHTML=V.render(params);
    if(V.bind) V.bind(view);
    content.scrollTop=0;
  },
  rerender(){
    const V=Views[this.route]; if(!V) return;
    const content=document.getElementById('content');
    const st=content.scrollTop;
    const view=document.getElementById('view');
    this.hideActionBar();
    view.innerHTML=V.render();
    if(V.bind) V.bind(view);
    content.scrollTop=st;
  },

  /* ---------- drawer / modal / toast ---------- */
  drawer(title, html){
    document.getElementById('drawer').innerHTML=`
      <div class="drawer-head"><h2>${title}</h2><button class="drawer-x" onclick="App.closeDrawer()">${this.icon('x',17)}</button></div>
      <div class="drawer-body">${html}</div>`;
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawerVeil').classList.add('open');
    Charts.arm(document.getElementById('drawer'));
  },
  closeDrawer(){
    document.getElementById('drawer')?.classList.remove('open');
    document.getElementById('drawerVeil')?.classList.remove('open');
  },
  modal(title, html){
    document.getElementById('modalBox').innerHTML=`
      <div class="modal-head"><div style="width:34px"></div><h2>${title}</h2>
      <button class="drawer-x" onclick="App.closeModal()">${this.icon('x',17)}</button></div>
      <div class="modal-body">${html}</div>`;
    document.getElementById('modalVeil').classList.add('open');
  },
  closeModal(){ document.getElementById('modalVeil')?.classList.remove('open'); },
  actionBar(html){ const h=document.getElementById('actionBarHost'); if(!h)return; h.innerHTML=html; h.classList.add('show'); },
  hideActionBar(){ const h=document.getElementById('actionBarHost'); if(h){ h.classList.remove('show'); } },
  toast(msg){
    const box=document.getElementById('toasts');
    const t=document.createElement('div');
    t.className='toast'; t.innerHTML=`${this.icon('check',15)}<span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(()=>{ t.classList.add('leaving'); setTimeout(()=>t.remove(),260); }, 3200);
  },

  /* ---------- command palette ---------- */
  toggleCmdk(open){
    document.getElementById('cmdkVeil').classList.toggle('open',open);
    document.getElementById('cmdk').classList.toggle('open',open);
    if(open){ const i=document.getElementById('cmdkInput'); i.value=''; this.cmdkFilter(''); setTimeout(()=>i.focus(),40); }
  },
  bindCmdk(){
    const input=document.getElementById('cmdkInput');
    input.addEventListener('input',()=>this.cmdkFilter(input.value));
    input.addEventListener('keydown',e=>{
      const items=[...document.querySelectorAll('.cmdk-item')];
      let idx=items.findIndex(i=>i.classList.contains('sel'));
      if(e.key==='ArrowDown'){ e.preventDefault(); idx=Math.min(items.length-1,idx+1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); idx=Math.max(0,idx-1); }
      else if(e.key==='Enter'){ e.preventDefault(); items[Math.max(0,idx)]?.click(); return; }
      else return;
      items.forEach((i,n)=>i.classList.toggle('sel',n===idx));
      items[idx]?.scrollIntoView({block:'nearest'});
    });
  },
  cmdkFilter(q){
    const list=document.getElementById('cmdkList');
    q=q.trim().toLowerCase();
    const fields=FIELDS.filter(f=>!q||f.name.toLowerCase().includes(q)||f.id.toLowerCase().includes(q)).slice(0,q?4:0)
      .map(f=>({id:f.id,name:`${f.name} — 필지로 이동`,path:'통합 모니터링',route:'map',params:{focus:f.id,layers:['LY-10','LY-01','LY-02']}}));
    const eq=EQUIP.filter(v=>q&&(v.model.toLowerCase().includes(q)||v.nick.toLowerCase().includes(q))).slice(0,3)
      .map(v=>({id:v.id,name:`${v.nick} — 장비 상세`,path:'장비관리',route:'equip',params:{veh:v.id}}));
    const fns=FUNCTIONS.filter(([id,n,p])=>!q||n.toLowerCase().includes(q)||p.toLowerCase().includes(q)||id.startsWith(q)).slice(0,12)
      .map(([id,n,p,route])=>({id,name:n,path:p,route,params:{}}));
    const all=[...fields,...eq,...fns];
    list.innerHTML=all.length? all.map((it,i)=>`
      <div class="cmdk-item ${i===0?'sel':''}" onclick='App.toggleCmdk(false);${it.route==="ai"?"App.toggleAI(true)":`App.go("${it.route}",${JSON.stringify(it.params)})`}'>
        <span class="ci-id mono">${it.id}</span><span class="ci-name">${it.name}</span><span class="ci-path">${it.path}</span>
      </div>`).join('') : `<div class="cmdk-empty">검색 결과가 없습니다 — 91개 기능·필지·장비를 검색해 보세요</div>`;
  },

  /* ---------- AI Agent ---------- */
  aiOpen:false, aiBooted:false,
  toggleAI(force){
    this.aiOpen = force!==undefined? force : !this.aiOpen;
    document.getElementById('aiPanel').classList.toggle('open',this.aiOpen);
    if(this.aiOpen&&!this.aiBooted){ this.aiBooted=true; this.aiBoot(); }
    if(this.aiOpen) setTimeout(()=>document.getElementById('aiInput').focus(),150);
  },
  openAI(topic){
    this.toggleAI(true);
    if(topic==='todo') this.aiAsk('오늘 할 일 정리해줘');
    if(topic==='stats') this.aiAsk('올해 필지별 연료비 비교해줘');
  },
  bindAI(){
    document.getElementById('aiInput').addEventListener('keydown',e=>{ if(e.key==='Enter') this.aiSend(); });
  },
  aiBoot(){
    const body=document.getElementById('aiBody');
    body.innerHTML='';
    this.aiBot(`안녕하세요, ${this.role.name}님. <b>AI 대동이</b>입니다.<br>차량·작업 조회, 통계 질의, 영농 컨설팅, 매뉴얼 검색을 도와드려요.`);
    setTimeout(()=>{
      body.insertAdjacentHTML('beforeend',`
        <div class="ins-card"><div class="ic-ico" style="background:var(--amber-soft);color:var(--amber)">${this.icon('rain',15)}</div>
          <div><b>AI 재해경보 <span class="mono" style="font-size:9px;color:var(--ink-3)">3.2.3</span></b><small>내일 새벽 호우 예보 — 07.23 '윗배미 잡초 방제'를 오후로 미루는 것을 권장합니다.</small></div></div>
        <div class="ins-card"><div class="ic-ico" style="background:var(--green-soft);color:var(--green)">${this.icon('won',15)}</div>
          <div><b>보조금 정책 추천 <span class="mono" style="font-size:9px;color:var(--ink-3)">3.2.2</span></b><small>'2026 농기계 임대료 지원사업'에 내 필지 조건이 부합합니다. 증빙 리포트 자동 생성 가능.</small></div></div>`);
      body.scrollTop=body.scrollHeight;
    },600);
    this.aiChips(['HX1400 어디서 작업중이야?','올해 필지별 연료비 비교해줘','오늘 할 일 정리해줘','HX1400 DEF 경고등 매뉴얼']);
  },
  aiChips(arr){
    document.getElementById('aiChips').innerHTML=arr.map(c=>`<button class="ai-chip" onclick="App.aiAsk('${c.replace(/'/g,"\\'")}')">${c}</button>`).join('');
  },
  aiBot(html){
    const body=document.getElementById('aiBody');
    body.insertAdjacentHTML('beforeend',`<div class="ai-msg bot">${html}</div>`);
    body.scrollTop=body.scrollHeight;
  },
  aiAsk(q){ document.getElementById('aiInput').value=q; this.aiSend(); },
  aiSend(){
    const input=document.getElementById('aiInput');
    const q=input.value.trim(); if(!q) return;
    input.value='';
    const body=document.getElementById('aiBody');
    body.insertAdjacentHTML('beforeend',`<div class="ai-msg user">${q}</div>`);
    body.insertAdjacentHTML('beforeend',`<div class="ai-typing" id="aiTyping"><i></i><i></i><i></i></div>`);
    body.scrollTop=body.scrollHeight;
    setTimeout(()=>{ document.getElementById('aiTyping')?.remove(); this.aiAnswer(q); }, 900);
  },
  aiAnswer(q){
    const L=q.toLowerCase();
    if(L.includes('hx1400')&&(L.includes('어디')||L.includes('작업'))&&!L.includes('def')){
      this.aiBot(`<b>HX1400AI 1호기</b>는 현재 <b>안들 3 (GJ-R3)</b>에서 A-Motion 심경 로터리 작업 중입니다. <span class="mono" style="font-size:10px;color:var(--ink-3)">3.1.1</span><br>
        진행률 <b style="color:var(--purple)">42%</b> · 연료 72% · 이상감지 0건
        <br><span class="ai-link" onclick='App.toggleAI(false);App.go("map",{layers:["LY-03","LY-01","LY-02"],focus:"GJ-R3",amotion:true})'>${this.icon('map',13)} 통합 맵 관제 모드로 보기 →</span>`);
      this.aiChips(['일시정지 시켜줘','안들 3 처방 이력 보여줘','다른 장비 현황은?']);
    }
    else if(L.includes('연료비')||L.includes('통계')||L.includes('비교')){
      this.aiBot(`올해 필지별 연료비를 정리했어요. <span class="mono" style="font-size:10px;color:var(--ink-3)">3.1.2 자연어 통계 질의</span>
        <div class="ai-chart">${Charts.bars(['안들','윗배미','큰들','부식리','옥산'],[28,12,41,22,38],{h:110,color:'#DE9207'})}
        <small style="font-size:10.5px;color:var(--ink-3)">필지 그룹별 연료비 (만원) · 2026 시즌 누적</small></div>
        <b>큰들(41만원)</b>이 최다 — 면적 대비 원단위는 <b>옥산 대전</b>이 가장 효율적입니다.
        <span class="ai-link" onclick="App.toggleAI(false);App.go('stats')">${this.icon('chart',13)} 교차 통계에서 자세히 →</span>`);
      this.aiChips(['수확량도 비교해줘','작년과 비교하면?','리포트로 만들어줘']);
    }
    else if(L.includes('할 일')||L.includes('todo')||L.includes('투두')){
      this.aiBot(`작업 캘린더 기반 오늘의 to-do입니다. <span class="mono" style="font-size:10px;color:var(--ink-3)">3.2.5</span><br>
        <b>1.</b> 안들 3 A-Motion 심경 로터리 — <span style="color:var(--purple);font-weight:700">진행중 42%</span><br>
        <b>2.</b> 큰들 방제(대행) 완료 확인 — 65%<br>
        <b>3.</b> <span style="color:var(--red);font-weight:700">⚠ 우선</span> DSC85 콤바인 DTC 조치 (서비스 예약 권장)<br>
        <b>4.</b> 내일 호우 대비 — 윗배미 방제 일정 조정 검토
        <span class="ai-link" onclick="App.toggleAI(false);App.go('work',{tab:'plan'})">${this.icon('work',13)} 작업 캘린더 열기 →</span>`);
      this.aiChips(['DSC85 서비스 예약해줘','윗배미 방제 24일로 미뤄줘']);
    }
    else if(L.includes('매뉴얼')||L.includes('def')||L.includes('경고등')){
      this.aiBot(`<b>HX1400AI 유저매뉴얼 § 7.3</b>에서 찾았어요. <span class="mono" style="font-size:10px;color:var(--ink-3)">3.3.1 지식베이스</span><br><br>
        DEF(요소수) 경고등 점등 시:<br>① 잔량 확인 — 12% 이하면 보충 ② 보충 후에도 점등 시 품질 센서 오염 가능성 ③ 세척 후 재시동, 지속 시 <b>스마트원격진단(5.2.8)</b> 실행<br>
        <span class="ai-link" onclick="App.toggleAI(false);App.go('equip')">${this.icon('tractor',13)} 장비관리에서 원격진단 실행 →</span>`);
      this.aiChips(['원격진단 실행해줘','가까운 서비스센터 예약']);
    }
    else if(L.includes('예약')){
      this.aiBot(`<b>김제 대리점</b>에 07.25(토) 오전 예약 가능 슬롯이 있습니다. DSC85 콤바인 DTC(P2263) 점검으로 예약을 진행할까요? <span class="mono" style="font-size:10px;color:var(--ink-3)">5.2.11</span>
      <span class="ai-link" onclick="App.toast('서비스 예약이 접수되었습니다 — 07.25 09:00 김제 대리점')">${this.icon('check',13)} 예약 확정 →</span>`);
      this.aiChips(['다른 날짜 보여줘','예약 취소']);
    }
    else if(L.includes('일시정지')){
      this.aiBot(`HX1400AI 1호기에 <b>원격 일시정지</b> 명령을 보냈습니다. 재개·제어권 이전은 현장 모바일 단말(App)에서만 가능합니다. <span class="mono" style="font-size:10px;color:var(--ink-3)">6.4.3 App 전용</span>`);
      this.aiChips(['작업 재개 알림 받기','관제 모드 열기']);
    }
    else if(L.includes('처방')){
      this.aiBot(`<b>안들 3 (GJ-R3)</b> 처방 이력:<br>· 07.05 시비처방(VRT) — 평균 24.3kg/10a, <b style="color:var(--green)">-12.4% 절감</b> (적용 대기)<br>· '25.10 토양개량 처방 (완료)
        <span class="ai-link" onclick='App.toggleAI(false);App.go("map",{layers:["LY-09","LY-10"],focus:"GJ-R3",stop:"vrt"})'>${this.icon('map',13)} 처방맵 레이어로 보기 →</span>`);
      this.aiChips(['작업기로 전송해줘','토양진단 결과도 보여줘']);
    }
    else{
      this.aiBot(`요청을 이해했어요. 프로토타입에서는 아래 시나리오가 준비되어 있습니다 — 칩을 눌러 시험해 보세요.<br><small style="color:var(--ink-3)">실서비스에서는 영농 컨설팅(3.2.1)·병해충 경보(3.2.4) 등 농진청 연계 응답이 제공됩니다.</small>`);
      this.aiChips(['HX1400 어디서 작업중이야?','올해 필지별 연료비 비교해줘','오늘 할 일 정리해줘','HX1400 DEF 경고등 매뉴얼']);
    }
  },
};

document.addEventListener('DOMContentLoaded',()=>App.init());
