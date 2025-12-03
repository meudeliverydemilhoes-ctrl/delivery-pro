import React from "react";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function RankingMentorados({ scores = [], mentorados = [] }) {
  // Ordenar por score de execução
  const ranking = scores
    .map(score => {
      const mentorado = mentorados.find(m => m.id === score.mentorado_id);
      return {
        ...score,
        mentorado
      };
    })
    .filter(s => s.mentorado)
    .sort((a, b) => (b.score_execucao || 0) - (a.score_execucao || 0))
    .map((item, idx) => ({ ...item, posicao: idx + 1 }));

  const getMedalColor = (posicao) => {
    switch (posicao) {
      case 1: return "text-amber-400 bg-amber-500/20";
      case 2: return "text-gray-300 bg-gray-500/20";
      case 3: return "text-amber-600 bg-amber-600/20";
      default: return "text-white/50 bg-white/10";
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp size={14} className="text-emerald-400" />;
    if (trend < 0) return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-white/30" />;
  };

  if (ranking.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-xl">
        <Trophy size={40} className="mx-auto mb-3 text-white/20" />
        <p className="text-white/50">Nenhum ranking disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top 3 em destaque */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {ranking.slice(0, 3).map((item, idx) => (
          <div
            key={item.mentorado_id}
            className={`relative p-4 rounded-xl text-center ${
              idx === 0 
                ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/30" 
                : "bg-white/5 border border-white/10"
            } ${idx === 0 ? "transform -translate-y-2" : ""}`}
          >
            {idx === 0 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Trophy size={24} className="text-amber-400" />
              </div>
            )}
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${getMedalColor(idx + 1)}`}>
              <span className="text-lg font-bold">{idx + 1}º</span>
            </div>
            <div className="w-10 h-10 mx-auto mb-2 bg-[#FF4D00]/20 rounded-full flex items-center justify-center">
              <span className="text-[#FF4D00] font-bold">
                {item.mentorado?.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-medium text-white text-sm truncate">{item.mentorado?.nome}</p>
            <p className="text-xs text-white/50 truncate">{item.mentorado?.negocio}</p>
            <p className={`text-2xl font-bold mt-2 ${
              (item.score_execucao || 0) >= 80 ? "text-emerald-400" : 
              (item.score_execucao || 0) >= 60 ? "text-blue-400" : 
              "text-amber-400"
            }`}>
              {Math.round(item.score_execucao || 0)}
            </p>
            <p className="text-xs text-white/40">pontos</p>
          </div>
        ))}
      </div>

      {/* Lista completa */}
      {ranking.length > 3 && (
        <div className="space-y-2">
          {ranking.slice(3).map((item) => (
            <div
              key={item.mentorado_id}
              className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getMedalColor(item.posicao)}`}>
                {item.posicao}º
              </span>
              <div className="w-8 h-8 bg-[#FF4D00]/20 rounded-full flex items-center justify-center">
                <span className="text-[#FF4D00] font-bold text-sm">
                  {item.mentorado?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{item.mentorado?.nome}</p>
                <p className="text-xs text-white/50 truncate">{item.mentorado?.negocio}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  (item.score_execucao || 0) >= 80 ? "text-emerald-400" : 
                  (item.score_execucao || 0) >= 60 ? "text-blue-400" : 
                  "text-white/60"
                }`}>
                  {Math.round(item.score_execucao || 0)}
                </p>
                <p className="text-xs text-white/40">{item.pontos_totais || 0} pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}