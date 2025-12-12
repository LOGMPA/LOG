import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tractor, Wrench, Package, Wallet, Lock, Truck } from "lucide-react";
import CustosMaquinas from "../components/custos/CustosMaquinas";
import CustosPecas from "../components/custos/CustosPecas";
import CustosFrota from "../components/custos/CustosFrota";

/** Meses disponíveis no painel de custos */
const MESES = [
  { id: "geral", label: "GERAL", value: null, locked: false },
  { id: "out25", label: "OUT/25", value: "2025-10", locked: false },
  { id: "nov25", label: "NOV/25", value: "2025-11", locked: true },
  { id: "dez25", label: "DEZ/25", value: "2025-12", locked: true },
  { id: "jan26", label: "JAN/26", value: "2026-01", locked: true },
  { id: "fev26", label: "FEV/26", value: "2026-02", locked: true },
  { id: "mar26", label: "MAR/26", value: "2026-03", locked: true },
  { id: "abr26", label: "ABR/26", value: "2026-04", locked: true },
  { id: "mai26", label: "MAI/26", value: "2026-05", locked: true },
  { id: "jun26", label: "JUN/26", value: "2026-06", locked: true },
  { id: "ago26", label: "AGO/26", value: "2026-08", locked: true },
  { id: "set26", label: "SET/26", value: "2026-09", locked: true },
  { id: "out26", label: "OUT/26", value: "2026-10", locked: true },
];

export default function DashboardCustos() {
  const [activeTab, setActiveTab] = useState("maquinas");
  const [mesSelecionado, setMesSelecionado] = useState("geral");

  const mesAtual = MESES.find((m) => m.id === mesSelecionado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header no estilo do Calendário */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-3">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div
                className="px-5 py-3"
                style={{
                  background:
                    "linear-gradient(90deg, #165A2A 0%, #FDBA74 40%, #FDE68A 75%, #F9FAFB 100%)",
                }}
              >
                <div className="w-full max-w-xl bg-white/95 rounded-2xl shadow-md px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Wallet className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl md:text-2xl font-extrabold text-slate-900">
                      Painel de Custos
                    </span>
                    <span className="text-sm md:text-base text-slate-600">
                      Visão consolidada dos custos operacionais 2026.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 pt-4 pb-6 space-y-4">
        {/* Linha de meses em cima */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            {MESES.map((mes) => {
              const isActive = mesSelecionado === mes.id;
              const isLocked = mes.locked;

              return (
                <Button
                  key={mes.id}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) setMesSelecionado(mes.id);
                  }}
                  className={
                    isActive && !isLocked
                      ? "bg-[#FCDC01] text-[#2A5E20] hover:bg-[#FCDC01]/90 font-bold shadow-sm"
                      : isLocked
                      ? "text-slate-400 hover:bg-transparent cursor-not-allowed border border-dashed border-slate-300"
                      : "text-slate-700 hover:bg-slate-100 font-semibold"
                  }
                  title={
                    isLocked
                      ? "Mês bloqueado: sem dados consolidados ainda."
                      : undefined
                  }
                >
                  {isLocked && <Lock className="w-3 h-3 mr-1 opacity-80" />}
                  {mes.label}
                </Button>
              );
            })}
          </div>

          {/* Indicador do período selecionado */}
          {mesSelecionado !== "geral" && mesAtual && (
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold border-emerald-400 bg-emerald-50 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Período selecionado: {mesAtual.label}
              </div>
            </div>
          )}
        </div>

        {/* Tabs de Máquinas / Peças / Frota logo abaixo dos meses */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white p-1 shadow-sm border border-gray-100">
            <TabsTrigger
              value="maquinas"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Tractor className="w-4 h-4" />
              <span>Custos Máquinas</span>
            </TabsTrigger>
            <TabsTrigger
              value="pecas"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Package className="w-4 h-4" />
              <span>Custos Peças</span>
            </TabsTrigger>
            <TabsTrigger
              value="frota"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Truck className="w-4 h-4" />
              <span>Custos Frota</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maquinas" className="space-y-4">
            <CustosMaquinas mes={mesAtual?.value} />
          </TabsContent>

          <TabsContent value="pecas" className="space-y-4">
            <CustosPecas mes={mesAtual?.value} />
          </TabsContent>

          <TabsContent value="frota" className="space-y-4">
            <CustosFrota mes={mesAtual?.value} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
