import React, { useEffect, useState, useMemo } from 'react'
import { loadSolicitacoes } from '../api/csvLoader.js'
import { startOfWeekMonday, addDays, startOfMonth, endOfMonth, eachDay, isSameDay, ptBRDayLabel, fmtDM } from '../utils/date.js'

function Item({ s }){
  const chassi = s.chassi_lista?.[0] || 'SEM CHASSI'
  return (
    <div className="list-item">
      <div style={{fontWeight:800, fontSize:12}}>{chassi}</div>
      <div className="tiny muted" title={s.nota} style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.nota}</div>
      {s.loc && <a className="badge" href={s.loc} target="_blank" rel="noreferrer">Mapa</a>}
    </div>
  )
}

export default function Calendario(){
  const [sols, setSols] = useState([])
  useEffect(()=>{ loadSolicitacoes().then(setSols) }, [])

  const today = new Date()
  const seg = startOfWeekMonday(today)
  const sab = addDays(seg, 5)
  const inicioMes = startOfMonth(today)
  const fimMes = endOfMonth(today)
  const diasSemana = eachDay(seg, sab)
  const diasMes = eachDay(inicioMes, fimMes)

  const semana = useMemo(()=> sols
    .filter(s => !String(s.status).includes('(D)') && ['RECEBIDO','PROGRAMADO','EM ROTA'].includes(s.status) && s.previsao && s.previsao>=seg && s.previsao<=sab)
    .sort((a,b)=> a.previsao-b.previsao), [sols, seg, sab])

  const mensal = useMemo(()=> sols
    .filter(s => s.status==='CONCLUIDO' && s.previsao && s.previsao>=inicioMes && s.previsao<=fimMes)
    .sort((a,b)=> a.previsao-b.previsao), [sols, inicioMes, fimMes])

  return (
    <div className="grid" style={{gap:20}}>
      <div>
        <h1 className="section-title">Calendário</h1>
        <div className="section-sub">Visão semanal e mensal de transportes</div>
      </div>

      <div className="card">
        <div className="card-h">Semana Atual - {fmtDM(seg)} a {fmtDM(sab)}</div>
        <div className="card-b">
          <div className="calendar-week">
            {diasSemana.map(dia=>{
              const solsDia = semana.filter(s => s.previsao && (s.previsao.getFullYear()===dia.getFullYear() && s.previsao.getMonth()===dia.getMonth() && s.previsao.getDate()===dia.getDate()))
              return (
                <div className="calendar-day" key={dia.toISOString()}>
                  <div className="calendar-day-h">
                    <div className="tiny" style={{fontWeight:700}}>{ptBRDayLabel(dia)}</div>
                    <div style={{fontSize:22, fontWeight:800}}>{dia.getDate()}</div>
                  </div>
                  <div className="calendar-day-b">
                    {solsDia.length===0 ? <div className="tiny muted" style={{textAlign:'center', padding:'8px 0'}}>Sem transportes</div> :
                      solsDia.map(s=> <Item key={s.id} s={s} />)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">Mês Atual</div>
        <div className="card-b">
          <div className="calendar-month">
            {['SEG','TER','QUA','QUI','SEX','SAB','DOM'].map(h=> <div key={h} className="tiny muted" style={{textAlign:'center', padding:'6px 0', fontWeight:700}}>{h}</div>)}
            {diasMes.map(dia=>{
              const solsDia = mensal.filter(s=> s.previsao && s.previsao.getFullYear()===dia.getFullYear() && s.previsao.getMonth()===dia.getMonth() && s.previsao.getDate()===dia.getDate())
              const isToday = isSameDay(dia, new Date())
              return (
                <div className={"calendar-cell"+(isToday?' today':'')} key={dia.toISOString()}>
                  <div className="tiny muted" style={{fontWeight:700, marginBottom:6}}>{dia.getDate()}</div>
                  <div className="vstack">
                    {solsDia.slice(0,2).map(s=> <div key={s.id} className="chip" title={s.nota}>{s.chassi_lista?.[0] || 'SEM CHASSI'}</div>)}
                    {solsDia.length>2 && <div className="tiny muted">+{solsDia.length-2}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
