// ════════════════════════════════════
// PURCHASES
// ════════════════════════════════════
let purPhotoData=null;

function populatePurPumpSelect(){
  const sel=document.getElementById('pur-pump');if(!sel)return;
  sel.innerHTML=!pumps.length
    ?'<option value="">No pumps added — Owner must add pumps first</option>'
    :'<option value="">Select pump...</option>'+pumps.map(p=>`<option value="${p.id}">${p.name}${p.location?' · '+p.location:''}</option>`).join('');
  sel.onchange=()=>{
    const p=pumps.find(x=>x.id===sel.value);
    if(p?.defaultRate){document.getElementById('pur-rate').value=p.defaultRate;calcPurAmt();}
  };
}
function calcPurAmt(){
  const l=parseFloat(document.getElementById('pur-litres').value)||0;
  const r=parseFloat(document.getElementById('pur-rate').value)||0;
  if(l&&r)document.getElementById('pur-amount').value=fmt(l*r,2);
}
function handlePurPhoto(inp){
  const file=inp.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=e=>{
    purPhotoData=e.target.result;
    document.getElementById('pur-photo-img').src=purPhotoData;
    document.getElementById('pur-photo-img').classList.add('show');
    document.getElementById('pur-photo-lbl').textContent='✅ Bill photo saved — tap to replace';
    document.getElementById('pur-photo-btn').classList.add('hasp');
  };r.readAsDataURL(file);
}
function savePurchase(){
  const pumpId=document.getElementById('pur-pump')?.value;
  const pump=pumps.find(p=>p.id===pumpId);
  const vendor=pump?.name||document.getElementById('pur-pump-name')?.value?.trim()||'';
  const litres=parseFloat(document.getElementById('pur-litres').value)||0;
  if(!vendor){alert('Select a pump');return;}
  if(!litres){alert('Enter litres');return;}
  purchases.push({
    id:uid(),date:today(),ts:Date.now(),vendor,pumpId:pumpId||null,litres,
    rate:parseFloat(document.getElementById('pur-rate').value)||0,
    amount:parseFloat(document.getElementById('pur-amount').value)||0,
    paid:parseFloat(document.getElementById('pur-paid').value)||0,
    bill:document.getElementById('pur-bill').value,
    billPhoto:purPhotoData||null,
    loggedBy:sess.userId,loggedByName:sess.name,
  });
  sv('purchases',purchases);
  purPhotoData=null;
  ['pur-litres','pur-rate','pur-amount','pur-paid','pur-bill'].forEach(i=>document.getElementById(i).value='');
  const psel=document.getElementById('pur-pump');if(psel)psel.value='';
  const pimg=document.getElementById('pur-photo-img');if(pimg){pimg.src='';pimg.classList.remove('show');}
  const plbl=document.getElementById('pur-photo-lbl');if(plbl)plbl.textContent='Tap to photograph bill';
  const pbtn=document.getElementById('pur-photo-btn');if(pbtn)pbtn.classList.remove('hasp');
  renderPurchases();
  flash('ADDED!',litres+' L from '+vendor);
}
function delPurchase(id){
  if(!canDelEntry()){alert('Only Owner can delete');return;}
  const p=purchases.find(x=>x.id===id);
  showConfirm('Delete purchase from "'+p?.vendor+'"?',()=>{
    purchases=purchases.filter(p=>p.id!==id);sv('purchases',purchases);renderPurchases();
    flash('DELETED!','Purchase entry removed');
  });
}
function renderPurchases(){
  populatePurPumpSelect();
  const bal=purchases.reduce((a,p)=>a+(p.amount-p.paid),0);
  document.getElementById('pur-bal').innerHTML=`<div class="bal-ban ${bal>0?'bal-owing':'bal-clear'}">
    <div><div class="bal-lbl">Balance Due</div><div class="bal-amt ${bal>0?'ba-red':'ba-grn'}">₹${fmt(bal,0)}</div></div>
    <div style="text-align:right"><div class="bal-lbl">Entries</div><div class="bal-amt" style="font-size:20px;color:var(--white)">${purchases.length}</div></div>
  </div>`;
  const el=document.getElementById('pur-log');
  if(!purchases.length){el.innerHTML='<div class="muted-txt">No purchases yet</div>';return;}
  el.innerHTML=[...purchases].sort((a,b)=>b.ts-a.ts).map(p=>{
    const b=p.amount-p.paid;
    const canE=canEditEntry(p),canD=canDelEntry();
    return `<div class="log-item">
      <div class="li-ico">🏪</div>
      <div class="li-main">
        <div class="li-name">${p.vendor}</div>
        <div class="li-det">${fmt(p.litres,1)} L · ₹${fmt(p.amount,0)} · ${p.bill||'No bill'}${p.billPhoto?' 📷':''}</div>
        <div class="li-by">by ${p.loggedByName}${p.editedByName?' · edited by '+p.editedByName:''}</div>
        <span class="bdg ${b>0?'bg-red':'bg-grn'}">${b>0?'DUE ₹'+fmt(b,0):'PAID'}</span>
      </div>
      <div class="li-right"><div class="li-val" style="font-size:14px">₹${fmt(p.paid,0)}</div><div class="li-date">${fmtD(p.date)}</div></div>
      <div class="li-actions">
        ${canE?`<button class="li-btn" onclick="openEditModal('purchase','${p.id}')">✏️</button>`:''}
        ${canD?`<button class="li-btn del" onclick="delPurchase('${p.id}')">🗑</button>`:''}
      </div>
    </div>`;
  }).join('');
}
