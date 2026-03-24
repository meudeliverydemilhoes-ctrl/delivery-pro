import React from "react";
import { Link } from "react-router-dom";
import { Package, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

const DOCS_COUNT = 8;

function calcKit(briefing) {
  if (!briefing) return 0;
  let score = 0;
  if (briefing.diagnostico_status?.mvv) score++;
  if ((briefing.fichas_tecnicas||[]).length > 0) score++;
  if (briefing.fluxogramas_data && Object.keys(briefing.fluxogramas_data).length > 0) score++;
  return score;
}

export default function StatusKits({ mentorados, briefings }) {
  const ativos = mentorados.filter(m => m.status === "ativo");
  const briefingMap = {};
  briefings.forEach(b => { briefingMap[b.mentorado_id] = b; });

  const semMVV     = ativos.filter(m => !briefingMap[m.id]?.diagnostico_status?.mvv);
  const semFichas  = ativos.filter(m => !(briefingMap[m.id]?.fichas_tecnicas?.length > 0));
  const semManual  = ativos; // placeholder

  if (ativos.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <Package size={18} style={{ color: "#E8601C" }} /> Status dos Kits
        </h2>
        <Link to="/KitDocumentos" className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors">
          Gerar docs <ArrowRight size={12} />
        </Link>
      </div>

      {/* Alertas críticos */}
      <div className="space-y-2 mb-5">
        {semMVV.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-300 text-xs">
            <AlertTriangle size={13} className="flex-shrink-0" />
            <span>{semMVV.length} mentorado{semMVV.length>1?"s":""} sem MVV: {semMVV.slice(0,2).map(m=>m.nome).join(", ")}{semMVV.length>2?` +${semMVV.length-2}`:""}</span>
          </div>
        )}
        {semFichas.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-300 text-xs">
            <AlertTriangle size={13} className="flex-shrink-0" />
            <span>{semFichas.length} sem fichas técnicas</span>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {ativos.slice(0, 6).map(m => {
          const b = briefingMap[m.id];
          const score = calcKit(b);
          const pct = Math.round((score / DOCS_COUNT) * 100);
          const cor = pct >= 75 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#EF4444";
          return (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ background: "#ffffff10", color: "#fff" }}>
                {m.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white truncate">{m.nome}</span>
                  <span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: cor }}>{score}/{DOCS_COUNT}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}