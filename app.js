// Password Gate (asks every load)
(function passwordGate(){
  const mk = ()=>{
    const gate = document.createElement('div')
    gate.className = 'gate'
    gate.innerHTML = `
      <div class="box">
        <div class="row" style="gap:10px;align-items:center;margin-bottom:8px">
          <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);display:grid;place-items:center;font-weight:900">LG</div>
          <div>
            <div style="font-weight:900;font-size:18px">Logística 2026</div>
            <div class="tiny">Acesso restrito</div>
          </div>
        </div>
        <label class="tiny">Senha</label>
        <input id="pw" type="password" class="input" placeholder="Digite a senha" style="margin-top:6px">
        <div id="err" class="err" style="display:none">Senha incorreta</div>
        <button id="go" class="btn" style="margin-top:10px;width:100%">Entrar</button>
        <div class="tiny" style="margin-top:8px;color:#64748b">Dica: MPA</div>
      </div>`
    document.body.appendChild(gate)
    const ok=()=>{ document.body.removeChild(gate) }
    gate.querySelector('#go').onclick = ()=>{
      const v = gate.querySelector('#pw').value
      if(v==='MPA'){ ok() } else { const e=gate.querySelector('#err'); e.style.display='block' }
    }
    gate.querySelector('#pw').addEventListener('keydown', (ev)=>{
      if(ev.key==='Enter'){ gate.querySelector('#go').click() }
    })
    setTimeout(()=> gate.querySelector('#pw').focus(), 0)
  }
  mk()
})();

// Utilities
function parseNumberBR(s){
  if(!s) return 0;
  s = s.replace(/R\$\s?/,'').replace(/\./g,'').replace(',','.');
  const n = Number(s); return isNaN(n)?0:n;
}
function splitChassis(raw){
  if(!raw) return [];
  return raw.split(/[;,\n]+|\s{2,}/).map(s=>s.trim()).filter(Boolean);
}
function parseDateBR(s){
  if(!s) return null;
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(!m) return null;
  let [_, dd, mm, yy] = m;
  dd=+dd; mm=+mm-1; let year=+yy; if(year<100) year+=2000;
  const d = new Date(year, mm, dd); d.setHours(0,0,0,0); return d;
}
function fmtDMY(d){
  if(!d) return '-'; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}
async function loadCSV(){
  const res = await fetch('data/solicitacoes.csv');
  const txt = await res.text();
  const lines = txt.split(/\r?\n/).filter(l=>l.trim().length>0);
  if(lines.length<=1) return [];
  const headers = lines[0].split(',').map(h=>h.trim());
  const out = [];
  for(let i=1;i<lines.length;i++){
    const line = lines[i];
    let cols=[],cur='',inQ=false;
    for(let j=0;j<line.length;j++){
      const ch=line[j];
      if(ch==='"'){ inQ=!inQ; continue; }
      if(ch===',' && !inQ){ cols.push(cur); cur=''; continue; }
      cur+=ch;
    }
    cols.push(cur);
    const obj={}; headers.forEach((h,idx)=> obj[h]=(cols[idx]||'').trim());

    const s = {
      status: obj['STATUS']||'',
      frete: obj['FRETE']||'',
      hr: obj['HR']||'',
      km: Number((obj['KM']||'').replace(/[^0-9]/g,''))||0,
      valor_prop: parseNumberBR(obj['R$ PROP']||''),
      valor_terc: parseNumberBR(obj['R$ TERC']||''),
      chassi_lista: splitChassis(obj['CHASSI']||''),
      previsao: parseDateBR(obj['PREVISÃO']||''),
      real: parseDateBR(obj['REAL']||''),
      nota: obj['NOTA']||'',
      solicitante: obj['SOLICITANTE']||'',
      esta: obj['ESTÁ:'] || obj['ESTÃO EM:'] || '',
      vai: obj['VAI:'] || obj['VAI PARA:'] || '',
      tipo: obj['TIPO']||'',
      obs: obj['OBS']||'',
    };
    const link = (s.esta.match(/https?:\/\/[^\s]+/)||[])[0] || (s.vai.match(/https?:\/\/[^\s]+/)||[])[0] || '';
    s.loc = link;
    out.push(s);
  }
  return out;
}

function pick(arr,n){ return arr.slice(0,n) }
function el(tag, attrs={}, html=''){
  const e=document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=> e.setAttribute(k,v));
  if(html) e.innerHTML = html; return e;
}

// Painel
async function initPainel(){
  const data = await loadCSV();
  // KPIs últimos 30 dias
  const now = new Date(); const back = new Date(now); back.setDate(back.getDate()-30);
  const janela = data.filter(s=> s.previsao && s.previsao>=back && s.previsao<=now && !String(s.status).includes('(D)'));
  const c = (st)=> janela.filter(x=>x.status===st).length;
  document.getElementById('kpi-recebido').textContent = c('RECEBIDO');
  document.getElementById('kpi-programado').textContent = c('PROGRAMADO');
  document.getElementById('kpi-emrota').textContent = c('EM ROTA');
  document.getElementById('kpi-concluido').textContent = c('CONCLUIDO');

  function renderLista(id, status){
    const dest = document.getElementById(id);
    const prox = data.filter(s=> s.status===status && s.previsao && s.previsao>=now && s.previsao< new Date(now.getTime()+14*86400000)).sort((a,b)=> a.previsao-b.previsao);
    dest.innerHTML = '';
    if(prox.length===0){ dest.innerHTML = '<div class="tiny">Sem itens</div>'; return; }
    prox.forEach(s=>{
      const ch = s.chassi_lista[0]||'SEM CHASSI'; const extra = s.chassi_lista.length-1;
      const it = el('div', {class:'item'}, `
        <div class="row"><div class="a">${ch} ${extra>0?`<span class="pill">+${extra}</span>`:''}</div>
        <span class="pill status-${s.status.replace(' ','\ ')}">${s.status}</span></div>
        <div class="b">${s.nota||''}</div>
        ${s.loc? `<a class="loc" href="${s.loc}" target="_blank">Mapa</a>`:''}
      `);
      dest.appendChild(it);
    })
  }
  renderLista('lista-recebido','RECEBIDO');
  renderLista('lista-programado','PROGRAMADO');
  renderLista('lista-emrota','EM ROTA');

  // Chart por cidade (simples)
  const cidades = ['PONTA GROSSA','CASTRO','IRATI','ARAPOTI','GUARAPUAVA','PRUDENTÓPOLIS','QUEDAS DO IGUAÇU','TIBAGI'];
  const valor = (s)=> s.valor_terc>0? s.valor_terc : s.valor_prop;
  const tot = {};
  janela.forEach(s=>{
    const E=(s.esta||'').toUpperCase(), V=(s.vai||'').toUpperCase();
    cidades.forEach(c=>{
      if(E.includes(c)) tot[c]=(tot[c]||0)+valor(s);
      if(V.includes(c)) tot[c]=(tot[c]||0)+valor(s);
    })
  })
  const arr = Object.entries(tot).map(([k,v])=>({k, v})).sort((a,b)=>b.v-a.v).slice(0,8);
  const ctx = document.getElementById('chart').getContext('2d');
  // manual draw
  ctx.clearRect(0,0,1100,260);
  const max = Math.max(1, ...arr.map(x=>x.v));
  arr.forEach((x,i)=>{
    const y = 20 + i*28;
    const w = Math.round((x.v/max)*900);
    ctx.fillStyle = '#1d4ed8'; ctx.fillRect(140,y, w, 16);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '12px sans-serif'; ctx.fillText(x.k[0]+x.k.slice(1).toLowerCase(), 10, y+13);
    ctx.fillStyle = '#e5e7eb'; ctx.fillText('R$ '+x.v.toFixed(2), 150+w, y+13);
  })
}

// Calendário
function startOfWeekMonday(d){ const date=new Date(d), day=date.getDay(); const diff=(day===0?-6:1-day); date.setDate(date.getDate()+diff); date.setHours(0,0,0,0); return date }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x }
function daysBetween(a,b){ const out=[]; const x=new Date(a); while(x<=b){ out.push(new Date(x)); x.setDate(x.getDate()+1) } return out }
async function initCalendario(){
  const data = await loadCSV();
  const today = new Date(); const seg = startOfWeekMonday(today); const sab = addDays(seg,5);
  document.getElementById('semana-range').textContent = `Semana Atual - ${fmtDMY(seg)} a ${fmtDMY(sab)}`;
  const semana = data.filter(s=> !String(s.status).includes('(D)') && ['RECEBIDO','PROGRAMADO','EM ROTA'].includes(s.status) && s.previsao && s.previsao>=seg && s.previsao<=sab).sort((a,b)=> a.previsao-b.previsao);
  const weekEl = document.getElementById('week');
  const labels = ['SEG','TER','QUA','QUI','SEX','SAB'];
  for(let i=0;i<6;i++){
    const dia = addDays(seg, i);
    const col = el('div',{class:'calendar-day'});
    col.innerHTML = `<div class="calendar-day-h"><div class="tiny">${labels[i]}</div><div style="font-size:22px;font-weight:900">${dia.getDate()}</div></div><div class="calendar-day-b"></div>`;
    const body = col.querySelector('.calendar-day-b');
    const items = semana.filter(s=> s.previsao.getTime()===dia.getTime());
    if(items.length===0){ body.innerHTML = '<div class="tiny">Sem transportes</div>' }
    else items.forEach(s=>{
      const ch=s.chassi_lista[0]||'SEM CHASSI'; const extra=s.chassi_lista.length-1;
      const it = el('div',{class:'item'}, `<div class="a">${ch} ${extra>0?`<span class="pill">+${extra}</span>`:''}</div><div class="b">${s.nota||''}</div>${s.loc? `<a class="loc" href="${s.loc}" target="_blank">Mapa</a>`:''}`);
      body.appendChild(it);
    })
    weekEl.appendChild(col)
  }

  // Mensal concluidos
  const mStart = new Date(today.getFullYear(), today.getMonth(), 1); mStart.setHours(0,0,0,0);
  const mEnd = new Date(today.getFullYear(), today.getMonth()+1, 0); mEnd.setHours(23,59,59,999);
  const mensal = data.filter(s=> s.status==='CONCLUIDO' && s.previsao && s.previsao>=mStart && s.previsao<=mEnd).sort((a,b)=> a.previsao-b.previsao);
  const monthEl = document.getElementById('month');
  const heads = ['SEG','TER','QUA','QUI','SEX','SAB','DOM'];
  heads.forEach(h=> monthEl.appendChild(el('div',{}, `<div class="tiny">${h}</div>`)));
  daysBetween(mStart, mEnd).forEach(dia=>{
    const cell = el('div',{class:'cell'});
    cell.innerHTML = `<div class="tiny" style="font-weight:900;margin-bottom:6px">${dia.getDate()}</div><div class="stack"></div>`;
    const body = cell.querySelector('.stack');
    const items = mensal.filter(s=> s.previsao.getTime()===dia.getTime());
    items.slice(0,2).forEach(s=> body.appendChild(el('div',{}, `<span class="pill">${s.chassi_lista[0]||'SEM CHASSI'}</span>`)));
    if(items.length>2) body.appendChild(el('div',{class:'tiny'}, `+${items.length-2}`));
    monthEl.appendChild(cell);
  })
}

// Registradas (não concluídas nem D)
function applyFilters(rows, f){
  return rows.filter(s=>{
    if(s.status==='CONCLUIDO' || String(s.status).includes('(D)')) return false;
    if(f.chassi && !(s.chassi_lista||[]).some(c=> c.toLowerCase().includes(f.chassi))) return false;
    if(f.cliente && !(s.nota||'').toLowerCase().includes(f.cliente)) return false;
    if(f.solicitante && !(s.solicitante||'').toLowerCase().includes(f.solicitante)) return false;
    if(f.inicio){ const si=new Date(f.inicio); if(!s.previsao || s.previsao<si) return false; }
    if(f.fim){ const sf=new Date(f.fim); sf.setHours(23,59,59,999); if(!s.previsao || s.previsao>sf) return false; }
    if(f.status && f.status!=='all' && s.status!==f.status) return false;
    return true;
  }).sort((a,b)=> (b.previsao?.getTime()||0)-(a.previsao?.getTime()||0));
}
async function initRegistradas(){
  const data = await loadCSV();
  const f = { chassi:'', cliente:'', solicitante:'', inicio:'', fim:'', status:'all' };
  const tbl = document.querySelector('#tbl tbody');
  function render(){
    const rows = applyFilters(data, f);
    tbl.innerHTML='';
    if(rows.length===0){ tbl.innerHTML='<tr><td colspan="9" class="tiny">Nada encontrado</td></tr>'; return; }
    rows.forEach(s=>{
      const ch = s.chassi_lista[0]||'SEM CHASSI'; const extra=s.chassi_lista.length-1;
      const tr=document.createElement('tr');
      tr.innerHTML = `<td class="tiny">${fmtDMY(s.previsao)}</td>
                      <td class="tiny">${s.solicitante||''}</td>
                      <td class="tiny">${s.nota||''}</td>
                      <td><span style="font-weight:900;font-size:12px">${ch}</span> ${extra>0?`<span class="pill">+${extra}</span>`:''}</td>
                      <td class="tiny">${s.esta||''}</td>
                      <td class="tiny">${s.vai||''}</td>
                      <td class="tiny">${s.frete||''}</td>
                      <td><span class="pill status-${s.status.replace(' ','\ ')}">${s.status}</span></td>
                      <td>${s.loc? `<a class="pill" href="${s.loc}" target="_blank">Mapa</a>`:'<span class="tiny">-</span>'}</td>`;
      tbl.appendChild(tr);
    })
  }
  const $ = (id)=> document.getElementById(id);
  $('#f-aplicar').onclick = ()=>{
    f.chassi=$('#f-chassi').value.trim().toLowerCase();
    f.cliente=$('#f-cliente').value.trim().toLowerCase();
    f.solicitante=$('#f-solicitante').value.trim().toLowerCase();
    f.inicio=$('#f-inicio').value;
    f.fim=$('#f-fim').value;
    f.status=$('#f-status').value;
    render();
  };
  $('#f-limpar').onclick = ()=>{
    ['f-chassi','f-cliente','f-solicitante','f-inicio','f-fim'].forEach(id=> document.getElementById(id).value='');
    document.getElementById('f-status').value='all';
    f.chassi=f.cliente=f.solicitante=f.inicio=f.fim=''; f.status='all'; render();
  };
  render();
}

// Concluídos
function applyFiltersC(rows, f){
  return rows.filter(s=>{
    if(s.status!=='CONCLUIDO') return false;
    if(f.chassi && !(s.chassi_lista||[]).some(c=> c.toLowerCase().includes(f.chassi))) return false;
    if(f.cliente && !(s.nota||'').toLowerCase().includes(f.cliente)) return false;
    if(f.solicitante && !(s.solicitante||'').toLowerCase().includes(f.solicitante)) return false;
    if(f.inicio){ const si=new Date(f.inicio); if(!s.previsao || s.previsao<si) return false; }
    if(f.fim){ const sf=new Date(f.fim); sf.setHours(23,59,59,999); if(!s.previsao || s.previsao>sf) return false; }
    return true;
  }).sort((a,b)=> (b.previsao?.getTime()||0)-(a.previsao?.getTime()||0));
}
async function initConcluidas(){
  const data = await loadCSV();
  const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
  const f = { chassi:'', cliente:'', solicitante:'', inicio: start.toISOString().slice(0,10), fim: end.toISOString().slice(0,10) };
  const tbl = document.querySelector('#tblc tbody');
  function render(){
    const rows = applyFiltersC(data, f);
    tbl.innerHTML='';
    if(rows.length===0){ tbl.innerHTML='<tr><td colspan="9" class="tiny">Nada encontrado</td></tr>'; return; }
    rows.forEach(s=>{
      const ch = s.chassi_lista[0]||'SEM CHASSI'; const extra=s.chassi_lista.length-1;
      const tr=document.createElement('tr');
      tr.innerHTML = `<td class="tiny">${fmtDMY(s.previsao)}</td>
                      <td class="tiny">${s.solicitante||''}</td>
                      <td class="tiny">${s.nota||''}</td>
                      <td><span style="font-weight:900;font-size:12px">${ch}</span> ${extra>0?`<span class="pill">+${extra}</span>`:''}</td>
                      <td class="tiny">${s.esta||''}</td>
                      <td class="tiny">${s.vai||''}</td>
                      <td class="tiny">${s.frete||''}</td>
                      <td><span class="pill status-${s.status.replace(' ','\ ')}">${s.status}</span></td>
                      <td>${s.loc? `<a class="pill" href="${s.loc}" target="_blank">Mapa</a>`:'<span class="tiny">-</span>'}</td>`;
      tbl.appendChild(tr);
    })
  }
  const $ = (id)=> document.getElementById(id);
  $('#fc-aplicar').onclick = ()=>{
    f.chassi=$('#fc-chassi').value.trim().toLowerCase();
    f.cliente=$('#fc-cliente').value.trim().toLowerCase();
    f.solicitante=$('#fc-solicitante').value.trim().toLowerCase();
    f.inicio=$('#fc-inicio').value;
    f.fim=$('#fc-fim').value;
    render();
  };
  $('#fc-limpar').onclick = ()=>{
    ['fc-chassi','fc-cliente','fc-solicitante','fc-inicio','fc-fim'].forEach(id=> document.getElementById(id).value='');
    const now=new Date(); const st=new Date(now.getFullYear(), now.getMonth(), 1); const nd=new Date(now.getFullYear(), now.getMonth()+1, 0);
    f.chassi=f.cliente=f.solicitante=''; f.inicio=st.toISOString().slice(0,10); f.fim=nd.toISOString().slice(0,10);
    document.getElementById('fc-inicio').value=f.inicio; document.getElementById('fc-fim').value=f.fim;
    render();
  };
  document.getElementById('fc-inicio').value = f.inicio; document.getElementById('fc-fim').value = f.fim;
  render();
}

// Demonstrações
async function initDemo(){
  const data = await loadCSV();
  const now = new Date();
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1); mStart.setHours(0,0,0,0);
  const mEnd = new Date(now.getFullYear(), now.getMonth()+1, 0); mEnd.setHours(23,59,59,999);
  const demos = data.filter(s=> String(s.status).includes('(D)') && s.previsao && s.previsao>=mStart && s.previsao<=mEnd);
  document.getElementById('demo-header').textContent = mStart.toLocaleString('pt-BR',{month:'long',year:'numeric'});

  const monthEl = document.getElementById('demo-month');
  const heads = ['SEG','TER','QUA','QUI','SEX','SAB','DOM'];
  heads.forEach(h=> monthEl.appendChild(el('div',{}, `<div class="tiny">${h}</div>`)));
  function color(status){
    if(status==='RECEBIDO (D)') return {bg:'#E9D5FF', text:'#6D28D9', border:'#C4B5FD'}
    if(status==='PROGRAMADO (D)') return {bg:'#DBEAFE', text:'#1D4ED8', border:'#BFDBFE'}
    if(status==='CONCLUIDO (D)') return {bg:'#DCFCE7', text:'#065F46', border:'#A7F3D0'}
    return {bg:'#0b1327', text:'#cbd5e1', border:'#1f2937'}
  }
  for(let d=new Date(mStart); d<=mEnd; d.setDate(d.getDate()+1)){
    const dia = new Date(d)
    const cell = el('div',{class:'cell'})
    cell.innerHTML = `<div class="tiny" style="font-weight:900;margin-bottom:6px">${dia.getDate()}</div><div class="stack"></div>`
    const body = cell.querySelector('.stack')
    demos.filter(s=> s.previsao.getTime()===dia.getTime()).forEach(s=>{
      const c = color(s.status)
      const ch = s.chassi_lista[0]||'SEM CHASSI'
      const box = el('div', {style:`background:${c.bg};color:${c.text};border:1px solid ${c.border};border-radius:8px;padding:4px 6px`},
        `<div style="font-size:11px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ch}</div>
         <div class="tiny" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.nota||''}</div>`)
      body.appendChild(box)
    })
    monthEl.appendChild(cell)
  }
}

// Router-ish per page
const page = document.body.getAttribute('data-page')
if(page==='painel') initPainel();
if(page==='calendario') initCalendario();
if(page==='registradas') initRegistradas();
if(page==='concluidas') initConcluidas();
if(page==='demo') initDemo();
