import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Brain, CheckCircle2, Clock, AlertTriangle, ChevronRight, BarChart3, Star } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const SEMANAS_TEMAS = [
  { s: 1, tema: "Diagnóstico & Onboarding", pilar: "Processos" },
  { s: 2, tema: "Fichas Técnicas & CMV", pilar: "Desempenho" },
  { s: 3, tema: "Fluxogramas Operacionais", pilar: "Processos" },
  { s: 4, tema: "Controle Financeiro", pilar: "Desempenho" },
  { s: 5, tema: "Precificação & Cardápio", pilar: "Desempenho" },
  { s: 6, tema: "Equipe & Treinamento", pilar: "Tempo & Potência" },
  { s: 7, tema: "Liderança & Organograma", pilar: "Tempo & Potência" },
  { s: 8, tema: "SOPs & Manuais", pilar: "Processos" },
  { s: 9, tema: "Missão, Visão e Valores", pilar: "Norte Estratégico" },
  { s: 10, tema: "Estratégia de Crescimento", pilar: "Norte Estratégico" },
  { s: 11, tema: "Marketing & iFood", pilar: "Presença Magnética" },
  { s: 12, tema: "Plano de Escala", pilar: "Presença Magnética" },
];

const PILAR_CORES = {
  "Processos": "#EF4444",
  "Desempenho": "#F97316",
  "Tempo & Potência": "#A855F7",
  "Norte Estratégico": "#3B82F6",
  "Presença Magnética": "#10B981",
};

export default function RelatorioProgresso() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [iaResult, setIaResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0], enabled: !!mentoradoId
  });
  const { data: evolucoes = [] } = useQuery({
    queryKey: ["evolucoes", mentoradoId],
    queryFn: () => base44.entities.Evolucao.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });
  const { data: checklists = [] } = useQuery({
    queryKey: ["checklists-exec", mentoradoId],
    queryFn: () => base44.entities.ChecklistExecucao.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const mentorado = mentorados.find(m => m.id === mentoradoId);

  const semanaAtual = useMemo(() => {
    if (!mentorado?.data_entrada) return 1;
    const diff = differenceInDays(new Date(), parseISO(mentorado.data_entrada));
    return Math.min(Math.max(Math.ceil(diff / 7), 1), 12);
  }, [mentorado]);

  const fluxKeys = briefing?.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];
  const entregaveis = [
    { label: "Briefing preenchido", ok: !!briefing && !!briefing.faturamento_mensal },
    { label: "CMV calculado", ok: !!briefing?.cmv },
    { label: "Fichas técnicas", ok: briefing?.fichas_tecnicas?.length > 0 },
    { label: "Fluxogramas", ok: fluxKeys.length >= 3 },
    { label: "Controle financeiro", ok: !!briefing?.checklist_maturidade?.financeiro_organizado },
    { label: "Equipe treinada", ok: !!briefing?.checklist_maturidade?.equipe_treinada },
    { label: "Marketing ativo", ok: !!briefing?.checklist_maturidade?.marketing_ativo },
    { label: "Cardápio otimizado", ok: !!briefing?.checklist_maturidade?.cardapio_otimizado },
  ];

  const concluidosPct = Math.round((entregaveis.filter(e => e.ok).length / entregaveis.length) * 100);

  const handleRelatorioIA = async () => {
    setLoading(true); setIaResult(null);
    try {
      const res = await base44.functions.invoke("gerarDocumento", {
        tipo: "analise_gargalos",
        dados: { briefing: briefing || {}, mentorado: mentorado || {} }
      });
      setIaResult(res.data.result);
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          📊 Relatório & Acompanhamento
        </h1>
        <p className="text-white/40 text-sm mt-1">Progresso detalhado por mentorado com análise de IA</p>
      </div>

      {/* Seletor */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={mentoradoId} onValueChange={v => { setMentoradoId(v); setIaResult(null); }}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
            <SelectValue placeholder="Selecionar mentorado..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {mentorados.map(m => <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>)}
          </SelectContent>
        </Select>
        {mentoradoId && (
          <Button onClick={handleRelatorioIA} disabled={loading} style={{ background: "#7c6bff" }} className="hover:opacity-90 shrink-0">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Gerando...</>
              : <><Brain size={15} className="mr-2" />📊 Relatório com IA</>}
          </Button>
        )}
      </div>

      {mentorado && (
        <>
          {/* Cabeçalho do mentorado */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0"
              style={{ background: "rgba(124,107,255,0.15)", border: "2px solid rgba(124,107,255,0.4)", color: "#7c6bff" }}>
              {mentorado.nome?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{mentorado.nome}</h2>
              <p className="text-sm text-white/50">{mentorado.negocio} · {mentorado.cidade}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black" style={{ color: "#7c6bff" }}>{semanaAtual}/12</p>
              <p className="text-xs text-white/40">semanas</p>
            </div>
          </div>

          {/* Progresso geral */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white">Progresso Geral</h3>
              <span className="text-2xl font-black" style={{ color: concluidosPct >= 70 ? "#10B981" : concluidosPct >= 40 ? "#F59E0B" : "#EF4444" }}>{concluidosPct}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${concluidosPct}%`, background: concluidosPct >= 70 ? "#10B981" : concluidosPct >= 40 ? "#F59E0B" : "#EF4444" }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {entregaveis.map((e, i) => (
                <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl text-xs border ${e.ok ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-white/3 border-white/8 text-white/40'}`}>
                  {e.ok ? <CheckCircle2 size={13} className="flex-shrink-0" /> : <Clock size={13} className="flex-shrink-0" />}
                  {e.label}
                </div>
              ))}
            </div>
          </div>

          {/* Métricas financeiras */}
          {briefing && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={15} style={{ color: "#7c6bff" }} /> Métricas do Negócio
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { l: "Faturamento/mês", v: briefing.faturamento_mensal ? `R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')}` : "—", cor: "#7c6bff" },
                  { l: "Ticket Médio", v: briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "—", cor: "#F97316" },
                  { l: "CMV", v: briefing.cmv ? `${briefing.cmv}%` : "N/D", cor: briefing.cmv && briefing.cmv > 35 ? "#EF4444" : "#10B981" },
                  { l: "Pedidos/dia", v: briefing.media_pedidos_dia || "—", cor: "#3B82F6" },
                ].map((m, i) => (
                  <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-white/40 uppercase mb-1">{m.l}</p>
                    <p className="text-lg font-black" style={{ color: m.cor }}>{m.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline das 12 semanas */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <BarChart3 size={15} style={{ color: "#7c6bff" }} /> Jornada das 12 Semanas
            </h3>
            <div className="space-y-2">
              {SEMANAS_TEMAS.map(({ s, tema, pilar }) => {
                const cor = PILAR_CORES[pilar] || "#7c6bff";
                const status = s < semanaAtual ? "concluida" : s === semanaAtual ? "atual" : "futura";
                return (
                  <div key={s} className={`flex gap-3 items-center p-3 rounded-xl transition-all ${status === "atual" ? "border" : "border border-transparent"}`}
                    style={status === "atual" ? { background: `${cor}0f`, borderColor: `${cor}30` } : {}}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 border`}
                      style={{
                        background: status === "concluida" ? "#10B98120" : status === "atual" ? `${cor}25` : "rgba(255,255,255,0.05)",
                        borderColor: status === "concluida" ? "#10B98140" : status === "atual" ? `${cor}50` : "rgba(255,255,255,0.08)",
                        color: status === "concluida" ? "#10B981" : status === "atual" ? cor : "rgba(255,255,255,0.3)"
                      }}>
                      {status === "concluida" ? "✓" : s}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${status === "futura" ? "text-white/30" : "text-white"}`}>{tema}</p>
                        {status === "atual" && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${cor}20`, color: cor }}>ATUAL</span>}
                      </div>
                      <p className="text-[10px] text-white/30">{pilar}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "rgba(124,107,255,0.2)", borderTopColor: "#7c6bff" }} />
          <p className="text-white text-sm font-bold">Gerando relatório com IA...</p>
        </div>
      )}

      {/* Resultado IA */}
      {iaResult && !loading && (
        <div className="space-y-4" style={{ animation: "fadeIn 0.4s ease" }}>
          {iaResult.panorama_executivo && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Star size={15} style={{ color: "#7c6bff" }} /> Análise Executiva
              </h3>
              {iaResult.panorama_executivo.split('\n\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-sm text-white/70 leading-relaxed mb-2">{p}</p>
              ))}
              {iaResult.frase_motivacional && (
                <div className="mt-3 p-3 rounded-xl text-center italic border" style={{ background: "rgba(124,107,255,0.08)", borderColor: "rgba(124,107,255,0.25)", color: "#7c6bff" }}>
                  "{iaResult.frase_motivacional}"
                </div>
              )}
            </div>
          )}
          {iaResult.faturamento_potencial && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Atual", v: `R$ ${(briefing?.faturamento_mensal || 0).toLocaleString('pt-BR')}`, cor: "rgba(255,255,255,0.7)" },
                { l: "Potencial", v: `R$ ${iaResult.faturamento_potencial.toLocaleString('pt-BR')}`, cor: "#7c6bff" },
                { l: "Crescimento", v: `+${iaResult.percentual_crescimento || 0}%`, cor: "#10B981" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">{item.l}</p>
                  <p className="text-lg font-black" style={{ color: item.cor }}>{item.v}</p>
                </div>
              ))}
            </div>
          )}
          {iaResult.insights?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
              {iaResult.insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 bg-black/20 rounded-xl p-3 border border-white/5">
                  <ChevronRight size={12} style={{ color: "#7c6bff" }} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70">{ins}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!mentoradoId && (
        <div className="text-center py-20 text-white/20">
          <BarChart3 size={48} className="mx-auto mb-3 opacity-20" />
          <p>Selecione um mentorado para ver o relatório</p>
        </div>
      )}
    </div>
  );
}