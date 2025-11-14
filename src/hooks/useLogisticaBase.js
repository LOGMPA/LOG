// src/hooks/useLogisticaBase.js
import { useEffect, useState } from "react"

// LINK FIXO DO BASE.xlsx (espelhado pelo Power Automate)
const EXCEL_URL =
  "https://1drv.ms/x/c/4b504997c31a5c11/EePSIm4WTQZIivVHJe986k0BTZe_W-1ddMjAwvRXlFwOlg?download=1"

// nomes possíveis pras colunas, pra funcionar mesmo se alguém renomear um pouco
const HEAD_MAP = {
  data:   ["data","dt","data registro","dt prev","previsão","previsao"],
  chassi: ["chassi","chassi/serie","chasis","série","serie"],
  cliente:["cliente","cliente/nota","cliente/nota fiscal","destinatario","destinatário"],
  status: ["status","situação","situacao","andamento","etapa"],
  de:     ["de","origem","está em","esta em"],
  para:   ["para","vai para","destino"]
}

const norm = v => String(v ?? "").trim()

function guessHead(keysRaw){
  const keys = keysRaw.map(k => String(k).toLowerCase().trim())
  const res = {}
  for(const k of Object.keys(HEAD_MAP)){
    const opts = HEAD_MAP[k]
    let hit = null
    for(let i=0;i<keys.length;i++){
      if(opts.includes(keys[i])){ hit = keysRaw[i]; break }
    }
    res[k] = hit
  }
  // fallback básico se não bater nada
  res.data   = res.data   || keysRaw.find(k => String(k).toLowerCase().includes("data"))   || keysRaw[0]
  res.status = res.status || keysRaw.find(k => String(k).toLowerCase().includes("status")) || keysRaw[1]
  res.chassi = res.chassi || keysRaw.find(k => String(k).toLowerCase().includes("chas"))   || keysRaw[2]
  res.cliente= res.cliente|| keysRaw.find(k => String(k).toLowerCase().includes("client")) || keysRaw[3]
  res.de     = res.de     || keysRaw.find(k => String(k).toLowerCase().includes("orig"))   || keysRaw[4]
  res.para   = res.para   || keysRaw.find(k => String(k).toLowerCase().includes("dest"))   || keysRaw[5]
  return res
}

function fmtDate(v){
  if(v instanceof Date) return v.toLocaleDateString("pt-BR")
  const s = String(v ?? "").trim()
  if(!s) return ""
  // yyyy-mm-dd
  if(/^\d{4}-\d{2}-\d{2}/.test(s)){
    const d = new Date(s)
    if(!isNaN(d)) return d.toLocaleDateString("pt-BR")
  }
  // dd/mm/yyyy
  if(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) return s
  // número serial do Excel
  const n = Number(s)
  if(!isNaN(n) && n>25569 && n<60000 && window.XLSX?.SSF){
    const dd = window.XLSX.SSF.parse_date_code(n)
    if(dd) return new Date(Date.UTC(dd.y,dd.m-1,dd.d)).toLocaleDateString("pt-BR")
  }
  return s
}

function statusClass(s){
  s = norm(s).toUpperCase()
  if(s.includes("CONCLU")) return "ok"
  if(s.includes("ROTA") || s.includes("TRÂNSITO") || s.includes("TRANSITO")) return "warn"
  if(s.includes("PROGRAM")) return "warn"
  return "bad"
}

export function useLogisticaBase(refreshMs = 60000){
  const [rows, setRows] = useState([])              // linhas pra tabela
  const [kpis, setKpis] = useState({                // cards de resumo
    total: 0,
    prog: 0,
    rote: 0,
    nok:  0
  })
  const [loading, setLoading] = useState(true)      // loading global
  const [error, setError] = useState("")            // mensagem de erro (se der ruim)

  useEffect(() => {
    let cancelled = false

    async function load(){
      try{
        setError("")
        if(!EXCEL_URL) throw new Error("URL do BASE.xlsx não configurada")
        const res = await fetch(EXCEL_URL, { cache: "no-store" })
        if(!res.ok) throw new Error("HTTP " + res.status)

        const buf = await res.arrayBuffer()
        const XLSX = window.XLSX
        if(!XLSX) throw new Error("XLSX não carregado (script ausente no index.html)")

        const wb = XLSX.read(buf, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(ws, { defval: "" })

        if(cancelled) return
        if(!raw.length) throw new Error("Arquivo BASE.xlsx sem linhas")

        const keys = Object.keys(raw[0])
        const head = guessHead(keys)

        // Normaliza cada linha pro formato que o painel vai usar
        const normRows = raw.map(r => ({
          data:   fmtDate(r[head.data]),
          chassi: norm(r[head.chassi]),
          cliente:norm(r[head.cliente]),
          status: norm(r[head.status]),
          de:     norm(r[head.de]),
          para:   norm(r[head.para])
        }))

        // Ordena por data desc
        const sorted = [...normRows].sort((a,b) => {
          const pa = a.data?.split("/").reverse().join("-") || ""
          const pb = b.data?.split("/").reverse().join("-") || ""
          return (Date.parse(pb) || 0) - (Date.parse(pa) || 0)
        })

        // KPIs
        const total = sorted.length
        const prog  = sorted.filter(r => r.status.toUpperCase().includes("PROGRAM")).length
        const rote  = sorted.filter(r => {
          const s = r.status.toUpperCase()
          return s.includes("ROTA") || s.includes("TRÂNSITO") || s.includes("TRANSITO")
        }).length
        const nok   = sorted.filter(r => statusClass(r.status) === "bad").length

        if(cancelled) return
        setRows(sorted)
        setKpis({ total, prog, rote, nok })
        setLoading(false)
      }catch(e){
        if(cancelled) return
        setError(e.message || String(e))
        setLoading(false)
      }
    }

    // carrega na montagem
    load()
    // auto-refresh
    const id = setInterval(load, refreshMs)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [refreshMs])

  return { rows, kpis, loading, error }
}
