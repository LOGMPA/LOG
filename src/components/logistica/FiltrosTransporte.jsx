import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem } from "../ui/select";
import { Search, Filter } from "lucide-react";

export default function FiltrosTransporte({ filtros, onFiltrosChange, showStatusFilter = true }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Filtros de Busca</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="chassi" className="text-xs text-gray-600 mb-1.5 block">CHASSI</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input id="chassi" placeholder="Buscar chassi..." value={filtros.chassi} onChange={(e) => onFiltrosChange({ ...filtros, chassi: e.target.value })} className="pl-9 text-[10px]" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="cliente" className="text-xs text-gray-600 mb-1.5 block">CLIENTE</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input id="cliente" placeholder="Buscar cliente..." value={filtros.cliente} onChange={(e) => onFiltrosChange({ ...filtros, cliente: e.target.value })} className="pl-9 text-[10px]" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="solicitante" className="text-xs text-gray-600 mb-1.5 block">SOLICITANTE</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input id="solicitante" placeholder="Buscar solicitante..." value={filtros.solicitante} onChange={(e) => onFiltrosChange({ ...filtros, solicitante: e.target.value })} className="pl-9 text-[10px]" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="dataInicio" className="text-xs text-gray-600 mb-1.5 block">DATA INÍCIO</Label>
          <Input id="dataInicio" type="date" value={filtros.dataInicio} onChange={(e) => onFiltrosChange({ ...filtros, dataInicio: e.target.value })} className="text-[10px]" />
        </div>
        
        <div>
          <Label htmlFor="dataFim" className="text-xs text-gray-600 mb-1.5 block">DATA FIM</Label>
          <Input id="dataFim" type="date" value={filtros.dataFim} onChange={(e) => onFiltrosChange({ ...filtros, dataFim: e.target.value })} className="text-[10px]" />
        </div>
        
        {showStatusFilter && (
          <div>
            <Label htmlFor="status" className="text-xs text-gray-600 mb-1.5 block">STATUS</Label>
            <Select value={filtros.status} onValueChange={(value) => onFiltrosChange({ ...filtros, status: value })}>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="RECEBIDO">RECEBIDO</SelectItem>
                <SelectItem value="PROGRAMADO">PROGRAMADO</SelectItem>
                <SelectItem value="EM ROTA">EM ROTA</SelectItem>
                <SelectItem value="SUSPENSO">SUSPENSO</SelectItem>
                <SelectItem value="CONCLUIDO">CONCLUÍDO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
