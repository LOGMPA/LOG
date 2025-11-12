import React from "react";
import { Card, CardContent } from "../ui/card";
import { MapPin } from "lucide-react";
import { Badge } from "../ui/badge";

export default function SolicitacaoCard({ solicitacao }) {
  const chassiList = solicitacao.chassi_lista && solicitacao.chassi_lista.length > 0 ? solicitacao.chassi_lista : ["SEM CHASSI"];

  return (
    <Card className="mb-3 hover:shadow-md transition-all duration-200 border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 mb-1 max-h-20 overflow-auto pr-1">
              {chassiList.map((c, idx) => (
                <Badge key={idx} className="text-[10px] px-1.5 py-0 font-mono">{c}</Badge>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 truncate">{solicitacao.nota}</p>
          </div>
          {solicitacao.loc && (
            <a href={solicitacao.loc} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Abrir localização">
              <MapPin className="w-4 h-4 text-blue-600" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
