import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Brain, CheckCircle2, DollarSign, ClipboardList, Target, Star, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";

const CRIT = {
  critico: { label: "CRÍTICO", cor: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.35)" },
  alto:    { label: "ALTO",    cor: "#F97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.35)" },
  medio:   { label: "MÉDIO",   cor: "#EAB308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.35)"  },
};

function detectarGargalos(briefing) {
  if (!briefing) return [];
  const g = [];
  const mat = briefing.checklist_maturidade || {};
  const fluxKeys = briefing.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];

  if (!briefing.cmv)
    g.push({ criticidade: "critico", titulo: "Sem controle de CMV — lucro desconhecido", descricao: "Sem saber o custo de mercadoria, é impossível precificar ou medir lucro.", acao: "Calcular CMV de cada produto e definir margem mínima de 65%.", icon: DollarSign });

  if (!briefing.fichas_tecnicas?.length)
    g.push({ criticidade: "critico", titulo: "Sem fichas técnicas — desperdício e custo alto", descricao: "Produção inconsistente gera desperdício e dificulta o controle de custo.", acao: "Criar fichas técnicas A6 para os 10 produtos mais vendidos.", icon: ClipboardList });

  if (!fluxKeys.length)
    g.push({ criticidade: "alto", titulo: "Operação depende do dono", descricao: "Sem fluxogramas, toda decisão depende do proprietário.", acao: "Mapear e documentar os 9 fluxos operacionais principais.", icon: AlertTriangle });

  if (briefing.faturamento_mensal && briefing.faturamento_mensal < 50000)
    g.push({ criticidade: "alto", titulo: `Faturamento abaixo do potencial (R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')}/mês)`, descricao: "Com os ajustes corretos, é possível crescer 40-80% em 12 semanas.", acao: "Otimizar cardápio, ticket médio e estratégia de marketing.", icon: TrendingUp });

  if (!briefing.diagnostico_inicial || briefing.diagnostico_inicial.trim().length < 30)
    g.push({ criticidade: "medio", titulo: "Briefing incompleto — diagnóstico limitado", descricao: "Quanto mais dados, mais preciso é o plano de ação da mentoria.", acao: "Completar todos os campos do briefing antes do próximo encontro.", icon: Target });

  if (!mat.financeiro_organizado)
    g.push({ criticidade: "alto", titulo: "Financeiro desorganizado", descricao: "Contas pessoais e do negócio misturadas comprometem o crescimento.", acao: "Separar finanças pessoais e implementar DRE simples.", icon: DollarSign });

  return g;
}

function calcularScore(briefing) {
  if (!briefing) return 0;
  let score = 30;
  const mat = briefing.checklist_maturidade || {};
  const fluxKeys = briefing.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];
  if (briefing.cmv) score += 15;
  if (briefing.fichas_tecnicas?.length) score += 15;
  if (fluxKeys.length >= 5) score += 12;
  else if (fluxKeys.length > 0) score += 6;
  if (mat.financeiro_organizado) score += 10;
  if (mat.equipe_treinada) score += 8;
  if (mat.marketing_ativo) score += 5;
  if (mat.cardapio_otimizado) score += 5;
  return Math.min(score, 100);
}

export default function AnaliseGargalosKit() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [iaResult, setIaResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0],
    enabled: !!mentoradoId
  });

  const mentorado = mentorados.find(m => m.id === mentoradoId);
  const gargalos = useMemo(() => detectarGargalos(briefing), [briefing]);
  const score = useMemo(() => calcularScore(briefing), [briefing]);
  const scoreCor = score >= 70 ? "#10B981" : score >= 40 ? "#F97316" : "#EF4444";

  const handleIA = async () => {
    setLoading(true); setIaResult(null);
    try {
      const res = await base44.functions.invoke("gerarDocumento", {
        tipo: "analise_gargalos", dados: { briefing: briefing || {}, mentorado: mentorado || {} }
      });
      setIaResult(res.data.result);
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Seleção */}
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
          <Button onClick={handleIA} disabled={loading} className="bg-[#FF6B00] hover:bg-[#E65C00] shrink-0">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Analisando...</>
              : <><Brain size={15} className="mr-2" />🤖 Gerar Análise com IA</>}
          </Button>
        )}
      </div>

      {briefing && (
        <>
          {/* Score */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white/70">Score de Maturidade</p>
              <span className="text-2xl font-black" style={{ color: scoreCor }}>{score}/100</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreCor}80, ${scoreCor})`, boxShadow: `0 0 12px ${scoreCor}60` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/30">Crítico</span>
              <span className="text-[10px] text-white/30">Em desenvolvimento</span>
              <span className="text-[10px] text-white/30">Saudável</span>
            </div>

            {/* Dados rápidos */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { l: "Faturamento", v: briefing.faturamento_mensal ? `R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')}` : "—" },
                { l: "CMV", v: briefing.cmv ? `${briefing.cmv}%` : "❌ Não definido" },
                { l: "Ticket Médio", v: briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "—" },
                { l: "Pedidos/dia", v: briefing.media_pedidos_dia || "—" },
              ].map((item, i) => (
                <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-0.5">{item.l}</p>
                  <p className="text-xs font-bold text-white">{item.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cards de gargalos */}
          <div className="space-y-3">
            {['critico','alto','medio'].map(nivel => {
              const items = gargalos.filter(g => g.criticidade === nivel);
              if (!items.length) return null;
              const cfg = CRIT[nivel];
              return (
                <div key={nivel}>
                  <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: cfg.cor }}>● {cfg.label} ({items.length})</p>
                  {items.map((g, i) => {
                    const Icon = g.icon || AlertTriangle;
                    return (
                      <div key={i} className="rounded-xl p-4 border flex gap-3 mb-2" style={{ background: cfg.bg, borderColor: cfg.border }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.cor}15`, border: `1px solid ${cfg.cor}40` }}>
                          <Icon size={16} style={{ color: cfg.cor }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white mb-1">{g.titulo}</h4>
                          <p className="text-xs text-white/55 mb-2">{g.descricao}</p>
                          <div className="bg-black/20 rounded-lg px-3 py-1.5">
                            <p className="text-xs text-white/75"><span className="font-bold" style={{ color: cfg.cor }}>→ </span>{g.acao}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {!gargalos.length && <p className="text-center text-white/30 py-8">✅ Nenhum gargalo detectado</p>}
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-10 h-10 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white text-sm font-bold">Analisando com IA...</p>
        </div>
      )}

      {/* Resultado IA */}
      {iaResult && !loading && (
        <div className="space-y-4" style={{ animation: "fadeIn 0.4s ease" }}>
          {iaResult.panorama_executivo && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Zap size={15} className="text-[#FF6B00]" /> Diagnóstico Executivo</h3>
              {iaResult.panorama_executivo.split('\n\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-sm text-white/70 leading-relaxed mb-2">{p}</p>
              ))}
              {iaResult.frase_motivacional && (
                <div className="mt-3 p-3 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/5 italic text-center">
                  <p className="text-sm text-[#FF6B00]">"{iaResult.frase_motivacional}"</p>
                </div>
              )}
            </div>
          )}

          {iaResult.faturamento_potencial && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/20 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-white/40 uppercase mb-1">Atual</p>
                <p className="text-base font-black text-white">R$ {(briefing?.faturamento_mensal || 0).toLocaleString('pt-BR')}</p>
              </div>
              <div className="rounded-xl p-3 border text-center" style={{ background: "rgba(255,107,0,0.08)", borderColor: "rgba(255,107,0,0.3)" }}>
                <p className="text-[10px] text-[#FF6B00]/70 uppercase mb-1">Potencial</p>
                <p className="text-base font-black text-[#FF6B00]">R$ {iaResult.faturamento_potencial.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-emerald-400/70 uppercase mb-1">Crescimento</p>
                <p className="text-base font-black text-emerald-400">+{iaResult.percentual_crescimento || 0}%</p>
              </div>
            </div>
          )}

          {iaResult.top5_gargalos?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Top 5 Gargalos Priorizados</h3>
              <div className="space-y-2">
                {iaResult.top5_gargalos.map((g, i) => {
                  const cfg = CRIT[g.criticidade] || CRIT.medio;
                  return (
                    <div key={i} className="flex gap-3 p-3 rounded-xl border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                      <span className="text-xs font-black w-5 text-center flex-shrink-0" style={{ color: cfg.cor }}>{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">{g.titulo}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">{g.impacto || g.descricao}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">🎯 {g.semana_foco}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {iaResult.plano_12_semanas?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Plano — 12 Semanas</h3>
              <div className="space-y-2">
                {iaResult.plano_12_semanas.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-12 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 border border-[#FF6B00]/30 text-[#FF6B00]" style={{ background: "rgba(255,107,0,0.1)" }}>
                      {s.semana}
                    </div>
                    <div className="flex-1 pb-2 border-b border-white/5">
                      <p className="text-xs font-bold text-white">{s.tema}</p>
                      <p className="text-[11px] text-white/45">{s.objetivo}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.acoes?.map((a, j) => (
                          <span key={j} className="text-[10px] text-white/50 flex items-center gap-1">
                            <ChevronRight size={9} className="text-[#FF6B00]" />{a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {iaResult.insights?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Star size={14} className="text-[#FF6B00]" /> Insights</h3>
              {iaResult.insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 bg-black/20 rounded-lg p-2.5 border border-white/5">
                  <ChevronRight size={12} className="text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70">{ins}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!mentoradoId && (
        <div className="text-center py-12 text-white/25">
          <AlertTriangle size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Selecione um mentorado para iniciar</p>
        </div>
      )}
    </div>
  );
}