import React, { useState } from "react";
import ModFichaExcel from "@/components/kits/ModFichaExcel";
import ModMVV from "@/components/kits/ModMVV";
import ModManualColaborador from "@/components/kits/ModManualColaborador";
import ModCargos from "@/components/kits/ModCargos";
import ModManualMentorado from "@/components/kits/ModManualMentorado";

const TABS = [
  { id: "ficha", label: "📊 Ficha de Pesagem" },
  { id: "mvv", label: "🎯 Missão, Visão e Valores" },
  { id: "manual_col", label: "📋 Manual do Colaborador" },
  { id: "cargos", label: "👔 Descrição de Cargos" },
  { id: "manual_ment", label: "📖 Manual do Mentorado" },
];

export default function GeradorKits() {
  const [tab, setTab] = useState("ficha");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">🎨 Gerador de Kits</h1>
        <p className="text-white/40 text-sm mt-1">Gere todos os documentos do kit de mentoria dentro do app</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-[#E8601C] text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div>
        {tab === "ficha" && <ModFichaExcel />}
        {tab === "mvv" && <ModMVV />}
        {tab === "manual_col" && <ModManualColaborador />}
        {tab === "cargos" && <ModCargos />}
        {tab === "manual_ment" && <ModManualMentorado />}
      </div>
    </div>
  );
}