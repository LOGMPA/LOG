import React from 'react'

export default function StatusCard({ title, count, tone='gray' }){
  const toneClass = {
    gray:'kpi gray',
    blue:'kpi blue',
    amber:'kpi amber',
    green:'kpi green',
  }[tone] || 'kpi gray'
  return (
    <div className={toneClass}>
      <div className="tiny muted">{title}</div>
      <div style={{fontSize:28, fontWeight:800}}>{count}</div>
    </div>
  )
}
