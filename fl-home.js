// ════════════════════════════════════
// HOME
// ════════════════════════════════════
function renderHome(){
  if(!sess)return;
  // Update top bar
  document.getElementById('home-tag').textContent=
    new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})+' · Chiddarwar Construction';
  document.getElementById('sess-who').textContent=sess.name;
  document.getElementById('sess-bdg').innerHTML=`<span class="bdg ${rBdg(sess.role)}">${rLbl(sess.role)}</span>`;
  // Show/hide bottom nav tabs based on role
  const fleetBtn=document.getElementById('bnav-fleet');
  const moreBtn=document.getElementById('bnav-more');
  const reportsBtn=document.getElementById('bnav-reports');
  if(fleetBtn)fleetBtn.style.display=isDriver()?'none':'';
  if(moreBtn)moreBtn.style.display=isDriver()?'none':'';
  if(reportsBtn)reportsBtn.style.display=isDriver()?'none':'';
  // Render active tab
  const tab=_bnavTab||'home';
  bnavRender(tab);
}

let _bnavTab='home';
function bnavTab(tab){
  _bnavTab=tab;
  // Update active state
  ['home','ops','reports','fleet','more'].forEach(t=>{
    const b=document.getElementById('bnav-'+t);
    if(b)b.classList.toggle('active',t===tab);
  });
  bnavRender(tab);
  // Scroll to top
  const hc=document.getElementById('home-content');
  if(hc)hc.scrollTop=0;
}

function bnavRender(tab){
  const dash=document.getElementById('home-dashboard');
  const alerts=document.getElementById('home-alerts');
  const actions=document.getElementById('home-actions');
  if(!dash||!alerts||!actions)return;

  if(tab==='home'){
    renderDashboard(dash,alerts);
    actions.innerHTML='';
    actions.style.display='none';
  } else if(tab==='ops'){
    dash.innerHTML='';alerts.innerHTML='';
    actions.style.display='';
    renderOpsTab(actions);
  } else if(tab==='reports'){
    dash.innerHTML='';alerts.innerHTML='';
    actions.style.display='';
    renderReportsTab(actions);
  } else if(tab==='fleet'){
    dash.innerHTML='';alerts.innerHTML='';
    actions.style.display='';
    renderFleetTab(actions);
  } else if(tab==='more'){
    dash.innerHTML='';alerts.innerHTML='';
    actions.style.display='';
    renderMoreTab(actions);
  }
}

// ── DASHBOARD TAB ──
function renderDashboard(dash,alerts){
  const td=today();
  const stock=getBowserStock();
  const maxStock=purchases.reduce((a,p)=>a+p.litres,0)||2000;
  const stockPct=Math.min(100,Math.round(stock/Math.max(maxStock,1)*100));
  const stockCol=stock<300?'var(--red)':stock<800?'#ffb300':'var(--green)';
  const todayDisbs=disbs.filter(x=>x.date===td);
  const todayPF=(pumpFills||[]).filter(x=>x.date===td);
  const todayL=todayDisbs.reduce((a,x)=>a+x.litres,0)+todayPF.reduce((a,x)=>a+x.litres,0);
  const fuelRate=getFuelRate();
  const todayCost=todayL*fuelRate;
  const fmtINR=n=>'₹'+Number(Math.round(n)).toLocaleString('en-IN');
  const fuelled=new Set([...todayDisbs,...todayPF].map(x=>x.vehicleId)).size;
  const totalVeh=fleet.length;
  const fuelledPct=totalVeh>0?Math.round(fuelled/totalVeh*100):0;
  const pending=disbs.filter(d=>(d.source==='can'||d.destType==='can')&&d.dipStatus==='pending').length;
  const mismatch=disbs.filter(d=>d.dipMatch===false||d.meterMismatch).length;
  const bal=isOwner()?purchases.reduce((a,p)=>a+(p.amount-p.paid),0):0;

  // Update ops badge
  const badge=document.getElementById('bnav-ops-badge');
  if(badge){badge.textContent=pending;badge.style.display=pending>0?'block':'none';}

  dash.innerHTML=`
    <!-- Bowser Stock Gauge -->
    <div class="dash-gauge-wrap">
      <div style="padding:12px 14px 8px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.5px">🛢 Bowser Stock</div>
          <div style="font-family:var(--fh);font-size:28px;color:${stockCol};margin-top:2px;line-height:1">${fmt(stock,0)} <span style="font-size:14px;color:var(--muted)">L</span></div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--fh);font-size:22px;color:var(--muted)">${stockPct}%</div>
          <div style="font-size:10px;color:var(--muted);font-weight:600">${stock<300?'🔴 CRITICAL':stock<800?'🟡 LOW':'🟢 OK'}</div>
        </div>
      </div>
      <div class="dash-gauge-bar">
        <div class="dash-gauge-fill" style="width:${stockPct}%;background:${stockCol}"></div>
      </div>
    </div>

    <!-- Today Coverage -->
    <div class="dash-progress-wrap">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.5px">🚚 Today's Coverage</div>
        <div style="font-family:var(--fh);font-size:13px;color:var(--amber)">${fuelled} / ${totalVeh} vehicles</div>
      </div>
      <div class="dash-prog-bar"><div class="dash-prog-fill" style="width:${fuelledPct}%"></div></div>
      <div style="font-size:10px;color:var(--muted);font-weight:600">${fuelledPct}% of fleet fuelled today</div>
    </div>

    <!-- KPI Grid -->
    <div style="margin:8px 14px 0;border-radius:14px;overflow:hidden;border:1px solid var(--border)">
      <div class="dash-kpi-grid">
        <div class="dash-kpi">
          <div class="dash-kpi-val">${fmt(todayL,0)} L</div>
          <div class="dash-kpi-lbl">Today Dispensed</div>
        </div>
        <div class="dash-kpi">
          <div class="dash-kpi-val" style="font-size:18px">${fmtINR(todayCost)}</div>
          <div class="dash-kpi-lbl">Today Cost</div>
        </div>
        <div class="dash-kpi">
          <div class="dash-kpi-val" style="color:${pending>0?'var(--red)':'var(--green)'}">${pending}</div>
          <div class="dash-kpi-lbl">Dip Pending</div>
        </div>
        ${isOwner()?`<div class="dash-kpi">
          <div class="dash-kpi-val" style="color:${bal>0?'var(--red)':'var(--green)'};font-size:18px">${fmtINR(bal)}</div>
          <div class="dash-kpi-lbl">Balance Due</div>
        </div>`:`<div class="dash-kpi">
          <div class="dash-kpi-val">${todayDisbs.length+todayPF.length}</div>
          <div class="dash-kpi-lbl">Today Entries</div>
        </div>`}
      </div>
    </div>

    <!-- Quick action -->
    <div style="margin:10px 14px 0">
      <div class="act prim" onclick="bnavTab('ops');setTimeout(()=>show('scr-source'),50)" style="margin:0">
        <div class="act-ico">⛽</div>
        <div class="act-txt"><div class="act-title">GIVE FUEL</div><div class="act-desc">Tap to log fuel disbursement</div></div>
        <div class="act-arr">›</div>
      </div>
    </div>
    <div style="height:8px"></div>`;

  // Alerts
  let alertHtml='';
  if(stock<300){
    alertHtml+=`<div class="dash-alert" style="background:rgba(255,61,61,.08);border:2px solid var(--red)">
      <div class="dash-alert-row">
        <div style="font-size:24px">🚨</div>
        <div style="flex:1"><div style="font-family:var(--fh);font-size:14px;color:var(--red)">BOWSER CRITICAL — ${fmt(stock,0)} L</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">Order diesel immediately</div></div>
      </div>
    </div>`;
  } else if(stock<800){
    alertHtml+=`<div class="dash-alert" style="background:rgba(255,179,0,.07);border:2px solid var(--amber)">
      <div class="dash-alert-row">
        <div style="font-size:24px">⚠️</div>
        <div style="flex:1"><div style="font-family:var(--fh);font-size:14px;color:var(--amber)">BOWSER LOW — ${fmt(stock,0)} L</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">Plan refill soon</div></div>
      </div>
    </div>`;
  }
  if(pending>0){
    alertHtml+=`<div class="dash-alert" style="background:rgba(255,61,61,.06);border:2px solid var(--red);cursor:pointer" onclick="show('scr-pending')">
      <div class="dash-alert-row">
        <div style="font-size:24px">⏳</div>
        <div style="flex:1"><div style="font-family:var(--fh);font-size:14px;color:var(--red)">${pending} DIP GAUGE${pending>1?'S':''} PENDING</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">Tap to verify can fills</div></div>
        <div style="color:var(--red);font-size:18px">›</div>
      </div>
    </div>`;
  }
  if(mismatch>0){
    alertHtml+=`<div class="dash-alert" style="background:rgba(255,61,61,.06);border:2px solid var(--red);cursor:pointer" onclick="bnavTab('reports')">
      <div class="dash-alert-row">
        <div style="font-size:24px">⚠️</div>
        <div style="flex:1"><div style="font-family:var(--fh);font-size:14px;color:var(--red)">${mismatch} METER MISMATCH${mismatch>1?'ES':''}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">Tap to review in Reports</div></div>
        <div style="color:var(--red);font-size:18px">›</div>
      </div>
    </div>`;
  }
  alerts.innerHTML=alertHtml ? `<div style="padding:0 14px;display:flex;flex-direction:column;gap:6px;margin-top:6px">${alertHtml}</div>` : '';
}

// ── OPERATIONS TAB ──
function renderOpsTab(el){
  const pending=disbs.filter(d=>(d.source==='can'||d.destType==='can')&&d.dipStatus==='pending').length;
  el.innerHTML=`
    <div class="sec-lbl">Fuel Operations</div>
    <div class="act prim" onclick="show('scr-source')">
      <div class="act-ico">⛽</div><div class="act-txt"><div class="act-title">GIVE FUEL</div><div class="act-desc">Bowser · Direct pump · Can</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-muster')">
      <div class="act-ico">📋</div><div class="act-txt"><div class="act-title">MORNING MUSTER</div><div class="act-desc">Attendance · Driver assignment</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-readings')">
      <div class="act-ico">📟</div><div class="act-txt"><div class="act-title">LOG READING</div><div class="act-desc">KM · Hours · Tank levels</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-pending')" style="${pending>0?'border-color:var(--red)':''}">
      <div class="act-ico">🪣</div><div class="act-txt"><div class="act-title">PENDING DIP GAUGES</div>
      <div class="act-desc" style="${pending>0?'color:var(--red)':''}">${pending} pending verification${pending!==1?'s':''}</div></div>
      <div class="act-arr" style="${pending>0?'color:var(--red)':''}">›</div>
    </div>
    ${isOwner()||isAdmin()?`
    <div class="sec-lbl" style="margin-top:4px">Accounts</div>
    <div class="act" onclick="show('scr-purchases')">
      <div class="act-ico">🛢</div><div class="act-txt"><div class="act-title">BOWSER PURCHASE</div><div class="act-desc">Buy fuel · Track balance</div></div><div class="act-arr">›</div>
    </div>`:''}
    <div class="pad-bot"></div>`;
}

// ── REPORTS TAB ──
function renderReportsTab(el){
  el.innerHTML=`
    <div class="sec-lbl">Reports & Analytics</div>
    <div class="act prim" onclick="show('scr-reports')">
      <div class="act-ico">📊</div><div class="act-txt"><div class="act-title">FUEL REPORTS</div><div class="act-desc">Day-wise · Vehicle · Driver · Site</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-reports');setTimeout(()=>repTab('vehicle'),100)">
      <div class="act-ico">🚚</div><div class="act-txt"><div class="act-title">VEHICLE EFFICIENCY</div><div class="act-desc">km/L · Cost per vehicle</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-reports');setTimeout(()=>repTab('daywise'),100)">
      <div class="act-ico">📅</div><div class="act-txt"><div class="act-title">DAY-WISE SUMMARY</div><div class="act-desc">Daily fuel and cost breakdown</div></div><div class="act-arr">›</div>
    </div>
    <div class="pad-bot"></div>`;
}

// ── FLEET TAB ──
function renderFleetTab(el){
  if(!canSettings()&&!isManager()){el.innerHTML='<div class="muted-txt" style="padding:40px;text-align:center">Access restricted</div>';return;}
  el.innerHTML=`
    <div class="sec-lbl">Fleet Management</div>
    <div class="act" onclick="show('scr-fleet')">
      <div class="act-ico">🚜</div><div class="act-txt"><div class="act-title">FLEET SETUP</div><div class="act-desc">Vehicles · Calibration · Targets</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-drivers')">
      <div class="act-ico">👷</div><div class="act-txt"><div class="act-title">DRIVERS & OPERATORS</div><div class="act-desc">Add staff · Assign to vehicles</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-sites')">
      <div class="act-ico">🏗</div><div class="act-txt"><div class="act-title">SITES</div><div class="act-desc">Manage project sites</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-pumps')">
      <div class="act-ico">🏪</div><div class="act-txt"><div class="act-title">PUMP STATIONS</div><div class="act-desc">Manage designated pumps</div></div><div class="act-arr">›</div>
    </div>
    <div class="pad-bot"></div>`;
}

// ── MORE TAB ──
function renderMoreTab(el){
  el.innerHTML=`
    ${isOwner()||isAdmin()?`
    <div class="sec-lbl">Administration</div>
    <div class="act" onclick="show('scr-users')">
      <div class="act-ico">👥</div><div class="act-txt"><div class="act-title">USERS</div><div class="act-desc">Add staff · Manage access · Reset PIN</div></div><div class="act-arr">›</div>
    </div>
    <div class="act" onclick="show('scr-checklists')">
      <div class="act-ico">✅</div><div class="act-txt"><div class="act-title">CHECKLISTS</div><div class="act-desc">Pre-start · Post-shift templates</div></div><div class="act-arr">›</div>
    </div>`:''}
    <div class="sec-lbl" style="margin-top:4px">System</div>
    <div class="act" onclick="fbManualSync();flash('SYNCING...','Uploading to cloud')">
      <div class="act-ico">☁</div><div class="act-txt"><div class="act-title">SYNC DATA</div><div class="act-desc">Push all data to Firebase cloud</div></div>
      <span id="fb-status-more" style="font-size:11px;font-weight:700;color:var(--muted)"></span>
    </div>
    <div class="act" onclick="logout()">
      <div class="act-ico">↩</div><div class="act-txt"><div class="act-title">LOGOUT</div><div class="act-desc">Sign out of ${sess?.name||'account'}</div></div><div class="act-arr">›</div>
    </div>
    <div class="pad-bot"></div>`;
}


// ════════════════════════════════════
// EFFICIENCY ALERTS (Owner only)
// ════════════════════════════════════
function renderEfficiencyAlerts(){
  const el=document.getElementById('efficiency-alerts');
  if(!el||!isOwner())return;
  const alerts=[];
  fleet.forEach(veh=>{
    if(!veh.expected||!veh.unit||veh.unit==='none')return;
    const isMachVeh=['excavator','dozer','roller','paver','hmp','generator','tractor','other'].includes(veh.type);
    let actual=null;
    if(isMachVeh){const eff=getMachEfficiency(veh);if(eff?.lph)actual=eff.lph;}
    else{const eff=getRoadEfficiency(veh);if(eff?.kpl)actual=eff.kpl;}
    if(actual===null)return;
    const target=parseFloat(veh.expected);
    const bad=isMachVeh?actual>target*1.1:actual<target*0.9;
    if(bad){
      const pct=isMachVeh?Math.round(((actual-target)/target)*100):Math.round(((target-actual)/target)*100);
      alerts.push({name:veh.name,ico:vIco(veh.type),
        actual:isMachVeh?fmt(actual,2)+' L/hr':fmt(actual,2)+' km/L',
        target:isMachVeh?target+' L/hr':target+' km/L',pct});
    }
  });
  if(!alerts.length){el.innerHTML='';return;}
  el.innerHTML=`<div style="margin:8px 12px 0;background:rgba(255,61,61,.08);border:2px solid var(--red);border-radius:12px;overflow:hidden">
    <div style="background:rgba(255,61,61,.12);padding:10px 14px;font-family:var(--fh);font-size:15px;color:var(--red);display:flex;align-items:center;gap:8px">
      ⚠️ EFFICIENCY ALERTS <span style="background:var(--red);color:#fff;font-size:12px;padding:2px 8px;border-radius:10px;margin-left:4px">${alerts.length}</span>
    </div>
    ${alerts.map(a=>`<div style="padding:10px 14px;border-top:1px solid rgba(255,61,61,.2);display:flex;align-items:center;gap:10px;cursor:pointer" onclick="show('scr-reports')">
      <div style="font-size:22px">${a.ico}</div>
      <div style="flex:1">
        <div style="font-family:var(--fh);font-size:15px;color:var(--white)">${a.name}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600">Actual: <span style="color:var(--red)">${a.actual}</span> · Target: ${a.target} · ${a.pct}% off</div>
      </div>
      <div style="font-size:13px;color:var(--red)">›</div>
    </div>`).join('')}
  </div>`;
}

// ════════════════════════════════════
// MUSTER REMINDER
// ════════════════════════════════════
function renderMusterReminder(){
  const el=document.getElementById('muster-reminder');
  if(!el||!fleet.length)return;
  const td=today();
  const marked=musters?musters.filter(m=>m.date===td).length:0;
  const total=fleet.length;
  if(marked>=total){el.innerHTML='';return;}
  const unmrk=total-marked;
  el.innerHTML=`<div style="margin:8px 12px 0;background:rgba(255,179,0,.07);border:1px solid var(--amber);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer" onclick="show('scr-muster')">
    <div style="font-size:20px">📋</div>
    <div style="flex:1">
      <div style="font-family:var(--fh);font-size:14px;color:var(--amber)">MORNING MUSTER PENDING</div>
      <div style="font-size:11px;color:var(--muted);font-weight:600">${unmrk} of ${total} vehicles not yet marked today</div>
    </div>
    <div style="color:var(--amber);font-size:14px">›</div>
  </div>`;
}

// ════════════════════════════════════
// PENDING BANNER
// ════════════════════════════════════
function renderPendBanner(){
  const pending=disbs.filter(d=>(d.source==='can'||d.destType==='can')&&d.dipStatus==='pending');
  const el=document.getElementById('pend-banner');
  if(!pending.length){el.innerHTML='';return;}
  const items=pending.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3).map(d=>{
    const veh=gV(d.vehicleId);
    const ago=Math.floor((Date.now()-new Date(d.date))/(864e5));
    const when=ago===0?'Today':ago===1?'Yesterday':ago+' days ago';
    return `<div class="pend-item" onclick="openDip('${d.id}')">
      <div class="pi-ico">${veh?vIco(veh.type):'🪣'}</div>
      <div class="pi-main">
        <div class="pi-name">${veh?veh.name:'Unknown'}</div>
        <div class="pi-det">${fmtD(d.date)} · ${when} · by ${d.loggedByName}</div>
      </div>
      <div class="pi-L">${fmt(d.litres,1)} L</div>
      <div class="pi-arr">›</div>
    </div>`;
  }).join('');
  el.innerHTML=`<div class="pend-banner">
    <div class="pend-hd" onclick="show('scr-pending')">
      <div class="pend-hd-t"><div class="pend-badge">${pending.length}</div>DIP GAUGE PENDING</div>
      <span style="font-size:11px;font-weight:700;color:var(--red)">SEE ALL ›</span>
    </div>
    <div class="pend-items">${items}</div>
  </div>`;
}

function renderPendingList(){
  const pending=disbs.filter(d=>(d.source==='can'||d.destType==='can')&&d.dipStatus==='pending').sort((a,b)=>a.date.localeCompare(b.date));
  const el=document.getElementById('pend-list');
  if(!pending.length){el.innerHTML='<div class="muted-txt" style="padding:40px">✅ All dip gauges complete</div>';return;}
  el.innerHTML=pending.map(d=>{
    const veh=gV(d.vehicleId);
    const ago=Math.floor((Date.now()-new Date(d.date))/(864e5));
    const when=ago===0?'Today':ago===1?'Yesterday':ago+' days ago';
    return `<div class="log-item lpend" style="cursor:pointer" onclick="openDip('${d.id}')">
      <div class="li-ico">${veh?vIco(veh.type):'🪣'}</div>
      <div class="li-main">
        <div class="li-name">${veh?veh.name:'Unknown'}</div>
        <div class="li-det">Meter: ${fmt(d.meterBefore,0)} → ${fmt(d.meterAfter,0)} · ${when}</div>
        <div class="li-by">by ${d.loggedByName}</div>
        <span class="bdg bg-amb">⏳ DIP PENDING</span>
      </div>
      <div class="li-right"><div class="li-val">${fmt(d.litres,1)} L</div><div class="li-date">${fmtD(d.date)}</div></div>
    </div>`;
  }).join('');
}

function renderPendingReadings(){
  const el=document.getElementById('pending-readings-list');if(!el)return;
  el.innerHTML='<div class="muted-txt">No pending readings</div>';
}
