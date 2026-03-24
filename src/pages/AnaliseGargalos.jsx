import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, TrendingUp, Brain, Save, ChevronRight,
  CheckCircle2, Clock, DollarSign, Users, Compass, Megaphone,
  ClipboardList, Search, Lightbulb, Star, Zap, Target
} from "lucide-react";
import { toast } from "sonner";

/* ── PILARES CONFIG ── */
const PILARES = {
  processos:          { label: "Processos",         cor: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)",   icon: ClipboardList, encontros: "1–3"   },
  desempenho:         { label: "Desempenho",         cor: "#F97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.3)",  icon: TrendingUp,    encontros: "4–6"   },
  tempo_potencia:     { label: "Tempo & Potência",   cor: "#A855F7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.3)",  icon: Users,         encontros: "7–8"   },
  norte_estrategico:  { label: "Norte Estratégico",  cor: "#3B82F6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.3)",  icon: Compass,       encontros: "9–10"  },
  presenca_magnetica: { label: "Presença Magnética", cor: "#10B981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.3)",  icon: Megaphone,     encontros: "11–12" },
};

const CRIT = {
  critico: { label: "CRÍTICO", text: "#EF4444", badge: "rgba(239,68,68,0.15)" },
  alto:    { label: "ALTO",    text: "#F97316", badge: "rgba(249,115,22,0.15)" },
  medio:   { label: "MÉDIO",   text: "#EAB308", badge: "rgba(234,179,8,0.15)"  },
};

/* ── DETECÇÃO DE GARGALOS ── */
function detectarGargalos(briefing) {
  if (!briefing) return [];
  const g = [];
  const mat = briefing.checklist_maturidade || {};
  const fluxKeys = briefing.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];
  const prob = (briefing.problemas_identificados || "").toLowerCase();

  // PROCESSOS
  if (!briefing.fichas_tecnicas?.length)
    g.push({ pilar: "processos", criticidade: "critico", titulo: "Sem fichas técnicas", problema: "Produtos são produzidos sem padrão de gramatura ou custo definido.", impacto: "Desperdício, prejuízo oculto e impossibilidade de escalar.", entrega: "Fichas Técnicas no formato A6 para impressão (todos os produtos)", encontro: "Encontro 1–2" });

  if (!fluxKeys.length)
    g.push({ pilar: "processos", criticidade: "critico", titulo: "Sem fluxogramas operacionais", problema: "Nenhum setor tem processo documentado. Equipe trabalha de memória.", impacto: "Erros constantes, retrabalho e total dependência do dono.", entrega: "9 Fluxogramas operacionais completos (A3 plastificado)", encontro: "Encontro 2–3" });
  else if (fluxKeys.length < 5)
    g.push({ pilar: "processos", criticidade: "alto", titulo: "Fluxogramas incompletos", problema: `Apenas ${fluxKeys.length} de 9 setores mapeados.`, impacto: "Gaps operacionais nos setores não mapeados.", entrega: "Fluxogramas dos setores faltantes", encontro: "Encontro 3" });

  if (!mat.processos_definidos)
    g.push({ pilar: "processos", criticidade: "alto", titulo: "Sem SOPs documentados", problema: "Procedimentos operacionais não estão escritos.", impacto: "Cada colaborador executa diferente, sem padrão.", entrega: "SOPs principais + Checklists de abertura e fechamento", encontro: "Encontro 3" });

  // DESEMPENHO
  if (!briefing.cmv)
    g.push({ pilar: "desempenho", criticidade: "critico", titulo: "CMV não calculado", problema: "Custo de Mercadoria Vendida nunca foi calculado.", impacto: "O negócio pode estar operando no prejuízo sem saber.", entrega: "Planilha de CMV + Ficha de custo por produto", encontro: "Encontro 4" });
  else if (parseFloat(briefing.cmv) > 35)
    g.push({ pilar: "desempenho", criticidade: "alto", titulo: `CMV elevado (${briefing.cmv}%)`, problema: "CMV acima de 35% compromete a lucratividade.", impacto: "Margem apertada impede reinvestimento e crescimento.", entrega: "Revisão de cardápio + negociação com fornecedores", encontro: "Encontro 4–5" });

  if (!briefing.faturamento_mensal || briefing.faturamento_mensal === 0)
    g.push({ pilar: "desempenho", criticidade: "critico", titulo: "Faturamento não monitorado", problema: "Não há controle do faturamento real do negócio.", impacto: "Impossível medir crescimento ou tomar decisões financeiras.", entrega: "DRE Simplificado + Controle de caixa diário", encontro: "Encontro 4" });

  if (!mat.financeiro_organizado)
    g.push({ pilar: "desempenho", criticidade: "alto", titulo: "Financeiro desorganizado", problema: "Finanças pessoais e do negócio misturadas.", impacto: "Sangria de caixa e impossibilidade de pagar pró-labore.", entrega: "Conta PJ separada + DRE + Controle de despesas fixas/variáveis", encontro: "Encontro 5" });

  // TEMPO & POTÊNCIA
  if (prob.includes("preso") || prob.includes("sozinho") || prob.includes("dono") || !mat.equipe_treinada)
    g.push({ pilar: "tempo_potencia", criticidade: "alto", titulo: "Dono preso na operação", problema: "O proprietário executa funções operacionais diariamente.", impacto: "Impossível crescer, viajar ou adoecer sem o negócio parar.", entrega: "Organograma + Matriz de Alçadas + Manual de Conduta da Equipe", encontro: "Encontro 7" });

  if (!mat.equipe_treinada)
    g.push({ pilar: "tempo_potencia", criticidade: "alto", titulo: "Equipe sem treinamento formal", problema: "Colaboradores aprendem vendo o dono fazer, sem material.", impacto: "Alta rotatividade e queda de qualidade constante.", entrega: "Manual de integração + Roteiro de treinamento por função", encontro: "Encontro 7–8" });

  // NORTE ESTRATÉGICO
  if (!briefing.objetivos || briefing.objetivos.trim().length < 20)
    g.push({ pilar: "norte_estrategico", criticidade: "alto", titulo: "Sem MVV definido", problema: "Negócio não tem Missão, Visão e Valores documentados.", impacto: "Equipe sem propósito, marca sem identidade clara.", entrega: "Documento de Missão, Visão e Valores", encontro: "Encontro 9" });

  if (!mat.delivery_eficiente)
    g.push({ pilar: "norte_estrategico", criticidade: "medio", titulo: "Operação de delivery ineficiente", problema: "Entrega sem padrão de tempo, rota ou qualidade.", impacto: "Avaliações negativas no iFood e perda de recorrência.", entrega: "SOP de Expedição + Avaliação de entregadores", encontro: "Encontro 9–10" });

  // PRESENÇA MAGNÉTICA
  if (!mat.marketing_ativo)
    g.push({ pilar: "presenca_magnetica", criticidade: "medio", titulo: "Sem marketing digital ativo", problema: "Nenhuma estratégia de conteúdo ou impulsionamento ativo.", impacto: "Dependência total do algoritmo orgânico do iFood.", entrega: "Calendário de conteúdo 30 dias + Estratégia iFood", encontro: "Encontro 11" });

  if (!mat.cardapio_otimizado)
    g.push({ pilar: "presenca_magnetica", criticidade: "medio", titulo: "Cardápio não otimizado para conversão", problema: "Fotos, descrições e precificação sem estratégia.", impacto: "Taxa de conversão baixa no iFood e ticket médio abaixo do potencial.", entrega: "Análise de Cardápio + Guia de fotos + Descrições otimizadas", encontro: "Encontro 11–12" });

  return g;
}

/* ── SCORE POR PILAR ── */
function calcularScorePorPilar(briefing) {
  if (!briefing) return { processos: 0, desempenho: 0, tempo_potencia: 0, norte_estrategico: 0, presenca_magnetica: 0, total: 0 };
  const mat = briefing.checklist_maturidade || {};
  const fluxKeys = briefing.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];

  const processos = (
    (briefing.fichas_tecnicas?.length > 0 ? 4 : 0) +
    (fluxKeys.length >= 5 ? 4 : fluxKeys.length > 0 ? 2 : 0) +
    (mat.processos_definidos ? 4 : 0) +
    4 + // checklists (assumido)
    0   // manual conduta (não temos campo)
  );

  const desempenho = (
    (briefing.cmv && parseFloat(briefing.cmv) <= 35 ? 4 : briefing.cmv ? 2 : 0) +
    (mat.financeiro_organizado ? 4 : 0) +
    (briefing.ticket_medio ? 4 : 0) +
    (briefing.faturamento_mensal ? 4 : 0) +
    0
  );

  const tempo_potencia = (
    (mat.equipe_treinada ? 8 : 0) +
    (mat.processos_definidos ? 4 : 0) +
    8
  );

  const norte_estrategico = (
    (briefing.objetivos?.trim().length > 20 ? 8 : 0) +
    (mat.delivery_eficiente ? 4 : 0) +
    8
  );

  const presenca_magnetica = (
    (mat.marketing_ativo ? 8 : 0) +
    (mat.cardapio_otimizado ? 8 : 0) +
    4
  );

  const clamp = (v, max) => Math.min(v, max);
  const p1 = clamp(processos, 20);
  const p2 = clamp(desempenho, 20);
  const p3 = clamp(tempo_potencia, 20);
  const p4 = clamp(norte_estrategico, 20);
  const p5 = clamp(presenca_magnetica, 20);

  return { processos: p1, desempenho: p2, tempo_potencia: p3, norte_estrategico: p4, presenca_magnetica: p5, total: p1 + p2 + p3 + p4 + p5 };
}

/* ── KIT ENTREGAS ── */
function calcularKit(briefing) {
  const fluxKeys = briefing?.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];
  const fluxMap = {
    atendimento: "Fluxograma Atendimento",
    cozinha: "Fluxograma Cozinha",
    montagem: "Fluxograma Montagem",
    expedicao: "Fluxograma Expedição",
    entregadores: "Fluxograma Entregadores",
    estoque: "Fluxograma Estoque",
    compras: "Fluxograma Compras",
    financeiro: "Fluxograma Financeiro",
    gestao: "Fluxograma Gestão",
  };

  const fluxItems = Object.entries(fluxMap).map(([key, label]) => ({
    label, ok: fluxKeys.includes(key), pilar: "processos"
  }));

  const extras = [
    { label: "Fichas Técnicas", ok: briefing?.fichas_tecnicas?.length > 0, pilar: "processos" },
    { label: "Missão, Visão e Valores", ok: false, pilar: "norte_estrategico" },
    { label: "Manual de Conduta", ok: false, pilar: "tempo_potencia" },
    { label: "Organograma", ok: false, pilar: "tempo_potencia" },
    { label: "Matriz de Alçadas", ok: false, pilar: "tempo_potencia" },
  ];

  return [...fluxItems, ...extras];
}

/* ── COMPONENTES UI ── */
function GaugeScore({ scores }) {
  const total = scores.total;
  const r = 70;
  const circ = Math.PI * r;
  const filled = (total / 100) * circ;
  const color = total >= 70 ? "#10B981" : total >= 40 ? "#F97316" : "#EF4444";
  const status = total >= 70 ? "Negócio Saudável" : total >= 40 ? "Em Desenvolvimento" : "Atenção Urgente";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="170" height="100" viewBox="0 0 170 100">
        <path d="M 15 90 A 70 70 0 0 1 155 90" fill="none" stroke="#ffffff0a" strokeWidth="14" strokeLinecap="round" />
        <path d="M 15 90 A 70 70 0 0 1 155 90" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          style={{ filter: `drop-shadow(0 0 10px ${color}88)`, transition: "stroke-dasharray 1.2s ease" }} />
        <text x="85" y="80" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">{total}</text>
        <text x="85" y="94" textAnchor="middle" fill="#ffffff50" fontSize="9" letterSpacing="1">MATURIDADE</text>
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{status}</span>
    </div>
  );
}

function PilarBar({ pilarKey, score }) {
  const p = PILARES[pilarKey];
  const Icon = p.icon;
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <Icon size={14} style={{ color: p.cor }} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-white/60">{p.label}</span>
          <span className="text-xs font-bold" style={{ color: p.cor }}>{score}/20</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(score / 20) * 100}%`, backgroundColor: p.cor, boxShadow: `0 0 6px ${p.cor}80` }} />
        </div>
      </div>
    </div>
  );
}

function GargaloCard({ g, idx }) {
  const pilar = PILARES[g.pilar] || PILARES.processos;
  const crit = CRIT[g.criticidade] || CRIT.medio;
  const Icon = pilar.icon;

  return (
    <div className="rounded-2xl p-4 border flex gap-3"
      style={{ background: pilar.bg, borderColor: pilar.border, animation: `fadeIn 0.3s ease ${idx * 0.06}s both` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
        style={{ background: `${pilar.cor}15`, borderColor: `${pilar.cor}40` }}>
        <Icon size={18} style={{ color: pilar.cor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: crit.badge, color: crit.text }}>
            {crit.label}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">{pilar.label}</span>
          <span className="text-[10px] text-white/30">{g.encontro}</span>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">{g.titulo}</h4>
        <p className="text-xs text-white/60 mb-1">{g.problema}</p>
        <p className="text-xs text-white/40 italic mb-2">📉 {g.impacto}</p>
        <div className="rounded-xl px-3 py-2 bg-black/20 border border-white/5">
          <p className="text-xs text-white/80"><span className="font-bold" style={{ color: pilar.cor }}>✦ Mentoria entrega: </span>{g.entrega}</p>
        </div>
      </div>
    </div>
  );
}

function KitCard({ item }) {
  const p = PILARES[item.pilar] || PILARES.processos;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.ok ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/3 border-white/8'}`}>
      {item.ok
        ? <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
        : <Clock size={15} className="flex-shrink-0" style={{ color: p.cor }} />}
      <span className={`text-xs ${item.ok ? 'text-emerald-300' : 'text-white/65'}`}>{item.label}</span>
    </div>
  );
}

/* ── PÁGINA ── */
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
  const gargalos = useMemo(() => detectarGargalos(briefing), [briefing]);
  const scores = useMemo(() => calcularScorePorPilar(briefing), [briefing]);
  const kit = useMemo(() => calcularKit(briefing), [briefing]);

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
    saveMutation.mutate({
      id: briefing.id,
      data: { ...briefing, analise_gargalos: { scores, gargalos, iaResult, gerado_em: new Date().toISOString() } }
    });
  };

  const critCounts = { critico: gargalos.filter(g => g.criticidade === "critico").length, alto: gargalos.filter(g => g.criticidade === "alto").length, medio: gargalos.filter(g => g.criticidade === "medio").length };
  const pendentes = kit.filter(k => !k.ok).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Search size={26} className="text-[#FF4D00]" /> Análise de Gargalos
        </h1>
        <p className="text-white/40 text-sm mt-1">Diagnóstico automático por pilar + panorama completo com IA</p>
      </div>

      {/* Seleção */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={mentoradoId} onValueChange={v => { setMentoradoId(v); setIaResult(null); }}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
              <SelectValue placeholder="Selecionar mentorado..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {mentorados.map(m => (
                <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mentoradoId && (
            <Button onClick={handleIA} disabled={loading} className="bg-[#FF4D00] hover:bg-[#E64500] shrink-0">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Analisando...</>
                : <><Brain size={15} className="mr-2" />🤖 Gerar Panorama com IA</>}
            </Button>
          )}
        </div>

        {briefing && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: "Faturamento", v: briefing.faturamento_mensal ? `R$ ${briefing.faturamento_mensal.toLocaleString('pt-BR')}` : "—" },
              { l: "Ticket Médio", v: briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "—" },
              { l: "Pedidos/dia", v: briefing.media_pedidos_dia || "—" },
              { l: "CMV", v: briefing.cmv ? `${briefing.cmv}%` : "❌ Não definido" },
            ].map((item, i) => (
              <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-3">
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
          {/* Score + Barras por pilar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
              <GaugeScore scores={scores} />
              <div className="grid grid-cols-3 gap-2 w-full">
                {Object.entries({ critico: "#EF4444", alto: "#F97316", medio: "#EAB308" }).map(([k, cor]) => (
                  <div key={k} className="text-center p-2 rounded-xl" style={{ background: `${cor}10`, border: `1px solid ${cor}25` }}>
                    <p className="text-xl font-black" style={{ color: cor }}>{critCounts[k]}</p>
                    <p className="text-[10px] uppercase font-bold" style={{ color: cor }}>{CRIT[k]?.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-semibold text-white/70 mb-3">Score por Pilar</p>
              {Object.keys(PILARES).map(key => (
                <PilarBar key={key} pilarKey={key} score={scores[key]} />
              ))}
            </div>
          </div>

          {/* Gargalos automáticos */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={17} className="text-[#FF4D00]" /> Gargalos Identificados por Pilar
            </h3>
            {['critico','alto','medio'].map(nivel => {
              const items = gargalos.filter(g => g.criticidade === nivel);
              if (!items.length) return null;
              return (
                <div key={nivel} className="mb-4">
                  <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: CRIT[nivel].text }}>
                    ● {CRIT[nivel].label} ({items.length})
                  </p>
                  <div className="space-y-2">
                    {items.map((g, i) => <GargaloCard key={i} g={g} idx={i} />)}
                  </div>
                </div>
              );
            })}
            {!gargalos.length && (
              <p className="text-center text-white/40 py-8">✅ Nenhum gargalo detectado automaticamente</p>
            )}
          </div>

          {/* Kit de Entregáveis */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target size={17} className="text-[#FF4D00]" /> Kit de Entregáveis
              </h3>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                {pendentes} pendentes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {kit.map((item, i) => <KitCard key={i} item={item} />)}
            </div>
          </div>
        </>
      )}

      {/* Loading IA */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#FF4D00]/20 border-t-[#FF4D00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">Claude está gerando o diagnóstico completo...</p>
          <p className="text-white/40 text-sm mt-1">Analisando os 5 pilares e preparando o plano de 12 encontros</p>
        </div>
      )}

      {/* Resultado IA */}
      {iaResult && !loading && (
        <div className="space-y-5" style={{ animation: "fadeIn 0.4s ease" }}>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!briefing?.id} className="bg-[#FF4D00] hover:bg-[#E64500]">
              <Save size={15} className="mr-2" /> Salvar no Briefing
            </Button>
          </div>

          {/* Diagnóstico executivo */}
          {iaResult.diagnostico_executivo && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Lightbulb size={17} className="text-[#FF4D00]" /> Diagnóstico Executivo
              </h3>
              <div className="space-y-3">
                {iaResult.diagnostico_executivo.split('\n\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="text-sm text-white/75 leading-relaxed">{p}</p>
                ))}
              </div>
              {iaResult.frase_motivacional && (
                <div className="mt-4 p-4 rounded-xl border border-[#FF4D00]/30 bg-[#FF4D00]/5 italic">
                  <p className="text-sm text-[#FF4D00] font-medium text-center">"{iaResult.frase_motivacional}"</p>
                </div>
              )}
            </div>
          )}

          {/* Top 3 urgentes */}
          {iaResult.top3_gargalos_urgentes?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={17} className="text-[#FF4D00]" /> Top 3 Prioridades — Primeiras 4 Semanas
              </h3>
              <div className="space-y-3">
                {iaResult.top3_gargalos_urgentes.map((g, i) => {
                  const p = PILARES[g.pilar] || PILARES.processos;
                  return (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border" style={{ background: p.bg, borderColor: p.border }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background: p.cor, color: '#fff' }}>{g.posicao}</div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{g.titulo}</p>
                        <p className="text-xs text-white/60 mt-0.5">{g.por_que_urgente}</p>
                        <div className="mt-2 bg-black/20 rounded-lg px-3 py-1.5">
                          <p className="text-xs text-white/80"><span className="font-bold" style={{ color: p.cor }}>⚡ Agora: </span>{g.quick_win}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Potencial */}
          {iaResult.faturamento_potencial && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={17} className="text-[#FF4D00]" /> Potencial de Crescimento
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Atual</p>
                  <p className="text-lg font-black text-white">R$ {(briefing?.faturamento_mensal || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="rounded-xl p-4 text-center border" style={{ background: "rgba(255,77,0,0.08)", borderColor: "rgba(255,77,0,0.3)" }}>
                  <p className="text-[10px] text-[#FF4D00]/70 uppercase mb-1">Potencial/mês</p>
                  <p className="text-lg font-black text-[#FF4D00]">R$ {iaResult.faturamento_potencial.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-emerald-400/70 uppercase mb-1">Crescimento</p>
                  <p className="text-lg font-black text-emerald-400">+{iaResult.percentual_crescimento || 0}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Plano 12 encontros */}
          {iaResult.plano_12_encontros?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Target size={17} className="text-[#FF4D00]" /> Plano — 12 Encontros
              </h3>
              <div className="space-y-2">
                {iaResult.plano_12_encontros.map((enc, i) => {
                  const pilarKey = Object.keys(PILARES).find(k => PILARES[k].label.toLowerCase().includes((enc.pilar || "").toLowerCase())) || "processos";
                  const p = PILARES[pilarKey];
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border"
                        style={{ background: `${p.cor}15`, borderColor: `${p.cor}40`, color: p.cor }}>
                        {enc.encontro}
                      </div>
                      <div className="flex-1 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-white">{enc.tema}</span>
                          <span className="text-[10px] text-white/30">{enc.semana}</span>
                        </div>
                        <p className="text-xs text-white/50 mb-1">{enc.objetivo}</p>
                        <div className="flex flex-wrap gap-1">
                          {enc.entregaveis?.map((e, j) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">{e}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights */}
          {iaResult.insights_personalizados?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Star size={17} className="text-[#FF4D00]" /> Insights Personalizados
              </h3>
              <div className="space-y-2">
                {iaResult.insights_personalizados.map((ins, i) => (
                  <div key={i} className="flex items-start gap-3 bg-black/20 border border-white/5 rounded-xl p-3">
                    <ChevronRight size={13} className="text-[#FF4D00] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/75">{ins}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!mentoradoId && (
        <div className="text-center py-20 text-white/20">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-base">Selecione um mentorado para iniciar a análise</p>
        </div>
      )}
    </div>
  );
}