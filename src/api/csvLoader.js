// CSV headers esperados:
// STATUS,FRETE,HR,KM,R$ PROP,R$ TERC,CHASSI,PREVISÃO,REAL,NOTA,SOLICITANTE,ESTÁ:,VAI:,TIPO,ESTÃO EM:,VAI PARA:,OBS

function splitChassis(raw){
  if(!raw) return []
  return raw.split(/[;,\n]+|\s{2,}/).map(s=>s.trim()).filter(Boolean)
}

function parseNumberBR(s){
  if(!s) return 0
  s = s.replace(/R\$\s?/g,'').replace(/\./g,'').replace(',','.') // "R$ 1.234,56" -> "1234.56"
  const n = Number(s)
  return isNaN(n) ? 0 : n
}

function parseDateBR(s){
  if(!s) return null
  // aceita "dd/mm/aa" ou "dd/mm/aaaa"
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if(!m) return null
  let [_, dd, mm, yy] = m
  dd = Number(dd); mm = Number(mm)-1
  let year = Number(yy); if(year<100) year += 2000
  const d = new Date(year, mm, dd)
  d.setHours(0,0,0,0)
  return d
}

function firstLink(text){
  if(!text) return ''
  const m = String(text).match(/https?:\/\/[^\s]+/)
  return m ? m[0] : ''
}

export async function loadSolicitacoes(){
  const url = import.meta.env.BASE_URL + 'data/solicitacoes.csv'
  const res = await fetch(url)
  const txt = await res.text()
  // very small CSV parser for comma separated, simple quotes
  const lines = txt.split(/\r?\n/).filter(l=>l.trim().length>0)
  const headers = lines[0].split(',').map(h=>h.trim())
  const rows = lines.slice(1).map(line => {
    // naive split by commas but keep quoted commas
    const cols = []
    let cur = '', inQ = false
    for(let i=0;i<line.length;i++){
      const ch = line[i]
      if(ch === '"'){ inQ = !inQ; continue }
      if(ch === ',' && !inQ){ cols.push(cur); cur=''; continue }
      cur += ch
    }
    cols.push(cur)
    const obj = {}
    headers.forEach((h,idx)=> obj[h]= (cols[idx]||'').trim())
    // map to entity
    const status = obj['STATUS'] || ''
    const frete = obj['FRETE'] || ''
    const hr = obj['HR'] || ''
    const km = Number((obj['KM']||'').replace(/[^0-9]/g,'')) || 0
    const valor_prop = parseNumberBR(obj['R$ PROP'])
    const valor_terc = parseNumberBR(obj['R$ TERC'])
    const chassi_lista = splitChassis(obj['CHASSI'])
    const previsao = parseDateBR(obj['PREVISÃO'])
    const real = parseDateBR(obj['REAL'])
    const nota = obj['NOTA'] || ''
    const solicitante = obj['SOLICITANTE'] || ''
    const esta = obj['ESTÁ:'] || obj['ESTÃO EM:'] || ''
    const vai = obj['VAI:'] || obj['VAI PARA:'] || ''
    const tipo = obj['TIPO'] || ''
    const obs = obj['OBS'] || ''
    const loc = firstLink(esta) || firstLink(vai)

    return {
      id: crypto.randomUUID(),
      status, frete, hr, km, valor_prop, valor_terc,
      chassi_lista, previsao, real, nota, solicitante,
      esta, vai, tipo, obs, loc
    }
  })
  return rows
}
