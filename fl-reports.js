// ════════════════════════════════════
// REPORTS
// ════════════════════════════════════

function getFuelAdded(vehicleId,fromDate,toDate){
  const fromDisbs=disbs.filter(d=>d.vehicleId===vehicleId&&d.date>=fromDate&&d.date<=toDate).reduce((a,d)=>a+d.litres,0);
  const fromPump=(pumpFills||[]).filter(d=>d.vehicleId===vehicleId&&d.date>=fromDate&&d.date<=toDate).reduce((a,d)=>a+d.litres,0);
  return fromDisbs+fromPump;
}

// ── MACHINERY EFFICIENCY ──
// Each reading entry stores: openingLtr, closingLtr, reading (hourmeter)
// Hours worked per entry = current hourmeter - previous hourmeter
// Consumed per entry = openingLtr + fuelFilled(that day) - closingLtr
function getMachEfficiency(veh){
  const dipR=readings.filter(r=>r.vehicleId===veh.id&&r.type==='dip')
    .sort((a,b)=>a.date.localeCompare(b.date));
  if(!dipR.length)return null;

  let totalConsumed=0,totalHrs=0,hasConsumption=false,hasHours=false;

  dipR.forEach((r,i)=>{
    // Consumption per entry
    if(r.openingLtr!=null&&r.closingLtr!=null){
      const fuelFilled=getFuelAdded(veh.id,r.date,r.date);
      const consumed=r.openingLtr+fuelFilled-r.closingLtr;
      if(consumed>0){totalConsumed+=consumed;hasConsumption=true;}
    }
    // Hours per entry = this hourmeter - previous hourmeter
    if(r.reading!=null&&i>0){
      const prev=dipR[i-1];
      if(prev.reading!=null){
        const hrs=r.reading-prev.reading;
        if(hrs>0){totalHrs+=hrs;hasHours=true;}
      }
    }
  });

  if(!hasConsumption)return null;
  if(!hasHours)return{consumed:totalConsumed,hours:null};
  return{consumed:totalConsumed,hours:totalHrs,lph:totalConsumed/totalHrs};
}

// ── ROAD VEHICLE EFFICIENCY ──
function getRoadEfficiency(veh){
  const kmR=readings.filter(r=>r.vehicleId===veh.id&&r.type==='km')
    .sort((a,b)=>a.date.localeCompare(b.date));
  if(!kmR.length)return null;
  let totalConsumed=0,totalKm=0,hasData=false;
  kmR.forEach(r=>{
    const from=r.fromDate||r.date;
    const to=r.toDate||r.date;
    const fuelFilled=getFuelAdded(veh.id,from,to);
    const km=(r.closingKm||0)-(r.openingKm||0);
    let consumed=fuelFilled;
    if(r.openingPct!=null&&r.closingPct!=null&&veh.tank){
      const openL=(r.openingPct/100)*veh.tank;
      const closeL=(r.closingPct/100)*veh.tank;
      consumed=openL+fuelFilled-closeL;
    }
    if(km>0&&consumed>0){totalKm+=km;totalConsumed+=consumed;hasData=true;}
  });
  if(!hasData||totalConsumed<=0)return null;
  return{consumed:totalConsumed,km:totalKm,kpl:totalKm/totalConsumed};
}

// ── DELETE READING ──
function delReading(id){
  if(!canDelEntry()){alert('Only Owner can delete');return;}
  const r=readings.find(x=>x.id===id);
  const veh=gV(r?.vehicleId);
  showConfirm('Delete reading for "'+veh?.name+'"?',()=>{
    readings=readings.filter(x=>x.id!==id);sv('readings',readings);renderReports();
    flash('DELETED!','Reading removed');
  });
}

// ── EDIT READING ──
function editReading(id){
  const r=readings.find(x=>x.id===id);if(!r)return;
  if(!canEditEntry(r)){alert('You can only edit your own same-day entries');return;}
  const veh=gV(r.vehicleId);
  const isMachVeh=['excavator','dozer','roller','paver','hmp','generator','tractor','other'].includes(veh?.type);
  const body=document.getElementById('edit-modal-body');
  document.getElementById('edit-modal-title').textContent='EDIT READING — '+veh?.name;

  if(isMachVeh){
    body.innerHTML=`
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Opening Dip (cm)</label><input class="f-inp" id="er-open-cm" value="${r.openingCm||''}" type="number" inputmode="decimal"></div>
        <div class="f-field"><label class="f-lbl">Closing Dip (cm)</label><input class="f-inp" id="er-close-cm" value="${r.closingCm||''}" type="number" inputmode="decimal"></div>
      </div>
      <div class="f-field"><label class="f-lbl">Hourmeter Reading (hrs)</label><input class="f-inp" id="er-hours" value="${r.reading||''}" type="number" inputmode="decimal"></div>
      <div class="f-field"><label class="f-lbl">Date</label><input class="f-inp" id="er-date" value="${r.date}" type="date"></div>
      <div class="f-field"><label class="f-lbl">Remarks</label><input class="f-inp" id="er-remarks" value="${r.remarks||''}" type="text"></div>`;
  } else {
    body.innerHTML=`
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Opening KM</label><input class="f-inp" id="er-open-km" value="${r.openingKm||''}" type="number" inputmode="decimal"></div>
        <div class="f-field"><label class="f-lbl">Closing KM</label><input class="f-inp" id="er-close-km" value="${r.closingKm||''}" type="number" inputmode="decimal"></div>
      </div>
      <div class="f-r2">
        <div class="f-field"><label class="f-lbl">Opening Fuel %</label><input class="f-inp" id="er-open-pct" value="${r.openingPct||''}" type="number" inputmode="decimal"></div>
        <div class="f-field"><label class="f-lbl">Closing Fuel %</label><input class="f-inp" id="er-close-pct" value="${r.closingPct||''}" type="number" inputmode="decimal"></div>
      </div>
      <div class="f-field"><label class="f-lbl">Remarks</label><input class="f-inp" id="er-remarks" value="${r.remarks||''}" type="text"></div>`;
  }

  // Store reading id for saveEdit
  document.getElementById('edit-modal').dataset.readingId=id;
  document.getElementById('edit-modal').dataset.editType='reading';
  document.getElementById('edit-modal').classList.add('show');
}

// ════════════════════════════════════
// AUDIT TRAIL RENDER — Owner only
// ════════════════════════════════════
function renderAuditTrail(){
  const el=document.getElementById('audit-trail-section');if(!el)return;
  if(!isOwner()){el.innerHTML='';return;}
  const audits=getAudits().sort((a,b)=>b.ts-a.ts).slice(0,100);
  if(!audits.length){
    el.innerHTML=`<div style="margin:10px 14px;background:var(--bg2);border-radius:12px;padding:16px;
      text-align:center;color:var(--muted);font-size:13px;font-weight:600">
      No edit history yet — edits to fuel disbursements and purchases will appear here
    </div>`;return;
  }
  const typeLabel={disb:'⛽ Fuel Disbursement',purchase:'🛢 Purchase',reading:'📟 Reading',fleet:'🚜 Fleet'};
  el.innerHTML=`
    <div style="margin:10px 14px 0">
      <div style="font-family:var(--fh);font-size:11px;color:var(--muted);letter-spacing:1px;
                  padding:0 0 8px">✏️ EDIT AUDIT TRAIL &nbsp;·&nbsp; OWNER ONLY &nbsp;·&nbsp; LAST 100 EDITS</div>
      ${audits.map(a=>`
        <div style="background:var(--bg2);border-radius:12px;margin-bottom:8px;overflow:hidden;
                    border:1px solid var(--border)">
          <div style="padding:10px 14px;background:var(--bg3);display:flex;align-items:center;
                      gap:8px;border-bottom:1px solid var(--border)">
            <span style="font-size:12px;color:var(--amber);font-weight:700;font-family:var(--fh)">
              ${typeLabel[a.entryType]||a.entryType}
            </span>
            <span style="font-size:11px;color:var(--muted);margin-left:auto">
              ${fmtD(a.date)} · ${new Date(a.ts).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
            </span>
            <span style="font-size:11px;color:var(--blue);font-weight:700">by ${a.changedByName}</span>
          </div>
          <div style="padding:10px 14px">
            ${a.changes.map(c=>`
              <div style="display:flex;gap:8px;align-items:center;font-size:12px;
                          margin-bottom:4px;flex-wrap:wrap">
                <span style="color:var(--muted);font-weight:700;min-width:90px">${c.field}</span>
                <span style="color:var(--red);text-decoration:line-through;font-family:var(--fb)">${c.oldVal}</span>
                <span style="color:var(--muted)">→</span>
                <span style="color:var(--green);font-family:var(--fb);font-weight:700">${c.newVal}</span>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

// ════════════════════════════════════
// ── REPORT STATE ──
let repActiveTab='summary';
let repActiveQuick='today';

function repGetRange(){
  const td=today();
  if(repActiveQuick==='today') return{from:td,to:td};
  if(repActiveQuick==='week'){
    const d=new Date();const day=d.getDay()||7;
    d.setDate(d.getDate()-day+1);
    return{from:d.toISOString().slice(0,10),to:td};
  }
  if(repActiveQuick==='month'){
    const d=new Date();
    return{from:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`,to:td};
  }
  return{
    from:document.getElementById('rep-from')?.value||td,
    to:document.getElementById('rep-to')?.value||td
  };
}

function repQuick(q){
  repActiveQuick=q;
  ['today','week','month','custom'].forEach(k=>{
    const b=document.getElementById('rq-'+k);
    if(b)b.classList.toggle('active',k===q);
  });
  const cr=document.getElementById('rep-custom-range');
  if(cr)cr.style.display=q==='custom'?'flex':'none';
  renderReports();
}

function repTab(t){
  repActiveTab=t;
  ['summary','daywise','vehicle','driver','site'].forEach(k=>{
    const b=document.getElementById('rtab-'+k);
    if(b)b.classList.toggle('active',k===t);
  });
  renderReports();
}

function repFmtRange(r){
  if(r.from===r.to)return fmtD(r.from);
  return fmtD(r.from)+' – '+fmtD(r.to);
}

function getFuelRate(){
  if(!purchases||!purchases.length)return 90;
  const last=[...purchases].sort((a,b)=>b.date.localeCompare(a.date))[0];
  if(last&&last.litres&&last.amount)return last.amount/last.litres;
  return 90;
}

function renderReports(){
  const el=document.getElementById('rep-content');
  if(!el)return;
  if(!fleet.length){el.innerHTML='<div class="muted-txt" style="padding:40px;text-align:center">Add fleet first</div>';renderAttendanceReport();return;}
  const range=repGetRange();
  const fuelRate=getFuelRate();
  const fmtINR=n=>'₹'+Number(Math.round(n)).toLocaleString('en-IN');

  // ── Common data ──
  const allDisbs=disbs.filter(d=>d.date>=range.from&&d.date<=range.to);
  const allPF=(pumpFills||[]).filter(d=>d.date>=range.from&&d.date<=range.to);
  const totalL=allDisbs.reduce((a,d)=>a+d.litres,0)+allPF.reduce((a,d)=>a+d.litres,0);
  const totalCost=totalL*fuelRate;
  const stock=getBowserStock();
  const totalPurchased=purchases.filter(p=>p.date>=range.from&&p.date<=range.to).reduce((a,p)=>a+p.litres,0);

  // ── Avg efficiency ──
  let totalKm=0,totalConsumedForEff=0;
  fleet.forEach(veh=>{
    const eff=getRoadEfficiency(veh);
    if(eff&&eff.km&&eff.consumed){totalKm+=eff.km;totalConsumedForEff+=eff.consumed;}
  });
  const avgEff=totalConsumedForEff>0?totalKm/totalConsumedForEff:0;

  // ── Summary cards (always shown at top) ──
  let html=`
  <div style="margin:10px 14px 0;font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.5px">
    📅 ${repFmtRange(range)} &nbsp;·&nbsp; ₹${fmt(fuelRate,1)}/L
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);margin:8px 14px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="background:var(--bg2);padding:12px 14px">
      <div style="font-family:var(--fh);font-size:22px;color:var(--amber)">${fmt(totalL,1)} L</div>
      <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:3px">Dispensed</div>
    </div>
    <div style="background:var(--bg2);padding:12px 14px">
      <div style="font-family:var(--fh);font-size:22px;color:var(--amber)">${fmtINR(totalCost)}</div>
      <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:3px">Total Cost</div>
    </div>
    <div style="background:var(--bg2);padding:12px 14px">
      <div style="font-family:var(--fh);font-size:22px;color:${stock<500?'var(--red)':'var(--green)'}">${fmt(stock,0)} L</div>
      <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:3px">Stock</div>
    </div>
    <div style="background:var(--bg2);padding:12px 14px">
      <div style="font-family:var(--fh);font-size:22px;color:${avgEff>0?(avgEff>=3?'var(--green)':'var(--red)'):'var(--muted)'}">${avgEff>0?fmt(avgEff,2)+' km/L':'—'}</div>
      <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:3px">Avg Efficiency</div>
    </div>
  </div>`;

  // ── Tab content ──
  if(repActiveTab==='summary'){
    // Top vehicles by consumption
    const vehData=fleet.map(v=>{
      const L=allDisbs.filter(d=>d.vehicleId===v.id).reduce((a,d)=>a+d.litres,0)
              +allPF.filter(d=>d.vehicleId===v.id).reduce((a,d)=>a+d.litres,0);
      return{name:v.name,L};
    }).filter(x=>x.L>0).sort((a,b)=>b.L-a.L);

    if(vehData.length){
      html+=`<div class="rep-card">
        <div class="rep-hd">🚚 Vehicle Summary</div>`;
      vehData.forEach(({name,L})=>{
        const pct=totalL>0?Math.round(L/totalL*100):0;
        html+=`<div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px">
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--fh);font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
            <div style="background:var(--border);border-radius:3px;height:4px;margin-top:5px;overflow:hidden">
              <div style="width:${pct}%;background:var(--amber);height:100%;border-radius:3px"></div>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;min-width:90px">
            <div style="font-family:var(--fh);font-size:14px;color:var(--amber)">${fmtINR(L*fuelRate)}</div>
            <div style="font-size:10px;color:var(--muted);font-weight:700">${fmt(L,1)} L · ${pct}%</div>
          </div>
        </div>`;
      });
      html+='</div>';
    } else {
      html+='<div class="muted-txt" style="padding:30px;text-align:center">No fuel entries in this period</div>';
    }

  } else if(repActiveTab==='daywise'){
    // Build list of dates in range
    const days=[];
    let d=new Date(range.from);const end=new Date(range.to);
    while(d<=end){days.push(d.toISOString().slice(0,10));d.setDate(d.getDate()+1);}
    html+=`<div class="rep-card"><div class="rep-hd">📅 Day-wise Fuel</div>`;
    let anyDay=false;
    days.forEach(dt=>{
      const dL=allDisbs.filter(x=>x.date===dt).reduce((a,x)=>a+x.litres,0);
      const pL=allPF.filter(x=>x.date===dt).reduce((a,x)=>a+x.litres,0);
      const total=dL+pL;
      if(!total)return;
      anyDay=true;
      const entries=allDisbs.filter(x=>x.date===dt).length+allPF.filter(x=>x.date===dt).length;
      html+=`<div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-family:var(--fh);font-size:14px;color:var(--white)">${fmtD(dt)}</div>
          <div style="font-size:10px;color:var(--muted);font-weight:700;margin-top:2px">${entries} entries</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--fh);font-size:15px;color:var(--amber)">${fmtINR(total*fuelRate)}</div>
          <div style="font-size:10px;color:var(--muted);font-weight:700">${fmt(total,1)} L</div>
        </div>
      </div>`;
    });
    if(!anyDay)html+='<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">No entries in this period</div>';
    html+='</div>';

  } else if(repActiveTab==='vehicle'){
    html+=`<div class="rep-card"><div class="rep-hd">🚚 Vehicle-wise Fuel</div>`;
    let anyVeh=false;
    fleet.forEach(v=>{
      const vDisbs=allDisbs.filter(d=>d.vehicleId===v.id);
      const vPF=allPF.filter(d=>d.vehicleId===v.id);
      const L=vDisbs.reduce((a,d)=>a+d.litres,0)+vPF.reduce((a,d)=>a+d.litres,0);
      if(!L)return;
      anyVeh=true;
      const entries=vDisbs.length+vPF.length;
      const eff=getRoadEfficiency(v);
      const effStr=eff&&eff.kpl?fmt(eff.kpl,2)+' km/L':'—';
      const effCol=eff&&eff.kpl?(v.expected&&eff.kpl>=v.expected*0.9?'var(--green)':'var(--red)'):'var(--muted)';
      html+=`<div style="padding:10px 14px;border-top:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--fh);font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.name}</div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;margin-top:2px">${entries} entries · Eff: <span style="color:${effCol}">${effStr}</span></div>
          </div>
          <div style="text-align:right;flex-shrink:0;min-width:90px">
            <div style="font-family:var(--fh);font-size:14px;color:var(--amber)">${fmtINR(L*fuelRate)}</div>
            <div style="font-size:10px;color:var(--muted);font-weight:700">${fmt(L,1)} L</div>
          </div>
        </div>
      </div>`;
    });
    if(!anyVeh)html+='<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">No entries in this period</div>';
    html+='</div>';

  } else if(repActiveTab==='driver'){
    // Group by driver name
    const driverMap={};
    allDisbs.forEach(d=>{
      const key=d.operator||d.loggedByName||'Unknown';
      if(!driverMap[key])driverMap[key]={L:0,entries:0};
      driverMap[key].L+=d.litres;driverMap[key].entries++;
    });
    allPF.forEach(d=>{
      const key=d.operator||d.loggedByName||'Unknown';
      if(!driverMap[key])driverMap[key]={L:0,entries:0};
      driverMap[key].L+=d.litres;driverMap[key].entries++;
    });
    const driverList=Object.entries(driverMap).sort((a,b)=>b[1].L-a[1].L);
    html+=`<div class="rep-card"><div class="rep-hd">👤 Driver-wise Fuel</div>`;
    if(driverList.length){
      driverList.forEach(([name,{L,entries}])=>{
        html+=`<div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-family:var(--fh);font-size:14px;color:var(--white)">${name}</div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;margin-top:2px">${entries} entries</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--fh);font-size:15px;color:var(--amber)">${fmtINR(L*fuelRate)}</div>
            <div style="font-size:10px;color:var(--muted);font-weight:700">${fmt(L,1)} L</div>
          </div>
        </div>`;
      });
    } else {
      html+='<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">No entries in this period</div>';
    }
    html+='</div>';

  } else if(repActiveTab==='site'){
    // Group by site
    const siteMap={};
    allDisbs.forEach(d=>{
      const v=gV(d.vehicleId);
      const key=v?.siteName||'Mobile/Unassigned';
      if(!siteMap[key])siteMap[key]={L:0,entries:0,vehicles:new Set()};
      siteMap[key].L+=d.litres;siteMap[key].entries++;
      if(v)siteMap[key].vehicles.add(v.name);
    });
    allPF.forEach(d=>{
      const v=gV(d.vehicleId);
      const key=v?.siteName||'Mobile/Unassigned';
      if(!siteMap[key])siteMap[key]={L:0,entries:0,vehicles:new Set()};
      siteMap[key].L+=d.litres;siteMap[key].entries++;
      if(v)siteMap[key].vehicles.add(v.name);
    });
    const siteList=Object.entries(siteMap).sort((a,b)=>b[1].L-a[1].L);
    html+=`<div class="rep-card"><div class="rep-hd">📍 Site-wise Fuel</div>`;
    if(siteList.length){
      siteList.forEach(([name,{L,entries,vehicles}])=>{
        html+=`<div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--fh);font-size:14px;color:var(--white)">${name}</div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;margin-top:2px">${entries} entries · ${vehicles.size} vehicles</div>
          </div>
          <div style="text-align:right;flex-shrink:0;min-width:90px">
            <div style="font-family:var(--fh);font-size:15px;color:var(--amber)">${fmtINR(L*fuelRate)}</div>
            <div style="font-size:10px;color:var(--muted);font-weight:700">${fmt(L,1)} L</div>
          </div>
        </div>`;
      });
    } else {
      html+='<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">No entries in this period</div>';
    }
    html+='</div>';
  }

  el.innerHTML=html+'<div class="pad-bot"></div>';
  renderAttendanceReport();
}

// ── WhatsApp Export ──
function exportReportWhatsApp(){
  const range=repGetRange();
  const fuelRate=getFuelRate();
  const fmtINR=n=>'₹'+Number(Math.round(n)).toLocaleString('en-IN');
  const allDisbs=disbs.filter(d=>d.date>=range.from&&d.date<=range.to);
  const allPF=(pumpFills||[]).filter(d=>d.date>=range.from&&d.date<=range.to);
  const totalL=allDisbs.reduce((a,d)=>a+d.litres,0)+allPF.reduce((a,d)=>a+d.litres,0);
  let txt='⛽ *FUELLOG REPORT*\n';
  txt+=`📍 Chiddarwar Construction Co.\n`;
  txt+=`📅 ${repFmtRange(range)}\n\n`;
  txt+=`🛢 *Summary*\n`;
  txt+=`Total Dispensed: *${fmt(totalL,1)} L*\n`;
  txt+=`Total Cost: *${fmtINR(totalL*fuelRate)}*\n`;
  txt+=`Stock: ${fmt(getBowserStock(),0)} L\n`;
  txt+=`Rate: ₹${fmt(fuelRate,1)}/L\n\n`;
  txt+='🚚 *Vehicle-wise*\n';
  const vehRows=fleet.map(v=>{
    const L=allDisbs.filter(d=>d.vehicleId===v.id).reduce((a,d)=>a+d.litres,0)
            +allPF.filter(d=>d.vehicleId===v.id).reduce((a,d)=>a+d.litres,0);
    return{name:v.name,L};
  }).filter(x=>x.L>0).sort((a,b)=>b.L-a.L);
  vehRows.forEach(({name,L})=>txt+=`• ${name}: ${fmt(L,1)} L = ${fmtINR(L*fuelRate)}\n`);
  txt+='\n_Sent from FuelLog — Chiddarwar Construction_';
  window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(txt),'_blank');
}

// ── PDF Export ──
function exportRepPDF(){
  const range=repGetRange();
  const fuelRate=getFuelRate();
  const fmtINR=n=>'₹'+Number(Math.round(n)).toLocaleString('en-IN');
  const allDisbs=disbs.filter(d=>d.date>=range.from&&d.date<=range.to);
  const allPF=(pumpFills||[]).filter(d=>d.date>=range.from&&d.date<=range.to);
  const totalL=allDisbs.reduce((a,d)=>a+d.litres,0)+allPF.reduce((a,d)=>a+d.litres,0);
  const totalCost=totalL*fuelRate;
  const stock=getBowserStock();

  // Vehicle rows
  const vehRows=fleet.map(v=>{
    const L=allDisbs.filter(d=>d.vehicleId===v.id).reduce((a,d)=>a+d.litres,0)
            +allPF.filter(d=>d.vehicleId===v.id).reduce((a,d)=>a+d.litres,0);
    const eff=getRoadEfficiency(v);
    return{name:v.name,L,eff:eff?.kpl||0};
  }).filter(x=>x.L>0).sort((a,b)=>b.L-a.L);

  // Day rows
  const days=[];
  let d=new Date(range.from);const endD=new Date(range.to);
  while(d<=endD){days.push(d.toISOString().slice(0,10));d.setDate(d.getDate()+1);}
  const dayRows=days.map(dt=>{
    const L=allDisbs.filter(x=>x.date===dt).reduce((a,x)=>a+x.litres,0)
            +allPF.filter(x=>x.date===dt).reduce((a,x)=>a+x.litres,0);
    return{dt,L};
  }).filter(x=>x.L>0);

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>FuelLog Report — ${repFmtRange(range)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:24px;color:#111;font-size:12px}
    .header{border-bottom:3px solid #e65100;padding-bottom:12px;margin-bottom:16px}
    .header h1{font-size:22px;color:#e65100}
    .header .sub{color:#666;font-size:11px;margin-top:4px}
    .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-bottom:20px}
    .sum-cell{padding:12px 14px;border-right:1px solid #ddd;background:#fff8e1}
    .sum-cell:last-child{border-right:none}
    .sum-val{font-size:18px;font-weight:700;color:#e65100}
    .sum-lbl{font-size:9px;color:#999;text-transform:uppercase;letter-spacing:.5px;margin-top:3px}
    h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
       color:#e65100;border-bottom:1px solid #eee;padding-bottom:6px;margin:16px 0 8px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#f5f5f5;padding:7px 10px;text-align:left;font-size:10px;
       text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #ddd}
    td{padding:7px 10px;border-bottom:1px solid #eee}
    tr:last-child td{border-bottom:none}
    .tfoot td{font-weight:700;background:#fff8e1;border-top:2px solid #ddd}
    .right{text-align:right}
    .footer{margin-top:24px;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:10px;text-align:center}
    @media print{body{padding:12px}}
  </style></head><body>
  <div class="header">
    <h1>⛽ FUELLOG REPORT</h1>
    <div class="sub">Chiddarwar Construction Co. Pvt. Ltd. &nbsp;|&nbsp; Period: ${repFmtRange(range)} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; Rate: ₹${fmt(fuelRate,1)}/L</div>
  </div>
  <div class="summary">
    <div class="sum-cell"><div class="sum-val">${fmt(totalL,1)} L</div><div class="sum-lbl">Total Dispensed</div></div>
    <div class="sum-cell"><div class="sum-val">${fmtINR(totalCost)}</div><div class="sum-lbl">Total Cost</div></div>
    <div class="sum-cell"><div class="sum-val">${fmt(stock,0)} L</div><div class="sum-lbl">Stock Remaining</div></div>
    <div class="sum-cell"><div class="sum-val">${vehRows.length} vehicles</div><div class="sum-lbl">Active This Period</div></div>
  </div>
  <h2>Vehicle-wise Breakdown</h2>
  <table>
    <thead><tr><th>#</th><th>Vehicle</th><th class="right">Litres</th><th class="right">Cost (₹)</th><th class="right">Efficiency</th></tr></thead>
    <tbody>
      ${vehRows.map((v,i)=>`<tr><td>${i+1}</td><td>${v.name}</td><td class="right">${fmt(v.L,1)}</td><td class="right">${fmtINR(v.L*fuelRate)}</td><td class="right">${v.eff?fmt(v.eff,2)+' km/L':'—'}</td></tr>`).join('')}
    </tbody>
    <tfoot><tr class="tfoot"><td colspan="2">TOTAL</td><td class="right">${fmt(totalL,1)} L</td><td class="right">${fmtINR(totalCost)}</td><td></td></tr></tfoot>
  </table>
  <h2>Day-wise Summary</h2>
  <table>
    <thead><tr><th>Date</th><th class="right">Litres</th><th class="right">Cost (₹)</th></tr></thead>
    <tbody>${dayRows.map(({dt,L})=>`<tr><td>${fmtD(dt)}</td><td class="right">${fmt(L,1)}</td><td class="right">${fmtINR(L*fuelRate)}</td></tr>`).join('')}</tbody>
  </table>
  <div class="footer">Total Entries: ${allDisbs.length+allPF.length} &nbsp;|&nbsp; Generated from FuelLog App &nbsp;|&nbsp; Chiddarwar Construction Co. Pvt. Ltd.</div>
  </body></html>`;

  const w=window.open('','_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(()=>w.print(),600);
}


function delEntry(id,type){
  if(!canDelEntry()){alert('Only Owner can delete');return;}
  if(type==='pf'){
    const e=(pumpFills||[]).find(x=>x.id===id);
    showConfirm('Delete pump fill entry?',()=>{
      pumpFills=pumpFills.filter(x=>x.id!==id);sv('pumpFills',pumpFills);renderReports();
      flash('DELETED!','Entry removed');
    });
  } else {
    const d=disbs.find(x=>x.id===id);const veh=gV(d?.vehicleId);
    showConfirm('Delete disbursement for "'+veh?.name+'"?',()=>{
      disbs=disbs.filter(x=>x.id!==id);sv('disbs',disbs);renderReports();
      flash('DELETED!','Disbursement removed');
    });
  }
}
