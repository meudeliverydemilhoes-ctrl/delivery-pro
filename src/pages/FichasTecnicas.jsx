import React, { useState } from "react";
import { ClipboardList, Plus, LayoutGrid } from "lucide-react";
import MinhasFichas from "@/components/fichas/MinhasFichas";
import NovaFicha from "@/components/fichas/NovaFicha";
import TabelaFichas from "@/components/fichas/TabelaFichas";

const ABAS = [
  { id: "minhas",  label: "Minhas Fichas",      icon: ClipboardList },
  { id: "nova",    label: "Nova Ficha",          icon: Plus          },
  { id: "tabela",  label: "Tabela (Modelo)",     icon: LayoutGrid    },
];

export default function FichasTecnicas() {
  const [aba, setAba] = useState("minhas");
  const [novaConfig, setNovaConfig] = useState({ mentoradoId: "", ficha: null, briefing: null });

  const irParaNova = (mentoradoId = "") => {
    setNovaConfig({ mentoradoId, ficha: null, briefing: null });
    setAba("nova");
  };

  const irParaEditar = (ficha, mentoradoId, briefing) => {
    setNovaConfig({ mentoradoId, ficha, briefing });
    setAba("nova");
  };

  const aoSalvar = () => {
    setAba("minhas");
    setNovaConfig({ mentoradoId: "", ficha: null, briefing: null });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          🍕 Fichas Técnicas
        </h1>
        <p className="text-white/40 text-sm mt-1">Crie, gerencie e visualize fichas técnicas no estilo da mentoria</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5">
        {ABAS.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.id} onClick={() => setAba(a.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${aba === a.id ? "bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/20" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <Icon size={14} />
              <span className="hidden sm:inline">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      <div key={aba} style={{ animation: "fadeIn 0.25s ease" }}>
        {aba === "minhas" && <MinhasFichas onNova={irParaNova} onEditar={irParaEditar} />}
        {aba === "nova" && (
          <NovaFicha
            mentoradoIdInicial={novaConfig.mentoradoId}
            fichaEditar={novaConfig.ficha}
            briefingEditar={novaConfig.briefing}
            onSalvo={aoSalvar}
          />
        )}
        {aba === "tabela" && <TabelaFichas />}
      </div>
    </div>
  );
}