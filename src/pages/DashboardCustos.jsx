import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Truck, Wrench, Package } from "lucide-react";
import CustosMaquinas from "../components/custos/CustosMaquinas";
import CustosPecas from "../components/custos/CustosPecas";
import CustosFrota from "../components/custos/CustosFrota";

export default function DashboardCustos() {
  const [activeTab, setActiveTab] = useState("maquinas");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-light text-gray-900 tracking-tight">
              Painel de Custos
            </h1>
            <p className="text-gray-500 text-lg font-light">
              Análise completa de custos operacionais 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
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
