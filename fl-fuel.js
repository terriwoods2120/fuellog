// ════════════════════════════════════
// GIVE FUEL FLOW
// ════════════════════════════════════


// ════════════════════════════════════
// GIVE FUEL FLOW
// ════════════════════════════════════


// ════════════════════════════════════
// GIVE FUEL FLOW
// ════════════════════════════════════
const gf={source:'',vehicleId:'',meterBefore:0,litres:0,meterAfter:0};

// ── Recent vehicles tracking ──
const RECENT_KEY = 'fl7_recent_veh';
function getRecentVehs(){
  try{return JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');}catch{return[];}
}
function addRecentVeh(id){
  let recent = getRecentVehs();
  recent = [id, ...recent.filter(x=>x!==id)].slice(0,5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

function buildVehTile(f, onclick){
  return `<div class="veh-tile" onclick="${onclick}">
    <div class="vt-ico">${vIco(f.type)}</div>
    <div style="flex:1">
      <div class="vt-name">${f.name}</div>
      <div class="vt-sub">${f.type}${f.calibration?' · 📏 '+f.calibration+' L/cm':''}${f.unit&&f.unit!=='none'?' · '+f.unit.toUpperCase():''}</div>
    </div>
    <div class="vt-arr">›</div>
  </div>`;
}

function renderVehGrid(filtered){
  if(!fleet.length)
    return `<div class="no-fleet"><div class="nf-ico">🚜</div><div class="nf-ttl">No Fleet Added</div><div class="nf-sub">Go to Fleet Setup first</div></div>`;
  if(filtered!==undefined){
    // Search mode — just show filtered results
    if(!filtered.length)
      return `<div style="padding:30px;text-align:center;color:var(--muted);font-size:14px;font-weight:600">No vehicles match your search</div>`;
    return filtered.map(f=>buildVehTile(f,`pickVehForFuel('${f.id}')`)).join('');
  }
  // Normal mode — recent + all
  const recentIds = getRecentVehs();
  const recentVehs = recentIds.map(id=>fleet.find(f=>f.id===id)).filter(Boolean);
  let html = '';
  if(recentVehs.length){
    html += `<div style="padding:8px 14px 4px;font-size:10px;color:var(--amber);font-weight:700;letter-spacing:.8px;text-transform:uppercase">⚡ Recently Used</div>`;
    html += recentVehs.map(f=>buildVehTile(f,`pickVehForFuel('${f.id}')`)).join('');
    html += `<div style="padding:8px 14px 4px;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.8px;text-transform:uppercase;border-top:1px solid var(--border);margin-top:4px">All Vehicles</div>`;
  }
  html += fleet.map(f=>buildVehTile(f,`pickVehForFuel('${f.id}')`)).join('');
  return html;
}

function filterVehGrid(q){
  const el = document.getElementById('veh-grid');
  if(!el) return;
  if(!q.trim()){
    el.innerHTML = renderVehGrid();
    return;
  }
  const filtered = fleet.filter(f=>f.name.toLowerCase().includes(q.toLowerCase()));
  el.innerHTML = renderVehGrid(filtered);
}

function selSource(src){
  gf.source=src;
  const title=src==='can'?'SELECT MACHINE':'SELECT VEHICLE';
  const sub=src==='bowser'?'Which vehicle is being fuelled from bowser?':
            src==='pump'?'Which vehicle is filling at pump?':
            'Which machine are the cans going to?';
  document.getElementById('pv-title').textContent=title;
  document.getElementById('pv-sub').textContent=sub;
  // Clear search and render
  const searchEl = document.getElementById('veh-search');
  if(searchEl) searchEl.value='';
  document.getElementById('veh-grid').innerHTML = renderVehGrid();
  show('scr-pick-veh');
  // Focus search after screen shows
  setTimeout(()=>{ if(searchEl) searchEl.focus(); }, 300);
}

function pickVehForFuel(id){
  gf.vehicleId=id;
  addRecentVeh(id);
  const veh=gV(id);
  if(gf.source==='pump'){
    // Pump fill — separate form
    populatePumpSelect();
    document.getElementById('pf-veh-name').textContent=veh?.name||'';
    document.getElementById('pf-loggedby').value=sess?.name||'';
    resetPFPhotos();
    ['pf-litres','pf-rate','pf-amount','pf-paid','pf-bill','pf-operator'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});
    show('scr-pump-fill');
    return;
  }
  // Bowser or can — go to single entry form
  openFuelEntryForm(veh);
}

function openFuelEntryForm(veh){
  // Set header
  document.getElementById('fe-title').textContent = 'BOWSER FUEL';
  document.getElementById('fe-veh-name').textContent = veh?.name||'';
  document.getElementById('fe-src-tag').innerHTML = '<span style="color:var(--green);font-size:11px;font-weight:700">🛢 BOWSER</span>';

  // Clear fields
  document.getElementById('fe-before').value='';
  document.getElementById('fe-litres').value='';
  document.getElementById('fe-after').value='';
  document.getElementById('fe-remarks').value='';
  document.getElementById('fe-meter-check').innerHTML='';
  document.getElementById('fe-operator-err').style.display='none';

  // Populate receiver dropdown — site supervisors + managers
  const drvSel = document.getElementById('fe-operator');
  drvSel.innerHTML = '<option value="">-- Select receiver --</option>';
  const receivers = (users||[]).filter(u=>['sitesup','supervisor','admin','owner'].includes(u.role));
  receivers.forEach(u=>{
    const opt = document.createElement('option');
    opt.value = u.name;
    opt.textContent = u.name + ' · ' + rLbl(u.role);
    drvSel.appendChild(opt);
  });
  // If no supervisors, fall back to all users
  if(!receivers.length){
    (users||[]).forEach(u=>{
      const opt = document.createElement('option');
      opt.value = u.name;
      opt.textContent = u.name;
      drvSel.appendChild(opt);
    });
  }

  // Hint for meter before
  const last=[...disbs].filter(d=>d.source==='bowser'||d.source==='can'||d.destType==='can').sort((a,b)=>b.ts-a.ts)[0];
  document.getElementById('fe-before-hint').textContent=
    last?'Last reading: '+fmt(last.meterAfter,0)+' L':'First entry — enter current totaliser';

  // Destination toggle — default direct
  const destWrap=document.getElementById('fe-dest-wrap');
  destWrap.style.display='';
  feSelDest('direct');

  show('scr-fuel-entry');
  setTimeout(()=>document.getElementById('fe-before').focus(),300);
}

let feDestType='direct';
function feSelDest(d){
  feDestType=d;
  const dir=document.getElementById('fe-dest-direct');
  const can=document.getElementById('fe-dest-can');
  if(d==='direct'){
    dir.style.background='var(--amber)';dir.style.borderColor='var(--amber)';
    dir.querySelector('div:last-child').style.color='#111';
    can.style.background='var(--bg3)';can.style.borderColor='var(--border)';
    can.querySelector('div:last-child').style.color='var(--muted)';
  } else {
    can.style.background='var(--amber)';can.style.borderColor='var(--amber)';
    can.querySelector('div:last-child').style.color='#111';
    dir.style.background='var(--bg3)';dir.style.borderColor='var(--border)';
    dir.querySelector('div:last-child').style.color='var(--muted)';
  }
  // Show/hide mandatory indicator on Received By
  const req=document.getElementById('fe-operator-req');
  const lbl=document.getElementById('fe-operator-lbl');
  if(req){req.style.display=d==='can'?'':'none';}
  // Update label text
  if(lbl){
    lbl.innerHTML=d==='can'
      ?'👤 Received By <span style="color:var(--red)">*</span> <span style="font-size:10px;color:var(--amber)">(mandatory for can)</span>'
      :'👤 Received By <span style="font-size:10px;color:var(--muted)">(optional)</span>';
  }
}

function feLiveCheck(){
  const before=parseFloat(document.getElementById('fe-before').value)||0;
  const litres=parseFloat(document.getElementById('fe-litres').value)||0;
  const after=parseFloat(document.getElementById('fe-after').value)||0;
  const box=document.getElementById('fe-meter-check');
  if(!before||!litres||!after){box.innerHTML='';return;}
  const diff=after-before;
  const gap=Math.abs(diff-litres);
  const pct=litres>0?(gap/litres)*100:0;
  let bg,ico,msg;
  if(diff<0){bg='rgba(255,61,61,.12)';ico='🚫';msg='After reading is less than before — check meter.';}
  else if(gap<=1){bg='rgba(0,200,83,.1)';ico='✅';msg='Meter matches — diff '+fmt(diff,1)+' L vs '+fmt(litres,1)+' L entered';}
  else if(pct<=5){bg='rgba(255,179,0,.1)';ico='⚠️';msg='Small variance: meter diff '+fmt(diff,1)+' L, entered '+fmt(litres,1)+' L';}
  else{bg='rgba(255,61,61,.12)';ico='🚨';msg='MISMATCH: meter diff '+fmt(diff,1)+' L vs entered '+fmt(litres,1)+' L';}
  box.innerHTML=`<div style="background:${bg};border-radius:8px;padding:10px 12px;display:flex;gap:8px;align-items:center;font-size:12px;font-weight:600">
    <span style="font-size:16px">${ico}</span><span>${msg}</span>
  </div>`;
}

function saveFuelEntry(){
  const before=parseFloat(document.getElementById('fe-before').value)||0;
  const litres=parseFloat(document.getElementById('fe-litres').value)||0;
  const after=parseFloat(document.getElementById('fe-after').value)||0;
  const operator=document.getElementById('fe-operator').value;
  const isCan=feDestType==='can';

  if(!before){alert('Enter bowser meter BEFORE');document.getElementById('fe-before').focus();return;}
  if(!litres){alert('Enter litres issued');document.getElementById('fe-litres').focus();return;}
  if(!after){alert('Enter bowser meter AFTER');document.getElementById('fe-after').focus();return;}
  if(isCan&&!operator){
    document.getElementById('fe-operator-err').style.display='';
    document.getElementById('fe-operator').focus();
    alert('Received By is required for Can dispatch');
    return;
  }
  document.getElementById('fe-operator-err').style.display='none';

  const veh=gV(gf.vehicleId);
  const mDiff=after-before;
  const source='bowser';
  disbs.push({
    id:uid(),date:today(),ts:Date.now(),
    vehicleId:gf.vehicleId,litres,source,
    destType:isCan?'can':null,
    meterBefore:before,meterAfter:after,meterDiff:mDiff,
    meterMismatch:mDiff<0||Math.abs(mDiff-litres)>1,
    operator,
    remarks:document.getElementById('fe-remarks').value,
    loggedBy:sess.userId,loggedByName:sess.name,
    dipStatus:isCan?'pending':null,
    gaugeBefore:null,gaugeAfter:null,gaugeIncreaseCm:null,
    gaugeIncreaseLtr:null,diff:null,dipMatch:null,
    dipTakenBy:null,dipTakenByName:null,dipDate:null,dipRemarks:'',
    photoBef:null,photoAft:null,dipTs:null,
  });
  sv('disbs',disbs);
  flash(isCan?'DISPATCHED!':'LOGGED!',fmt(litres,1)+' L → '+(veh?.name||'—')+(isCan?'\n⏳ Dip gauge pending':''));
  show('scr-home');
  _bnavTab='home';
  bnavTab('home');
}


// Old step functions replaced by saveFuelEntry()

// ════════════════════════════════════
// DIP GAUGE
// ════════════════════════════════════
let dipState={id:null,photoBef:null,photoAft:null};

function openDip(disbId){
  const e=disbs.find(d=>d.id===disbId);if(!e)return;
  dipState={id:disbId,photoBef:null,photoAft:null};
  const veh=gV(e.vehicleId);
  const calib=veh?.calibration||null;
  document.getElementById('dip-sub').textContent=veh?.name||'Unknown';
  document.getElementById('dip-date-r').textContent=fmtD(today());
  document.getElementById('dip-before').value='';
  document.getElementById('dip-after').value='';
  document.getElementById('dip-takenby').value=sess.name;
  document.getElementById('dip-remarks').value='';
  document.getElementById('dip-calc-box').innerHTML='';
  ['phb','pha'].forEach(p=>{
    document.getElementById(p+'-img').src='';
    document.getElementById(p+'-img').classList.remove('show');
    document.getElementById(p+'-lbl').textContent='Tap to take photo';
    document.getElementById(p+'-btn').classList.remove('hasp');
  });
  document.getElementById('dip-info').innerHTML=`
    <div class="dip-row"><span class="dip-k">Machine</span><span class="dip-v">${veh?.name||'—'}</span></div>
    <div class="dip-row"><span class="dip-k">Dispatched</span><span class="dip-v">${fmtD(e.date)}</span></div>
    <div class="dip-row"><span class="dip-k">Fuel Sent</span><span class="dip-v dhl">${fmt(e.litres,1)} L</span></div>
    <div class="dip-row"><span class="dip-k">Bowser Meter</span><span class="dip-v">${fmt(e.meterBefore,0)} → ${fmt(e.meterAfter,0)} L</span></div>
    <div class="dip-row"><span class="dip-k">Dispatched By</span><span class="dip-v">${e.loggedByName}</span></div>
    <div class="dip-row"><span class="dip-k">Calibration</span>
      <span class="dip-v" style="color:${calib?'var(--green)':'var(--red)'}">
        ${calib?calib+' L/cm':'Not set — cm will be recorded'}
      </span>
    </div>`;
  show('scr-dip');
}

function calcDip(){
  const e=disbs.find(d=>d.id===dipState.id);if(!e)return;
  const calib=gV(e.vehicleId)?.calibration||null;
  const before=parseFloat(document.getElementById('dip-before').value);
  const after=parseFloat(document.getElementById('dip-after').value);
  const box=document.getElementById('dip-calc-box');
  if(isNaN(before)||isNaN(after)){box.innerHTML='';return;}
  const cm=after-before;
  if(!calib){
    box.innerHTML=`<div class="dip-calc dc-neutral"><div style="font-size:14px;font-weight:700">📏 Tape rise: <strong>${fmt(cm,1)} cm</strong></div><div style="font-size:11px;margin-top:4px">Set calibration in Fleet Setup to auto-calculate litres</div></div>`;
    return;
  }
  const filled=cm*calib;
  const diff=e.litres-filled;
  const ok=Math.abs(diff)<=2;
  box.innerHTML=`<div class="dip-calc ${ok?'dc-ok':'dc-fail'}">
    <div class="dc-row">
      <div class="dc-item"><div class="dci-v">${fmt(cm,1)} cm</div><div class="dci-l">Tape Rise</div></div>
      <div class="dc-item"><div class="dci-v">${fmt(filled,1)} L</div><div class="dci-l">Filled</div></div>
      <div class="dc-item"><div class="dci-v">${fmt(e.litres,1)} L</div><div class="dci-l">Dispatched</div></div>
    </div>
    <div class="dc-verdict">${ok?'✅ VERIFIED — MATCHES':'⚠️ MISMATCH — '+fmt(Math.abs(diff),1)+' L difference'}</div>
  </div>`;
}

function handlePhoto(side,inp){
  const file=inp.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=e=>{
    const data=e.target.result;
    const pfx=side==='b'?'phb':'pha';
    if(side==='b')dipState.photoBef=data;else dipState.photoAft=data;
    document.getElementById(pfx+'-img').src=data;
    document.getElementById(pfx+'-img').classList.add('show');
    document.getElementById(pfx+'-lbl').textContent='✅ Photo saved — tap to replace';
    document.getElementById(pfx+'-btn').classList.add('hasp');
  };r.readAsDataURL(file);
}

function saveDip(){
  const before=parseFloat(document.getElementById('dip-before').value);
  const after=parseFloat(document.getElementById('dip-after').value);
  if(isNaN(before)||isNaN(after)){alert('Enter both tape readings');return;}
  const idx=disbs.findIndex(d=>d.id===dipState.id);if(idx===-1)return;
  const calib=gV(disbs[idx].vehicleId)?.calibration||null;
  const cm=after-before;
  const filled=calib?cm*calib:null;
  const diff=filled!==null?disbs[idx].litres-filled:null;
  const ok=diff!==null?Math.abs(diff)<=2:null;
  disbs[idx]={...disbs[idx],
    dipStatus:'verified',
    gaugeBefore:before,gaugeAfter:after,gaugeIncreaseCm:cm,gaugeIncreaseLtr:filled,
    diff,dipMatch:ok,
    dipTakenBy:sess.userId,dipTakenByName:sess.name,
    dipDate:today(),dipRemarks:document.getElementById('dip-remarks').value,
    photoBef:dipState.photoBef,photoAft:dipState.photoAft,dipTs:Date.now(),
  };
  sv('disbs',disbs);
  flash(ok?'VERIFIED ✓':ok===null?'SAVED':'MISMATCH ⚠️',
    ok?gV(disbs[idx].vehicleId)?.name+' — fuel confirmed':
    ok===null?'cm recorded — no calibration set':'Diff '+fmt(Math.abs(diff||0),1)+' L saved');
  show('scr-home');
}

// Reading flow moved to scr-readings / openReadingEntry


