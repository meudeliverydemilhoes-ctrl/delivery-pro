import React, { useState } from "react";
import { FileText, BookOpen, Users, ChefHat, BarChart3, ArrowLeft, Sparkles } from "lucide-react";
import ModuloMVV from "@/components/kit/ModuloMVV";
import ModuloManual from "@/components/kit/ModuloManual";
import ModuloCargos from "@/components/kit/ModuloCargos";
import ModuloGuia from "@/components/kit/ModuloGuia";
import ModuloFichaExcel from "@/components/kit/ModuloFichaExcel";
import ModuloRelatorio from "@/components/kit/ModuloRelatorio";

const MODULOS = [
  { id: "mvv",     emoji: "🎯", label: "Missão, Visão e Valores",      desc: "Gere com IA o MVV completo do negócio",         cor: "#7c6bff", comp: ModuloMVV },
  { id: "manual",  emoji: "📋", label: "Manual do Colaborador",         desc: "Regulamento interno profissional com IA",        cor: "#E8601C", comp: ModuloManual },
  { id: "cargos",  emoji: "👥", label: "Descrição de Cargos",           desc: "Cargos, funções e KPIs para cada papel",         cor: "#10B981", comp: ModuloCargos },
  { id: "guia",    emoji: "🌟", label: "Guia de Boas-Vindas",           desc: "Manual do mentorado para iniciar a jornada",     cor: "#F59E0B", comp: ModuloGuia },
  { id: "ficha",   emoji: "🍕", label: "Fichas Técnicas via Excel",     desc: "Upload de planilha → PDF formatado",             cor: "#EF4444", comp: ModuloFichaExcel },
  { id: "relatorio", emoji: "📊", label: "Relatório de Progresso",       desc: "12 semanas de evolução com análise IA",          cor: "#A855F7", comp: ModuloRelatorio },
];

export default function KitDocumentos() {
  const [modulo, setModulo] = useState(null);

  const mod = MODULOS.find(m => m.id === modulo);

  if (mod) {
    const Comp = mod.comp;
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => setModulo(null)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Voltar ao Kit
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{mod.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{mod.label}</h1>
            <p className="text-white/40 text-sm">{mod.desc}</p>
          </div>
        </div>
        <Comp />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          📄 Kit de Documentos
        </h1>
        <p className="text-white/40 text-sm mt-1">6 módulos de geração automática de documentos para seus mentorados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULOS.map(m => (
          <button key={m.id} onClick={() => setModulo(m.id)}
            className="text-left p-6 rounded-2xl border transition-all hover:scale-[1.02] group"
            style={{ background: `${m.cor}0a`, borderColor: `${m.cor}25` }}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{m.emoji}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: `${m.cor}25`, color: m.cor }}>
                <Sparkles size={14} />
              </div>
            </div>
            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{m.label}</h3>
            <p className="text-white/40 text-sm">{m.desc}</p>
            <div className="mt-4 text-xs font-semibold" style={{ color: m.cor }}>Abrir módulo →</div>
          </button>
        ))}
      </div>
    </div>
  );
}