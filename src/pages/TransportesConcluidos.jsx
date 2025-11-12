import React, { useEffect, useMemo, useState } from 'react'
import { loadSolicitacoes } from '../api/csvLoader.js'
import Filtros from '../components/logistica/FiltrosTransporte.jsx'

export default function Concluidos(){
  const [sols, setSols] = useState([])
  const [filtros, setFiltros] = useState(()=>{
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth()+1, 0)
    return {
      chassi:'', cliente:'', solicitante:'',
      dataInicio: start.toISOString().slice(0,10),
      dataFim: end.toISOString().slice(0,10),
      status:'all'
    }
  })
  useEffect(()=>{ loadSolicitacoes().then(setSols) }, [])

  const filtradas = useMemo(()=> sols.filter(s=>{
    if(s.status!=='CONCLUIDO') return false
    if(filtros.chassi && !(s.chassi_lista||[]).some(c=> c.toLowerCase().includes(filtros.chassi.toLowerCase()))) return false
    if(filtros.cliente && !(s.nota||'').toLowerCase().includes(filtros.cliente.toLowerCase())) return false
    if(filtros.solicitante && !(s.solicitante||'').toLowerCase().includes(filtros.solicitante.toLowerCase())) return false
    if(filtros.dataInicio){ const si = new Date(filtros.dataInicio); if(!s.previsao || s.previsao < si) return false }
    if(filtros.dataFim){ const sf = new Date(filtros.dataFim); sf.setHours(23,59,59,999); if(!s.previsao || s.previsao > sf) return false }
    return true
  }).sort((a,b)=> (b.previsao?.getTime()||0)-(a.previsao?.getTime()||0)), [sols, filtros])

  return (
    <div className="grid" style={{gap:20}}>
      <div>
        <h1 className="section-title">Transportes Concluídos</h1>
        <div className="section-sub">Histórico de transportes finalizados</div>
      </div>

      <Filtros filtros={filtros} onChange={setFiltros} showStatus={false} />

      <div className="card">
        <div className="card-b" style={{overflowX:'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>PREVISÃO</th>
                <th>SOLICITANTE</th>
                <th>CLIENTE/NOTA</th>
                <th>CHASSI</th>
                <th>ESTÁ EM</th>
                <th>VAI PARA</th>
                <th>TRANSPORTE</th>
                <th>STATUS</th>
                <th>LOC</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length===0 ? (
                <tr><td colSpan="9" style={{textAlign:'center', padding:'16px 0'}} className="muted">Nenhum transporte concluído encontrado</td></tr>
              ): filtradas.map(s=>{
                const chassi = s.chassi_lista?.[0] || 'SEM CHASSI'
                const extra = (s.chassi_lista?.length||0)-1
                return (
                  <tr key={s.id}>
                    <td className="tiny">{s.previsao ? `${String(s.previsao.getDate()).padStart(2,'0')}/${String(s.previsao.getMonth()+1).padStart(2,'0')}/${String(s.previsao.getFullYear()).slice(-2)}` : '-'}</td>
                    <td className="tiny">{s.solicitante||''}</td>
                    <td className="tiny">{s.nota||''}</td>
                    <td>
                      <div className="hstack">
                        <span style={{fontWeight:800, fontSize:12}}>{chassi}</span>
                        {extra>0 && <span className="badge">+{extra}</span>}
                      </div>
                    </td>
                    <td className="tiny">{s.esta||''}</td>
                    <td className="tiny">{s.vai||''}</td>
                    <td className="tiny">{s.frete||''}</td>
                    <td><span className={`status-pill status-${s.status}`}>{s.status}</span></td>
                    <td>{s.loc ? <a className="badge" href={s.loc} target="_blank" rel="noreferrer">Mapa</a> : <span className="muted tiny">-</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
