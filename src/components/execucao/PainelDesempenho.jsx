import React from "react";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trophy,
  TrendingUp,
  Target,
  Award
} from "lucide-react";

export default function PainelDesempenho({ checklists = [], planosAcao = [], pontuacoes = [] }) {
  // Calcular métricas
  const checklistsConcluidos = checklists.filter(c => c.status === "concluido").length;
  const totalChecklists = checklists.length;
  const taxaConclusao = totalChecklists > 0 ? Math.round((checklistsConcluidos / totalChecklists) * 100) : 0;

  const planosAtrasados = planosAcao.filter(p => p.status === "atrasado" || 
    (p.prazo && new Date(p.prazo) < new Date() && p.status !== "concluido")).length;
  const planosPendentes = planosAcao.filter(p => p.status !== "concluido").length;

  const totalPontos = pontuacoes.reduce((acc, p) => acc + (p.pontos || 0), 0);

  // Calcular tempo médio de execução (simulado)
  const tempoMedio = checklists.length > 0 ? 
    Math.round(checklists.reduce((acc, c) => acc + (c.progresso || 0), 0) / checklists.length) : 0;

  // Score geral (0-100)
  const scoreGeral = Math.min(100, Math.round(
    (taxaConclusao * 0.4) + 
    ((100 - (planosAtrasados * 10)) * 0.3) + 
    (Math.min(totalPontos, 100) * 0.3)
  ));

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muito Bom";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    return "Precisa Melhorar";
  };

  const stats = [
    {
      label: "Taxa de Conclusão",
      value: `${taxaConclusao}%`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20"
    },
    {
      label: "Checklists Executados",
      value: `${checklistsConcluidos}/${totalChecklists}`,
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      label: "Planos de Ação Pendentes",
      value: planosPendentes,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20"
    },
    {
      label: "Atrasados",
      value: planosAtrasados,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <div className="bg-gradient-to-br from-[#FF4D00]/20 to-transparent border border-[#FF4D00]/30 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="text-[#FF4D00]" size={28} />
          <h3 className="text-lg font-semibold text-white">Score de Execução</h3>
        </div>
        <p className={`text-6xl font-bold ${getScoreColor(scoreGeral)} mb-2`}>
          {scoreGeral}
        </p>
        <p className="text-white/60">{getScoreLabel(scoreGeral)}</p>
        <Progress value={scoreGeral} className="mt-4 h-3 bg-white/10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pontuação Total */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Award className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Pontuação Total</p>
              <p className="text-2xl font-bold text-white">{totalPontos} pts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Últimas ações</p>
            <p className="text-sm text-emerald-400 flex items-center gap-1">
              <TrendingUp size={14} /> +{pontuacoes.slice(0, 5).reduce((a, p) => a + (p.pontos || 0), 0)} pts
            </p>
          </div>
        </div>
      </div>

      {/* Selos (Gamificação) */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
          <Award size={18} className="text-[#FF4D00]" />
          Conquistas
        </h4>
        <div className="flex flex-wrap gap-3">
          {taxaConclusao >= 80 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 rounded-full">
              <span className="text-lg">🥇</span>
              <span className="text-xs text-amber-400 font-medium">Mentorado de Ouro</span>
            </div>
          )}
          {planosAtrasados === 0 && planosPendentes === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 rounded-full">
              <span className="text-lg">✅</span>
              <span className="text-xs text-emerald-400 font-medium">Planos em Dia</span>
            </div>
          )}
          {checklistsConcluidos >= 10 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 rounded-full">
              <span className="text-lg">📋</span>
              <span className="text-xs text-blue-400 font-medium">Executor Dedicado</span>
            </div>
          )}
          {totalPontos >= 100 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-violet-500/20 rounded-full">
              <span className="text-lg">⭐</span>
              <span className="text-xs text-violet-400 font-medium">100 Pontos!</span>
            </div>
          )}
          {scoreGeral >= 90 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 rounded-full">
              <span className="text-lg">🚀</span>
              <span className="text-xs text-pink-400 font-medium">Alta Performance</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}