import React from 'react'

export default function SolicitacaoCard({ s }){
  const chassi = s.chassi_lista?.[0] || 'SEM CHASSI'
  const extra = (s.chassi_lista?.length || 0) - 1
  return (
    <div className="list-item">
      <div className="hstack" style={{justifyContent:'space-between'}}>
        <div className="vstack" style={{minWidth:0}}>
          <div style={{fontWeight:800, fontSize:12}} title={chassi}>
            {chassi} {extra>0 && <span className="badge">+{extra}</span>}
          </div>
          <div className="tiny muted" title={s.nota} style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {s.nota}
          </div>
        </div>
        {s.loc ? <a className="badge" href={s.loc} target="_blank" rel="noreferrer">Mapa</a> : <span className="badge" style={{opacity:.4}}>-</span>}
      </div>
    </div>
  )
}
