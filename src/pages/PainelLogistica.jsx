import React, { useEffect, useMemo, useState } from 'react'
import { loadSolicitacoes } from '../api/csvLoader.js'
import StatusCard from '../components/logistica/StatusCard.jsx'
import SolicitacaoCard from '../components/logistica/SolicitacaoCard.jsx'

function HorizontalBarChart({ data }){
  // data: [{label, value}]
  const max = Math.max(1, ...data.map(d=>d.value))
  return (
    <svg className="chart" viewBox={`0 0 100 ${data.length*12+8}`} preserveAspectRatio="none">
      {data.map((d,i)=>{
        const w = (d.value/max)*85
        const y = 6 + i*12
        return (
          <g key={i}>
            <text x="1" y={y+6} fontSize="3" fill="#374151">{d.label}</text>
            <rect x="30" y={y} width={w} height="8" rx="2" fill="#3B82F6"/>
            <text x={30+w+1} y={y+6} fontSize="3" fill="#111827">R$ {d.value.toFixed(2)}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Painel(){
  const [sols, setSols] = useState([])
  useEffect(()=>{ loadSolicitacoes().then(setSols) }, [])

  const now = new Date()
  const last30 = new Date(); last30.setDate(now.getDate()-30)
  const janela = sols.filter(s=> s.previsao && s.previsao>=last30 && s.previsao<=now && !String(s.status).includes('(D)'))

  const counts = useMemo(()=> ({
    RECEBIDO: janela.filter(s=>s.status==='RECEBIDO').length,
    PROGRAMADO: janela.filter(s=>s.status==='PROGRAMADO').length,
    'EM ROTA': janela.filter(s=>s.status==='EM ROTA').length,
    CONCLUIDO: janela.filter(s=>s.status==='CONCLUIDO').length,
  }), [janela])

  const ala = (status)=> sols.filter(s=> s.status===status && s.previsao && s.previsao>= now && s.previsao <= (new Date(now.getTime()+14*86400000)))
                           .sort((a,b)=> a.previsao-b.previsao)

  const recebidos = ala('RECEBIDO')
  const programados = ala('PROGRAMADO')
  const emRota = ala('EM ROTA')

  // custos por cidade a partir de "esta" e "vai"
  const cidades = ['PONTA GROSSA','CASTRO','IRATI','ARAPOTI','GUARAPUAVA','PRUDENTÓPOLIS','QUEDAS DO IGUAÇU','TIBAGI']
  const upperIncludes = (t, q)=> t && t.toUpperCase().includes(q)
  const valor = (s)=> (s.valor_terc>0? s.valor_terc : s.valor_prop)||0
  const custos = {}
  janela.forEach(s=>{
    const est = s.esta || ''; const vai = s.vai || ''
    cidades.forEach(c=>{
      if(upperIncludes(est, c)) custos[c] = (custos[c]||0) + valor(s)
      if(upperIncludes(vai, c))  custos[c] = (custos[c]||0) + valor(s)
    })
  })
  const dataChart = Object.entries(custos).map(([k,v])=>({label: k[0]+k.slice(1).toLowerCase(), value:v})).sort((a,b)=>b.value-a.value).slice(0,8)

  return (
    <div className="grid" style={{gap:20}}>
      <div>
        <h1 className="section-title">Painel Logística 2026</h1>
        <div className="section-sub">Visão geral das operações de transporte</div>
      </div>

      <div className="card">
        <div className="card-h">Formulários de Solicitação</div>
        <div className="card-b hstack" style={{flexWrap:'wrap', gap:10}}>
          <a className="btn" href="#" target="_blank" rel="noreferrer">Solicitação de Frete de Máquinas</a>
          <a className="btn" href="#" target="_blank" rel="noreferrer">Solicitação de Frete de Peças/Fracionados</a>
        </div>
      </div>

      <div className="grid cols-4">
        <StatusCard title="RECEBIDO" count={counts['RECEBIDO']||0} tone="gray" />
        <StatusCard title="PROGRAMADO" count={counts['PROGRAMADO']||0} tone="blue" />
        <StatusCard title="EM ROTA" count={counts['EM ROTA']||0} tone="amber" />
        <StatusCard title="CONCLUIDO" count={counts['CONCLUIDO']||0} tone="green" />
      </div>

      <div className="grid cols-3">
        <div className="card">
          <div className="card-h">RECEBIDO</div>
          <div className="card-b" style={{maxHeight:380, overflow:'auto'}}>
            {recebidos.length===0 ? <div className="tiny muted" style={{textAlign:'center', padding:'16px 0'}}>Nenhuma solicitação</div> :
              recebidos.map(s=> <SolicitacaoCard key={s.id} s={s} />)}
          </div>
        </div>
        <div className="card">
          <div className="card-h">PROGRAMADO</div>
          <div className="card-b" style={{maxHeight:380, overflow:'auto'}}>
            {programados.length===0 ? <div className="tiny muted" style={{textAlign:'center', padding:'16px 0'}}>Nenhuma solicitação</div> :
              programados.map(s=> <SolicitacaoCard key={s.id} s={s} />)}
          </div>
        </div>
        <div className="card">
          <div className="card-h">EM ROTA</div>
          <div className="card-b" style={{maxHeight:380, overflow:'auto'}}>
            {emRota.length===0 ? <div className="tiny muted" style={{textAlign:'center', padding:'16px 0'}}>Nenhuma solicitação</div> :
              emRota.map(s=> <SolicitacaoCard key={s.id} s={s} />)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">Custos de Transporte por Cidade</div>
        <div className="card-b">
          {dataChart.length===0 ? <div className="tiny muted">Sem dados suficientes</div> : <HorizontalBarChart data={dataChart} />}
          <div className="tiny muted" style={{marginTop:8}}>Considera R$ TERC quando > 0, caso contrário R$ PROP</div>
        </div>
      </div>
    </div>
  )
}
