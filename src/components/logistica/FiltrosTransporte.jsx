import React from 'react'

export default function FiltrosTransporte({ filtros, onChange, showStatus=true }){
  return (
    <div className="card">
      <div className="card-h">Filtros de Busca</div>
      <div className="card-b">
        <div className="grid" style={{gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
          <div>
            <div className="tiny muted">CHASSI</div>
            <input className="input" value={filtros.chassi} onChange={e=>onChange({...filtros, chassi: e.target.value})} placeholder="Buscar chassi..." />
          </div>
          <div>
            <div className="tiny muted">CLIENTE</div>
            <input className="input" value={filtros.cliente} onChange={e=>onChange({...filtros, cliente: e.target.value})} placeholder="Buscar cliente..." />
          </div>
          <div>
            <div className="tiny muted">SOLICITANTE</div>
            <input className="input" value={filtros.solicitante} onChange={e=>onChange({...filtros, solicitante: e.target.value})} placeholder="Buscar solicitante..." />
          </div>
          <div>
            <div className="tiny muted">DATA INÍCIO</div>
            <input type="date" className="input" value={filtros.dataInicio} onChange={e=>onChange({...filtros, dataInicio: e.target.value})} />
          </div>
          <div>
            <div className="tiny muted">DATA FIM</div>
            <input type="date" className="input" value={filtros.dataFim} onChange={e=>onChange({...filtros, dataFim: e.target.value})} />
          </div>
          {showStatus && (
            <div>
              <div className="tiny muted">STATUS</div>
              <select className="select" value={filtros.status} onChange={e=>onChange({...filtros, status: e.target.value})}>
                <option value="all">Todos</option>
                <option>RECEBIDO</option>
                <option>PROGRAMADO</option>
                <option>EM ROTA</option>
                <option>SUSPENSO</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
