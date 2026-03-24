import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Circle, ExternalLink } from "lucide-react";

const ITENS = [
  { key: "mvv",       label: "Missão, Visão e Valores",      check: (b) => !!b?.diagnostico_status?.mvv },
  { key: "manual",    label: "Manual do Colaborador",         check: () => false },
  { key: "cargos",    label: "Descrição de Cargos",           check: () => false },
  { key: "fichas",    label: "Fichas Técnicas",               check: (b) => (b?.fichas_tecnicas||[]).length > 0, extra: (b) => b?.fichas_tecnicas?.length ? `${b.fichas_tecnicas.length} ficha(s)` : null },
  { key: "fluxo",     label: "Fluxogramas Operacionais",      check: (b) => b?.fluxogramas_data && Object.keys(b.fluxogramas_data).length > 0, extra: (b) => { const k=Object.keys(b?.fluxogramas_data||{}); return k.length ? `${k.length} setor(es)` : null; } },
  { key: "guia",      label: "Guia de Boas-Vindas",           check: () => false },
  { key: "checklist", label: "Checklists Operacionais",       check: () => false },
  { key: "plano",     label: "Plano de Ação",                 check: () => false },
];

export default function KitEntregaveis({ briefing, mentoradoId }) {
  const concluidos = ITENS.filter(i => i.check(briefing)).length;
  const pct = Math.round((concluidos / ITENS.length) * 100);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">📦 Kit de Entregáveis</h3>
        <span className="text-sm font-bold" style={{ color: pct === 100 ? "#10B981" : pct > 50 ? "#F59E0B" : "#EF4444" }}>
          {concluidos}/{ITENS.length} itens
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="mb-5 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{
          width: `${pct}%`,
          background: pct === 100 ? "#10B981" : pct > 50 ? "#F59E0B" : "#E8601C"
        }} />
      </div>

      <div className="space-y-2">
        {ITENS.map(item => {
          const ok = item.check(briefing);
          const extra = item.extra ? item.extra(briefing) : null;
          return (
            <div key={item.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ok ? "bg-[#10B981]/5 border-[#10B981]/20" : "bg-white/3 border-white/8"}`}>
              {ok
                ? <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                : <Circle size={18} className="text-white/20 flex-shrink-0" />}
              <span className={`flex-1 text-sm font-medium ${ok ? "text-white" : "text-white/50"}`}>{item.label}</span>
              {extra && <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{extra}</span>}
              {!ok && (
                <Link to="/KitDocumentos" className="text-xs px-2 py-1 rounded-lg bg-[#E8601C]/20 text-[#E8601C] hover:bg-[#E8601C]/30 transition-colors font-medium flex-shrink-0">
                  Gerar →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}