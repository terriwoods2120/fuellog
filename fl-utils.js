// ════════════════════════════════════
// SAVE EDIT (readings + disbursements)
// ════════════════════════════════════

// ════════════════════════════════════
// AUDIT TRAIL
// ════════════════════════════════════
function buildAuditEntry(entryType,entryId,changes){
  return {id:uid(),ts:Date.now(),date:today(),entryType,entryId,
    changedBy:sess.userId,changedByName:sess.name,changes};
}
function saveAudit(entry){
  const audits=JSON.parse(localStorage.getItem('fl7_audits')||'[]');
  audits.push(entry);
  if(audits.length>500)audits.splice(0,audits.length-500);
  localStorage.setItem('fl7_audits',JSON.stringify(audits));
  if(fbOnline)fbSet('fuellog/audits',audits).catch(()=>{});
}
function getAudits(){return JSON.parse(localStorage.getItem('fl7_audits')||'[]');}

function saveEditMain(){
  const modal=document.getElementById('edit-modal');
  const editType=modal.dataset.editType;

  if(editType==='reading'){
    const id=modal.dataset.readingId;
    const idx=readings.findIndex(r=>r.id===id);if(idx===-1)return;
    const r=readings[idx];
    const veh=gV(r.vehicleId);
    const calib=veh?.calibration||null;
    const isMach=r.type==='dip';
    if(isMach){
      const openCm=parseFloat(document.getElementById('er-open-cm')?.value)||null;
      const closeCm=parseFloat(document.getElementById('er-close-cm')?.value)||null;
      const hours=parseFloat(document.getElementById('er-hours')?.value)||null;
      const date=document.getElementById('er-date')?.value||r.date;
      readings[idx]={...r,
        openingCm:openCm,closingCm:closeCm,
        openingLtr:calib&&openCm!=null?openCm*calib:null,
        closingLtr:calib&&closeCm!=null?closeCm*calib:null,
        reading:hours,date,
        remarks:document.getElementById('er-remarks')?.value||'',
        editedBy:sess.userId,editedByName:sess.name,editedAt:Date.now(),
      };
    } else {
      const openKm=parseFloat(document.getElementById('er-open-km')?.value)||null;
      const closeKm=parseFloat(document.getElementById('er-close-km')?.value)||null;
      const openPct=parseFloat(document.getElementById('er-open-pct')?.value)||null;
      const closePct=parseFloat(document.getElementById('er-close-pct')?.value)||null;
      readings[idx]={...r,
        openingKm:openKm,closingKm:closeKm,
        openingPct:openPct,closingPct:closePct,
        reading:closeKm,
        remarks:document.getElementById('er-remarks')?.value||'',
        editedBy:sess.userId,editedByName:sess.name,editedAt:Date.now(),
      };
    }
    sv('readings',readings);
    flash('UPDATED!','Reading updated');
    closeEditModal();
    renderReports();
  } else if(editType==='quickAssign'){
    const vid=modal.dataset.vehicleId;
    const newDrvId=document.getElementById('qa-driver')?.value||'';
    if(!newDrvId){alert('Select a driver');return;}
    const permanent=document.getElementById('qa-permanent')?.checked;
    if(permanent){
      const idx=fleet.findIndex(x=>x.id===vid);
      if(idx>=0){const drv=drivers.find(d=>d.id===newDrvId);fleet[idx]={...fleet[idx],driverId:newDrvId,driverName:drv?.name||null};}
      sv('fleet',fleet);
    }
    closeEditModal();
    markMuster(vid,'present',newDrvId);
  } else if(editType==='swapDriver'){
    const vid=modal.dataset.vehicleId;
    const td=today();
    const swInp=document.getElementById('sw-driver-inp')?.value?.trim()||'';
    const newDrvId=drivers.find(d=>d.name.toLowerCase()===swInp.toLowerCase())?.id||'';
    const newDrv=drivers?.find(d=>d.id===newDrvId);
    const reason=document.getElementById('sw-reason')?.value||'';
    const f=fleet.find(x=>x.id===vid);
    const idx=musters.findIndex(x=>x.vehicleId===vid&&x.date===td);
    const entry={id:idx>=0?musters[idx].id:uid(),date:td,vehicleId:vid,
      driverId:newDrvId||null,driverName:newDrv?.name||null,status:'present',swap:true,
      swapReason:reason,markedBy:sess.userId,markedByName:sess.name,ts:Date.now()};
    if(idx>=0)musters[idx]=entry;else musters.push(entry);
    sv('musters',musters);renderMuster();renderHome();
    flash('DRIVER SWAPPED!',f?.name+' → '+(newDrv?.name||'?'));
    closeEditModal();
  } else if(editType==='fleetDriver'){
    const fid=modal.dataset.fleetId;
    const idx=fleet.findIndex(f=>f.id===fid);if(idx===-1)return;
    const newDrvId=document.getElementById('ef-driver')?.value||'';
    const newDrv=drivers?.find(d=>d.id===newDrvId);
    fleet[idx]={...fleet[idx],driverId:newDrvId||null,driverName:newDrv?.name||null};
    sv('fleet',fleet);renderFleetLog();
    flash('DRIVER ASSIGNED!',fleet[idx].name+' → '+(newDrv?.name||'Unassigned'));
    closeEditModal();
  } else if(editType==='fleetSite'){
    const fid=modal.dataset.fleetId;
    const idx=fleet.findIndex(f=>f.id===fid);if(idx===-1)return;
    const newSiteId=document.getElementById('ef-site')?.value||'';
    const newSite=sites?.find(s=>s.id===newSiteId);
    const reason=document.getElementById('ef-reason')?.value||'';
    const history=fleet[idx].siteHistory||[];
    history.push({from:fleet[idx].siteName||'Mobile',to:newSite?.name||'Mobile',date:today(),by:sess.name,reason});
    fleet[idx]={...fleet[idx],siteId:newSiteId||null,siteName:newSite?.name||'Mobile',siteHistory:history};
    sv('fleet',fleet);renderFleetLog();
    flash('SITE UPDATED!',fleet[idx].name+' → '+(newSite?.name||'Mobile'));
    closeEditModal();
  } else if(editType==='fleet'){
    const fid=modal.dataset.fleetId;
    const idx=fleet.findIndex(f=>f.id===fid);if(idx===-1)return;
    const name=document.getElementById('ed-fn').value.trim();if(!name){alert('Enter name');return;}
    const t=document.getElementById('ed-ft').value;
    const newSiteId=document.getElementById('ed-fsite')?.value||'';
    const newSite=sites?.find(s=>s.id===newSiteId);
    const calibEl=document.getElementById('ed-fc');
    fleet[idx]={...fleet[idx],name,type:t,siteId:newSiteId||null,siteName:newSite?.name||'Mobile',
      calibration:isMach(t)&&calibEl?parseFloat(calibEl.value)||null:null,
      tank:parseFloat(document.getElementById('ed-ftank').value)||fleet[idx].tank,
      expected:parseFloat(document.getElementById('ed-feff').value)||fleet[idx].expected};
    sv('fleet',fleet);renderFleetLog();flash('UPDATED!',name+' updated');closeEditModal();
  } else if(editType==='purchase'){
    const idx=purchases.findIndex(p=>p.id===editCtx.id);if(idx===-1)return;
    const orig=purchases[idx];
    const vendor=document.getElementById('ed-vendor').value;
    const litres=parseFloat(document.getElementById('ed-pL').value)||0;
    const rate=parseFloat(document.getElementById('ed-pr').value)||0;
    const amount=parseFloat(document.getElementById('ed-pa').value)||0;
    const paid=parseFloat(document.getElementById('ed-pp').value)||0;
    const bill=document.getElementById('ed-pb').value;
    const changes=[];
    if(vendor!==orig.vendor)changes.push({field:'Vendor',oldVal:orig.vendor||'',newVal:vendor});
    if(litres!==orig.litres)changes.push({field:'Litres',oldVal:orig.litres,newVal:litres});
    if(rate!==orig.rate)changes.push({field:'Rate',oldVal:orig.rate,newVal:rate});
    if(amount!==orig.amount)changes.push({field:'Amount',oldVal:orig.amount,newVal:amount});
    if(paid!==orig.paid)changes.push({field:'Paid',oldVal:orig.paid,newVal:paid});
    if(bill!==orig.bill)changes.push({field:'Bill No',oldVal:orig.bill||'',newVal:bill});
    purchases[idx]={...orig,vendor,litres,rate,amount,paid,bill,
      editedBy:sess.userId,editedByName:sess.name,editedAt:Date.now()};
    if(changes.length)saveAudit(buildAuditEntry('purchase',editCtx.id,changes));
    sv('purchases',purchases);renderPurchases();flash('UPDATED!','Purchase updated');closeEditModal();
  } else if(editType==='disb'){
    const disbId=modal.dataset.disbId;
    const idx=disbs.findIndex(d=>d.id===disbId);if(idx===-1)return;
    const orig=disbs[idx];
    const mb=parseFloat(document.getElementById('ed-mb').value)||orig.meterBefore;
    const ma=parseFloat(document.getElementById('ed-ma').value)||orig.meterAfter;
    const L=parseFloat(document.getElementById('ed-L').value)||orig.litres;
    const op=document.getElementById('ed-op').value;
    const rem=document.getElementById('ed-rem').value;
    const mDiff=ma-mb;
    const changes=[];
    if(mb!==orig.meterBefore)changes.push({field:'Meter Before',oldVal:orig.meterBefore,newVal:mb});
    if(ma!==orig.meterAfter)changes.push({field:'Meter After',oldVal:orig.meterAfter,newVal:ma});
    if(L!==orig.litres)changes.push({field:'Litres',oldVal:orig.litres,newVal:L});
    if(op!==orig.operator)changes.push({field:'Operator',oldVal:orig.operator||'',newVal:op});
    if(rem!==orig.remarks)changes.push({field:'Remarks',oldVal:orig.remarks||'',newVal:rem});
    disbs[idx]={...orig,meterBefore:mb,meterAfter:ma,meterDiff:mDiff,litres:L,
      meterMismatch:mDiff<0||Math.abs(mDiff-L)>1,operator:op,remarks:rem,
      editedBy:sess.userId,editedByName:sess.name,editedAt:Date.now()};
    if(changes.length)saveAudit(buildAuditEntry('disb',disbId,changes));
    sv('disbs',disbs);flash('UPDATED!','Disbursement updated');closeEditModal();
  } else {
    closeEditModal();
  }
}


// ════════════════════════════════════
// ATTENDANCE REPORT
// ════════════════════════════════════
function renderAttendanceReport(){
  const el=document.getElementById('attendance-report');if(!el)return;
  const td=today();
  if(!fleet.length){el.innerHTML='';return;}

  const present=[];const absent=[];const unmarked=[];
  fleet.forEach(f=>{
    const m=musters?.find(x=>x.vehicleId===f.id&&x.date===td);
    const drvId=m?.driverId||f.driverId;
    const drv=drivers?.find(d=>d.id===drvId);
    const site=f.siteName||'Mobile';
    const entry={f,m,drv,site};
    if(!m)unmarked.push(entry);
    else if(m.status==='present')present.push(entry);
    else absent.push(entry);
  });

  const total=fleet.length;
  if(!total){el.innerHTML='';return;}

  const rowHtml=(entries,ico,col)=>entries.map(({f,m,drv,site})=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid var(--border)">
      <div style="font-size:18px">${vIco(f.type)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--fh);font-size:14px;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
        <div style="font-size:10px;color:var(--muted);font-weight:600;margin-top:1px">
          👤 ${drv?.name||'<span style="color:var(--amber)">Unassigned</span>'} · 📍 ${site}
          ${m?.swap?'<span style="color:var(--amber)"> · 🔄 Swap</span>':''}
        </div>
      </div>
      <div style="font-size:12px;color:${col};font-weight:700;flex-shrink:0">${ico}</div>
    </div>`).join('');

  el.innerHTML=`<div class="rep-card" style="margin-top:10px">
    <div class="rep-hd" style="justify-content:space-between">
      <span>📋 Today's Attendance</span>
      <span style="font-size:11px;color:var(--muted)">${new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:var(--border);gap:1px;border-bottom:1px solid var(--border)">
      <div style="background:var(--bg2);padding:10px;text-align:center">
        <div style="font-family:var(--fh);font-size:22px;color:var(--green)">${present.length}</div>
        <div style="font-size:9px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:2px">Present</div>
      </div>
      <div style="background:var(--bg2);padding:10px;text-align:center">
        <div style="font-family:var(--fh);font-size:22px;color:var(--red)">${absent.length}</div>
        <div style="font-size:9px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:2px">Absent</div>
      </div>
      <div style="background:var(--bg2);padding:10px;text-align:center">
        <div style="font-family:var(--fh);font-size:22px;color:var(--muted)">${unmarked.length}</div>
        <div style="font-size:9px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:2px">Unmarked</div>
      </div>
    </div>
    ${present.length?rowHtml(present,'✅ PRESENT','var(--green)'):''}
    ${absent.length?rowHtml(absent,'❌ ABSENT','var(--red)'):''}
    ${unmarked.length?rowHtml(unmarked,'⏳ —','var(--muted)'):''}
  </div>`;
}

// ════════════════════════════════════
// CONFIRM DIALOG
// ════════════════════════════════════


let _confirmCB=null;
function showConfirm(msg,cb,icon='🗑',btnLabel='DELETE'){
  document.getElementById('confirm-icon').textContent=icon;
  document.getElementById('confirm-msg').textContent=msg;
  document.getElementById('confirm-ok-btn').textContent=btnLabel;
  _confirmCB=cb;
  document.getElementById('confirm-overlay').classList.add('show');
}
function closeConfirm(){
  document.getElementById('confirm-overlay').classList.remove('show');
  _confirmCB=null;
}
document.getElementById('confirm-ok-btn').onclick=()=>{const cb=_confirmCB;closeConfirm();if(cb)cb();};
document.getElementById('confirm-overlay').onclick=function(e){if(e.target===this)closeConfirm();};
document.getElementById('edit-modal').onclick=function(e){if(e.target===this)closeEditModal();};

// ════════════════════════════════════
// SUCCESS FLASH
// ════════════════════════════════════
function flash(t,s){
  document.getElementById('sov-t').textContent=t;
  document.getElementById('sov-s').textContent=s;
  const o=document.getElementById('sov');
  o.classList.add('show');
  setTimeout(()=>o.classList.remove('show'),1500);
}
function toggleOpt(id){document.getElementById(id).classList.toggle('open');}

// ════════════════════════════════════
// SITES
// ════════════════════════════════════
let siteType='site';
function selSiteType(t){
  siteType=t;
  ['site','unit','mobile'].forEach(x=>document.getElementById('site-type-'+x).classList.toggle('on',x===t));
}
function saveSite(){
  if(!isOwner()){alert('Only Owner can manage sites');return;}
  const name=document.getElementById('site-name').value.trim();
  if(!name){alert('Enter site name');return;}
  sites.push({id:uid(),name,location:document.getElementById('site-loc').value,type:siteType,active:true,addedBy:sess.userId,addedByName:sess.name});
  sv('sites',sites);
  ['site-name','site-loc'].forEach(i=>document.getElementById(i).value='');
  renderSitesLog();flash('SITE ADDED!',name);
}
function delSite(id){
  if(!isOwner())return;
  const s=sites.find(x=>x.id===id);
  showConfirm('Remove site "'+s?.name+'"?',()=>{
    sites=sites.filter(x=>x.id!==id);sv('sites',sites);renderSitesLog();flash('REMOVED!',s?.name);
  });
}
function renderSitesLog(){
  const el=document.getElementById('sites-log');if(!el)return;
  if(!sites.length){el.innerHTML='<div class="muted-txt">No sites added yet</div>';return;}
  const typeIco={site:'🏗',unit:'🏭',mobile:'🚛'};
  el.innerHTML=sites.map(s=>`
    <div class="log-item">
      <div class="li-ico">${typeIco[s.type]||'🏗'}</div>
      <div class="li-main">
        <div class="li-name">${s.name}</div>
        <div class="li-det">${s.location||'No location'} · ${s.type}</div>
        <div class="li-by">Added by ${s.addedByName||'—'}</div>
      </div>
      ${isOwner()?`<button class="li-btn del" onclick="delSite('${s.id}')">🗑</button>`:''}
    </div>`).join('');
}

// ════════════════════════════════════
// DRIVERS
// ════════════════════════════════════
let driverType='driver';
function selDriverType(t){
  driverType=t;
  ['driver','operator','both'].forEach(x=>document.getElementById('drv-type-'+x).classList.toggle('on',x===t));
}
function saveDriver(){
  if(!isOwner()&&!isSup()){alert('Only Owner or Manager can add drivers');return;}
  const name=document.getElementById('drv-name').value.trim();
  if(!name){alert('Enter name');return;}
  const pin=document.getElementById('drv-pin').value.trim();
  if(pin&&(pin.length!==4||isNaN(Number(pin)))){alert('PIN must be 4 digits or leave blank');return;}
  if(drivers.find(d=>d.name.toLowerCase()===name.toLowerCase())){alert('Name already exists');return;}
  drivers.push({id:uid(),name,type:driverType,
    phone:document.getElementById('drv-phone').value.trim(),
    pin:pin||null,active:true,addedBy:sess.userId,addedByName:sess.name});
  sv('drivers',drivers);
  ['drv-name','drv-phone','drv-pin'].forEach(i=>document.getElementById(i).value='');
  renderDriverList();flash('DRIVER ADDED!',name);
}
function editDriver(id){
  if(!isAdmin()){alert('Only Owner or Admin can edit drivers');return;}
  const d=drivers.find(x=>x.id===id);if(!d)return;
  const body=document.getElementById('edit-modal-body');
  document.getElementById('edit-modal-title').textContent='EDIT DRIVER — '+d.name;
  body.innerHTML=`
    <div class="f-field"><label class="f-lbl">Full Name</label>
      <input class="f-inp" id="ed-drv-name" value="${d.name}" type="text"></div>
    <div class="f-field"><label class="f-lbl">Type</label>
      <div class="sel-row">
        <div class="sopt ${d.type==='driver'?'on':''}" id="ed-drv-t-driver" onclick="edSelDrvType('driver')">🚚 Driver</div>
        <div class="sopt ${d.type==='operator'?'on':''}" id="ed-drv-t-operator" onclick="edSelDrvType('operator')">⚙️ Operator</div>
        <div class="sopt ${d.type==='both'?'on':''}" id="ed-drv-t-both" onclick="edSelDrvType('both')">👷 Both</div>
      </div></div>
    <div class="f-field"><label class="f-lbl">Phone</label>
      <input class="f-inp" id="ed-drv-phone" value="${d.phone||''}" type="tel" inputmode="numeric"></div>
    <div class="f-field"><label class="f-lbl">PIN (4 digits — leave blank to keep current)</label>
      <input class="f-inp" id="ed-drv-pin" placeholder="New PIN or leave blank" type="password" inputmode="numeric" maxlength="4"></div>`;
  document.getElementById('edit-modal').dataset.editType='driver';
  document.getElementById('edit-modal').dataset.driverId=id;
  document.getElementById('edit-modal').classList.add('show');
}
let edDrvType='driver';
function edSelDrvType(t){
  edDrvType=t;
  ['driver','operator','both'].forEach(x=>document.getElementById('ed-drv-t-'+x)?.classList.toggle('on',x===t));
}
function saveDriverEdit(){
  const modal=document.getElementById('edit-modal');
  const id=modal.dataset.driverId;
  const idx=drivers.findIndex(d=>d.id===id);if(idx===-1)return;
  const name=document.getElementById('ed-drv-name').value.trim();
  if(!name){alert('Enter name');return;}
  const pin=document.getElementById('ed-drv-pin').value.trim();
  if(pin&&(pin.length!==4||isNaN(Number(pin)))){alert('PIN must be 4 digits or leave blank');return;}
  drivers[idx]={...drivers[idx],
    name,
    type:edDrvType||drivers[idx].type,
    phone:document.getElementById('ed-drv-phone').value.trim(),
    pin:pin||drivers[idx].pin,
    editedBy:sess.userId,editedByName:sess.name,editedAt:Date.now()
  };
  sv('drivers',drivers);
  renderDriverList();
  flash('UPDATED!',name);
  closeEditModal();
}
function delDriver(id){
  if(!isOwner())return;
  const d=drivers.find(x=>x.id===id);
  showConfirm('Remove "'+d?.name+'"?',()=>{
    drivers=drivers.filter(x=>x.id!==id);sv('drivers',drivers);renderDriverList();flash('REMOVED!',d?.name);
  });
}
function renderDriverList(){
  const el=document.getElementById('driver-log');if(!el)return;
  if(!drivers.length){el.innerHTML='<div class="muted-txt">No drivers added yet</div>';return;}
  const typeIco={driver:'🚚',operator:'⚙️',both:'👷'};
  const typeLbl={driver:'Driver',operator:'Operator',both:'Driver & Operator'};
  el.innerHTML=drivers.map(d=>`
    <div class="log-item">
      <div class="li-ico">${typeIco[d.type]||'👷'}</div>
      <div class="li-main">
        <div class="li-name">${d.name}</div>
        <div class="li-det">${typeLbl[d.type]||d.type}${d.phone?' · 📞 '+d.phone:''}</div>
        <div class="li-by">PIN: ${d.pin?'●●●●':'Not set'} · Added by ${d.addedByName||'—'}</div>
      </div>
      <div class="li-actions">
        ${isAdmin()?`<button class="li-btn" onclick="editDriver('${d.id}')">✏️</button>`:''}
        ${isOwner()?`<button class="li-btn del" onclick="delDriver('${d.id}')">🗑</button>`:''}
      </div>
    </div>`).join('');
}

// ════════════════════════════════════
// MORNING MUSTER
// ════════════════════════════════════
function renderMuster(){
  const el=document.getElementById('muster-list');if(!el)return;
  const td=today();
  if(!fleet.length){el.innerHTML='<div class="muted-txt">No fleet added yet</div>';return;}
  el.innerHTML=fleet.map(f=>{
    const m=musters.find(x=>x.vehicleId===f.id&&x.date===td)||null;
    const assignedDriver=drivers.find(d=>d.id===f.driverId);
    const todayDriverId=m?.driverId||f.driverId;
    const todayDriver=drivers.find(d=>d.id===todayDriverId);
    const status=m?.status||'pending';
    const statusCol=status==='present'?'var(--green)':status==='absent'?'var(--red)':'var(--muted)';
    const statusLbl=status==='present'?'✅ Present · '+(todayDriver?.name||'?'):status==='absent'?'❌ Absent':'⏳ Not marked';
    const hasDriver=!!(f.driverId);
    const driverPickerHtml=!hasDriver&&drivers.length?`
      <div style="margin-top:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <input list="drv-list-${f.id}" id="drv-pick-${f.id}" placeholder="Type or pick driver…"
          style="flex:1;min-width:140px;background:var(--bg3);border:2px solid var(--amber);color:var(--white);padding:8px 10px;border-radius:8px;font-size:13px;font-family:var(--fb)">
        <datalist id="drv-list-${f.id}">
          ${drivers.map(d=>`<option value="${d.name}">${d.name} · ${d.type}</option>`).join('')}
        </datalist>
        <label style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);font-weight:600;white-space:nowrap">
          <input type="checkbox" id="drv-perm-${f.id}" style="width:15px;height:15px"> Set permanent
        </label>
      </div>`:!hasDriver?`<div style="font-size:10px;color:var(--muted);margin-top:6px">No drivers in system yet</div>`:'';
    return `<div class="log-item" style="flex-direction:column;gap:8px;align-items:stretch">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <div class="li-ico" style="margin-top:2px;flex-shrink:0">${vIco(f.type)}</div>
        <div class="li-main" style="flex:1;min-width:0">
          <div class="li-name">${f.name}</div>
          <div class="li-det" style="color:${statusCol}">${statusLbl}</div>
          <div class="li-by">📍 ${f.siteName||'Mobile'} · 👤 ${assignedDriver?.name||'<span style="color:var(--amber)">Unassigned</span>'}</div>
          ${driverPickerHtml}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button style="flex:1;height:40px;background:rgba(0,200,83,.15);color:var(--green);border:2px solid var(--green);border-radius:8px;font-family:var(--fh);font-size:13px;cursor:pointer"
          onclick="markPresentInline('${f.id}')">✅ PRESENT</button>
        <button style="flex:1;height:40px;background:rgba(255,61,61,.12);color:var(--red);border:2px solid var(--red);border-radius:8px;font-family:var(--fh);font-size:13px;cursor:pointer"
          onclick="markMuster('${f.id}','absent',null)">❌ ABSENT</button>
        <button style="flex:1;height:40px;background:rgba(255,179,0,.12);color:var(--amber);border:2px solid var(--amber);border-radius:8px;font-family:var(--fh);font-size:13px;cursor:pointer"
          onclick="openSwapDriver('${f.id}')">🔄 SWAP</button>
      </div>
    </div>`;
  }).join('');
}

function markPresentInline(vehicleId){
  const f=fleet.find(x=>x.id===vehicleId);if(!f)return;
  if(!f.driverId){
    const inp=document.getElementById('drv-pick-'+vehicleId);
    const typedName=inp?.value.trim();
    if(!typedName){alert('Please select or type a driver name first.');inp?.focus();return;}
    const drv=drivers.find(d=>d.name.toLowerCase()===typedName.toLowerCase());
    if(!drv){alert('Driver "'+typedName+'" not found. Please select from the list.');inp?.focus();return;}
    const permanent=document.getElementById('drv-perm-'+vehicleId)?.checked;
    if(permanent){
      const idx=fleet.findIndex(x=>x.id===vehicleId);
      if(idx>=0){fleet[idx]={...fleet[idx],driverId:drv.id,driverName:drv.name};}
      sv('fleet',fleet);
    }
    markMuster(vehicleId,'present',drv.id);return;
  }
  markMuster(vehicleId,'present',f.driverId);
}

function markMuster(vehicleId,status,driverId){
  const td=today();
  const f=fleet.find(x=>x.id===vehicleId);
  const drv=drivers.find(d=>d.id===driverId);
  const idx=musters.findIndex(x=>x.vehicleId===vehicleId&&x.date===td);
  const entry={id:idx>=0?musters[idx].id:uid(),date:td,vehicleId,
    driverId:driverId||null,driverName:drv?.name||null,status,
    markedBy:sess.userId,markedByName:sess.name,ts:Date.now()};
  if(idx>=0)musters[idx]=entry;else musters.push(entry);
  sv('musters',musters);renderMuster();renderHome();
  flash(status==='present'?'✅ PRESENT!':'❌ ABSENT',f?.name+(drv?' · '+drv.name:''));
}

function openSwapDriver(vehicleId){
  const f=fleet.find(x=>x.id===vehicleId);if(!f)return;
  const body=document.getElementById('edit-modal-body');
  document.getElementById('edit-modal-title').textContent='SWAP DRIVER — '+f.name;
  body.innerHTML=`
    <div class="f-field"><label class="f-lbl">Assigned Driver</label>
      <input class="f-inp ro" value="${drivers.find(d=>d.id===f.driverId)?.name||'Unassigned'}" readonly></div>
    <div class="f-field"><label class="f-lbl">Today's Driver (temporary)</label>
      <input list="swap-drv-list" id="sw-driver-inp" placeholder="Type or pick driver…" class="f-inp">
      <datalist id="swap-drv-list">
        ${drivers.map(d=>`<option value="${d.name}">${d.name} · ${d.type}</option>`).join('')}
      </datalist></div>
    <div class="f-field"><label class="f-lbl">Reason (optional)</label>
      <input class="f-inp" id="sw-reason" placeholder="e.g. Regular driver on leave" type="text"></div>`;
  document.getElementById('edit-modal').dataset.editType='swapDriver';
  document.getElementById('edit-modal').dataset.vehicleId=vehicleId;
  document.getElementById('edit-modal').classList.add('show');
}

function getSwapDriverId(){
  const name=document.getElementById('sw-driver-inp')?.value.trim();
  return drivers.find(d=>d.name.toLowerCase()===name?.toLowerCase())?.id||null;
}

// ════════════════════════════════════
// INIT — moved to after Firebase declarations below
// ════════════════════════════════════

