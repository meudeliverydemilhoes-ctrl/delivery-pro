import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight,
  FileText, Brain, BarChart3, Plus, Clock, Zap, Bell
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function Avatar({ nome, size = "md" }) {
  const cores = ["#7c6bff","#FF6B00","#10B981","#3B82F6","#A855F7","#EF4444","#F59E0B"];
  const cor = cores[(nome?.charCodeAt(0) || 0) % cores.length];
  const s = size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  return (
    <div className={`${s} rounded-xl flex items-center justify-center font-black flex-shrink-0`} style={{ background: `${cor}22`, border: `2px solid ${cor}55`, color: cor }}>
      {nome?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function StatusDot({ status }) {
  const cfg = { ok: { cor: "#10B981", label: "Em dia" }, atencao: { cor: "#F59E0B", label: "Atenção" }, atrasado: { cor: "#EF4444", label: "Atrasado" } };
  const c = cfg[status] || cfg.ok;
  return <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: c.cor }}>
    <span className="w-2 h-2 rounded-full" style={{ background: c.cor, boxShadow: `0 0 6px ${c.cor}` }} />{c.label}
  </span>;
}

function calcStatus(m, briefing) {
  if (!briefing) return "atrasado";
  const temCMV = !!briefing.cmv;
  const temFichas = briefing.fichas_tecnicas?.length > 0;
  const temFluxo = briefing.fluxogramas_data && Object.keys(briefing.fluxogramas_data).length > 0;
  const criticos = [temCMV, temFichas, temFluxo].filter(Boolean).length;
  if (criticos === 3) return "ok";
  if (criticos >= 1) return "atencao";
  return "atrasado";
}

function calcSemana(dataEntrada) {
  if (!dataEntrada) return 1;
  const diff = differenceInDays(new Date(), parseISO(dataEntrada));
  return Math.min(Math.max(Math.ceil(diff / 7), 1), 12);
}

const ATALHOS = [
  { label: "Novo Mentorado", icon: Plus, to: "/Mentorados", cor: "#7c6bff" },
  { label: "Gerar Documentos", icon: FileText, to: "/KitDocumentos", cor: "#FF6B00" },
  { label: "Análise de Gargalos", icon: Brain, to: "/AnaliseGargalos", cor: "#EF4444" },
  { label: "Relatório", icon: BarChart3, to: "/RelatorioProgresso", cor: "#10B981" },
];

export default function Dashboard() {
  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefings = [] } = useQuery({ queryKey: ["briefings-all"], queryFn: () => base44.entities.Briefing.list() });
  const { data: agenda = [] } = useQuery({ queryKey: ["agenda-pendente"], queryFn: () => base44.entities.Agenda.filter({ status: "pendente" }, "-data", 3) });

  const briefingMap = useMemo(() => {
    const m = {};
    briefings.forEach(b => { m[b.mentorado_id] = b; });
    return m;
  }, [briefings]);

  const ativos = mentorados.filter(m => m.status === "ativo");
  const semBriefing = ativos.filter(m => !briefingMap[m.id]);
  const comProblemas = ativos.filter(m => calcStatus(m, briefingMap[m.id]) === "atrasado");
  const briefingsCompletos = ativos.filter(m => {
    const b = briefingMap[m.id];
    return b && b.cmv && b.faturamento_mensal && b.fichas_tecnicas?.length > 0;
  });

  const alertas = [
    ...semBriefing.map(m => ({ tipo: "erro", msg: `${m.nome} — briefing não preenchido` })),
    ...comProblemas.filter(m => !semBriefing.find(s => s.id === m.id)).map(m => ({ tipo: "aviso", msg: `${m.nome} — múltiplos gargalos críticos detectados` })),
  ].slice(0, 5);

  const kpis = [
    { label: "Mentorados Ativos", valor: ativos.length, icon: Users, cor: "#7c6bff" },
    { label: "Briefings Incompletos", valor: semBriefing.length + (ativos.length - briefingsCompletos.length), icon: AlertTriangle, cor: "#EF4444" },
    { label: "Briefings Completos", valor: briefingsCompletos.length, icon: CheckCircle2, cor: "#10B981" },
    { label: "Próximos Encontros", valor: agenda.length, icon: Clock, cor: "#F59E0B" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Olá, Brenda 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Central de gestão da Mentoria Delivery Pro</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold border" style={{ background: "rgba(124,107,255,0.1)", borderColor: "rgba(124,107,255,0.3)", color: "#7c6bff" }}>
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${k.cor}18`, border: `1px solid ${k.cor}30` }}>
                <k.icon size={18} style={{ color: k.cor }} />
              </div>
              <span className="text-3xl font-black text-white">{k.valor}</span>
            </div>
            <p className="text-xs text-white/50 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ATALHOS.map((a, i) => (
          <Link key={i} to={a.to} className="flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all hover:scale-[1.02]"
            style={{ background: `${a.cor}0f`, borderColor: `${a.cor}25` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${a.cor}20`, border: `1px solid ${a.cor}40` }}>
              <a.icon size={22} style={{ color: a.cor }} />
            </div>
            <span className="text-sm font-semibold text-white/80 text-center">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista de mentorados com status */}
        <div className="lg:col-span-2 bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              <Users size={18} style={{ color: "#7c6bff" }} /> Mentorados Ativos
            </h2>
            <Link to="/Mentorados" className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {ativos.length === 0 && <p className="text-center text-white/30 py-8 text-sm">Nenhum mentorado ativo</p>}
            {ativos.map(m => {
              const b = briefingMap[m.id];
              const status = calcStatus(m, b);
              const semana = calcSemana(m.data_entrada);
              const pendentes = [];
              if (!b) pendentes.push("briefing");
              else {
                if (!b.cmv) pendentes.push("CMV");
                if (!b.fichas_tecnicas?.length) pendentes.push("fichas técnicas");
                if (!b.fluxogramas_data || Object.keys(b.fluxogramas_data).length === 0) pendentes.push("fluxogramas");
              }
              return (
                <Link key={m.id} to={`/MentoradoDetalhe?id=${m.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <Avatar nome={m.nome} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-white truncate">{m.nome}</p>
                      <StatusDot status={status} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/40">{m.negocio}</span>
                      {semana > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">Semana {semana}/12</span>}
                      {pendentes.length > 0 && <span className="text-[10px] text-amber-400">⚠ {pendentes.slice(0, 2).join(", ")}{pendentes.length > 2 ? ` +${pendentes.length - 2}` : ""}</span>}
                    </div>
                  </div>
                  {/* Barra de progresso da mentoria */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-20">
                    <span className="text-[10px] text-white/30">{semana}/12 sem.</span>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(semana / 12) * 100}%`, background: "#7c6bff" }} />
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-[#7c6bff] transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Alertas + Agenda */}
        <div className="space-y-4">
          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                <Bell size={15} className="text-amber-400" /> Alertas
              </h2>
              <div className="space-y-2">
                {alertas.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${a.tipo === "erro" ? "bg-red-500/8 border border-red-500/20 text-red-300" : "bg-amber-500/8 border border-amber-500/20 text-amber-300"}`}>
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    {a.msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos encontros */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              <Zap size={15} style={{ color: "#7c6bff" }} /> Próximos Encontros
            </h2>
            {agenda.length === 0
              ? <p className="text-xs text-white/30 text-center py-4">Nenhum agendado</p>
              : <div className="space-y-2">
                  {agenda.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/5">
                      <div className="text-center w-10 flex-shrink-0">
                        <p className="text-[10px] text-white/30 uppercase">{item.data ? format(parseISO(item.data), "dd MMM", { locale: ptBR }) : "—"}</p>
                        <p className="text-xs font-bold text-white">{item.horario || "--:--"}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.titulo}</p>
                        <p className="text-[10px] text-white/40 capitalize">{item.tipo?.replace("_", " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Stats rápidos */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>📊 Saúde Geral</h2>
            {[
              { l: "Briefings ok", v: briefingsCompletos.length, t: ativos.length, cor: "#10B981" },
              { l: "Com gargalos críticos", v: comProblemas.length, t: ativos.length, cor: "#EF4444" },
              { l: "Em atraso de docs", v: semBriefing.length, t: ativos.length, cor: "#F59E0B" },
            ].map((item, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{item.l}</span>
                  <span className="font-bold text-white">{item.v}/{item.t}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: item.t ? `${(item.v / item.t) * 100}%` : "0%", background: item.cor }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}