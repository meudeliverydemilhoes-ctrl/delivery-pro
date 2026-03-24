import React, { useState } from "react";
import { BookOpen, ChefHat, Search } from "lucide-react";
import GuiaMentorado from "@/components/kit/GuiaMentorado";
import FichaTecnica from "@/components/kit/FichaTecnica";
import AnaliseGargalosKit from "@/components/kit/AnaliseGargalosKit";

const ABAS = [
  { id: "guia",     label: "Guia do Mentorado",   icon: BookOpen  },
  { id: "ficha",    label: "Ficha Técnica",        icon: ChefHat   },
  { id: "analise",  label: "Análise de Gargalos",  icon: Search    },
];

export default function KitDocumentos() {
  const [aba, setAba] = useState("guia");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          🎨 Kit de Documentos
        </h1>
        <p className="text-white/40 text-sm mt-1">Guia do mentorado, fichas técnicas e análise de gargalos</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5">
        {ABAS.map(a => {
          const Icon = a.icon;
          const ativo = aba === a.id;
          return (
            <button key={a.id} onClick={() => setAba(a.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${ativo ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <Icon size={15} />
              <span className="hidden sm:inline">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      <div key={aba} style={{ animation: "fadeIn 0.25s ease" }}>
        {aba === "guia"   && <GuiaMentorado />}
        {aba === "ficha"  && <FichaTecnica />}
        {aba === "analise" && <AnaliseGargalosKit />}
      </div>
    </div>
  );
}