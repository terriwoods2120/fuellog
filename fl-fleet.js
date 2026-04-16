// ════════════════════════════════════
// FLEET
// ════════════════════════════════════
let flU='km';
function flTypeChange(){
  const t=document.getElementById('fl-type').value;
  const m=isMach(t);
  document.getElementById('fl-calib-wrap').style.display=m?'flex':'none';
  selFU(m?'hr':'km');
}
function selFU(u){
  flU=u;
  ['km','hr','no'].forEach(x=>document.getElementById('fu-'+x).classList.toggle('on',
    x==='km'?u==='km':x==='hr'?u==='hr':u==='none'));
  document.getElementById('fl-eff-lbl').textContent=u==='km'?'Target km/L':u==='hr'?'Target L/hr':'—';
}
function populateFleetSiteSelect(){
  const sel=document.getElementById('fl-site');if(!sel)return;
  sel.innerHTML='<option value="">No fixed site (Mobile)</option>'+
    (sites||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}
function populateFleetDriverSelect(selId,selectedId){
  const sel=document.getElementById(selId);if(!sel)return;
  sel.innerHTML='<option value="">No driver assigned</option>'+
    (drivers||[]).map(d=>`<option value="${d.id}" ${d.id===selectedId?'selected':''}>${d.name} · ${d.type}</option>`).join('');
}
function saveFleet(){
  if(!isOwner()){alert('Only Owner can modify fleet');return;}
  const name=document.getElementById('fl-name').value.trim();
  if(!name){alert('Enter name');return;}
  const t=document.getElementById('fl-type').value;
  const siteId=document.getElementById('fl-site')?.value||'';
  const site=sites?.find(s=>s.id===siteId);
  const driverId=document.getElementById('fl-driver')?.value||'';
  const driver=drivers?.find(d=>d.id===driverId);
  fleet.push({
    id:uid(),name,type:t,unit:flU,
    siteId:siteId||null,siteName:site?.name||'Mobile',
    driverId:driverId||null,driverName:driver?.name||null,
    calibration:isMach(t)?parseFloat(document.getElementById('fl-calib').value)||null:null,
    tank:parseFloat(document.getElementById('fl-tank').value)||0,
    expected:parseFloat(document.getElementById('fl-eff').value)||0,
    addedBy:sess.userId,addedByName:sess.name,
  });
  sv('fleet',fleet);
  ['fl-name','fl-calib','fl-tank','fl-eff'].forEach(i=>document.getElementById(i).value='');
  const siteEl=document.getElementById('fl-site');if(siteEl)siteEl.value='';
  const drvEl=document.getElementById('fl-driver');if(drvEl)drvEl.value='';
  renderFleetLog();
  flash('ADDED!',name+' added to fleet');
}
function delFleet(id){
  if(!isOwner())return;
  const f=fleet.find(x=>x.id===id);
  showConfirm('Remove "'+f?.name+'" from fleet?',()=>{
    fleet=fleet.filter(f=>f.id!==id);sv('fleet',fleet);renderFleetLog();
    flash('REMOVED!',f?.name+' removed');
  });
}
function editFleetSite(id){
  if(!isOwner())return;
  const f=fleet.find(x=>x.id===id);if(!f)return;
  const body=document.getElementById('edit-modal-body');
  document.getElementById('edit-modal-title').textContent='CHANGE SITE — '+f.name;
  body.innerHTML=`
    <div class="f-field"><label class="f-lbl">Current Site</label>
      <input class="f-inp ro" value="${f.siteName||'Mobile'}" readonly></div>
    <div class="f-field"><label class="f-lbl">New Site</label>
      <select class="f-sel" id="ef-site">
        <option value="">No fixed site (Mobile)</option>
        ${(sites||[]).map(s=>`<option value="${s.id}" ${s.id===f.siteId?'selected':''}>${s.name}</option>`).join('')}
      </select></div>
    <div class="f-field"><label class="f-lbl">Reason for change (optional)</label>
      <input class="f-inp" id="ef-reason" placeholder="e.g. Machine shifted to new site" type="text"></div>`;
  document.getElementById('edit-modal').dataset.editType='fleetSite';
  document.getElementById('edit-modal').dataset.fleetId=id;
  document.getElementById('edit-modal').classList.add('show');
}
function editFleetDriver(id){
  if(!isOwner()&&!isSup())return;
  const f=fleet.find(x=>x.id===id);if(!f)return;
  const body=document.getElementById('edit-modal-body');
  document.getElementById('edit-modal-title').textContent='ASSIGN DRIVER — '+f.name;
  body.innerHTML=`
    <div class="f-field"><label class="f-lbl">Current Driver</label>
      <input class="f-inp ro" value="${f.driverName||'Unassigned'}" readonly></div>
    <div class="f-field"><label class="f-lbl">Assign Driver / Operator</label>
      <select class="f-sel" id="ef-driver">
        <option value="">No driver assigned</option>
        ${(drivers||[]).map(d=>`<option value="${d.id}" ${d.id===f.driverId?'selected':''}>${d.name} · ${d.type}</option>`).join('')}
      </select></div>`;
  document.getElementById('edit-modal').dataset.editType='fleetDriver';
  document.getElementById('edit-modal').dataset.fleetId=id;
  document.getElementById('edit-modal').classList.add('show');
}
function renderFleetLog(){
  populateFleetSiteSelect();
  populateFleetDriverSelect('fl-driver',null);
  const el=document.getElementById('fleet-log');
  if(!fleet.length){el.innerHTML='<div class="muted-txt">No vehicles yet — add above</div>';return;}
  const siteGroups={};
  fleet.forEach(f=>{
    const key=f.siteName||'Mobile';
    if(!siteGroups[key])siteGroups[key]=[];
    siteGroups[key].push(f);
  });
  let html='';
  Object.entries(siteGroups).forEach(([siteName,vehicles])=>{
    html+=`<div class="sec-lbl" style="padding:8px 0 4px">📍 ${siteName}</div>`;
    html+=vehicles.map(f=>`
      <div class="log-item">
        <div class="li-ico">${vIco(f.type)}</div>
        <div class="li-main">
          <div class="li-name">${f.name}</div>
          <div class="li-det">${f.type}${f.calibration?' · 📏 '+f.calibration+' L/cm':''}${f.unit&&f.unit!=='none'?' · '+f.unit.toUpperCase():''}</div>
          <div class="li-by">👤 ${f.driverName||'No driver assigned'} · ✅ ${(checklistTemplates||[]).find(t=>t.id===f.checklistTemplateId)?.name||'No checklist'}</div>
          ${f.calibration?'<span class="bdg bg-grn">Dip Ready</span>':isMach(f.type)?'<span class="bdg bg-amb">No Calib</span>':''}
        </div>
        ${isOwner()||isSup()?`<div class="li-actions">
          <button class="li-btn" title="Change Site" onclick="editFleetSite('${f.id}')">📍</button>
          <button class="li-btn" title="Assign Driver" onclick="editFleetDriver('${f.id}')">👤</button>
          <button class="li-btn" title="Assign Checklist" onclick="editFleetChecklist('${f.id}')" style="color:${f.checklistTemplateId?'var(--green)':'var(--muted)'}">✅</button>
          ${isOwner()?`<button class="li-btn" onclick="openEditModal('fleet','${f.id}')">✏️</button>
          <button class="li-btn del" onclick="delFleet('${f.id}')">🗑</button>`:''}
        </div>`:''}
      </div>`).join('');
  });
  el.innerHTML=html;
}

function editFleetChecklist(id){
  if(!isAdmin()){alert('Only Owner or Admin can assign checklists');return;}
  const f=fleet.find(x=>x.id===id);if(!f)return;
  const body=document.getElementById('edit-modal-body');
  document.getElementById('edit-modal-title').textContent='ASSIGN CHECKLIST — '+f.name;
  const tmplOpts=(checklistTemplates||[])
    .filter(t=>t.vehicleType===f.type||true) // show all templates
    .map(t=>`<option value="${t.id}" ${t.id===f.checklistTemplateId?'selected':''}>${t.name} (${t.vehicleType})</option>`)
    .join('');
  body.innerHTML=`
    <div class="f-field"><label class="f-lbl">Current Checklist</label>
      <input class="f-inp ro" value="${(checklistTemplates||[]).find(t=>t.id===f.checklistTemplateId)?.name||'None assigned'}" readonly></div>
    <div class="f-field"><label class="f-lbl">Assign Checklist Template</label>
      <select class="f-sel" id="ef-checklist">
        <option value="">No checklist</option>
        ${tmplOpts}
      </select></div>
    <div style="background:rgba(255,179,0,.07);border:1px solid var(--amber);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600;margin-top:4px">
      Daily items shown every morning.<br>Weekly items added every Wednesday.<br>Monthly items added on last Wednesday of month.
    </div>`;
  document.getElementById('edit-modal').dataset.editType='fleetChecklist';
  document.getElementById('edit-modal').dataset.fleetId=id;
  document.getElementById('edit-modal').classList.add('show');
}

// ════════════════════════════════════
// USERS
// ════════════════════════════════════
let umR='supervisor';
function selUR(r){
  umR=r;
  ['owner','admin','sup','sitesup','driver'].forEach(x=>{
    const el=document.getElementById('umr-'+x);
    if(el)el.classList.remove('on');
  });
  const map={owner:'owner',admin:'admin',supervisor:'sup',sitesup:'sitesup',driver:'driver'};
  const el=document.getElementById('umr-'+(map[r]||'sup'));
  if(el)el.classList.add('on');
}
function saveUser(){
  if(!isOwner()){alert('Only Owner can add users');return;}
  const name=document.getElementById('um-name').value.trim();
  const pin=document.getElementById('um-pin').value.trim();
  if(!name){alert('Enter name');return;}
  if(pin.length!==4||isNaN(Number(pin))){alert('PIN must be 4 digits');return;}
  if(users.find(u=>u.name.toLowerCase()===name.toLowerCase())){alert('Name already exists');return;}
  if(umR==='owner'&&!isOwner()){alert('Only Owner can create another Owner');return;}
  users.push({id:uid(),name,role:umR,pin,addedBy:sess.userId,addedByName:sess.name});
  sv('users',users);
  document.getElementById('um-name').value='';document.getElementById('um-pin').value='';
  renderUserList();flash('USER ADDED!',name+' ('+rLbl(umR)+')');
}
function delUser(id){
  if(!isOwner())return;
  const u=gU(id);
  if(u?.role==='owner'&&u.id!==sess?.userId){alert('Cannot delete another Owner account');return;}
  if(u?.id===sess?.userId){alert('Cannot delete your own account');return;}
  showConfirm('Remove user "'+u?.name+'"?',()=>{
    users=users.filter(u=>u.id!==id);sv('users',users);renderUserList();
    flash('REMOVED!',u?.name+' removed');
  });
}
function renderUserList(){
  const el=document.getElementById('um-list');
  if(!users.length){el.innerHTML='<div class="muted-txt">No users</div>';return;}
  el.innerHTML=users.map(u=>`
    <div class="log-item">
      <div class="li-ico" style="width:40px;height:40px;border-radius:50%;background:${rCol(u.role)}22;
        color:${rCol(u.role)};display:flex;align-items:center;justify-content:center;
        font-family:var(--fh);font-size:16px;flex-shrink:0">${u.name[0].toUpperCase()}</div>
      <div class="li-main">
        <div class="li-name">${u.name}</div>
        <div class="li-det" style="color:${rCol(u.role)}">${rLbl(u.role)}</div>
        <div class="li-by">PIN: ${'●'.repeat(u.pin?.length||4)}</div>
      </div>
      <div class="li-actions">
        ${isOwner()?`<button class="li-btn" onclick="editUser('${u.id}')">✏️</button>`:''}
        ${isOwner()&&u.id!==sess?.userId?`<button class="li-btn del" onclick="delUser('${u.id}')">🗑</button>`:''}
      </div>
    </div>`).join('');
}

function editUser(id){
  if(!isOwner()){alert('Only Owner can edit users');return;}
  const u=gU(id);if(!u)return;
  const body=document.getElementById('edit-modal-body');
  document.getElementById('edit-modal-title').textContent='EDIT USER — '+u.name;
  body.innerHTML=`
    <div class="f-field"><label class="f-lbl">Full Name</label>
      <input class="f-inp" id="eu-name" value="${u.name}" type="text"></div>
    <div class="f-field"><label class="f-lbl">Role</label>
      <select class="f-sel" id="eu-role">
        <option value="owner" ${u.role==='owner'?'selected':''}>👑 Owner</option>
        <option value="supervisor" ${u.role==='supervisor'?'selected':''}>🔧 Manager</option>
        <option value="sitesup" ${u.role==='sitesup'?'selected':''}>👷 Site Supervisor</option>
        <option value="admin" ${u.role==='admin'?'selected':''}>🛡 Admin</option>
      </select></div>
    <div class="f-field"><label class="f-lbl">New PIN (leave blank to keep current)</label>
      <input class="f-inp" id="eu-pin" placeholder="New 4-digit PIN or leave blank"
        type="password" inputmode="numeric" maxlength="4"></div>
    <div style="background:rgba(255,179,0,.07);border:1px solid var(--amber);border-radius:8px;
      padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600;margin-top:4px">
      Leave PIN blank to keep existing PIN unchanged.
    </div>`;
  document.getElementById('edit-modal').dataset.editType='user';
  document.getElementById('edit-modal').dataset.userId=id;
  document.getElementById('edit-modal').classList.add('show');
}

function saveUserEdit(){
  const modal=document.getElementById('edit-modal');
  const id=modal.dataset.userId;
  const idx=users.findIndex(u=>u.id===id);if(idx===-1)return;
  const name=document.getElementById('eu-name').value.trim();
  if(!name){alert('Enter name');return;}
  const pin=document.getElementById('eu-pin').value.trim();
  if(pin&&(pin.length!==4||isNaN(Number(pin)))){alert('PIN must be 4 digits or leave blank');return;}
  const role=document.getElementById('eu-role').value;
  users[idx]={...users[idx],name,role,
    pin:pin||users[idx].pin,
    editedBy:sess.userId,editedByName:sess.name,editedAt:Date.now()};
  sv('users',users);
  renderUserList();
  flash('USER UPDATED!',name);
  closeEditModal();
}

// ════════════════════════════════════
// EDIT MODAL
// ════════════════════════════════════


const pfPhotos={bill:null,before:null,after:null};

function populatePumpSelect(){
  const sel=document.getElementById('pf-pump');
  if(!sel)return;
  sel.innerHTML=!pumps.length
    ?'<option value="">No pumps added — Owner must add pumps first</option>'
    :'<option value="">Select pump...</option>'+pumps.map(p=>`<option value="${p.id}">${p.name}${p.location?' · '+p.location:''}</option>`).join('');
  sel.onchange=()=>{
    const p=pumps.find(x=>x.id===sel.value);
    if(p?.defaultRate){document.getElementById('pf-rate').value=p.defaultRate;calcPFAmt();}
  };
}
function calcPFAmt(){
  const l=parseFloat(document.getElementById('pf-litres').value)||0;
  const r=parseFloat(document.getElementById('pf-rate').value)||0;
  if(l&&r)document.getElementById('pf-amount').value=fmt(l*r,2);
}

// slot = 'bill' | 'before' | 'after'
function handlePFPhoto(slot,inp){
  const file=inp.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=e=>{
    pfPhotos[slot]=e.target.result;
    const img=document.getElementById('pf-photo-img-'+slot);
    const lbl=document.getElementById('pf-photo-lbl-'+slot);
    const btn=document.getElementById('pf-photo-btn-'+slot);
    if(img){img.src=pfPhotos[slot];img.classList.add('show');}
    if(lbl)lbl.textContent='✅ Photo saved — tap to replace';
    if(btn)btn.classList.add('hasp');
  };r.readAsDataURL(file);
}

function resetPFPhotos(){
  ['bill','before','after'].forEach(slot=>{
    pfPhotos[slot]=null;
    const img=document.getElementById('pf-photo-img-'+slot);
    const lbl=document.getElementById('pf-photo-lbl-'+slot);
    const btn=document.getElementById('pf-photo-btn-'+slot);
    if(img){img.src='';img.classList.remove('show');}
    if(lbl)lbl.textContent='Tap to take photo';
    if(btn)btn.classList.remove('hasp');
  });
}

function savePumpFill(){
  const pumpId=document.getElementById('pf-pump').value;
  const litres=parseFloat(document.getElementById('pf-litres').value)||0;
  if(!pumpId){alert('Select a pump');return;}
  if(!litres){alert('Enter litres');return;}
  const pump=pumps.find(p=>p.id===pumpId);
  const veh=gV(gf.vehicleId);
  pumpFills.push({
    id:uid(),date:today(),ts:Date.now(),
    vehicleId:gf.vehicleId,pumpId,pumpName:pump?.name||'',
    litres,
    rate:parseFloat(document.getElementById('pf-rate').value)||0,
    amount:parseFloat(document.getElementById('pf-amount').value)||0,
    paid:parseFloat(document.getElementById('pf-paid').value)||0,
    bill:document.getElementById('pf-bill').value,
    photoBill:pfPhotos.bill,
    photoBefore:pfPhotos.before,
    photoAfter:pfPhotos.after,
    operator:document.getElementById('pf-operator').value,
    loggedBy:sess.userId,loggedByName:sess.name,
  });
  sv('pumpFills',pumpFills);
  resetPFPhotos();
  flash('PUMP FILL SAVED!',fmt(litres,1)+' L → '+(veh?.name||'—')+' at '+(pump?.name||''));
  show('scr-home');
}

function savePump(){
  if(!isOwner()){alert('Only Owner can manage pumps');return;}
  const name=document.getElementById('pump-name').value.trim();
  if(!name){alert('Enter pump name');return;}
  pumps.push({
    id:uid(),name,
    location:document.getElementById('pump-loc').value,
    defaultRate:parseFloat(document.getElementById('pump-rate').value)||null,
    addedBy:sess.userId,addedByName:sess.name,
  });
  sv('pumps',pumps);
  ['pump-name','pump-loc','pump-rate'].forEach(i=>document.getElementById(i).value='');
  renderPumpLog();flash('PUMP ADDED!',name);
}
function delPump(id){
  if(!isOwner())return;
  const p=pumps.find(x=>x.id===id);
  showConfirm('Remove pump "'+p?.name+'"?',()=>{
    pumps=pumps.filter(x=>x.id!==id);sv('pumps',pumps);renderPumpLog();
    flash('REMOVED!',p?.name+' removed');
  });
}
function renderPumpLog(){
  const el=document.getElementById('pump-log');if(!el)return;
  if(!pumps.length){el.innerHTML='<div class="muted-txt">No pumps added yet</div>';return;}
  el.innerHTML=pumps.map(p=>`
    <div class="log-item">
      <div class="li-ico">🏪</div>
      <div class="li-main">
        <div class="li-name">${p.name}</div>
        <div class="li-det">${p.location||'No location'}${p.defaultRate?' · ₹'+p.defaultRate+'/L':''}</div>
        <div class="li-by">Added by ${p.addedByName||'—'}</div>
      </div>
      ${isOwner()?`<button class="li-btn del" onclick="delPump('${p.id}')">🗑</button>`:''}
    </div>`).join('');
}

// ════════════════════════════════════
// VEHICLE READINGS


// ════════════════════════════════════
function renderReadingsVehGrid(filter=''){
  const el=document.getElementById('readings-veh-grid');if(!el)return;
  if(!fleet.length){el.innerHTML='<div class="no-fleet"><div class="nf-ico">🚜</div><div class="nf-ttl">No Fleet</div><div class="nf-sub">Add vehicles first</div></div>';return;}
  const filtered = filter ? fleet.filter(f=>f.name.toLowerCase().includes(filter.toLowerCase())) : fleet;
  if(!filtered.length){el.innerHTML='<div style="padding:30px;text-align:center;color:var(--muted);font-size:14px;font-weight:600">No vehicles match your search</div>';return;}
  const recentIds = getRecentVehs();
  const recentVehs = !filter ? recentIds.map(id=>fleet.find(f=>f.id===id)).filter(Boolean) : [];
  let html = '';
  if(recentVehs.length){
    html += `<div style="padding:8px 14px 4px;font-size:10px;color:var(--amber);font-weight:700;letter-spacing:.8px;text-transform:uppercase">⚡ Recently Used</div>`;
    html += recentVehs.map(f=>{
      const lastR=[...readings].filter(r=>r.vehicleId===f.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
      return `<div class="veh-tile" onclick="openReadingEntry('${f.id}')">
        <div class="vt-ico">${vIco(f.type)}</div>
        <div style="flex:1"><div class="vt-name">${f.name}</div>
        <div class="vt-sub">${f.type} · Last: ${lastR?fmtD(lastR.date):'No entries'}</div></div>
        <div class="vt-arr">›</div></div>`;
    }).join('');
    html += `<div style="padding:8px 14px 4px;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.8px;text-transform:uppercase;border-top:1px solid var(--border);margin-top:4px">All Vehicles</div>`;
  }
  html += filtered.map(f=>{
    const lastR=[...readings].filter(r=>r.vehicleId===f.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
    return `<div class="veh-tile" onclick="openReadingEntry('${f.id}')">
      <div class="vt-ico">${vIco(f.type)}</div>
      <div style="flex:1"><div class="vt-name">${f.name}</div>
      <div class="vt-sub">${f.type} · Last: ${lastR?fmtD(lastR.date):'No entries'}</div></div>
      <div class="vt-arr">›</div></div>`;
  }).join('');
  el.innerHTML = html;
}

function filterReadingsVehGrid(q){
  renderReadingsVehGrid(q);
}

function openReadingEntry(vehId){
  const veh=gV(vehId);if(!veh)return;
  document.getElementById('re-veh-name').textContent=veh.name;
  document.getElementById('re-date').textContent=fmtD(today());
  const isMachVeh=['excavator','dozer','roller','paver','hmp','generator','tractor','other'].includes(veh.type);
  const calib=veh.calibration||null;
  let html='';
  if(isMachVeh){
    document.getElementById('re-title').textContent='DIP READINGS';
    html=`<div class="info-box info-blue" style="margin:10px 14px">Enter opening & closing dip to calculate actual fuel consumed for efficiency.</div>
    <div class="form-body">
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Opening Dip (cm)</label><input class="f-inp" id="re-open-cm" placeholder="e.g. 22" type="number" inputmode="decimal" oninput="calcDipLive('${vehId}')"></div>
        <div class="f-field"><label class="f-lbl">Opening Litres</label><input class="f-inp ro" id="re-open-L" placeholder="${calib?'Auto':'Set calib first'}" readonly></div>
      </div>
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Closing Dip (cm)</label><input class="f-inp" id="re-close-cm" placeholder="e.g. 14" type="number" inputmode="decimal" oninput="calcDipLive('${vehId}')"></div>
        <div class="f-field"><label class="f-lbl">Closing Litres</label><input class="f-inp ro" id="re-close-L" placeholder="${calib?'Auto':'Set calib first'}" readonly></div>
      </div>
      <div class="f-field"><label class="f-lbl">Hourmeter Reading (hrs)</label><input class="f-inp" id="re-hours" placeholder="e.g. 2847" type="number" inputmode="decimal"></div>
      <div class="f-field"><label class="f-lbl">Period Date</label><input class="f-inp" id="re-date-field" type="date" value="${today()}"></div>
      <div class="f-field"><label class="f-lbl">Remarks (optional)</label><input class="f-inp" id="re-remarks" placeholder="" type="text"></div>
      <button class="big-btn bb-go bb-full" style="height:58px;font-size:19px" onclick="saveReadingMach('${vehId}')">✓ SAVE READING</button>
    </div>`;
  } else {
    document.getElementById('re-title').textContent='VEHICLE READING';
    html=`<div class="info-box info-amber" style="margin:10px 14px">Enter data from your company telematics platform for this ${veh.type}.</div>
    <div class="form-body">
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Opening KM</label><input class="f-inp" id="re-open-km" placeholder="e.g. 48200" type="number" inputmode="decimal"></div>
        <div class="f-field"><label class="f-lbl">Closing KM</label><input class="f-inp" id="re-close-km" placeholder="e.g. 48650" type="number" inputmode="decimal"></div>
      </div>
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Opening Fuel %</label><input class="f-inp" id="re-open-pct" placeholder="e.g. 80" type="number" inputmode="decimal" max="100"></div>
        <div class="f-field"><label class="f-lbl">Closing Fuel %</label><input class="f-inp" id="re-close-pct" placeholder="e.g. 25" type="number" inputmode="decimal" max="100"></div>
      </div>
      <div class="f-field"><label class="f-lbl">Period</label>
        <div class="f-r2">
          <input class="f-inp" id="re-from-date" type="date" value="${today()}">
          <input class="f-inp" id="re-to-date" type="date" value="${today()}">
        </div>
      </div>
      <div class="f-field"><label class="f-lbl">Remarks (optional)</label><input class="f-inp" id="re-remarks" placeholder="" type="text"></div>
      <button class="big-btn bb-go bb-full" style="height:58px;font-size:19px" onclick="saveReadingRoad('${vehId}')">✓ SAVE READING</button>
    </div>`;
  }
  document.getElementById('re-content').innerHTML=html;
  show('scr-reading-entry');
}

function calcDipLive(vehId){
  const veh=gV(vehId);const calib=veh?.calibration||null;if(!calib)return;
  const oc=parseFloat(document.getElementById('re-open-cm')?.value);
  const cc=parseFloat(document.getElementById('re-close-cm')?.value);
  const olEl=document.getElementById('re-open-L');
  const clEl=document.getElementById('re-close-L');
  if(!isNaN(oc)&&olEl)olEl.value=fmt(oc*calib,1);
  if(!isNaN(cc)&&clEl)clEl.value=fmt(cc*calib,1);
}

function saveReadingMach(vehId){
  const veh=gV(vehId);
  const openCm=parseFloat(document.getElementById('re-open-cm')?.value)||null;
  const closeCm=parseFloat(document.getElementById('re-close-cm')?.value)||null;
  const hours=parseFloat(document.getElementById('re-hours')?.value)||null;
  const calib=veh?.calibration||null;
  const date=document.getElementById('re-date-field')?.value||today();
  readings.push({
    id:uid(),date,ts:Date.now(),vehicleId:vehId,type:'dip',
    openingCm:openCm,closingCm:closeCm,
    openingLtr:calib&&openCm!=null?openCm*calib:null,
    closingLtr:calib&&closeCm!=null?closeCm*calib:null,
    reading:hours,
    remarks:document.getElementById('re-remarks')?.value||'',
    loggedBy:sess.userId,loggedByName:sess.name,
  });
  sv('readings',readings);
  flash('READING SAVED!',veh?.name||'');
  show('scr-readings');
}

function saveReadingRoad(vehId){
  const veh=gV(vehId);
  const openKm=parseFloat(document.getElementById('re-open-km')?.value)||null;
  const closeKm=parseFloat(document.getElementById('re-close-km')?.value)||null;
  const openPct=parseFloat(document.getElementById('re-open-pct')?.value)||null;
  const closePct=parseFloat(document.getElementById('re-close-pct')?.value)||null;
  const fromDate=document.getElementById('re-from-date')?.value||today();
  const toDate=document.getElementById('re-to-date')?.value||today();
  readings.push({
    id:uid(),date:toDate,ts:Date.now(),vehicleId:vehId,type:'km',
    openingKm,closingKm:closeKm,
    openingPct,closingPct:closePct,
    reading:closeKm,fromDate,toDate,
    remarks:document.getElementById('re-remarks')?.value||'',
    loggedBy:sess.userId,loggedByName:sess.name,
  });
  sv('readings',readings);
  flash('READING SAVED!',veh?.name||'');
  show('scr-readings');
}


