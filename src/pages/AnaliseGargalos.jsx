import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  AlertTriangle, TrendingUp, Package, Brain,
  Save, Printer, ChevronRight, CheckCircle2, Zap, Target, Star
} from "lucide-react";
import { toast } from "sonner";

const criticidadeConfig = {
  critico: { label: "CRÍTICO", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40", dot: "bg-red-400" },
  alto:    { label: "ALTO",    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40", dot: "bg-orange-400" },
  medio:   { label: "MÉDIO",   color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/40", dot: "bg-yellow-400" }
};

const pilarConfig = {
  processos:         { label: "Processos",          cor: "#3B82F6", semanas: "1-3" },
  desempenho:        { label: "Desempenho",          cor: "#10B981", semanas: "4-6" },
  tempo_potencia:    { label: "Tempo & Potência",    cor: "#8B5CF6", semanas: "7-8" },
  norte_estrategico: { label: "Norte Estratégico",   cor: "#F59E0B", semanas: "9-10" },
  presenca_magnetica:{ label: "Presença Magnética",  cor: "#EC4899", semanas: "11-12" }
};

function ScoreGauge({ score }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const filled = (score / 100) * half;
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#ffffff15" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${half}`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="90" y="80" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">{score}</text>
        <text x="90" y="96" textAnchor="middle" fill="#ffffff60" fontSize="10">SCORE DE SAÚDE</text>
      </svg>
      <p className="text-sm font-medium mt-1" style={{ color }}>
        {score >= 70 ? "Negócio Saudável" : score >= 40 ? "Atenção Necessária" : "Cuidado Imediato"}
      </p>
    </div>
  );
}

function GargaloCard({ gargalo }) {
  const cfg = criticidadeConfig[gargalo.criticidade] || criticidadeConfig.medio;
  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0 mt-1.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
              {pilarConfig[gargalo.pilar]?.label || gargalo.pilar}
            </span>
          </div>
          <h4 className="font-semibold text-white mb-1">{gargalo.titulo}</h4>
          <p className="text-sm text-white/60 mb-2">{gargalo.impacto}</p>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-xs text-white/80"><span className="text-[#FF4D00] font-medium">→ </span>{gargalo.acao_recomendada}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanoTimeline({ plano }) {
  return (
    <div className="space-y-3">
      {plano.map((item, i) => {
        const cfg = pilarConfig[item.pilar] || {};
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                   style={{ backgroundColor: `${cfg.cor}30`, border: `1px solid ${cfg.cor}50`, color: cfg.cor }}>
                {item.semanas}
              </div>
              {i < plano.length - 1 && <div className="w-px h-full bg-white/10 mt-1" />}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white text-sm">{cfg.label}</h4>
                <span className="text-xs text-white/40">· {item.foco}</span>
              </div>
              <div className="space-y-1">
                {item.entregas?.map((e, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle2 size={12} style={{ color: cfg.cor }} className="flex-shrink-0" />
                    {e}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnaliseGargalos() {
  const queryClient = useQueryClient();
  const [selectedMentoradoId, setSelectedMentoradoId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list()
  });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", selectedMentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: selectedMentoradoId }),
    select: (d) => d[0],
    enabled: !!selectedMentoradoId
  });

  const mentoradoSelecionado = mentorados.find(m => m.id === selectedMentoradoId);

  const updateBriefingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: () => toast.success("Análise salva no briefing!")
  });

  const handleAnalyze = async () => {
    if (!briefing && !mentoradoSelecionado) return;
    setIsAnalyzing(true);
    try {
      const res = await base44.functions.invoke("analisarGargalos", {
        briefing: briefing || {},
        mentorado: mentoradoSelecionado || {}
      });
      setAnalysis(res.data.analysis);
    } catch (e) {
      toast.error("Erro ao gerar análise: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!briefing?.id || !analysis) return;
    updateBriefingMutation.mutate({
      id: briefing.id,
      data: { ...briefing, analise_gargalos: analysis }
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Brain size={32} className="text-[#FF4D00]" />
          Análise de Gargalos IA
        </h1>
        <p className="text-white/50 mt-1">Diagnóstico completo e personalizado gerado por inteligência artificial</p>
      </div>

      {/* Seleção do Mentorado */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Selecionar Mentorado</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Select value={selectedMentoradoId} onValueChange={setSelectedMentoradoId}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-11">
                <SelectValue placeholder="Escolha um mentorado..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {mentorados.map(m => (
                  <SelectItem key={m.id} value={m.id} className="text-white">
                    {m.nome} — {m.negocio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!selectedMentoradoId || isAnalyzing}
            className="bg-[#FF4D00] hover:bg-[#E64500] h-11 px-6"
          >
            {isAnalyzing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Analisando...</>
            ) : (
              <><Brain size={16} className="mr-2" />🔍 Analisar Gargalos com IA</>
            )}
          </Button>
        </div>

        {/* Resumo do Briefing */}
        {briefing && selectedMentoradoId && (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Faturamento/mês", value: briefing.faturamento_mensal ? `R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')}` : "—" },
              { label: "Ticket Médio", value: briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "—" },
              { label: "Pedidos/dia", value: briefing.media_pedidos_dia || "—" },
              { label: "CMV", value: briefing.cmv ? `${briefing.cmv}%` : "—" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-white/40">{item.label}</p>
                <p className="text-lg font-bold text-white">{item.value}</p>
              </div>
            ))}
            {briefing.problemas_identificados && (
              <div className="col-span-2 md:col-span-4 bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-white/40 mb-1">Problemas Identificados</p>
                <p className="text-sm text-white/80 line-clamp-2">{briefing.problemas_identificados}</p>
              </div>
            )}
          </div>
        )}

        {selectedMentoradoId && !briefing && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-400">
            ⚠️ Este mentorado não tem briefing preenchido. A análise será gerada com dados limitados.
          </div>
        )}
      </div>

      {/* Loading */}
      {isAnalyzing && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#FF4D00]/30 border-t-[#FF4D00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Analisando o negócio com inteligência artificial...</p>
          <p className="text-white/40 text-sm mt-1">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Resultado da Análise */}
      {analysis && !isAnalyzing && (
        <div className="space-y-5">
          {/* Ações */}
          <div className="flex gap-3 justify-end">
            <Button onClick={handlePrint} variant="outline" className="border-white/20 hover:bg-white/10">
              <Printer size={16} className="mr-2" /> Imprimir
            </Button>
            <Button onClick={handleSave} disabled={!briefing?.id} className="bg-[#FF4D00] hover:bg-[#E64500]">
              <Save size={16} className="mr-2" /> Salvar no Briefing
            </Button>
          </div>

          {/* Score + Resumo */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ScoreGauge score={analysis.score_saude} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Target size={20} className="text-[#FF4D00]" /> Resumo Executivo
                </h3>
                <p className="text-white/80 leading-relaxed">{analysis.resumo_executivo}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                    {analysis.gargalos?.filter(g => g.criticidade === 'critico').length || 0} Críticos
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    {analysis.gargalos?.filter(g => g.criticidade === 'alto').length || 0} Altos
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                    {analysis.gargalos?.filter(g => g.criticidade === 'medio').length || 0} Médios
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gargalos */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#FF4D00]" /> Gargalos Identificados
            </h3>
            <div className="space-y-3">
              {analysis.gargalos?.map((g, i) => <GargaloCard key={i} gargalo={g} />)}
            </div>
          </div>

          {/* Plano 12 Semanas */}
          {analysis.plano_12_semanas?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Zap size={20} className="text-[#FF4D00]" /> Plano 12 Semanas
              </h3>
              <PlanoTimeline plano={analysis.plano_12_semanas} />
            </div>
          )}

          {/* Potencial de Resultado */}
          {analysis.potencial_resultado && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#FF4D00]" /> Potencial de Resultado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-white/40 mb-1">Faturamento Atual</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {(analysis.potencial_resultado.faturamento_atual || 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-white/40 mb-1">Potencial em 12 semanas</p>
                  <p className="text-2xl font-bold text-[#FF4D00]">
                    R$ {(analysis.potencial_resultado.faturamento_projetado || 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400/70 mb-1">Crescimento Estimado</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    +{analysis.potencial_resultado.percentual_crescimento || 0}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-2">Principais alavancas de crescimento:</p>
                <div className="space-y-1">
                  {analysis.potencial_resultado.principais_ganhos?.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                      <ChevronRight size={14} className="text-[#FF4D00] flex-shrink-0" />
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kit de Entregas */}
          {analysis.kit_entregas_sugerido?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package size={20} className="text-[#FF4D00]" /> Kit de Entregas Sugerido
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {analysis.kit_entregas_sugerido.map((item, i) => {
                  const cfg = pilarConfig[item.pilar];
                  return (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                      <Star size={16} className="flex-shrink-0 mt-0.5" style={{ color: cfg?.cor || '#FF4D00' }} />
                      <div>
                        <p className="text-sm font-medium text-white">{item.documento}</p>
                        <p className="text-xs text-white/50 mt-0.5">{item.descricao}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}