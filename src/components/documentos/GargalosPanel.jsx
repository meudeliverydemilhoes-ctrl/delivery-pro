import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Brain, TrendingUp, ChevronRight, DollarSign, FileText, ClipboardList, Target, Star } from "lucide-react";
import { toast } from "sonner";

const CRIT = {
  critico: { label: "CRÍTICO", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40", badge: "bg-red-500/20 text-red-300" },
  alto:    { label: "ALTO",    text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40", badge: "bg-orange-500/20 text-orange-300" },
  medio:   { label: "MÉDIO",   text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/40", badge: "bg-yellow-500/20 text-yellow-300" },
};

function detectar(briefing) {
  const g = [];
  if (!briefing) return g;
  if (!briefing.cmv)
    g.push({ id: "cmv", titulo: "Sem controle de CMV — lucro desconhecido", criticidade: "critico", descricao: "Impossível saber se o negócio dá lucro ou prejuízo real.", acao: "Levantar custo de cada produto e calcular CMV por categoria.", icon: DollarSign });
  if (!briefing.fichas_tecnicas || briefing.fichas_tecnicas.length === 0)
    g.push({ id: "fichas", titulo: "Sem fichas técnicas — desperdício e custo alto", criticidade: "critico", descricao: "Produtos produzidos sem padrão de gramatura ou custo definido.", acao: "Criar fichas técnicas dos 10 produtos mais vendidos.", icon: FileText });
  if (!briefing.fluxogramas_data || Object.keys(briefing.fluxogramas_data || {}).length === 0)
    g.push({ id: "fluxo", titulo: "Operação depende do dono", criticidade: "alto", descricao: "Nenhum fluxo operacional mapeado. Equipe trabalha de memória.", acao: "Mapear fluxogramas dos setores principais.", icon: ClipboardList });
  if (briefing.faturamento_mensal && briefing.faturamento_mensal < 50000)
    g.push({ id: "fat", titulo: "Faturamento abaixo do potencial", criticidade: "alto", descricao: `Faturamento de R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')} está aquém do esperado para o porte.`, acao: "Revisar cardápio, marketing e ticket médio.", icon: TrendingUp });
  if (!briefing.diagnostico_inicial)
    g.push({ id: "diag", titulo: "Briefing incompleto", criticidade: "medio", descricao: "Sem diagnóstico inicial documentado, difícil priorizar ações.", acao: "Completar o diagnóstico inicial no briefing.", icon: Target });
  if (briefing.cmv && briefing.cmv > 35)
    g.push({ id: "cmv_alto", titulo: `CMV alto (${briefing.cmv}%) — margem comprometida`, criticidade: "alto", descricao: "CMV acima de 35% reduz drasticamente a margem de lucro.", acao: "Revisar fornecedores, fichas técnicas e desperdício.", icon: DollarSign });
  return g;
}

function calcScore(briefing) {
  if (!briefing) return 0;
  let s = 20;
  const m = briefing.checklist_maturidade || {};
  if (briefing.cmv && briefing.cmv <= 35) s += 15;
  if (briefing.fichas_tecnicas?.length > 0) s += 15;
  if (briefing.fluxogramas_data && Object.keys(briefing.fluxogramas_data).length > 0) s += 15;
  if (m.financeiro_organizado) s += 10;
  if (m.equipe_treinada) s += 8;
  if (m.marketing_ativo) s += 7;
  if (m.cardapio_otimizado) s += 5;
  if (briefing.diagnostico_inicial) s += 5;
  return Math.min(s, 100);
}

export default function GargalosPanel() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [iaResult, setIaResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0], enabled: !!mentoradoId
  });

  const mentorado = mentorados.find(m => m.id === mentoradoId);
  const gargalos = useMemo(() => detectar(briefing), [briefing]);
  const score = useMemo(() => calcScore(briefing), [briefing]);
  const scoreColor = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";

  const handleIA = async () => {
    setLoading(true);
    setIaResult(null);
    try {
      const res = await base44.functions.invoke("gerarManual", { tipo: "analise_ia", dados: { briefing: briefing || {}, mentorado: mentorado || {} } });
      setIaResult(res.data.result);
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Seleção */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <label className="text-sm text-white/60 block mb-2">Selecionar Mentorado</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={mentoradoId} onValueChange={v => { setMentoradoId(v); setIaResult(null); }}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
              <SelectValue placeholder="Escolha um mentorado..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {mentorados.map(m => <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>)}
            </SelectContent>
          </Select>
          {mentoradoId && (
            <Button onClick={handleIA} disabled={loading} className="bg-[#FF4D00] hover:bg-[#E64500] shrink-0">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Analisando...</>
                : <><Brain size={15} className="mr-2" />🤖 Panorama com IA</>}
            </Button>
          )}
        </div>
      </div>

      {briefing && mentoradoId && (
        <>
          {/* Score */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/70">Score de Maturidade</p>
              <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}/100</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: scoreColor, boxShadow: `0 0 10px ${scoreColor}66` }} />
            </div>
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>Crítico</span><span>Em desenvolvimento</span><span>Saudável</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { l: "Faturamento", v: briefing.faturamento_mensal ? `R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')}` : "—" },
                { l: "Ticket Médio", v: briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "—" },
                { l: "Pedidos/dia", v: briefing.media_pedidos_dia || "—" },
                { l: "CMV", v: briefing.cmv ? `${briefing.cmv}%` : "❌ N/D" },
              ].map((item, i) => (
                <div key={i} className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.l}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{item.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gargalos automáticos */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#FF4D00]" /> Gargalos Detectados
            </h3>
            <div className="space-y-3">
              {gargalos.sort((a, b) => ({ critico: 0, alto: 1, medio: 2 }[a.criticidade] - { critico: 0, alto: 1, medio: 2 }[b.criticidade]))
                .map((g, i) => {
                  const cfg = CRIT[g.criticidade];
                  const Icon = g.icon;
                  return (
                    <div key={g.id} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 flex gap-3`}>
                      <div className={`w-9 h-9 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={cfg.text} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                          <span className="text-sm font-semibold text-white">{g.titulo}</span>
                        </div>
                        <p className="text-xs text-white/60 mb-2">{g.descricao}</p>
                        <div className="bg-black/20 rounded-lg px-3 py-1.5">
                          <p className="text-xs text-white/80"><span className="text-[#FF4D00] font-bold">→ </span>{g.acao}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {gargalos.length === 0 && <p className="text-center text-white/40 py-4 text-sm">✅ Nenhum gargalo crítico detectado</p>}
            </div>
          </div>
        </>
      )}

      {/* Loading IA */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-10 h-10 border-4 border-[#FF4D00]/30 border-t-[#FF4D00] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white font-medium">Gerando panorama completo com IA...</p>
          <p className="text-white/40 text-sm mt-1">Claude está analisando todos os dados</p>
        </div>
      )}

      {/* Resultado IA */}
      {iaResult && !loading && (
        <div className="space-y-4">
          {iaResult.panorama && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Star size={16} className="text-[#FF4D00]" /> Panorama Executivo</h3>
              {iaResult.panorama.split('\n\n').map((p, i) => <p key={i} className="text-sm text-white/75 leading-relaxed mb-2">{p}</p>)}
              {iaResult.frase_motivacional && (
                <div className="mt-3 bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-xl p-3">
                  <p className="text-sm text-[#FF4D00] italic">"{iaResult.frase_motivacional}"</p>
                </div>
              )}
            </div>
          )}

          {iaResult.faturamento_projetado && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-[#FF4D00]" /> Potencial de Crescimento</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40">Atual</p>
                  <p className="text-lg font-bold text-white">R$ {(briefing?.faturamento_mensal || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-[#FF4D00]/10 rounded-xl p-3 border border-[#FF4D00]/20">
                  <p className="text-[10px] text-[#FF4D00]/70">Potencial 12 sem.</p>
                  <p className="text-lg font-bold text-[#FF4D00]">R$ {iaResult.faturamento_projetado.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400/70">Crescimento</p>
                  <p className="text-lg font-bold text-emerald-400">+{iaResult.percentual_crescimento}%</p>
                </div>
              </div>
            </div>
          )}

          {iaResult.top5_gargalos?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-[#FF4D00]" /> Top Gargalos Priorizados pela IA</h3>
              <div className="space-y-2">
                {iaResult.top5_gargalos.map((g, i) => {
                  const cfg = CRIT[g.criticidade] || CRIT.medio;
                  return (
                    <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        <span className="text-sm font-semibold text-white">{g.titulo}</span>
                        <span className="ml-auto text-xs text-white/40">{g.semana}</span>
                      </div>
                      <p className="text-xs text-white/60 mb-1">{g.impacto}</p>
                      <p className="text-xs text-white/80"><span className="text-[#FF4D00]">→ </span>{g.acao}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {iaResult.plano_semanas?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><ChevronRight size={16} className="text-[#FF4D00]" /> Plano Semana a Semana</h3>
              <div className="space-y-2">
                {iaResult.plano_semanas.map((b, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 h-9 rounded-lg bg-[#FF4D00]/15 border border-[#FF4D00]/30 flex items-center justify-center text-[#FF4D00] text-xs font-bold flex-shrink-0">{b.semanas}</div>
                    <div className="flex-1 py-1">
                      <p className="text-sm font-semibold text-white">{b.tema}</p>
                      <p className="text-xs text-white/50">{b.foco} {b.entregavel && <span className="text-[#FF4D00]">· {b.entregavel}</span>}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!mentoradoId && (
        <div className="text-center py-16 text-white/20">
          <Brain size={40} className="mx-auto mb-3 opacity-30" />
          <p>Selecione um mentorado para iniciar</p>
        </div>
      )}
    </div>
  );
}