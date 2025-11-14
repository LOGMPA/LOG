// src/hooks/useLogisticaBase.js
import { useEffect, useState } from "react"

// LINK DO BASE.xlsx NO ONEDRIVE PESSOAL (espelhado pelo Power Automate)
const EXCEL_URL =
  "https://1drv.ms/x/c/4b504997c31a5c11/EePSIm4WTQZIivVHJe986k0BTZe_W-1ddMjAwvRXlFwOlg?download=1"

// Nome exato da guia que vamos ler dentro do BASE.xlsx
const SHEET_NAME = "FRETE MÁQUINAS"

const norm = v => String(v ?? "").trim()

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
  const [rows, setRows] = useState([])   // linhas prontas pra tabela
  const [kpis, setKpis] = useState({
    total: 0,
    prog:  0,
    rote:  0,
    nok:   0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load(){
      try{
        setError("")
        setLoading(true)

        if(!EXCEL_URL) throw new Error("URL do BASE.xlsx não configurada")

        const res = await fetch(EXCEL_URL, { cache: "no-store" })
        if(!res.ok) throw new Error("HTTP " + res.status)

        const buf = await res.arrayBuffer()
        const XLSX = window.XLSX
        if(!XLSX) throw new Error("XLSX não carregado (faltou <script> no index.html)")

        const wb = XLSX.read(buf, { type: "array" })

        const ws =
          wb.Sheets[SHEET_NAME] ||
          wb.Sheets[wb.SheetNames[0]]  // fallback se alguém renomear a aba

        if(!ws) throw new Error(`Guia "${SHEET_NAME}" não encontrada no BASE.xlsx`)

        const raw = XLSX.utils.sheet_to_json(ws, { defval: "" })

        if(cancelled) return
        if(!raw.length) throw new Error("Nenhuma linha na guia FRETE MÁQUINAS")

        // Filtra linhas totalmente vazias
        const filtradas = raw.filter(r => {
          const st = norm(r["STATUS"])
          const ch = norm(r["CHASSI"])
          return st || ch
        })

        // Normaliza pra estrutura que o painel vai usar
        const normRows = filtradas.map(r => {
          // data: prioriza REAL, senão PREV
          const dataBruta = r["REAL"] || r["PREV"]
          return {
            data:   fmtDate(dataBruta),
            chassi: norm(r["CHASSI"]),
            cliente:norm(r["CLIENTE/NOTA"]),
            status: norm(r["STATUS"]),
            de:     norm(r["ESTÁ EM:"] || r["ESTÁ:"]),
            para:   norm(r["VAI PARA:"] || r["VAI:"]),
            filial: norm(r["FILIAL CUSTOS"] || "")
          }
        })

        // Ordena por data REAL/ PREV desc
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
