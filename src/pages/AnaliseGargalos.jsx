import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, TrendingUp, Package, Brain, Save, ChevronRight,
  CheckCircle2, Zap, Target, Star, FileText, ClipboardList,
  DollarSign, ShieldAlert, Search, Lightbulb, BarChart3
} from "lucide-react";
import { toast } from "sonner";

/* ─── helpers ─── */
const CRIT = {
  critico: { label: "CRÍTICO", text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/40",    dot: "bg-red-400",    badge: "bg-red-500/20 text-red-300" },
  alto:    { label: "ALTO",    text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40", dot: "bg-orange-400", badge: "bg-orange-500/20 text-orange-300" },
  medio:   { label: "MÉDIO",   text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/40", dot: "bg-yellow-400", badge: "bg-yellow-500/20 text-yellow-300" },
};

function detectarGargalos(briefing) {
  const g = [];
  if (!briefing) return g;

  if (!briefing.cmv)
    g.push({ id: "cmv", titulo: "CMV não definido", criticidade: "critico", descricao: "Sem controle do Custo de Mercadoria Vendida, o negócio opera no escuro financeiramente.", impacto: "Impossível saber se o negócio dá lucro ou prejuízo real.", acao: "Levantar custo de cada produto e calcular CMV por categoria.", icon: DollarSign });

  if (!briefing.fichas_tecnicas || briefing.fichas_tecnicas.length === 0)
    g.push({ id: "fichas", titulo: "Sem fichas técnicas", criticidade: "critico", descricao: "Produtos produzidos sem padrão de gramatura ou custo definido.", impacto: "Desperdício, inconsistência e impossibilidade de escalar.", acao: "Criar fichas técnicas dos 10 produtos mais vendidos.", icon: FileText });

  if (!briefing.fluxogramas_data || Object.keys(briefing.fluxogramas_data).length === 0)
    g.push({ id: "fluxo", titulo: "Processos não documentados", criticidade: "alto", descricao: "Nenhum fluxo operacional mapeado. Equipe trabalha de memória.", impacto: "Erros, retrabalho e dependência total do dono.", acao: "Mapear e documentar os fluxos dos 3 setores principais.", icon: ClipboardList });

  if (briefing.faturamento_mensal && briefing.media_pedidos_dia) {
    const ticketCalc = (briefing.faturamento_mensal / 30) / briefing.media_pedidos_dia;
    if (briefing.ticket_medio && ticketCalc < briefing.ticket_medio * 0.7)
      g.push({ id: "ticket", titulo: "Ticket médio inconsistente", criticidade: "alto", descricao: "O faturamento declarado não condiz com os pedidos diários.", impacto: "Pode indicar cancelamentos, descontos excessivos ou subnotificação.", acao: "Auditar registros de venda e revisar política de descontos.", icon: TrendingUp });
  }

  const mat = briefing.checklist_maturidade || {};
  if (!mat.financeiro_organizado)
    g.push({ id: "financeiro", titulo: "Financeiro desorganizado", criticidade: "critico", descricao: "Sem separação entre finanças pessoais e do negócio.", impacto: "Sangria de caixa e impossibilidade de medir lucratividade.", acao: "Abrir conta PJ e implementar DRE simples.", icon: DollarSign });

  if (!mat.equipe_treinada)
    g.push({ id: "equipe", titulo: "Equipe sem padrão de treinamento", criticidade: "alto", descricao: "Colaboradores operam sem processos ou treinamentos documentados.", impacto: "Alta rotatividade, erros frequentes e qualidade inconsistente.", acao: "Criar manual de integração e roteiro de treinamento.", icon: ShieldAlert });

  if (!mat.marketing_ativo)
    g.push({ id: "marketing", titulo: "Marketing inativo", criticidade: "medio", descricao: "Pouca ou nenhuma ação de marketing digital ativa.", impacto: "Dependência exclusiva de tráfego orgânico do iFood.", acao: "Criar calendário semanal de conteúdo e ativar impulsionamentos.", icon: Target });

  if (!mat.cardapio_otimizado)
    g.push({ id: "cardapio", titulo: "Cardápio não otimizado", criticidade: "medio", descricao: "Cardápio extenso sem análise de curva ABC.", impacto: "Desperdício operacional e confusão para o cliente.", acao: "Aplicar análise de Pareto e reduzir cardápio aos campeões.", icon: Star });

  return g;
}

function calcularScore(briefing) {
  if (!briefing) return 0;
  let score = 40;
  const mat = briefing.checklist_maturidade || {};
  if (briefing.cmv) score += 10;
  if (briefing.fichas_tecnicas?.length > 0) score += 12;
  if (briefing.fluxogramas_data && Object.keys(briefing.fluxogramas_data).length > 0) score += 8;
  if (mat.financeiro_organizado) score += 8;
  if (mat.equipe_treinada) score += 6;
  if (mat.marketing_ativo) score += 6;
  if (mat.cardapio_otimizado) score += 5;
  if (mat.processos_definidos) score += 5;
  return Math.min(score, 100);
}

/* ─── componentes ─── */
function ScoreGauge({ score }) {
  const r = 66;
  const circ = Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";
  const label = score >= 70 ? "Saudável" : score >= 40 ? "Em Desenvolvimento" : "Atenção Urgente";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="160" height="90" viewBox="0 0 160 90">
        <path d="M 14 84 A 66 66 0 0 1 146 84" fill="none" stroke="#ffffff0f" strokeWidth="12" strokeLinecap="round" />
        <path d="M 14 84 A 66 66 0 0 1 146 84" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`} style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: 'stroke-dasharray 1s ease' }} />
        <text x="80" y="76" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" fontFamily="sans-serif">{score}</text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function GargaloCard({ g, idx }) {
  const cfg = CRIT[g.criticidade] || CRIT.medio;
  const Icon = g.icon || AlertTriangle;
  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex gap-3`}
         style={{ animation: `fadeIn 0.3s ease ${idx * 0.05}s both` }}>
      <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={cfg.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          <h4 className="text-sm font-semibold text-white">{g.titulo}</h4>
        </div>
        <p className="text-xs text-white/60 mb-2">{g.descricao}</p>
        {g.impacto && <p className="text-xs text-white/50 mb-2 italic">📉 {g.impacto}</p>}
        <div className="bg-black/20 rounded-xl px-3 py-2">
          <p className="text-xs text-white/80"><span className="text-[#FF4D00] font-bold">→ </span>{g.acao || g.acao_recomendada}</p>
        </div>
      </div>
    </div>
  );
}

function KitEntregaveis({ briefing }) {
  const items = [
    { label: "Fluxogramas Operacionais", ok: briefing?.fluxogramas_data && Object.keys(briefing.fluxogramas_data).length > 0 },
    { label: "Fichas Técnicas", ok: briefing?.fichas_tecnicas?.length > 0 },
    { label: "Missão, Visão e Valores", ok: false },
    { label: "Manual de Conduta", ok: false },
    { label: "Checklists Operacionais", ok: false },
    { label: "DRE Simplificado", ok: !!briefing?.checklist_maturidade?.financeiro_organizado },
    { label: "Análise de Cardápio (Curva ABC)", ok: !!briefing?.analise_cardapio },
    { label: "Script de Atendimento", ok: false },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item, i) => (
        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.ok ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
          {item.ok
            ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            : <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />}
          <span className={`text-sm ${item.ok ? 'text-emerald-300' : 'text-white/70'}`}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── página principal ─── */
export default function AnaliseGargalos() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [iaResult, setIaResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list()
  });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0],
    enabled: !!mentoradoId
  });

  const mentorado = mentorados.find(m => m.id === mentoradoId);
  const gargalosAuto = useMemo(() => detectarGargalos(briefing), [briefing]);
  const score = useMemo(() => calcularScore(briefing), [briefing]);

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: () => toast.success("Análise salva no briefing!")
  });

  const handleIA = async () => {
    setLoading(true);
    setIaResult(null);
    try {
      const res = await base44.functions.invoke("analisarGargalos", { briefing: briefing || {}, mentorado: mentorado || {} });
      setIaResult(res.data.analysis);
    } catch (e) {
      toast.error("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!briefing?.id) return;
    saveMutation.mutate({ id: briefing.id, data: { ...briefing, analise_gargalos: { score, gargalosAuto, iaResult, gerado_em: new Date().toISOString() } } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Search size={30} className="text-[#FF4D00]" /> Análise de Gargalos
        </h1>
        <p className="text-white/50 mt-1 text-sm">Diagnóstico automático + IA para identificar o que trava o crescimento do negócio</p>
      </div>

      {/* Seleção */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <label className="text-sm text-white/60 block mb-2">Selecionar Mentorado</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={mentoradoId} onValueChange={v => { setMentoradoId(v); setIaResult(null); }}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
              <SelectValue placeholder="Escolha um mentorado..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {mentorados.map(m => (
                <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mentoradoId && (
            <Button onClick={handleIA} disabled={loading} className="bg-[#FF4D00] hover:bg-[#E64500] shrink-0">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Analisando...</>
               : <><Brain size={16} className="mr-2" />🤖 Gerar Análise com IA</>}
            </Button>
          )}
        </div>

        {/* Mini resumo do briefing */}
        {briefing && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: "Faturamento/mês", v: briefing.faturamento_mensal ? `R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')}` : "—" },
              { l: "Ticket Médio", v: briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "—" },
              { l: "Pedidos/dia", v: briefing.media_pedidos_dia || "—" },
              { l: "CMV", v: briefing.cmv ? `${briefing.cmv}%` : "❌ Não definido" },
            ].map((item, i) => (
              <div key={i} className="bg-black/20 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{item.l}</p>
                <p className="text-sm font-bold text-white">{item.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panorama automático */}
      {mentoradoId && (
        <>
          {/* Score + Gargalos automáticos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Score */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
              <p className="text-sm text-white/60 font-medium">Score de Maturidade</p>
              <ScoreGauge score={score} />
              <div className="w-full bg-black/20 rounded-xl p-3">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>0</span><span>50</span><span>100</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${score}%`, background: score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444' }} />
                </div>
              </div>
            </div>

            {/* Resumo de criticidades */}
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-white/60 font-medium mb-3">Gargalos Detectados Automaticamente</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['critico','alto','medio']).map(c => {
                  const cfg = CRIT[c];
                  const count = gargalosAuto.filter(g => g.criticidade === c).length;
                  return (
                    <div key={c} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 text-center`}>
                      <p className={`text-2xl font-bold ${cfg.text}`}>{count}</p>
                      <p className={`text-xs ${cfg.text} font-semibold`}>{cfg.label}</p>
                    </div>
                  );
                })}
              </div>
              {briefing?.problemas_identificados && (
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Problemas relatados pelo mentorado</p>
                  <p className="text-xs text-white/70 line-clamp-3">{briefing.problemas_identificados}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cards de gargalos */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#FF4D00]" /> Gargalos Identificados
            </h3>
            <div className="space-y-3">
              {gargalosAuto.sort((a,b) => {
                const order = {critico:0, alto:1, medio:2};
                return order[a.criticidade] - order[b.criticidade];
              }).map((g, i) => <GargaloCard key={g.id} g={g} idx={i} />)}
              {gargalosAuto.length === 0 && (
                <p className="text-center text-white/40 py-6">✅ Nenhum gargalo crítico detectado automaticamente</p>
              )}
            </div>
          </div>

          {/* Kit de entregáveis */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={18} className="text-[#FF4D00]" /> Kit de Entregáveis
              <span className="text-xs text-white/40 font-normal ml-1">— o que ainda falta gerar para este mentorado</span>
            </h3>
            <KitEntregaveis briefing={briefing} />
          </div>
        </>
      )}

      {/* Loading IA */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#FF4D00]/30 border-t-[#FF4D00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">Analisando com Inteligência Artificial...</p>
          <p className="text-white/40 text-sm mt-1">Claude está gerando o diagnóstico completo</p>
        </div>
      )}

      {/* Resultado IA */}
      {iaResult && !loading && (
        <div className="space-y-5" style={{ animation: 'fadeIn 0.4s ease' }}>
          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button onClick={handleSave} disabled={!briefing?.id} className="bg-[#FF4D00] hover:bg-[#E64500]">
              <Save size={15} className="mr-2" /> Salvar no Briefing
            </Button>
          </div>

          {/* Panorama executivo */}
          {iaResult.panorama_executivo && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 size={18} className="text-[#FF4D00]" /> Panorama Executivo
              </h3>
              <div className="space-y-3">
                {iaResult.panorama_executivo.split('\n\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="text-sm text-white/75 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Potencial financeiro */}
          {iaResult.faturamento_potencial && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#FF4D00]" /> Potencial de Crescimento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Faturamento Atual</p>
                  <p className="text-xl font-bold text-white">R$ {(briefing?.faturamento_mensal || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-[#FF4D00]/10 rounded-xl p-4 border border-[#FF4D00]/20">
                  <p className="text-xs text-[#FF4D00]/70 mb-1">Potencial em 12 semanas</p>
                  <p className="text-xl font-bold text-[#FF4D00]">R$ {iaResult.faturamento_potencial.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400/70 mb-1">Crescimento estimado</p>
                  <p className="text-xl font-bold text-emerald-400">+{iaResult.percentual_crescimento || 0}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Gargalos IA */}
          {iaResult.gargalos_ia?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-[#FF4D00]" /> Gargalos Priorizados pela IA
              </h3>
              <div className="space-y-3">
                {iaResult.gargalos_ia.map((g, i) => <GargaloCard key={i} g={g} idx={i} />)}
              </div>
            </div>
          )}

          {/* Plano 12 semanas */}
          {iaResult.plano_semanas?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={18} className="text-[#FF4D00]" /> Plano de Ação — 12 Semanas
              </h3>
              <div className="space-y-3">
                {iaResult.plano_semanas.map((bloco, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-10 rounded-xl bg-[#FF4D00]/15 border border-[#FF4D00]/30 flex items-center justify-center text-[#FF4D00] text-xs font-bold flex-shrink-0">
                        {bloco.semanas}
                      </div>
                      {i < iaResult.plano_semanas.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">{bloco.tema}</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-2">{bloco.objetivo}</p>
                      <div className="space-y-1">
                        {bloco.acoes?.map((a, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-white/65">
                            <ChevronRight size={12} className="text-[#FF4D00] flex-shrink-0 mt-0.5" />{a}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights finais */}
          {iaResult.insights_finais?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb size={18} className="text-[#FF4D00]" /> Insights da IA
              </h3>
              <div className="space-y-2">
                {iaResult.insights_finais.map((ins, i) => (
                  <div key={i} className="flex items-start gap-3 bg-black/20 rounded-xl p-3 border border-white/5">
                    <Star size={14} className="text-[#FF4D00] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white/75">{ins}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!mentoradoId && (
        <div className="text-center py-16 text-white/30">
          <Search size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">Selecione um mentorado para iniciar a análise</p>
        </div>
      )}
    </div>
  );
}