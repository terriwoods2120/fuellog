// ════════════════════════════════════
// FIREBASE REALTIME DATABASE SYNC
// ════════════════════════════════════
const FB_URL = 'https://fuellog-9f3c0-default-rtdb.firebaseio.com';
const FB_KEY = 'AIzaSyB44pKu7YTc-Q_6GLC3mlaEBPJm3d3odPc';

// All keys we sync to Firebase
const FB_KEYS = ['users','fleet','disbs','readings','purchases','pumps','pumpFills','sites','drivers','musters','checklistTemplates','checklistRecords'];

let fbOnline = false;
let fbSyncing = false;

// ── REST API helpers ──
async function fbGet(path){
  try {
    const r = await fetch(`${FB_URL}/${path}.json?auth=${FB_KEY}`);
    if(!r.ok) return null;
    return await r.json();
  } catch(e){ return null; }
}

async function fbSet(path, data){
  try {
    const r = await fetch(`${FB_URL}/${path}.json?auth=${FB_KEY}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    return r.ok;
  } catch(e){ return false; }
}

async function fbPatch(path, data){
  try {
    const r = await fetch(`${FB_URL}/${path}.json?auth=${FB_KEY}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    return r.ok;
  } catch(e){ return false; }
}

// ── Status indicator ──
function fbSetStatus(status){
  const el = document.getElementById('fb-status');
  const el2 = document.getElementById('fb-status-top');
  if(status === 'online'){
    if(el)el.innerHTML = '<span style="color:var(--green);font-size:11px;font-weight:700">● ONLINE</span>';
    if(el2)el2.textContent='●';
    if(el2)el2.style.color='var(--green)';
    fbOnline = true;
  } else if(status === 'syncing'){
    if(el)el.innerHTML = '<span style="color:var(--amber);font-size:11px;font-weight:700">⟳ SYNCING</span>';
    if(el2)el2.textContent='⟳';
    if(el2)el2.style.color='var(--amber)';
  } else if(status === 'offline'){
    if(el)el.innerHTML = '<span style="color:var(--muted);font-size:11px;font-weight:700">○ OFFLINE</span>';
    if(el2)el2.textContent='○';
    if(el2)el2.style.color='var(--muted)';
    fbOnline = false;
  } else if(status === 'error'){
    if(el)el.innerHTML = '<span style="color:var(--red);font-size:11px;font-weight:700">✕ SYNC ERROR</span>';
    if(el2)el2.textContent='✕';
    if(el2)el2.style.color='var(--red)';
  }
}

// ── Push local data to Firebase ──
async function fbPushAll(){
  fbSetStatus('syncing');
  const payload = {};
  FB_KEYS.forEach(k => {
    const localKey = SK[k] || ('fl7_' + k);
    try {
      payload[k] = JSON.parse(localStorage.getItem(localKey) || '[]');
    } catch(e){ payload[k] = []; }
  });
  const ok = await fbSet('fuellog', payload);
  fbSetStatus(ok ? 'online' : 'error');
  return ok;
}

// ── Pull Firebase data to local ──
async function fbPullAll(){
  fbSetStatus('syncing');
  const data = await fbGet('fuellog');
  if(!data){ fbSetStatus('offline'); return false; }
  FB_KEYS.forEach(k => {
    const localKey = SK[k] || ('fl7_' + k);
    if(data[k] !== undefined){
      localStorage.setItem(localKey, JSON.stringify(data[k] || []));
    }
  });
  fbSetStatus('online');
  return true;
}

// ── Sync a single collection after save ──
async function fbSyncKey(key){
  if(!fbOnline) return;
  const localKey = SK[key] || ('fl7_' + key);
  try {
    const data = JSON.parse(localStorage.getItem(localKey) || '[]');
    await fbSet(`fuellog/${key}`, data);
  } catch(e){}
}

// ── Override sv() to also sync to Firebase ──
const _svOriginal = sv;
window.sv = function(k, v){
  _svOriginal(k, v);
  // Find the FB key name from the SK value
  const fbKey = Object.keys(SK).find(key => SK[key] === k);
  if(fbKey && fbOnline){
    fbSet(`fuellog/${fbKey}`, v).catch(()=>{});
  }
};

// ── Initial sync on login ──
async function fbInit(){
  // WhatsApp internal browser check
  if(window.location.href.includes('content://com.whatsapp')){
    const loginScr=document.getElementById('scr-login');
    if(loginScr)loginScr.innerHTML=`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  height:100vh;gap:16px;padding:30px;text-align:center">
        <div style="font-size:52px">⛽</div>
        <div style="font-family:var(--fh);font-size:26px;color:var(--amber)">FUELLOG</div>
        <div style="background:rgba(255,179,0,.1);border:1.5px solid var(--amber);border-radius:14px;padding:20px;max-width:340px">
          <div style="font-family:var(--fh);font-size:15px;color:var(--amber);margin-bottom:10px">⚠️ OPEN IN BROWSER</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.6;font-weight:600">
            This app must be opened from Chrome or Safari browser.
          </div>
        </div>
      </div>`;
    return;
  }

  // Show loading overlay on top of login screen (don't replace it)
  let overlay = document.getElementById('fb-loading-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'fb-loading-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px';
    overlay.innerHTML = `
      <div style="font-size:48px">⛽</div>
      <div style="font-family:var(--fh);font-size:24px;color:var(--amber)">FUELLOG</div>
      <div style="font-size:13px;color:var(--muted);font-weight:600">Connecting to server...</div>
      <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--amber);border-radius:50%;animation:spin 1s linear infinite"></div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(overlay);
  }

  fbSetStatus('syncing');

  // Try Firebase with 8 second timeout
  let data = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 8000);
    const r = await fetch(`${FB_URL}/fuellog.json?auth=${FB_KEY}`, {signal: controller.signal});
    clearTimeout(timeout);
    if(r.ok) data = await r.json();
  } catch(e){ data = null; }

  // Firebase responded (even null = empty DB = still online)
  fbOnline = true;
  fbSetStatus('online');

  if(data){
    FB_KEYS.forEach(k => {
      const localKey = SK[k] || ('fl7_' + k);
      const val = data[k] || [];
      localStorage.setItem(localKey, JSON.stringify(val));
      if(k==='users') users=val;
      else if(k==='fleet') fleet=val;
      else if(k==='disbs') disbs=val;
      else if(k==='readings') readings=val;
      else if(k==='purchases') purchases=val;
      else if(k==='pumps') pumps=val;
      else if(k==='pumpFills') pumpFills=val;
      else if(k==='sites') sites=val;
      else if(k==='drivers') drivers=val;
      else if(k==='musters') musters=val;
      else if(k==='checklistTemplates') checklistTemplates=val;
      else if(k==='checklistRecords') checklistRecords=val;
    });
  }

  // Remove loading overlay and show login
  overlay.remove();
  initLogin();
  show('scr-login');
}

// ── Manual sync button ──
async function fbManualSync(){
  fbSetStatus('syncing');
  const ok = await fbPushAll();
  if(ok){
    flash('✅ SYNCED!', 'All data uploaded to cloud');
  } else {
    flash('❌ SYNC FAILED', 'Check internet connection');
  }
}

// ── Check online status every 30 seconds ──
setInterval(async()=>{
  if(!sess) return; // only sync when logged in
  const data = await fbGet('fuellog/users');
  if(data !== null && !fbOnline){
    // Back online — push any local changes
    fbSetStatus('online');
    fbPushAll();
  } else if(data === null && fbOnline){
    fbSetStatus('offline');
  }
}, 30000);

// ── Secret URL Owner PIN Reset ──
// Usage: https://yourapp.url/?reset=SECRETKEY
// Secret key is: chiddarwar2024reset
(function checkSecretReset(){
  const params = new URLSearchParams(window.location.search);
  const key = params.get('reset');
  if(!key) return;
  if(key !== 'chiddarwar2024reset'){
    alert('Invalid reset key.');
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }
  // Valid key — show PIN reset screen
  window.history.replaceState({}, '', window.location.pathname);
  document.addEventListener('DOMContentLoaded', ()=>{}, false);
  const resetUI = ()=>{
    const scr = document.getElementById('scr-login');
    if(!scr) return;
    scr.innerHTML = `
      <div class="login-hdr">
        <div class="login-logo">⛽ FUELLOG</div>
        <div class="login-co">Owner PIN Reset</div>
      </div>
      <div style="padding:20px 16px">
        <div style="background:rgba(255,61,61,.08);border:1.5px solid var(--red);border-radius:12px;
          padding:16px;margin-bottom:16px;font-size:12px;color:var(--muted);font-weight:600">
          ⚠️ This will reset the Owner PIN. Only use if locked out.
        </div>
        <div class="f-field"><label class="f-lbl">Owner Name (must match exactly)</label>
          <input class="f-inp" id="rst-name" placeholder="Your owner name" type="text"></div>
        <div class="f-field"><label class="f-lbl">New PIN</label>
          <input class="f-inp" id="rst-pin1" placeholder="New 4-digit PIN" type="password"
            inputmode="numeric" maxlength="4"></div>
        <div class="f-field"><label class="f-lbl">Confirm New PIN</label>
          <input class="f-inp" id="rst-pin2" placeholder="Repeat PIN" type="password"
            inputmode="numeric" maxlength="4"></div>
        <button class="big-btn bb-amber bb-full" style="margin-top:8px;height:54px"
          onclick="doOwnerReset()">🔑 RESET OWNER PIN</button>
      </div>`;
  };
  // Run after DOM ready
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', resetUI);
  else setTimeout(resetUI, 100);
})();

function doOwnerReset(){
  const name = document.getElementById('rst-name')?.value.trim();
  const pin1 = document.getElementById('rst-pin1')?.value.trim();
  const pin2 = document.getElementById('rst-pin2')?.value.trim();
  if(!name){alert('Enter owner name');return;}
  if(pin1.length!==4||isNaN(Number(pin1))){alert('PIN must be 4 digits');return;}
  if(pin1!==pin2){alert('PINs do not match');return;}
  const owner = users.find(u=>u.role==='owner'&&u.name.toLowerCase()===name.toLowerCase());
  if(!owner){alert('No owner found with that name. Check spelling.');return;}
  const idx = users.findIndex(u=>u.id===owner.id);
  users[idx]={...users[idx],pin:pin1};
  sv('users',users);
  fbPushAll().then(()=>{
    alert('✅ PIN reset successful! You can now log in with your new PIN.');
    location.reload();
  }).catch(()=>{
    alert('✅ PIN reset saved locally. Sync when online.');
    location.reload();
  });
}

// ── Start app ──
fbInit();

</script>


<!-- ═══ CHECKLIST BUILDER (Owner/Admin) ═══ -->
<div class="screen" id="scr-checklists">
  <div class="topbar">
    <button class="tb-back" onclick="show('scr-home')">‹</button>
    <div><div class="tb-title">CHECKLISTS</div><div class="tb-sub">Build vehicle checklist templates</div></div>
  </div>
  <div class="form-body">
    <div class="f-field">
      <label class="f-lbl">Template Name</label>
      <input class="f-inp" id="cl-name" placeholder="e.g. Dumper Pre-Start" type="text">
    </div>
    <div class="f-field">
      <label class="f-lbl">Vehicle Type — Load Standard Template</label>
      <select class="f-sel" id="cl-vtype" onchange="onClVehicleTypeChange()">
        <option value="">Select vehicle type...</option>
        <option value="dumper">🚚 Dumper / Tipper</option>
        <option value="excavator">⚙️ Excavator (PC Class)</option>
        <option value="roller">🔃 Roller</option>
        <option value="paver">🛣️ Sensor Paver</option>
        <option value="transit-mixer">🌀 Transit Mixer</option>
        <option value="hmp">🏭 HMP</option>
        <option value="dozer">🚜 Dozer</option>
      </select>
    </div>
    <div id="cl-template-preview"></div>
    <button class="big-btn bb-amber bb-full" style="height:56px;font-size:18px;margin-top:8px" onclick="saveChecklistTemplate()">+ SAVE TEMPLATE</button>
  </div>
  <div class="sec-lbl">Saved Templates</div>
  <div class="log-list" id="cl-builder-list"></div>
  <div class="pad-bot"></div>
</div>

<!-- ═══ CHECKLIST COMPLETION (Driver/Op) ═══ -->
<div class="screen" id="scr-checklist">
  <div class="topbar">
    <button class="tb-back" onclick="show('scr-home')">‹</button>
    <div><div class="tb-title" id="cl-form-title">CHECKLIST</div><div class="tb-sub">Complete all items before starting</div></div>
  </div>
  <div id="cl-form"></div>
</div>

<!-- ═══ CHECKLIST REVIEW (Manager/Owner) ═══ -->
<div class="screen" id="scr-cl-review">
  <div class="topbar">
    <button class="tb-back" onclick="show('scr-home')">‹</button>
    <div><div class="tb-title">CHECKLIST REVIEW</div><div class="tb-sub">Today's submissions</div></div>
  </div>
  <div class="sec-lbl">Today's Submissions</div>
  <div class="log-list" id="cl-review-list"></div>
  <div class="pad-bot"></div>
</div>

<script id="fl-modal-core">
/* ═══ MODAL CORE — DO NOT REMOVE OR REPLACE ═══ */
let editCtx={type:null,id:null};

function closeEditModal(){
  document.getElementById('edit-modal').classList.remove('show');
  editCtx={type:null,id:null};
}

function openEditModal(type,id){
  editCtx={type,id};
  const modal=document.getElementById('edit-modal');
  const body=document.getElementById('edit-modal-body');
  if(type==='fleet'){
    const f=fleet.find(x=>x.id===id);if(!f)return;
    if(!isOwner()&&!isAdmin()){alert('Only Owner or Admin can edit fleet');return;}
    document.getElementById('edit-modal-title').textContent='EDIT FLEET — '+f.name;
    const m=isMach(f.type);
    body.innerHTML=`
      <div class="f-field"><label class="f-lbl">Name / Registration</label><input class="f-inp" id="ed-fn" value="${f.name||''}" type="text"></div>
      <div class="f-field"><label class="f-lbl">Type</label>
        <select class="f-sel" id="ed-ft">
          ${['dumper','truck','transit-mixer','excavator','dozer','roller','paver','hmp','generator','tractor','other'].map(t=>`<option value="${t}" ${f.type===t?'selected':''}>${vIco(t)} ${t}</option>`).join('')}
        </select></div>
      <div class="f-field"><label class="f-lbl">Assigned Site</label>
        <select class="f-sel" id="ed-fsite">
          <option value="">No fixed site (Mobile)</option>
          ${(sites||[]).map(s=>`<option value="${s.id}" ${s.id===f.siteId?'selected':''}>${s.name}</option>`).join('')}
        </select></div>
      ${m?`<div class="f-field"><label class="f-lbl">Calibration (L/cm)</label><input class="f-inp" id="ed-fc" value="${f.calibration||''}" type="number" inputmode="decimal" step="0.01"></div>`:''}
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Tank (L)</label><input class="f-inp" id="ed-ftank" value="${f.tank||''}" type="number" inputmode="numeric"></div>
        <div class="f-field"><label class="f-lbl">Target Efficiency</label><input class="f-inp" id="ed-feff" value="${f.expected||''}" type="number" inputmode="decimal"></div>
      </div>`;
    modal.dataset.editType='fleet';modal.dataset.fleetId=id;
  } else if(type==='purchase'){
    const p=purchases.find(x=>x.id===id);if(!p)return;
    if(!canEditEntry(p)){alert('You can only edit your own same-day entries');return;}
    document.getElementById('edit-modal-title').textContent='EDIT PURCHASE';
    body.innerHTML=`
      <div class="f-field"><label class="f-lbl">Vendor</label><input class="f-inp" id="ed-vendor" value="${p.vendor||''}" type="text"></div>
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Litres</label><input class="f-inp" id="ed-pL" value="${p.litres||''}" type="number" inputmode="decimal"></div>
        <div class="f-field"><label class="f-lbl">Rate ₹/L</label><input class="f-inp" id="ed-pr" value="${p.rate||''}" type="number" inputmode="decimal"></div>
      </div>
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Amount ₹</label><input class="f-inp" id="ed-pa" value="${p.amount||''}" type="number" inputmode="decimal"></div>
        <div class="f-field"><label class="f-lbl">Paid ₹</label><input class="f-inp" id="ed-pp" value="${p.paid||''}" type="number" inputmode="decimal"></div>
      </div>
      <div class="f-field"><label class="f-lbl">Bill No.</label><input class="f-inp" id="ed-pb" value="${p.bill||''}" type="text"></div>`;
    modal.dataset.editType='purchase';
  } else if(type==='disb'){
    const d=disbs.find(x=>x.id===id);if(!d)return;
    if(!canEditEntry(d)){alert('You can only edit your own same-day entries');return;}
    const veh=gV(d.vehicleId);
    document.getElementById('edit-modal-title').textContent='EDIT DISBURSEMENT';
    body.innerHTML=`
      <div class="f-field"><label class="f-lbl">Vehicle</label><input class="f-inp ro" value="${veh?.name||'—'}" readonly></div>
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Meter Before (L)</label><input class="f-inp" id="ed-mb" value="${d.meterBefore||''}" type="number" inputmode="decimal"></div>
        <div class="f-field"><label class="f-lbl">Meter After (L)</label><input class="f-inp" id="ed-ma" value="${d.meterAfter||''}" type="number" inputmode="decimal"></div>
      </div>
      <div class="f-field"><label class="f-lbl">Litres</label><input class="f-inp" id="ed-L" value="${d.litres||''}" type="number" inputmode="decimal"></div>
      <div class="f-field"><label class="f-lbl">Operator</label><input class="f-inp" id="ed-op" value="${d.operator||''}" type="text"></div>
      <div class="f-field"><label class="f-lbl">Remarks</label><input class="f-inp" id="ed-rem" value="${d.remarks||''}" type="text"></div>`;
    modal.dataset.editType='disb';modal.dataset.disbId=id;
  }
  modal.classList.add('show');
}

function saveFleetChecklistEdit(){
  const modal=document.getElementById('edit-modal');
  const fid=modal.dataset.fleetId;
  const idx=fleet.findIndex(f=>f.id===fid);if(idx===-1)return;
  const tmplId=document.getElementById('ef-checklist')?.value||'';
  const tmpl=(checklistTemplates||[]).find(t=>t.id===tmplId);
  fleet[idx]={...fleet[idx],checklistTemplateId:tmplId||null,checklistTemplateName:tmpl?.name||null};
  sv('fleet',fleet);renderFleetLog();
  flash('CHECKLIST ASSIGNED!',fleet[idx].name+' → '+(tmpl?.name||'None'));
  closeEditModal();
}
function saveEdit(){
  const modal=document.getElementById('edit-modal');
  const editType=modal?.dataset?.editType;
  if(editType==='user'){saveUserEdit();return;}
  if(editType==='driver'){saveDriverEdit();return;}
  if(editType==='fleetChecklist'){saveFleetChecklistEdit();return;}
  // All other cases handled in main script saveEdit
  if(typeof saveEditMain==='function')saveEditMain();
}
/* ═══ END MODAL CORE ═══ */
