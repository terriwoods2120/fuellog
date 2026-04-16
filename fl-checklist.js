// ════════════════════════════════════
// CHECKLIST — PRE-LOADED TEMPLATES
// ════════════════════════════════════
const CHECKLIST_TEMPLATES = {
  dumper: {
    label: '🚚 Dumper / Tipper',
    daily: [
      {hi:'तेल और पानी', en:'Engine Oil, Coolant & Hydraulic Oil', type:'okdefect'},
      {hi:'टायर', en:'Tyre Pressure & Condition (check for stones)', type:'okdefect'},
      {hi:'लीकेज', en:'Check under vehicle for oil/water leaks', type:'okdefect'},
      {hi:'ब्रेक और स्टीयरिंग', en:'Brakes & Steering — smooth operation', type:'okdefect'},
      {hi:'डंपर जैक', en:'Tipping System — rod clean, no hydraulic leak', type:'okdefect'},
      {hi:'लाइट और हॉर्न', en:'Reverse Horn, Headlights & Indicators', type:'okdefect'},
    ],
    weekly: [
      {hi:'ग्रीसिंग', en:'Grease all pins and hinges', type:'okdefect'},
      {hi:'एयर फिल्टर', en:'Air Filter — clean dust and debris', type:'okdefect'},
      {hi:'बैटरी', en:'Battery terminals — check for looseness or carbon', type:'okdefect'},
      {hi:'नट-बोल्ट', en:'Wheel Nuts — check all are tight', type:'okdefect'},
    ],
    monthly: [
      {hi:'चेसिस और क्रैक', en:'Full body inspection for cracks', type:'okdefect'},
      {hi:'पट्टा और सस्पेंशन', en:'Leaf Springs — check for breakage', type:'okdefect'},
      {hi:'हाइड्रोलिक पाइप', en:'Hose Pipes — check for bulging or wear', type:'okdefect'},
      {hi:'कागज और इंश्योरेंस', en:'Vehicle Documents & Insurance validity', type:'okdefect'},
    ]
  },
  excavator: {
    label: '⚙️ Excavator (PC Class)',
    daily: [
      {hi:'इंजन ऑयल', en:'Engine Oil Level', type:'okdefect'},
      {hi:'कूलेंट', en:'Coolant Level', type:'okdefect'},
      {hi:'हाइड्रोलिक ऑयल', en:'Hydraulic Oil Level', type:'okdefect'},
      {hi:'ट्रैक टेंशन', en:'Track Tension — not too loose or tight', type:'okdefect'},
      {hi:'बकेट पिन', en:'Bucket Pins & Attachments', type:'okdefect'},
      {hi:'फायर एक्सटिंगुइशर', en:'Fire Extinguisher — present & charged', type:'okdefect'},
      {hi:'लाइट और हॉर्न', en:'Lights & Horn', type:'okdefect'},
      {hi:'ईंधन स्तर (cm)', en:'Fuel Level (cm tape reading)', type:'number'},
    ],
    weekly: [
      {hi:'ग्रीसिंग', en:'Grease all points per chart', type:'okdefect'},
      {hi:'एयर फिल्टर', en:'Air Filter condition', type:'okdefect'},
      {hi:'बैटरी', en:'Battery terminals', type:'okdefect'},
      {hi:'अंडरकैरिज', en:'Undercarriage inspection', type:'okdefect'},
    ],
    monthly: [
      {hi:'इंजन ऑयल बदलाव', en:'Engine Oil Change due', type:'okdefect'},
      {hi:'हाइड्रोलिक फिल्टर', en:'Hydraulic Filter change', type:'okdefect'},
      {hi:'पूर्ण अंडरकैरिज', en:'Full undercarriage detailed inspection', type:'okdefect'},
      {hi:'हौरमीटर रीडिंग', en:'Hourmeter Reading', type:'number'},
    ]
  },
  roller: {
    label: '🔃 Roller (Vibratory/Static)',
    daily: [
      {hi:'इंजन ऑयल', en:'Engine Oil Level', type:'okdefect'},
      {hi:'कूलेंट', en:'Coolant Level', type:'okdefect'},
      {hi:'वाइब्रेटर ऑयल', en:'Vibrator Oil Level', type:'okdefect'},
      {hi:'ड्रम', en:'Drum condition — no cracks or damage', type:'okdefect'},
      {hi:'ब्रेक', en:'Brakes working correctly', type:'okdefect'},
      {hi:'हॉर्न और लाइट', en:'Horn & Lights', type:'okdefect'},
      {hi:'ईंधन स्तर (cm)', en:'Fuel Level (cm)', type:'number'},
    ],
    weekly: [
      {hi:'ग्रीसिंग', en:'Grease all fittings', type:'okdefect'},
      {hi:'एयर फिल्टर', en:'Air Filter', type:'okdefect'},
      {hi:'बैटरी', en:'Battery check', type:'okdefect'},
    ],
    monthly: [
      {hi:'वाइब्रेशन सिस्टम', en:'Vibration system full inspection', type:'okdefect'},
      {hi:'हाइड्रोलिक पाइप', en:'Hydraulic hoses condition', type:'okdefect'},
      {hi:'हौरमीटर रीडिंग', en:'Hourmeter Reading', type:'number'},
    ]
  },
  paver: {
    label: '🛣️ Sensor Paver',
    daily: [
      {hi:'इंजन ऑयल', en:'Engine Oil Level', type:'okdefect'},
      {hi:'कूलेंट', en:'Coolant Level', type:'okdefect'},
      {hi:'हाइड्रोलिक ऑयल', en:'Hydraulic Oil Level', type:'okdefect'},
      {hi:'स्क्रीड हीटिंग', en:'Screed Heating System working', type:'okdefect'},
      {hi:'ऑगर और कन्वेयर', en:'Auger & Conveyor — no blockage', type:'okdefect'},
      {hi:'सेंसर', en:'Sensors & Grade Controls', type:'okdefect'},
      {hi:'ईंधन स्तर (cm)', en:'Fuel Level (cm)', type:'number'},
    ],
    weekly: [
      {hi:'ग्रीसिंग', en:'Grease screed and auger points', type:'okdefect'},
      {hi:'चेन और बेल्ट', en:'Chain & Belt tension', type:'okdefect'},
      {hi:'एयर फिल्टर', en:'Air Filter', type:'okdefect'},
    ],
    monthly: [
      {hi:'स्क्रीड प्लेट', en:'Screed Plate — check wear', type:'okdefect'},
      {hi:'हाइड्रोलिक पाइप', en:'Hydraulic Hoses', type:'okdefect'},
      {hi:'हौरमीटर रीडिंग', en:'Hourmeter Reading', type:'number'},
    ]
  },
  'transit-mixer': {
    label: '🌀 Transit Mixer',
    daily: [
      {hi:'इंजन ऑयल', en:'Engine Oil Level', type:'okdefect'},
      {hi:'कूलेंट', en:'Coolant Level', type:'okdefect'},
      {hi:'टायर', en:'Tyre Pressure & Condition', type:'okdefect'},
      {hi:'ड्रम रोटेशन', en:'Drum rotation — smooth both directions', type:'okdefect'},
      {hi:'वाटर टैंक', en:'Water Tank — filled', type:'okdefect'},
      {hi:'लाइट और हॉर्न', en:'Lights & Horn', type:'okdefect'},
      {hi:'ओडोमीटर', en:'Odometer Reading', type:'number'},
    ],
    weekly: [
      {hi:'ड्रम फिन', en:'Drum fins — check for wear or damage', type:'okdefect'},
      {hi:'ग्रीसिंग', en:'Grease drum bearings and rollers', type:'okdefect'},
      {hi:'बैटरी', en:'Battery terminals', type:'okdefect'},
    ],
    monthly: [
      {hi:'ड्रम गियरबॉक्स', en:'Drum gearbox oil level', type:'okdefect'},
      {hi:'हाइड्रोलिक सिस्टम', en:'Hydraulic system full check', type:'okdefect'},
      {hi:'कागज और इंश्योरेंस', en:'Documents & Insurance validity', type:'okdefect'},
    ]
  },
  hmp: {
    label: '🏭 HMP (Hot Mix Plant)',
    daily: [
      {hi:'बर्नर', en:'Burner — ignition and flame stable', type:'okdefect'},
      {hi:'ड्रायर', en:'Dryer drum rotation', type:'okdefect'},
      {hi:'बिटुमिन टैंक', en:'Bitumen Tank temperature & level', type:'okdefect'},
      {hi:'एग्रीगेट बिन', en:'Aggregate bins — stocked', type:'okdefect'},
      {hi:'एग्जॉस्ट', en:'Exhaust & dust collector working', type:'okdefect'},
      {hi:'ईंधन स्तर (L)', en:'Fuel Level (litres)', type:'number'},
    ],
    weekly: [
      {hi:'ग्रीसिंग', en:'Grease all rotating parts', type:'okdefect'},
      {hi:'बेल्ट और चेन', en:'Belt & Chain condition and tension', type:'okdefect'},
      {hi:'एयर फिल्टर', en:'Air Filter — generator and burner', type:'okdefect'},
    ],
    monthly: [
      {hi:'बर्नर सर्विस', en:'Burner full service', type:'okdefect'},
      {hi:'ड्रायर ब्लेड', en:'Dryer blades — check for wear', type:'okdefect'},
      {hi:'इलेक्ट्रिकल', en:'Electrical panel — full inspection', type:'okdefect'},
    ]
  },
  dozer: {
    label: '🚜 Dozer',
    daily: [
      {hi:'इंजन ऑयल', en:'Engine Oil Level', type:'okdefect'},
      {hi:'कूलेंट', en:'Coolant Level', type:'okdefect'},
      {hi:'ट्रांसमिशन ऑयल', en:'Transmission Oil Level', type:'okdefect'},
      {hi:'ट्रैक', en:'Track condition and tension', type:'okdefect'},
      {hi:'ब्लेड', en:'Blade — no cracks or damage', type:'okdefect'},
      {hi:'हॉर्न और लाइट', en:'Horn & Lights', type:'okdefect'},
      {hi:'ईंधन स्तर (cm)', en:'Fuel Level (cm)', type:'number'},
    ],
    weekly: [
      {hi:'ग्रीसिंग', en:'Grease all track pins and rollers', type:'okdefect'},
      {hi:'एयर फिल्टर', en:'Air Filter', type:'okdefect'},
      {hi:'अंडरकैरिज', en:'Undercarriage — sprockets and rollers', type:'okdefect'},
    ],
    monthly: [
      {hi:'इंजन ऑयल बदलाव', en:'Engine Oil Change', type:'okdefect'},
      {hi:'हाइड्रोलिक', en:'Hydraulic system inspection', type:'okdefect'},
      {hi:'हौरमीटर रीडिंग', en:'Hourmeter Reading', type:'number'},
    ]
  }
};

// ════════════════════════════════════
// CHECKLIST STORAGE & STATE
// ════════════════════════════════════
let clState = {}; // active completion state

// ════════════════════════════════════
// CHECKLIST BUILDER — Owner/Admin
// ════════════════════════════════════
function renderChecklistBuilder(){
  const el=document.getElementById('cl-builder-list');if(!el)return;
  if(!checklistTemplates.length){
    el.innerHTML='<div class="muted-txt">No templates created yet. Use the form above to add one.</div>';return;
  }
  el.innerHTML=checklistTemplates.map(t=>`
    <div class="log-item">
      <div class="li-ico">${vIco(t.vehicleType)}</div>
      <div class="li-main">
        <div class="li-name">${t.name}</div>
        <div class="li-det">${t.vehicleType} · ${t.items?.length||0} items total</div>
        <div class="li-by">Daily: ${(t.items||[]).filter(i=>i.freq==='daily').length} · Weekly: ${(t.items||[]).filter(i=>i.freq==='weekly').length} · Monthly: ${(t.items||[]).filter(i=>i.freq==='monthly').length}</div>
      </div>
      <div class="li-actions">
        ${canDelete()?`<button class="li-btn del" onclick="delChecklistTemplate('${t.id}')">🗑</button>`:''}
      </div>
    </div>`).join('');
}

function onClVehicleTypeChange(){
  const t=document.getElementById('cl-vtype').value;
  const previewEl=document.getElementById('cl-template-preview');
  if(!t||!CHECKLIST_TEMPLATES[t]){previewEl.innerHTML='';return;}
  const tmpl=CHECKLIST_TEMPLATES[t];
  previewEl.innerHTML=`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;margin-top:8px">
      <div style="font-family:var(--fh);font-size:13px;color:var(--amber);margin-bottom:8px">📋 TEMPLATE PREVIEW — ${tmpl.label}</div>
      <div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px">DAILY (${tmpl.daily.length} items)</div>
      ${tmpl.daily.map(i=>`<div style="font-size:12px;color:var(--white);padding:3px 0;border-bottom:1px solid var(--border)">• ${i.hi} / ${i.en}</div>`).join('')}
      <div style="font-size:11px;color:var(--muted);font-weight:700;margin:8px 0 4px">WEEKLY (${tmpl.weekly.length} items)</div>
      ${tmpl.weekly.map(i=>`<div style="font-size:12px;color:var(--white);padding:3px 0;border-bottom:1px solid var(--border)">• ${i.hi} / ${i.en}</div>`).join('')}
      <div style="font-size:11px;color:var(--muted);font-weight:700;margin:8px 0 4px">MONTHLY (${tmpl.monthly.length} items)</div>
      ${tmpl.monthly.map(i=>`<div style="font-size:12px;color:var(--white);padding:3px 0">• ${i.hi} / ${i.en}</div>`).join('')}
    </div>`;
}

function saveChecklistTemplate(){
  if(!isAdmin()){alert('Only Owner or Admin can manage checklists');return;}
  const name=document.getElementById('cl-name').value.trim();
  const vtype=document.getElementById('cl-vtype').value;
  if(!name){alert('Enter a template name');return;}
  if(!vtype){alert('Select a vehicle type');return;}
  const tmpl=CHECKLIST_TEMPLATES[vtype];
  if(!tmpl){alert('No template found for this vehicle type');return;}
  // Build flat items list with frequency
  const items=[
    ...tmpl.daily.map((i,idx)=>({id:uid(),hi:i.hi,en:i.en,type:i.type,freq:'daily',order:idx})),
    ...tmpl.weekly.map((i,idx)=>({id:uid(),hi:i.hi,en:i.en,type:i.type,freq:'weekly',order:idx})),
    ...tmpl.monthly.map((i,idx)=>({id:uid(),hi:i.hi,en:i.en,type:i.type,freq:'monthly',order:idx})),
  ];
  checklistTemplates.push({id:uid(),name,vehicleType:vtype,items,createdBy:sess.name,createdAt:today()});
  sv('checklistTemplates',checklistTemplates);
  document.getElementById('cl-name').value='';
  document.getElementById('cl-vtype').value='';
  document.getElementById('cl-template-preview').innerHTML='';
  renderChecklistBuilder();
  flash('TEMPLATE SAVED!',name);
}

function delChecklistTemplate(id){
  if(!canDelete())return;
  const t=checklistTemplates.find(x=>x.id===id);
  showConfirm('Delete template "'+t?.name+'"?',()=>{
    checklistTemplates=checklistTemplates.filter(x=>x.id!==id);
    sv('checklistTemplates',checklistTemplates);
    renderChecklistBuilder();flash('DELETED!',t?.name);
  });
}

// ════════════════════════════════════
// CHECKLIST COMPLETION — Driver/Op
// ════════════════════════════════════
// Scheduling: daily always, weekly on Wednesday, monthly on last Wednesday
function getTodayFreqs(){
  const d=new Date();
  const dow=d.getDay(); // 0=Sun,3=Wed
  const freqs=['daily'];
  if(dow===3){ // Wednesday
    freqs.push('weekly');
    // Check if last Wednesday of month
    const nextWed=new Date(d);nextWed.setDate(d.getDate()+7);
    if(nextWed.getMonth()!==d.getMonth())freqs.push('monthly');
  }
  return freqs;
}

function openChecklistForVehicle(shiftType,vehicleId){
  const veh=fleet.find(f=>f.id===vehicleId);
  if(!veh){alert('Vehicle not found');return;}
  const tmpl=checklistTemplates.find(t=>t.id===veh.checklistTemplateId)
    ||checklistTemplates.find(t=>t.vehicleType===veh.type);
  if(!tmpl){
    alert(!checklistTemplates.length
      ?'No checklist templates set up yet. Go to Settings → Checklists.'
      :'No checklist assigned to '+veh.name+'. Go to Fleet Setup and tap ✅ to assign.');
    return;
  }
  const td=today();
  if(shiftType==='postshift'){
    const existing=checklistRecords.find(r=>r.vehicleId===veh.id&&r.date===td&&r.shiftType==='postshift'&&r.status==='submitted');
    if(existing){flash('✅ Already done','Post-shift submitted for '+veh.name);return;}
    const items=[
      {id:'ps1',hi:'क्लोजिंग रीडिंग',en:'Closing Hourmeter / Odometer Reading',type:'number',freq:'daily'},
      {id:'ps2',hi:'नुकसान की रिपोर्ट',en:'Any Damage Observed Today',type:'okdefect',freq:'daily'},
    ];
    clState={vehicleId:veh.id,vehicleName:veh.name,vehicleType:veh.type,
      templateId:tmpl.id,templateName:tmpl.name,
      shiftType:'postshift',date:td,items,responses:{},mediaUsed:false};
    document.getElementById('cl-form-title').textContent='POST-SHIFT — '+veh.name;
    renderChecklistForm();show('scr-checklist');return;
  }
  // Pre-start
  const existing=checklistRecords.find(r=>r.vehicleId===veh.id&&r.date===td&&r.shiftType==='prestart'&&r.status==='submitted');
  if(existing){flash('✅ Already done','Pre-start submitted for '+veh.name);return;}
  const todayFreqs=getTodayFreqs();
  const items=tmpl.items.filter(i=>todayFreqs.includes(i.freq));
  if(!items.length){alert('No checklist items found for today.');return;}
  const freqLabel=todayFreqs.includes('monthly')?'Daily + Weekly + Monthly':todayFreqs.includes('weekly')?'Daily + Weekly':'Daily';
  clState={vehicleId:veh.id,vehicleName:veh.name,vehicleType:veh.type,
    templateId:tmpl.id,templateName:tmpl.name,
    shiftType:'prestart',freq:freqLabel,date:td,items,responses:{},mediaUsed:false};
  document.getElementById('cl-form-title').textContent='PRE-START — '+veh.name;
  renderChecklistForm();show('scr-checklist');
}

function openChecklist(shiftType){
  // shiftType = 'prestart' | 'postshift'
  const myVeh=fleet.find(f=>f.driverId===sess.userId);
  if(!myVeh){alert('No vehicle assigned to you. Ask your manager.');return;}

  // Find assigned template
  const tmpl=checklistTemplates.find(t=>t.id===myVeh.checklistTemplateId)
    ||checklistTemplates.find(t=>t.vehicleType===myVeh.type);
  if(!tmpl){
    alert(!checklistTemplates.length
      ?'No checklist templates set up yet. Ask your Owner/Admin to create one in Settings → Checklists.'
      :'No checklist assigned to this vehicle. Ask your Owner/Admin to assign one in Fleet Setup.');
    return;
  }

  const td=today();

  if(shiftType==='postshift'){
    // Check already done
    const existing=checklistRecords.find(r=>r.vehicleId===myVeh.id&&r.date===td&&r.shiftType==='postshift'&&r.status==='submitted');
    if(existing){flash('✅ Already submitted','Post-shift done for today');return;}
    // Post-shift items — fixed 2 items
    const items=[
      {id:'ps1',hi:'क्लोजिंग रीडिंग',en:'Closing Hourmeter / Odometer Reading',type:'number',freq:'daily'},
      {id:'ps2',hi:'नुकसान की रिपोर्ट',en:'Any Damage Observed Today',type:'okdefect',freq:'daily'},
    ];
    clState={vehicleId:myVeh.id,vehicleName:myVeh.name,vehicleType:myVeh.type,
      templateId:tmpl.id,templateName:tmpl.name,
      shiftType:'postshift',date:td,items,responses:{},mediaUsed:false};
    document.getElementById('cl-form-title').textContent='POST-SHIFT';
    renderChecklistForm();show('scr-checklist');return;
  }

  // Pre-start — determine which freqs to include today
  const todayFreqs=getTodayFreqs();
  const existing=checklistRecords.find(r=>r.vehicleId===myVeh.id&&r.date===td&&r.shiftType==='prestart'&&r.status==='submitted');
  if(existing){flash('✅ Already submitted','Pre-start done for today');return;}

  const items=tmpl.items.filter(i=>todayFreqs.includes(i.freq));
  const freqLabel=todayFreqs.includes('monthly')?'Daily + Weekly + Monthly':todayFreqs.includes('weekly')?'Daily + Weekly (Wednesday)':'Daily';

  clState={vehicleId:myVeh.id,vehicleName:myVeh.name,vehicleType:myVeh.type,
    templateId:tmpl.id,templateName:tmpl.name,
    shiftType:'prestart',freq:freqLabel,date:td,items,responses:{},mediaUsed:false};
  document.getElementById('cl-form-title').textContent='PRE-START';
  renderChecklistForm();show('scr-checklist');
}

function renderChecklistForm(){
  const el=document.getElementById('cl-form');if(!el)return;
  const freqLbl={daily:'दैनिक / Daily',weekly:'साप्ताहिक / Weekly',monthly:'मासिक / Monthly'};
  el.innerHTML=`
    <div style="background:var(--bg2);border-bottom:1px solid var(--border);padding:12px 14px">
      <div style="font-family:var(--fh);font-size:16px;color:var(--amber)">${vIco(clState.vehicleType)} ${clState.vehicleName}</div>
      <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">${freqLbl[clState.freq]} · ${fmtD(clState.date)}</div>
    </div>
    ${clState.items.map((item,idx)=>buildChecklistItem(item,idx)).join('')}
    <div style="padding:14px">
      <div id="cl-media-warning" style="display:none;background:rgba(255,61,61,.1);border:1px solid var(--red);border-radius:8px;padding:10px;font-size:12px;color:var(--red);font-weight:600;margin-bottom:10px;text-align:center">
        ⚠️ कम से कम एक item पर camera या voice जरूरी है<br>At least one camera photo or voice note required
      </div>
      <button onclick="submitChecklist()" style="width:100%;height:56px;background:var(--green);border:none;color:#fff;font-family:var(--fh);font-size:20px;border-radius:12px;cursor:pointer">
        ✅ SUBMIT CHECKLIST
      </button>
    </div>
    <div class="pad-bot"></div>`;
}

function buildChecklistItem(item,idx){
  const r=clState.responses[item.id]||{};
  const statusBtns=item.type==='number'?`
    <input type="number" inputmode="decimal"
      style="width:100%;background:var(--bg3);border:2px solid ${r.numVal!=null?'var(--green)':'var(--border2)'};color:var(--white);padding:10px;border-radius:8px;font-size:18px;font-family:var(--fb);margin-bottom:8px"
      placeholder="Enter value..." value="${r.numVal??''}"
      onchange="setClResponse('${item.id}','num',this.value)">
  `:`
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button onclick="setClResponse('${item.id}','ok','ok')" style="flex:1;height:48px;background:${r.status==='ok'?'var(--green)':'rgba(0,200,83,.1)'};border:2px solid var(--green);color:${r.status==='ok'?'#fff':'var(--green)'};border-radius:10px;font-family:var(--fh);font-size:15px;cursor:pointer">✅ OK</button>
      <button onclick="setClResponse('${item.id}','ok','low')" style="flex:1;height:48px;background:${r.status==='low'?'var(--amber)':'rgba(255,179,0,.1)'};border:2px solid var(--amber);color:${r.status==='low'?'#000':'var(--amber)'};border-radius:10px;font-family:var(--fh);font-size:15px;cursor:pointer">⚠️ LOW</button>
      <button onclick="setClResponse('${item.id}','defect','defect')" style="flex:1;height:48px;background:${r.status==='defect'?'var(--red)':'rgba(255,61,61,.1)'};border:2px solid var(--red);color:${r.status==='defect'?'#fff':'var(--red)'};border-radius:10px;font-family:var(--fh);font-size:14px;cursor:pointer">🚨 DEFECT</button>
    </div>`;

  return `<div id="cl-item-${item.id}" style="padding:12px 14px;border-bottom:1px solid var(--border)">
    <div style="font-family:var(--fh);font-size:15px;color:var(--white);margin-bottom:2px">${item.hi}</div>
    <div style="font-size:11px;color:var(--muted);font-weight:600;margin-bottom:10px">${item.en}</div>
    ${statusBtns}
    <div style="display:flex;gap:8px;align-items:center">
      <button onclick="takeClPhoto('${item.id}')" style="flex:1;height:40px;background:${(r.photos&&r.photos.length)?'rgba(41,121,255,.3)':'var(--bg3)'};border:2px solid ${(r.photos&&r.photos.length)?'var(--blue)':'var(--border2)'};color:${(r.photos&&r.photos.length)?'var(--blue)':'var(--muted)'};border-radius:8px;font-size:13px;cursor:pointer">
        ${(r.photos&&r.photos.length)?'📷 '+r.photos.length+' photo'+(r.photos.length>1?'s':''):'📷 Add Photo'}
      </button>
      <button id="voice-btn-${item.id}" onclick="startClVoice('${item.id}')" style="flex:1;height:40px;background:${r.voiceText?'rgba(148,99,176,.3)':'var(--bg3)'};border:2px solid ${r.voiceText?'var(--purple)':'var(--border2)'};color:${r.voiceText?'var(--purple)':'var(--muted)'};border-radius:8px;font-size:13px;cursor:pointer">
        ${r.voiceText?'🎤 Recorded':'🎤 Voice Note'}
      </button>
    </div>
    ${(r.photos&&r.photos.length)?`<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
      ${r.photos.map((p,i)=>`<div style="position:relative">
        <img src="${p}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:2px solid var(--blue)">
        <button onclick="removeClPhoto('${item.id}',${i})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:var(--red);border:none;border-radius:50%;color:#fff;font-size:12px;cursor:pointer;line-height:1">✕</button>
      </div>`).join('')}
    </div>`:''}
    ${r.voiceText?`<div style="background:rgba(148,99,176,.1);border:1px solid var(--purple);border-radius:8px;padding:8px 10px;margin-top:8px">
      <div style="font-size:11px;color:var(--purple);font-weight:700;margin-bottom:4px">🎤 VOICE NOTE</div>
      <div style="font-size:13px;color:var(--white);font-style:italic;margin-bottom:8px">"${r.voiceText}"</div>
      <div style="display:flex;gap:6px">
        <button onclick="playClVoice('${item.id}')" style="flex:1;height:34px;background:rgba(148,99,176,.2);border:1px solid var(--purple);color:var(--purple);border-radius:8px;font-size:12px;cursor:pointer">▶ Play</button>
        <button onclick="deleteClVoice('${item.id}')" style="flex:1;height:34px;background:rgba(255,61,61,.1);border:1px solid var(--red);color:var(--red);border-radius:8px;font-size:12px;cursor:pointer">🗑 Delete</button>
      </div>
    </div>`:''}
    <div id="voice-interim-${item.id}" style="font-size:11px;color:var(--muted);margin-top:4px;font-style:italic;min-height:0"></div>
    <input type="file" accept="image/*" capture="environment" id="cl-photo-inp-${item.id}" style="display:none" onchange="handleClPhoto('${item.id}',this)">
  </div>`;
}

function setClResponse(itemId,type,val){
  if(!clState.responses[itemId])clState.responses[itemId]={};
  if(type==='ok')clState.responses[itemId].status=val;
  else if(type==='defect')clState.responses[itemId].status=val;
  else if(type==='num')clState.responses[itemId].numVal=val;
  // Re-render just that item
  const item=clState.items.find(i=>i.id===itemId);
  const idx=clState.items.indexOf(item);
  const el=document.getElementById('cl-item-'+itemId);
  if(el)el.outerHTML=buildChecklistItem(item,idx);
}

function takeClPhoto(itemId){
  document.getElementById('cl-photo-inp-'+itemId)?.click();
}

function handleClPhoto(itemId,inp){
  const file=inp.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(!clState.responses[itemId])clState.responses[itemId]={};
    if(!clState.responses[itemId].photos)clState.responses[itemId].photos=[];
    clState.responses[itemId].photos.push(e.target.result);
    clState.mediaUsed=true;
    inp.value=''; // reset so same photo can be added again if needed
    const item=clState.items.find(i=>i.id===itemId);
    const el=document.getElementById('cl-item-'+itemId);
    if(el)el.outerHTML=buildChecklistItem(item,0);
  };
  reader.readAsDataURL(file);
}

function removeClPhoto(itemId,photoIdx){
  if(!clState.responses[itemId]?.photos)return;
  clState.responses[itemId].photos.splice(photoIdx,1);
  if(!clState.responses[itemId].photos.length)clState.mediaUsed=false;
  const item=clState.items.find(i=>i.id===itemId);
  const el=document.getElementById('cl-item-'+itemId);
  if(el)el.outerHTML=buildChecklistItem(item,0);
}

let clVoiceRec=null;
let clVoiceRecording=false;

function startClVoice(itemId){
  if(clVoiceRecording){
    // Stop recording
    if(clVoiceRec)clVoiceRec.stop();
    return;
  }
  if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){
    alert('Voice recording not supported on this browser. Use Chrome on Android.');return;
  }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  clVoiceRec=new SR();
  clVoiceRec.lang='hi-IN';
  clVoiceRec.interimResults=true;
  clVoiceRec.maxAlternatives=1;
  clVoiceRecording=true;

  // Update button to show recording state
  const btn=document.getElementById('voice-btn-'+itemId);
  if(btn){btn.textContent='⏹ STOP';btn.style.background='rgba(255,61,61,.3)';btn.style.borderColor='var(--red)';btn.style.color='var(--red)';}

  clVoiceRec.onresult=e=>{
    const text=Array.from(e.results).map(r=>r[0].transcript).join(' ');
    const interim=document.getElementById('voice-interim-'+itemId);
    if(interim)interim.textContent=text;
  };
  clVoiceRec.onend=()=>{
    clVoiceRecording=false;
    const interim=document.getElementById('voice-interim-'+itemId);
    const finalText=interim?.textContent?.trim()||'';
    if(finalText){
      if(!clState.responses[itemId])clState.responses[itemId]={};
      clState.responses[itemId].voiceText=finalText;
      clState.mediaUsed=true;
    }
    const item=clState.items.find(i=>i.id===itemId);
    const el=document.getElementById('cl-item-'+itemId);
    if(el)el.outerHTML=buildChecklistItem(item,0);
  };
  clVoiceRec.onerror=()=>{
    clVoiceRecording=false;
    flash('❌ Error','Could not record. Try again.');
    const item=clState.items.find(i=>i.id===itemId);
    const el=document.getElementById('cl-item-'+itemId);
    if(el)el.outerHTML=buildChecklistItem(item,0);
  };
  clVoiceRec.start();
}

function deleteClVoice(itemId){
  if(!clState.responses[itemId])return;
  clState.responses[itemId].voiceText=null;
  const item=clState.items.find(i=>i.id===itemId);
  const el=document.getElementById('cl-item-'+itemId);
  if(el)el.outerHTML=buildChecklistItem(item,0);
}

function playClVoice(itemId){
  const text=clState.responses[itemId]?.voiceText;
  if(!text)return;
  if('speechSynthesis' in window){
    const utt=new SpeechSynthesisUtterance(text);
    utt.lang='hi-IN';
    window.speechSynthesis.speak(utt);
  } else {
    alert('Recorded note:\n\n"'+text+'"');
  }
}


function submitChecklist(){
  // Guard — clState must be valid
  if(!clState||!clState.items||!clState.items.length){
    alert('Checklist not loaded. Go back and try again.');return;
  }
  // Validate — all items must have a response
  const incomplete=clState.items.filter(item=>{
    const r=clState.responses[item.id];
    if(!r)return true;
    if(item.type==='number')return r.numVal==null||r.numVal==='';
    return !r.status;
  });
  if(incomplete.length){
    alert(`${incomplete.length} item(s) not completed:\n\n${incomplete.map(i=>i.en).join('\n')}`);return;
  }
  // Check media
  const hasMedia=Object.values(clState.responses).some(r=>(r.photos&&r.photos.length)||r.voiceText);
  if(!hasMedia){
    document.getElementById('cl-media-warning').style.display='block';
    document.getElementById('cl-media-warning').scrollIntoView({behavior:'smooth'});return;
  }
  // Build record
  const defects=clState.items.filter(i=>clState.responses[i.id]?.status==='defect');
  const record={
    id:uid(),
    vehicleId:clState.vehicleId,vehicleName:clState.vehicleName,vehicleType:clState.vehicleType,
    templateId:clState.templateId,freq:clState.freq||clState.shiftType,
    shiftType:clState.shiftType||'prestart',
    date:clState.date,submittedAt:Date.now(),
    submittedBy:sess.userId,submittedByName:sess.name,
    responses:clState.responses,
    defectCount:defects.length,
    status:'submitted'
  };
  checklistRecords.push(record);
  sv('checklistRecords',checklistRecords);
  clState={};
  flash('✅ SUBMITTED!',record.vehicleName+' checklist complete');
  if(defects.length){
    setTimeout(()=>alert(`⚠️ ${defects.length} DEFECT(S) REPORTED:\n\n${defects.map(i=>i.en).join('\n')}`),600);
  }
  show('scr-home');
}

function showChecklistRecord(record){
  // Show completed checklist view — locked
  flash('✅ Already submitted',record.vehicleName+' · '+fmtD(record.date));
}

// ════════════════════════════════════
// CHECKLIST REVIEW — Manager/Owner
// ════════════════════════════════════
function renderChecklistReview(){
  const el=document.getElementById('cl-review-list');if(!el)return;
  const td=today();
  const todayRecords=checklistRecords.filter(r=>r.date===td).sort((a,b)=>b.submittedAt-a.submittedAt);
  if(!todayRecords.length){
    el.innerHTML='<div class="muted-txt">No checklists submitted today</div>';return;
  }
  el.innerHTML=todayRecords.map(r=>`
    <div class="log-item" style="flex-direction:column;gap:6px;align-items:stretch">
      <div style="display:flex;gap:10px;align-items:center">
        <div style="font-size:24px">${vIco(r.vehicleType)}</div>
        <div style="flex:1">
          <div class="li-name">${r.vehicleName}</div>
          <div class="li-det">${r.freq} · ${r.submittedByName} · ${new Date(r.submittedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        ${r.defectCount>0?`<span style="background:var(--red);color:#fff;font-size:11px;font-family:var(--fh);padding:3px 8px;border-radius:8px">🚨 ${r.defectCount} DEFECT${r.defectCount>1?'S':''}</span>`:'<span style="background:var(--green);color:#fff;font-size:11px;font-family:var(--fh);padding:3px 8px;border-radius:8px">✅ CLEAR</span>'}
      </div>
      ${r.defectCount>0?`<div style="background:rgba(255,61,61,.08);border:1px solid var(--red);border-radius:8px;padding:8px 10px;font-size:11px;color:var(--red);font-weight:600">
        ${Object.entries(r.responses).filter(([,v])=>v.status==='defect').map(([id])=>{
          const tmpl=checklistTemplates.find(t=>t.id===r.templateId);
          const item=tmpl?.items.find(i=>i.id===id);
          return item?'• '+item.en:'';
        }).filter(Boolean).join('<br>')}
      </div>`:''}
    </div>`).join('');
}

