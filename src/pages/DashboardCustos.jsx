import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Wrench, Package, Wallet } from "lucide-react";
import CustosMaquinas from "../components/custos/CustosMaquinas";
import CustosPecas from "../components/custos/CustosPecas";
import CustosFrota from "../components/custos/CustosFrota";

export default function DashboardCustos() {
  const [activeTab, setActiveTab] = useState("maquinas");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header no estilo do Calendário */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-6">
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
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm border border-gray-100">
            <TabsTrigger
              value="maquinas"
              className="inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Truck className="w-5 h-5" />
              <span>Custos Máquinas</span>
            </TabsTrigger>
            <TabsTrigger
              value="pecas"
              className="inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Package className="w-5 h-5" />
              <span>Custos Peças</span>
            </TabsTrigger>
            <TabsTrigger
              value="frota"
              className="inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Wrench className="w-5 h-5" />
              <span>Custos Frota</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maquinas" className="space-y-6">
            <CustosMaquinas />
          </TabsContent>

          <TabsContent value="pecas" className="space-y-6">
            <CustosPecas />
          </TabsContent>

          <TabsContent value="frota" className="space-y-6">
            <CustosFrota />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
