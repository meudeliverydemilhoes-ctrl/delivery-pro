import React from "react";
import {
  CheckCircle2, Clock, AlertTriangle, Trophy, TrendingUp, Target, Award, Star
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const selosConfig = {
  "mentorado_ouro": { label: "Mentorado de Ouro", icon: "🏆", color: "text-amber-400" },
  "gestor_evolucao": { label: "Gestor em Evolução", icon: "📈", color: "text-emerald-400" },
  "alta_performance": { label: "Time Alta Performance", icon: "⚡", color: "text-violet-400" },
  "pontualidade": { label: "Pontualidade", icon: "⏰", color: "text-blue-400" },
  "consistencia": { label: "Consistência", icon: "🎯", color: "text-pink-400" }
};

export default function DashboardPerformance({ 
  execucoes = [], 
  planosAcao = [], 
  score = null,
  mentorado = null 
}) {
  // Cálculos
  const totalChecklists = execucoes.length;
  const concluidos = execucoes.filter(e => e.status === "concluido").length;
  const emAndamento = execucoes.filter(e => e.status === "em_andamento").length;
  const atrasados = execucoes.filter(e => e.status === "atrasado" || (e.data_limite && new Date(e.data_limite) < new Date() && e.status !== "concluido")).length;
  
  const planosPendentes = planosAcao.filter(p => p.status !== "concluido").length;
  const planosResolvidos = planosAcao.filter(p => p.status === "concluido").length;
  
  const taxaConclusao = totalChecklists > 0 ? Math.round((concluidos / totalChecklists) * 100) : 0;
  
  // Score de execução (0-100)
  const scoreExecucao = score?.score_execucao || Math.min(100, Math.max(0, 
    taxaConclusao * 0.6 + 
    (planosResolvidos / Math.max(1, planosAcao.length)) * 30 +
    (atrasados === 0 ? 10 : 0)
  ));

  const tempoMedioExecucao = score?.tempo_medio_execucao || 0;
  const pontosTotais = score?.pontos_totais || (concluidos * 10 + planosResolvidos * 15);

  // Selos conquistados
  const selos = [];
  if (scoreExecucao >= 90) selos.push("mentorado_ouro");
  if (scoreExecucao >= 70 && scoreExecucao < 90) selos.push("gestor_evolucao");
  if (atrasados === 0 && totalChecklists >= 5) selos.push("pontualidade");
  if (taxaConclusao >= 80) selos.push("consistencia");

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excelente!";
    if (score >= 70) return "Muito Bom";
    if (score >= 50) return "Bom";
    if (score >= 30) return "Regular";
    return "Precisa Melhorar";
  };

  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <div className="bg-gradient-to-br from-[#FF4D00]/20 to-violet-500/10 border border-[#FF4D00]/30 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="text-[#FF4D00]" size={24} />
          <span className="text-white/60 text-sm">Score de Execução</span>
        </div>
        <div className={`text-6xl font-bold ${getScoreColor(scoreExecucao)} mb-2`}>
          {Math.round(scoreExecucao)}
        </div>
        <p className={`text-sm ${getScoreColor(scoreExecucao)}`}>{getScoreLabel(scoreExecucao)}</p>
        <Progress value={scoreExecucao} className="h-2 mt-4" />
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={24} />
          <p className="text-2xl font-bold text-white">{taxaConclusao}%</p>
          <p className="text-xs text-white/50">Taxa de Conclusão</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Target className="mx-auto mb-2 text-blue-400" size={24} />
          <p className="text-2xl font-bold text-white">{concluidos}/{totalChecklists}</p>
          <p className="text-xs text-white/50">Checklists Concluídos</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <AlertTriangle className="mx-auto mb-2 text-amber-400" size={24} />
          <p className="text-2xl font-bold text-white">{planosPendentes}</p>
          <p className="text-xs text-white/50">Planos Pendentes</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Star className="mx-auto mb-2 text-[#FF4D00]" size={24} />
          <p className="text-2xl font-bold text-white">{pontosTotais}</p>
          <p className="text-xs text-white/50">Pontos Totais</p>
        </div>
      </div>

      {/* Detalhamento */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Checklists */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-4 flex items-center gap-2">
            <Target size={18} className="text-[#FF4D00]" />
            Status dos Checklists
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> Concluídos
              </span>
              <span className="text-sm font-medium text-emerald-400">{concluidos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <Clock size={14} className="text-blue-400" /> Em Andamento
              </span>
              <span className="text-sm font-medium text-blue-400">{emAndamento}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" /> Atrasados
              </span>
              <span className="text-sm font-medium text-red-400">{atrasados}</span>
            </div>
          </div>
        </div>

        {/* Planos de Ação */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#FF4D00]" />
            Planos de Ação
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> Resolvidos
              </span>
              <span className="text-sm font-medium text-emerald-400">{planosResolvidos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <Clock size={14} className="text-amber-400" /> Pendentes
              </span>
              <span className="text-sm font-medium text-amber-400">{planosPendentes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <Target size={14} className="text-white/40" /> Total
              </span>
              <span className="text-sm font-medium text-white/60">{planosAcao.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selos Conquistados */}
      {selos.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-[#FF4D00]" />
            Selos Conquistados
          </h4>
          <div className="flex flex-wrap gap-3">
            {selos.map((selo) => {
              const config = selosConfig[selo];
              return (
                <div key={selo} className={`flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full ${config.color}`}>
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights da IA */}
      {score?.insights_ia && (
        <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-4">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            Análise Inteligente
          </h4>
          <p className="text-sm text-white/70">{score.insights_ia}</p>
        </div>
      )}
    </div>
  );
}