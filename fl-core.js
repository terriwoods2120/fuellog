
'use strict';

// ════════════════════════════════════
// STORAGE
// ════════════════════════════════════
const SK={users:'fl7_users',fleet:'fl7_fleet',disbs:'fl7_disbs',readings:'fl7_readings',purchases:'fl7_purchases',pumps:'fl7_pumps',pumpFills:'fl7_pumpFills',sites:'fl7_sites',drivers:'fl7_drivers',musters:'fl7_musters',checklistTemplates:'fl7_clTemplates',checklistRecords:'fl7_clRecords'};
const ld=k=>{try{return JSON.parse(localStorage.getItem(SK[k])||'[]')}catch{return[]}};
const sv=(k,v)=>localStorage.setItem(SK[k],JSON.stringify(v));
let users=ld('users'),fleet=ld('fleet'),disbs=ld('disbs'),readings=ld('readings'),purchases=ld('purchases'),pumps=ld('pumps'),pumpFills=ld('pumpFills'),sites=ld('sites'),drivers=ld('drivers'),musters=ld('musters'),checklistTemplates=ld('checklistTemplates'),checklistRecords=ld('checklistRecords');


// Bowser stock = total purchased into bowser minus total dispensed from bowser
function getBowserStock(){
  const purchased=purchases.reduce((a,p)=>a+p.litres,0);
  const dispensed=disbs.filter(d=>d.source==='bowser'||d.source==='can').reduce((a,d)=>a+d.litres,0);
  return purchased-dispensed;
}

// ════════════════════════════════════
// SESSION
// ════════════════════════════════════
let sess=null;
const isOwner=  ()=>sess?.role==='owner';
const isAdmin=  ()=>sess?.role==='admin'||isOwner();
const isManager=()=>sess?.role==='supervisor'||isAdmin();
const isSiteSup=()=>sess?.role==='sitesup';
const isDriver= ()=>sess?.role==='driver';
const isSup=    ()=>isManager();
const canAdd=   ()=>isManager()||isSiteSup();
const canEdit=  ()=>isManager()||isAdmin();
const canDelete=()=>isOwner();
const canEditEntry=e=>canEdit()&&(isAdmin()||e.loggedBy===sess?.userId&&e.date===today());
const canDelEntry= ()=>canDelete();
const canSettings= ()=>isAdmin();

// ════════════════════════════════════
// HELPERS
// ════════════════════════════════════
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const today=()=>new Date().toISOString().slice(0,10);
const fmt=(n,d=1)=>(parseFloat(n)||0).toFixed(d);
const fmtD=d=>{if(!d)return'—';const p=d.split('-');return`${p[2]}/${p[1]}/${p[0].slice(2)}`};
const gV=id=>fleet.find(f=>f.id===id);
const gU=id=>users.find(u=>u.id===id);
const isMach=t=>['excavator','dozer','roller','paver','hmp','generator','tractor','other'].includes(t);
const vIco=t=>({dumper:'🚚',truck:'🚛','transit-mixer':'🌀',excavator:'⚙️',dozer:'🚜',roller:'🔃',paver:'🛣️',hmp:'🏭',generator:'⚡',tractor:'🚜',other:'🔧'}[t]||'🚗');
const rCol=r=>({owner:'var(--amber)',admin:'var(--amber)',supervisor:'var(--blue)',sitesup:'var(--purple)',driver:'var(--green)'}[r]||'var(--muted)');
const rBdg=r=>({owner:'bg-amb',admin:'bg-amb',supervisor:'bg-blu',sitesup:'bg-pur',driver:'bg-grn'}[r]||'bg-grn');
const rLbl=r=>({owner:'👑 OWNER',admin:'🛡 ADMIN',supervisor:'🔧 MANAGER',sitesup:'👷 SITE SUP',driver:'🚜 DRIVER/OP'}[r]||r);

// ════════════════════════════════════
// NAVIGATION — simple show/hide
// ════════════════════════════════════
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('show'));
  const el=document.getElementById(id);
  if(el){el.classList.add('show');el.scrollTop=0;}
  onEnter(id);
}
function onEnter(id){
  if(id==='scr-home')      renderHome();
  if(id==='scr-fleet')     renderFleetLog();
  if(id==='scr-users')     renderUserList();
  if(id==='scr-pumps')     renderPumpLog();
  if(id==='scr-sites')     renderSitesLog();
  if(id==='scr-drivers')   renderDriverList();
  if(id==='scr-muster'){const el=document.getElementById('muster-date');if(el)el.textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});renderMuster();}
  if(id==='scr-readings')  {const s=document.getElementById('readings-veh-search');if(s)s.value='';renderReadingsVehGrid();}
  if(id==='scr-purchases') {renderPurchases();document.getElementById('pur-by').value=sess?.name||'';}
  if(id==='scr-reports'){renderReports();renderAuditTrail();}
  if(id==='scr-pending')   renderPendingList();
}

// ════════════════════════════════════
// NUMPAD
// ════════════════════════════════════
const NP={};
function buildNP(key,gridId,dispId,opts={}){
  const max=opts.max||7;
  let val='0';
  const upd=()=>{
    const el=document.getElementById(dispId);
    if(el)el.textContent=val;
    if(opts.onChange)opts.onChange(parseFloat(val)||0);
  };
  document.getElementById(gridId).innerHTML=
    ['7','8','9','4','5','6','1','2','3','CLR','0','.','⌫']
    .map(k=>`<div class="nk ${k==='CLR'?'nclr':k==='⌫'?'ndel':''}" onclick="NP['${key}'].tap('${k}')">${k}</div>`)
    .join('');
  NP[key]={
    tap(k){
      if(k==='CLR')val='0';
      else if(k==='⌫')val=val.length>1?val.slice(0,-1):'0';
      else if(k==='.'){if(!val.includes('.'))val+='.'}
      else{if(val==='0')val=k;else if(val.length<max)val+=k;}
      upd();
    },
    get(){return parseFloat(val)||0;},
    reset(){val='0';upd();}
  };
  upd();
}

// ════════════════════════════════════
// LOGIN / PIN
// ════════════════════════════════════

// ════════════════════════════════════
// DRIVER LOGIN
// ════════════════════════════════════
let driverPinBuf='';
function showDriverLogin(){
  const form=document.getElementById('driver-login-form');
  if(!form)return;
  const isHidden=form.style.display==='none';
  form.style.display=isHidden?'block':'none';
  if(isHidden){
    driverPinBuf='';
    const nameInp=document.getElementById('driver-login-name');
    if(nameInp)nameInp.value='';
    const selName=document.getElementById('driver-selected-name');
    if(selName)selName.style.display='none';
    const pinSec=document.getElementById('driver-pin-section');
    if(pinSec)pinSec.style.display='none';
    const pinErr=document.getElementById('driver-pin-err');
    if(pinErr)pinErr.textContent='';
    buildDriverPinGrid();
    // Show all drivers immediately
    setTimeout(()=>filterDriverNames(''), 50);
  }
}
function showDriverNames(){
  filterDriverNames(document.getElementById('driver-login-name')?.value||'');
}
function filterDriverNames(q){
  const dd=document.getElementById('driver-name-dropdown');if(!dd)return;
  const inp2=document.getElementById('driver-login-name');
  const filtered=(drivers||[]).filter(d=>!q||d.name.toLowerCase().includes(q.toLowerCase()));
  if(!filtered.length){
    dd.style.display='block';
    dd.innerHTML='<div style="padding:12px 14px;color:var(--muted);font-size:13px">No match found</div>';
    if(inp2)inp2.style.borderRadius='10px 10px 0 0';
    return;
  }
  dd.style.display='block';
  if(inp2)inp2.style.borderRadius='10px 10px 0 0';
  dd.innerHTML=filtered.map(d=>`
    <div onclick="selectDriverName('${d.id}','${d.name.replace(/'/g,"\'")}')"
      style="padding:12px 14px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;align-items:center;gap:10px"
      onmouseover="this.style.background='rgba(255,179,0,.1)'" onmouseout="this.style.background=''">
      <div style="font-size:20px">🚜</div>
      <div>
        <div style="font-family:var(--fh);font-size:15px;color:var(--white)">${d.name}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600">${d.type}</div>
      </div>
    </div>`).join('');
}
function selectDriverName(id,name){
  document.getElementById('driver-login-name').value=name;
  const ddEl=document.getElementById('driver-name-dropdown');if(ddEl)ddEl.style.display='none';
  const inpEl=document.getElementById('driver-login-name');if(inpEl)inpEl.style.borderRadius='10px';
  document.getElementById('driver-selected-name').style.display='block';
  document.getElementById('driver-selected-name').textContent='✓ '+name;
  document.getElementById('driver-pin-section').style.display='block';
  document.getElementById('driver-pin-err').textContent='';
  driverPinBuf='';
  for(let i=0;i<4;i++){const d=document.getElementById('dpd'+i);if(d)d.style.background='var(--border2)';}
}
// Hide dropdown when clicking outside
document.addEventListener('click',function(e){
  const dd=document.getElementById('driver-name-dropdown');
  const inp=document.getElementById('driver-login-name');
  if(dd&&inp&&!dd.contains(e.target)&&e.target!==inp)dd.style.display='none';
});
function buildDriverPinGrid(){
  const grid=document.getElementById('driver-pin-grid');if(!grid)return;
  driverPinBuf='';
  grid.innerHTML=['7','8','9','4','5','6','1','2','3','CLR','0','⌫'].map(k=>
    `<div onclick="driverPk('${k}')" style="height:52px;background:var(--bg3);border:2px solid var(--border2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-size:20px;color:var(--white);cursor:pointer;user-select:none">${k}</div>`
  ).join('');
}
function driverPk(k){
  if(driverPinBuf.length>=4&&k!=='CLR'&&k!=='⌫')return;
  if(k==='CLR')driverPinBuf='';
  else if(k==='⌫')driverPinBuf=driverPinBuf.slice(0,-1);
  else driverPinBuf+=k;
  // Update dots
  for(let i=0;i<4;i++){
    const d=document.getElementById('dpd'+i);
    if(d)d.style.background=i<driverPinBuf.length?'var(--amber)':'var(--border2)';
  }
  if(driverPinBuf.length===4)setTimeout(checkDriverPin,150);
}
function checkDriverPin(){
  const name=document.getElementById('driver-login-name')?.value.trim();
  if(!name){document.getElementById('driver-pin-err').textContent='Enter your name first';driverPinBuf='';buildDriverPinGrid();return;}
  const drv=(drivers||[]).find(d=>d.name.toLowerCase()===name.toLowerCase());
  if(!drv){document.getElementById('driver-pin-err').textContent='Name not found';driverPinBuf='';buildDriverPinGrid();return;}
  if(!drv.pin){document.getElementById('driver-pin-err').textContent='No PIN set — ask your manager';driverPinBuf='';buildDriverPinGrid();return;}
  if(driverPinBuf===drv.pin){
    sess={userId:drv.id,name:drv.name,role:'driver'};
    show('scr-home');
  } else {
    document.getElementById('driver-pin-err').textContent='Wrong PIN — try again';
    driverPinBuf='';buildDriverPinGrid();
  }
}

let activeLoginRole=null;

function initLogin(){
  document.getElementById('login-dt').textContent=
    new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  // Only show first-setup if Firebase confirmed no users exist
  if(!users.length && fbOnline){
    document.getElementById('first-setup').style.display='block';
    document.getElementById('user-grid').innerHTML='';
    return;
  }
  // If Firebase not yet online and no local users, show loading message not setup screen
  if(!users.length && !fbOnline){
    document.getElementById('first-setup').style.display='none';
    document.getElementById('user-grid').innerHTML=`
      <div style="margin:20px 14px;background:rgba(255,179,0,.07);border:1.5px solid var(--amber);
                  border-radius:14px;padding:24px;text-align:center">
        <div style="font-size:32px;margin-bottom:10px">⟳</div>
        <div style="font-family:var(--fh);font-size:15px;color:var(--amber);margin-bottom:6px">CONNECTING...</div>
        <div style="font-size:12px;color:var(--muted);font-weight:600">Loading your account data.<br>Please wait a moment.</div>
      </div>`;
    return;
  }
  document.getElementById('first-setup').style.display='none';
  activeLoginRole=null;
  renderRoleBands();
}

function renderRoleBands(){
  const bands=[
    {roles:['owner','admin'], label:'OWNER  /  ADMIN',  color:'#ffb300', bg:'rgba(255,179,0,.12)' },
    {roles:['supervisor'],    label:'MANAGER',           color:'#2979ff', bg:'rgba(41,121,255,.12)'},
    {roles:['sitesup'],       label:'SITE SUPERVISOR',   color:'#9463b0', bg:'rgba(148,99,176,.12)'},
  ];

  const hasUsers = r => users.some(u=>r.includes(u.role));

  document.getElementById('user-grid').innerHTML = `
    <div style="padding:0 0 8px">
      ${bands.filter(b=>hasUsers(b.roles)).map(b=>`
        <div id="band-${b.roles[0]}" onclick="toggleRoleBand('${b.roles.join(',')}')"
          style="margin:0 0 2px;cursor:pointer;transition:all .2s">
          <div style="background:${b.bg};border-left:4px solid ${b.color};
                      padding:18px 20px;display:flex;align-items:center;justify-content:space-between">
            <span style="font-family:var(--fh);font-size:15px;color:${b.color};
                         letter-spacing:2px;font-weight:900">${b.label}</span>
            <span id="band-arr-${b.roles[0]}" style="color:${b.color};font-size:20px;transition:transform .2s">›</span>
          </div>
          <div id="band-body-${b.roles[0]}" style="display:none;background:var(--bg2);
               border-left:4px solid ${b.color};padding:14px 16px">
            <input id="band-inp-${b.roles[0]}" placeholder="Type your name..."
              oninput="filterBandUsers('${b.roles.join(',')}',this.value)"
              style="width:100%;background:var(--bg3);border:1.5px solid ${b.color}44;
                     color:var(--white);padding:12px 14px;border-radius:10px;
                     font-size:15px;font-family:var(--fb);box-sizing:border-box;outline:none">
            <div id="band-list-${b.roles[0]}" style="margin-top:10px"></div>
          </div>
        </div>`).join('')}
    </div>`;
}

function toggleRoleBand(rolesStr){
  const key=rolesStr.split(',')[0];
  const body=document.getElementById('band-body-'+key);
  const arr=document.getElementById('band-arr-'+key);
  const isOpen=body.style.display!=='none';
  // Close all
  ['owner','supervisor','sitesup'].forEach(r=>{
    const b=document.getElementById('band-body-'+r);
    const a=document.getElementById('band-arr-'+r);
    if(b)b.style.display='none';
    if(a)a.style.transform='';
  });
  if(!isOpen){
    body.style.display='block';
    arr.style.transform='rotate(90deg)';
    setTimeout(()=>{
      const inp=document.getElementById('band-inp-'+key);
      if(inp){inp.focus();filterBandUsers(rolesStr,'');}
    },100);
  }
}

function filterBandUsers(rolesStr, q){
  const roles=rolesStr.split(',');
  const key=roles[0];
  const el=document.getElementById('band-list-'+key);
  if(!el)return;
  const filtered=users.filter(u=>roles.includes(u.role)&&
    (!q||u.name.toLowerCase().includes(q.toLowerCase())));
  if(!filtered.length){
    el.innerHTML='<div style="color:var(--muted);font-size:13px;padding:4px 0">No match found</div>';
    return;
  }
  const col=rCol(filtered[0]?.role||roles[0]);
  el.innerHTML=filtered.map(u=>`
    <div onclick="startLogin('${u.id}')"
      style="padding:12px 14px;border-radius:10px;cursor:pointer;
             display:flex;align-items:center;gap:12px;margin-bottom:6px;
             background:var(--bg3);border:1.5px solid var(--border2);transition:border-color .15s"
      onmouseover="this.style.borderColor='${col}'" onmouseout="this.style.borderColor='var(--border2)'">
      <div style="width:38px;height:38px;border-radius:50%;background:${col}22;color:${col};
                  display:flex;align-items:center;justify-content:center;
                  font-family:var(--fh);font-size:17px;flex-shrink:0">${u.name[0].toUpperCase()}</div>
      <div style="flex:1">
        <div style="font-family:var(--fh);font-size:15px;color:var(--white)">${u.name}</div>
        <div style="font-size:11px;color:${col};font-weight:600;margin-top:1px">${rLbl(u.role)}</div>
      </div>
      <div style="color:var(--muted);font-size:18px">›</div>
    </div>`).join('');
}
function createOwner(){
  const name=document.getElementById('setup-name').value.trim();
  const pin=document.getElementById('setup-pin').value.trim();
  if(!name){alert('Enter your name');return;}
  if(pin.length!==4||isNaN(Number(pin))){alert('PIN must be 4 digits');return;}
  users.push({id:uid(),name,role:'owner',pin});
  sv('users',users);initLogin();
}
let pinTarget=null,pinBuf='';
function startLogin(uid_){
  const u=gU(uid_);if(!u)return;
  pinTarget=u;pinBuf='';
  document.getElementById('pin-who').textContent=u.name;
  document.getElementById('pin-err').textContent='';
  updDots();show('scr-pin');
}
function pk(k){if(pinBuf.length>=4)return;pinBuf+=k;updDots();if(pinBuf.length===4)setTimeout(checkPin,150);}
function pkDel(){pinBuf=pinBuf.slice(0,-1);updDots();}
function pkClr(){pinBuf='';updDots();}
function updDots(){for(let i=0;i<4;i++)document.getElementById('pd'+i).classList.toggle('on',i<pinBuf.length);}
function checkPin(){
  if(pinBuf===pinTarget.pin){
    sess={userId:pinTarget.id,name:pinTarget.name,role:pinTarget.role};
    show('scr-home');
  } else {
    document.getElementById('pin-err').textContent='Wrong PIN — try again';
    const c=document.querySelector('.pin-card');
    c.style.borderColor='var(--red)';
    setTimeout(()=>{c.style.borderColor='var(--amber)';pinBuf='';updDots();},700);
  }
}
function logout(){
  sess=null;pinBuf='';
  show('scr-login');initLogin();
}


