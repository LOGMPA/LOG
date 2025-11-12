import React, { useEffect, useMemo, useState } from 'react'
import { loadSolicitacoes } from '../api/csvLoader.js'
import { startOfMonth, endOfMonth, eachDay, isSameDay } from '../utils/date.js'

export default function Demos(){
  const [sols, setSols] = useState([])
  const [mes, setMes] = useState(()=>{
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  })
  useEffect(()=>{ loadSolicitacoes().then(setSols) }, [])

  const [y,m] = mes.split('-').map(Number)
  const dataBase = new Date(y, m-1, 1)
  const inicioMes = startOfMonth(dataBase)
  const fimMes = endOfMonth(dataBase)
  const diasMes = eachDay(inicioMes, fimMes)

  const demonstracoes = useMemo(()=> sols.filter(s=>{
    const st = String(s.status||'')
    if(!(st.includes('(D)'))) return False
    return s.previsao && s.previsao>=inicioMes && s.previsao<=fimMes
  }), [sols, inicioMes, fimMes])

  const colorBy = (status)=>{
    if(status==='RECEBIDO (D)') return {bg:'#E9D5FF', text:'#6D28D9', border:'#C4B5FD'}
    if(status==='PROGRAMADO (D)') return {bg:'#DBEAFE', text:'#1D4ED8', border:'#BFDBFE'}
    if(status==='CONCLUIDO (D)') return {bg:'#DCFCE7', text:'#065F46', border:'#A7F3D0'}
    return {bg:'#F3F4F6', text:'#374151', border:'#E5E7EB'}
  }

  return (
    <div className="grid" style={{gap:20}}>
      <div className="hstack" style={{justifyContent:'space-between'}}>
        <div>
          <h1 className="section-title">Demonstrações</h1>
          <div className="section-sub">Calendário de demonstrações de equipamentos</div>
        </div>
        <div className="card" style={{padding:8}}>
          <div className="hstack">
            <div className="tiny muted" style={{marginRight:6}}>Selecionar mês:</div>
            <input type="month" className="input" value={mes} onChange={e=>setMes(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">{new Date(y, m-1, 1).toLocaleString('pt-BR',{month:'long', year:'numeric'})}</div>
        <div className="card-b">
          <div className="calendar-month">
            {['SEG','TER','QUA','QUI','SEX','SAB','DOM'].map(h=> <div key={h} className="tiny muted" style={{textAlign:'center', padding:'6px 0', fontWeight:700}}>{h}</div>)}
            {diasMes.map(dia=>{
              const solsDia = demonstracoes.filter(s=> s.previsao && s.previsao.getFullYear()===dia.getFullYear() && s.previsao.getMonth()===dia.getMonth() && s.previsao.getDate()===dia.getDate())
              const isToday = isSameDay(dia, new Date())
              return (
                <div className={"calendar-cell"+(isToday?' today':'')} key={dia.toISOString()}>
                  <div className="tiny muted" style={{fontWeight:700, marginBottom:6}}>{dia.getDate()}</div>
                  <div className="vstack">
                    {solsDia.map(s=>{
                      const c = colorBy(s.status)
                      return (
                        <div key={s.id} title={`${(s.chassi_lista?.[0]||'SEM CHASSI')} - ${s.nota}`} style={{background:c.bg, color:c.text, border:`1px solid ${c.border}`, borderRadius:8, padding:'4px 6px'}}>
                          <div style={{fontSize:9, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.chassi_lista?.[0]||'SEM CHASSI'}</div>
                          <div className="tiny" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.nota}</div>
                          <span className="badge" style={{fontSize:8}}>{String(s.status).replace(' (D)','')}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">Legenda de Status</div>
        <div className="card-b hstack" style={{gap:16, flexWrap:'wrap'}}>
          <div className="hstack"><div style="width:16px;height:16px;border-radius:4px;background:#E9D5FF;border:1px solid #C4B5FD"></div><div className="small" style={{marginLeft:6}}>RECEBIDO (D)</div></div>
          <div className="hstack"><div style="width:16px;height:16px;border-radius:4px;background:#DBEAFE;border:1px solid #BFDBFE"></div><div className="small" style={{marginLeft:6}}>PROGRAMADO (D)</div></div>
          <div className="hstack"><div style="width:16px;height:16px;border-radius:4px;background:#DCFCE7;border:1px solid #A7F3D0"></div><div className="small" style={{marginLeft:6}}>CONCLUIDO (D)</div></div>
        </div>
      </div>
    </div>
  )
}
