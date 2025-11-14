import React from "react";
import { Filter, Calendar } from "lucide-react"; // <= troquei Funnel por Filter
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";

export default function FiltrosTransporte({ filtros, onFiltrosChange }) {
  const handleChange = (campo, valor) => {
    onFiltrosChange((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleReset = () => {
    onFiltrosChange({
      chassi: "",
      cliente: "",
      solicitante: "",
      dataInicio: "",
      dataFim: "",
      status: "all",
    });
  };

  return (
    <div className="space-y-3">
      {/* Título dos filtros */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            <Filter className="w-4 h-4 text-blue-600" /> {/* aqui também */}
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Filtros de Busca
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          onClick={handleReset}
        >
          Limpar filtros
        </Button>
      </div>

      {/* Grid de filtros – 1 linha no desktop */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
        {/* CHASSI */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-slate-700">
            CHASSI
          </Label>
          <Input
            placeholder="Buscar chassi..."
            value={filtros.chassi}
            onChange={(e) => handleChange("chassi", e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* CLIENTE */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-slate-700">
            CLIENTE
          </Label>
          <Input
            placeholder="Buscar cliente..."
            value={filtros.cliente}
            onChange={(e) => handleChange("cliente", e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* SOLICITANTE */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-slate-700">
            SOLICITANTE
          </Label>
          <Input
            placeholder="Buscar solicitante..."
            value={filtros.solicitante}
            onChange={(e) => handleChange("solicitante", e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* DATA INÍCIO */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-slate-700">
            DATA INÍCIO
          </Label>
          <div className="relative">
            <Input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => handleChange("dataInicio", e.target.value)}
              className="h-9 pr-8 text-xs"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* DATA FIM */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-slate-700">
            DATA FIM
          </Label>
          <div className="relative">
            <Input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => handleChange("dataFim", e.target.value)}
              className="h-9 pr-8 text-xs"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* STATUS */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-slate-700">
            STATUS
          </Label>
          <Select
            value={filtros.status}
            onValueChange={(v) => handleChange("status", v)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="RECEBIDO">RECEBIDO</SelectItem>
              <SelectItem value="RECEBIDO (D)">RECEBIDO (D)</SelectItem>
              <SelectItem value="PROGRAMADO">PROGRAMADO</SelectItem>
              <SelectItem value="PROGRAMADO (D)">PROGRAMADO (D)</SelectItem>
              <SelectItem value="EM ROTA">EM ROTA</SelectItem>
              <SelectItem value="SUSPENSO">SUSPENSO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
