import React, { useState } from "react";
import { Search, FileText } from "lucide-react";
import GargalosPanel from "@/components/documentos/GargalosPanel";
import ManualPanel from "@/components/documentos/ManualPanel";

const TABS = [
  { id: "gargalos", label: "🔍 Análise de Gargalos", icon: Search },
  { id: "manual",   label: "📄 Manual do Colaborador", icon: FileText },
];

export default function GeradorDocumentos() {
  const [tab, setTab] = useState("gargalos");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">📄 Gerador de Documentos</h1>
        <p className="text-white/50 mt-1 text-sm">Análise de gargalos por IA e geração automática de manuais profissionais</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? "bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/20" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "gargalos" && <GargalosPanel />}
      {tab === "manual"   && <ManualPanel />}
    </div>
  );
}