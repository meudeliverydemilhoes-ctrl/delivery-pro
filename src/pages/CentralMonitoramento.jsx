import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Users, Calendar, AlertTriangle, Clock, TrendingUp, ChevronRight, Filter, Flame, Target, Activity, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ETAPA_LABELS = { diagnostico: "Diagnóstico", pilar1: "Pilar 1", pilar2: "Pilar 2", pilar3: "Pilar 3", pilar4: "Pilar 4", pilar5: "Pilar 5", acompanhamento: "Acompanhamento" };
const ETAPA_COLORS = { diagnostico: "#7c6bff", pilar1: "#3b82f6", pilar2: "#06b6d4", pilar3: "#10b981", pilar4: "#f59e0b", pilar5: "#f97316", acompanhamento: "#ec4899" };
const HUMOR_EMOJI = { muito_engajado: "🔥", engajado: "😊", neutro: "😐", desanimado: "😟", risco_desistencia: "🚨" };
const PILAR_LABELS = { processos: "Processos", desempenho: "Desempenho", tempo_potencia: "Tempo", norte_estrategico: "Norte", presenca_magnetica: "Presença", diagnostico: "Diagnóstico", financeiro: "Financeiro", encerramento: "Encerramento" };
const STATUS_ANALISE = { aguardando_transcricao: { label: "Aguardando", color: "#f59e0b" }, transcrito: { label: "Transcrito", color: "#3b82f6" }, analisado: { label: "Analisado", color: "#10b981" }, revisado: { label: "Revisado", color: "#7c6bff" } };

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-[12px] text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-3xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function NoteaBadge({ nota }) {
  if (!nota) return <span className="text-white/20 text-xs">—</span>;
  const color = nota >= 8 ? "#10b981" : nota >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
      {nota}/10
    </span>
  );
}

export default function CentralMonitoramento() {
  const [etapaFiltro, setEtapaFiltro] = useState("todas");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [mentorFiltro, setMentorFiltro] = useState("todos");
  const [pilarFiltro, setPilarFiltro] = useState("todos");
  const [mentoradoAcaoFiltro, setMentoradoAcaoFiltro] = useState("todos");
  const [activeTab, setActiveTab] = useState("tabela");

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: reunioes = [] } = useQuery({ queryKey: ["reunioes"], queryFn: () => base44.entities.ReuniaoMentoria.list("-data_reuniao", 50) });
  const { data: tarefas = [] } = useQuery({ queryKey: ["tarefas_mon"], queryFn: () => base44.entities.TarefaMentorado.list() });

  const ativos = useMemo(() => mentorados.filter(m => m.status === "ativo"), [mentorados]);

  const hoje = new Date();
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const fimSemana = new Date(inicioSemana); fimSemana.setDate(inicioSemana.getDate() + 6);

  const reunioesSemana = reunioes.filter(r => {
    const d = parseISO(r.data_reuniao);
    return d >= inicioSemana && d <= fimSemana;
  });

  const tarefasAtrasadas = tarefas.filter(t => t.status !== "concluido" && t.prazo && parseISO(t.prazo) < hoje);

  // Promessas pendentes de todas as reuniões
  const promessasPendentes = useMemo(() => {
    const all = [];
    reunioes.forEach(r => {
      (r.promessas || []).forEach(p => {
        if (p.status === "pendente" || p.status === "atrasado") {
          all.push({ ...p, mentorado_nome: r.mentorado_nome, reuniao_data: r.data_reuniao, mentor: r.mentor_responsavel });
        }
      });
    });
    return all;
  }, [reunioes]);

  // Ações pendentes
  const acoesPendentes = useMemo(() => {
    const all = [];
    reunioes.forEach(r => {
      (r.acoes_necessarias || []).forEach(a => {
        if (a.status !== "concluido") {
          all.push({ ...a, mentorado_nome: r.mentorado_nome, mentorado_id: r.mentorado_id, pilar: r.pilar, reuniao_data: r.data_reuniao });
        }
      });
    });
    const prioOrder = { urgente: 0, alta: 1, media: 2, baixa: 3 };
    return all.sort((a, b) => (prioOrder[a.prioridade] ?? 2) - (prioOrder[b.prioridade] ?? 2));
  }, [reunioes]);

  // Última reunião por mentorado
  const ultimaReuniaoMap = useMemo(() => {
    const map = {};
    reunioes.forEach(r => {
      if (!map[r.mentorado_id] || r.data_reuniao > map[r.mentorado_id].data_reuniao) {
        map[r.mentorado_id] = r;
      }
    });
    return map;
  }, [reunioes]);

  // Mentorados sem reunião há +7 dias
  const alertaSemReuniao = ativos.filter(m => {
    const ur = ultimaReuniaoMap[m.id];
    if (!ur) return true;
    return differenceInDays(hoje, parseISO(ur.data_reuniao)) > 7;
  });

  // Risco de desistência
  const alertaRisco = ativos.filter(m => {
    const ur = ultimaReuniaoMap[m.id];
    return ur?.humor_mentorado === "risco_desistencia" || ur?.humor_mentorado === "desanimado";
  });

  // Tarefas por mentorado
  const tarefasPorMentorado = useMemo(() => {
    const map = {};
    tarefas.forEach(t => {
      if (t.status !== "concluido") {
        map[t.mentorado_id] = (map[t.mentorado_id] || 0) + 1;
      }
    });
    return map;
  }, [tarefas]);

  // Dados gráfico etapas
  const etapaData = useMemo(() => Object.entries(ETAPA_LABELS).map(([key, label]) => ({
    etapa: label.replace("Diagnóstico", "Diag.").replace("Acompanhamento", "Acomp."),
    key,
    total: ativos.filter(m => m.etapa === key).length,
    color: ETAPA_COLORS[key],
  })).filter(d => d.total > 0), [ativos]);

  // Filtra mentorados
  const mentoradosFiltrados = useMemo(() => ativos.filter(m => {
    if (etapaFiltro !== "todas" && m.etapa !== etapaFiltro) return false;
    if (statusFiltro !== "todos" && m.status !== statusFiltro) return false;
    const ur = ultimaReuniaoMap[m.id];
    if (mentorFiltro !== "todos" && ur?.mentor_responsavel !== mentorFiltro) return false;
    return true;
  }), [ativos, etapaFiltro, statusFiltro, mentorFiltro, ultimaReuniaoMap]);

  // Ações filtradas
  const acoesFiltradas = useMemo(() => acoesPendentes.filter(a => {
    if (pilarFiltro !== "todos" && a.pilar !== pilarFiltro) return false;
    if (mentoradoAcaoFiltro !== "todos" && a.mentorado_id !== mentoradoAcaoFiltro) return false;
    return true;
  }), [acoesPendentes, pilarFiltro, mentoradoAcaoFiltro]);

  const tabs = [
    { id: "tabela", label: "Mentorados" },
    { id: "alertas", label: `Alertas ${alertaSemReuniao.length + alertaRisco.length > 0 ? `(${alertaSemReuniao.length + alertaRisco.length})` : ""}` },
    { id: "reunioes", label: "Reuniões" },
    { id: "acoes", label: `Ações (${acoesPendentes.length})` },
  ];

  const PRIO_COLOR = { urgente: "#ef4444", alta: "#f97316", media: "#f59e0b", baixa: "#10b981" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
          📊 Central de Monitoramento
        </h1>
        <p className="text-white/40 text-sm mt-1">Visão completa do programa de mentoria</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Ativos" value={ativos.length} color="#7c6bff" sub="mentorados" />
        <StatCard icon={Calendar} label="Reuniões" value={reunioesSemana.length} color="#3b82f6" sub="esta semana" />
        <StatCard icon={Clock} label="Atrasadas" value={tarefasAtrasadas.length} color="#ef4444" sub="tarefas" />
        <StatCard icon={AlertTriangle} label="Promessas" value={promessasPendentes.length} color="#f59e0b" sub="pendentes" />
      </div>

      {/* Gráfico */}
      {etapaData.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-[#7c6bff]" /> Distribuição por Etapa
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={etapaData} barCategoryGap="30%">
              <XAxis dataKey="etapa" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {etapaData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
            style={activeTab === tab.id ? { background: 'rgba(124,107,255,0.2)', color: '#a89bff', border: '1px solid rgba(124,107,255,0.3)' } : { color: 'rgba(255,255,255,0.4)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Tabela Mentorados */}
      {activeTab === "tabela" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <select value={etapaFiltro} onChange={e => setEtapaFiltro(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/70 outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="todas">Todas etapas</option>
              {Object.entries(ETAPA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={mentorFiltro} onChange={e => setMentorFiltro(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/70 outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="todos">Todos mentores</option>
              {["Talison", "Marcel", "Brenda", "Everton"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {["Mentorado", "Etapa", "Última Reunião", "Nota", "Humor", "Tarefas"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mentoradosFiltrados.map((m, i) => {
                    const ur = ultimaReuniaoMap[m.id];
                    const diasSemReuniao = ur ? differenceInDays(hoje, parseISO(ur.data_reuniao)) : 999;
                    const pendentes = tarefasPorMentorado[m.id] || 0;
                    return (
                      <tr key={m.id} className="transition-colors hover:bg-white/[0.02] cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onClick={() => window.location.href = `/MentoradoDetalhe?id=${m.id}`}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white text-sm">{m.nome}</div>
                          <div className="text-xs text-white/35">{m.negocio}{m.cidade ? ` · ${m.cidade}` : ""}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: `${ETAPA_COLORS[m.etapa] || '#7c6bff'}18`, border: `1px solid ${ETAPA_COLORS[m.etapa] || '#7c6bff'}35`, color: ETAPA_COLORS[m.etapa] || '#7c6bff' }}>
                            {ETAPA_LABELS[m.etapa] || m.etapa}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {ur ? (
                            <div>
                              <div className="text-xs text-white/70">{format(parseISO(ur.data_reuniao), "dd/MM/yy", { locale: ptBR })}</div>
                              <div className={`text-[10px] ${diasSemReuniao > 14 ? "text-red-400" : diasSemReuniao > 7 ? "text-yellow-400" : "text-white/30"}`}>
                                {diasSemReuniao}d atrás
                              </div>
                            </div>
                          ) : <span className="text-xs text-red-400/70">Nenhuma</span>}
                        </td>
                        <td className="px-4 py-3"><NoteaBadge nota={ur?.nota_progresso} /></td>
                        <td className="px-4 py-3 text-xl">{HUMOR_EMOJI[ur?.humor_mentorado] || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${pendentes > 0 ? "" : "text-white/20"}`}
                            style={pendentes > 0 ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' } : {}}>
                            {pendentes > 0 ? pendentes : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {mentoradosFiltrados.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">Nenhum mentorado encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {mentoradosFiltrados.map(m => {
                const ur = ultimaReuniaoMap[m.id];
                const diasSemReuniao = ur ? differenceInDays(hoje, parseISO(ur.data_reuniao)) : 999;
                const pendentes = tarefasPorMentorado[m.id] || 0;
                return (
                  <div key={m.id} className="p-4 hover:bg-white/[0.02] cursor-pointer" onClick={() => window.location.href = `/MentoradoDetalhe?id=${m.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm">{m.nome}</p>
                        <p className="text-xs text-white/35 mt-0.5">{m.negocio}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{ background: `${ETAPA_COLORS[m.etapa] || '#7c6bff'}18`, color: ETAPA_COLORS[m.etapa] || '#7c6bff' }}>
                            {ETAPA_LABELS[m.etapa] || m.etapa}
                          </span>
                          <NoteaBadge nota={ur?.nota_progresso} />
                          <span className="text-base">{HUMOR_EMOJI[ur?.humor_mentorado] || ""}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {ur && <p className="text-[10px] text-white/30">{format(parseISO(ur.data_reuniao), "dd/MM", { locale: ptBR })}</p>}
                        {pendentes > 0 && <p className="text-xs text-red-400 mt-1">{pendentes} tarefas</p>}
                        <ChevronRight size={14} className="text-white/20 mt-2 ml-auto" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Alertas */}
      {activeTab === "alertas" && (
        <div className="space-y-4">
          {/* Sem reunião */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2 mb-3">
              <AlertCircle size={15} /> Sem reunião há +7 dias ({alertaSemReuniao.length})
            </h3>
            {alertaSemReuniao.length === 0 ? (
              <p className="text-white/30 text-xs">Nenhum alerta ativo</p>
            ) : (
              <div className="space-y-2">
                {alertaSemReuniao.map(m => {
                  const ur = ultimaReuniaoMap[m.id];
                  const dias = ur ? differenceInDays(hoje, parseISO(ur.data_reuniao)) : "?";
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)' }}>
                      <div>
                        <p className="text-sm font-semibold text-white">{m.nome}</p>
                        <p className="text-xs text-white/35">{m.negocio}</p>
                      </div>
                      <span className="text-xs font-bold text-yellow-400">{dias} dias</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Risco desistência */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
              <XCircle size={15} /> Risco de desistência ({alertaRisco.length})
            </h3>
            {alertaRisco.length === 0 ? (
              <p className="text-white/30 text-xs">Nenhum alerta ativo</p>
            ) : (
              <div className="space-y-2">
                {alertaRisco.map(m => {
                  const ur = ultimaReuniaoMap[m.id];
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)' }}>
                      <div>
                        <p className="text-sm font-semibold text-white">{m.nome} {HUMOR_EMOJI[ur?.humor_mentorado]}</p>
                        <p className="text-xs text-white/35">{m.negocio}</p>
                      </div>
                      <NoteaBadge nota={ur?.nota_progresso} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tarefas atrasadas */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <h3 className="text-sm font-bold text-red-300 flex items-center gap-2 mb-3">
              <Clock size={15} /> Tarefas atrasadas ({tarefasAtrasadas.length})
            </h3>
            {tarefasAtrasadas.length === 0 ? (
              <p className="text-white/30 text-xs">Nenhuma tarefa atrasada</p>
            ) : (
              <div className="space-y-2">
                {tarefasAtrasadas.slice(0, 8).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/80 truncate">{t.titulo || t.descricao}</p>
                      <p className="text-xs text-white/30">{t.responsavel}</p>
                    </div>
                    <span className="text-xs text-red-400 flex-shrink-0 ml-3">{t.prazo ? format(parseISO(t.prazo), "dd/MM") : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promessas pendentes */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <h3 className="text-sm font-bold text-yellow-300 flex items-center gap-2 mb-3">
              <Target size={15} /> Promessas pendentes ({promessasPendentes.length})
            </h3>
            {promessasPendentes.length === 0 ? (
              <p className="text-white/30 text-xs">Nenhuma promessa pendente</p>
            ) : (
              <div className="space-y-2">
                {promessasPendentes.slice(0, 8).map((p, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white/80 flex-1">{p.descricao}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${p.status === "atrasado" ? "text-red-400" : "text-yellow-400"}`}
                        style={{ background: p.status === "atrasado" ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-white/25">
                      <span>{p.mentorado_nome}</span>
                      {p.prazo && <span>· {format(parseISO(p.prazo), "dd/MM")}</span>}
                      <span>· {p.responsavel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Reuniões */}
      {activeTab === "reunioes" && (
        <div className="space-y-2">
          {reunioes.slice(0, 10).map(r => {
            const sa = STATUS_ANALISE[r.status_analise] || { label: r.status_analise, color: "#7c6bff" };
            return (
              <div key={r.id} className="p-4 rounded-2xl transition-all hover:bg-white/[0.02]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,107,255,0.12)', border: '1px solid rgba(124,107,255,0.2)' }}>
                    <Calendar size={15} className="text-[#7c6bff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{r.mentorado_nome || "Sem nome"}</span>
                      <span className="text-xs text-white/30">{r.data_reuniao ? format(parseISO(r.data_reuniao), "dd/MM/yy") : ""}</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ background: `${sa.color}15`, border: `1px solid ${sa.color}30`, color: sa.color }}>{sa.label}</span>
                      {r.nota_progresso && <NoteaBadge nota={r.nota_progresso} />}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/30 mb-1.5">
                      <span>{r.mentor_responsavel}</span>
                      {r.pilar && <span>· {PILAR_LABELS[r.pilar] || r.pilar}</span>}
                      {r.humor_mentorado && <span>{HUMOR_EMOJI[r.humor_mentorado]}</span>}
                    </div>
                    {r.resumo && <p className="text-xs text-white/45 line-clamp-2">{r.resumo}</p>}
                  </div>
                  <Link to={`/Encontros`} className="flex-shrink-0 p-2 rounded-xl hover:bg-white/10 transition-colors">
                    <ChevronRight size={15} className="text-white/30" />
                  </Link>
                </div>
              </div>
            );
          })}
          {reunioes.length === 0 && <p className="text-center text-white/30 py-8 text-sm">Nenhuma reunião registrada</p>}
        </div>
      )}

      {/* TAB: Ações */}
      {activeTab === "acoes" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select value={pilarFiltro} onChange={e => setPilarFiltro(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/70 outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="todos">Todos pilares</option>
              {Object.entries(PILAR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={mentoradoAcaoFiltro} onChange={e => setMentoradoAcaoFiltro(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/70 outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="todos">Todos mentorados</option>
              {ativos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            {acoesFiltradas.map((a, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: PRIO_COLOR[a.prioridade] || "#f59e0b" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80">{a.acao}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-white/30">
                      <span>{a.mentorado_nome}</span>
                      {a.pilar && <span>· {PILAR_LABELS[a.pilar] || a.pilar}</span>}
                      {a.responsavel && <span>· {a.responsavel}</span>}
                      {a.prazo && <span>· {format(parseISO(a.prazo), "dd/MM")}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${PRIO_COLOR[a.prioridade] || '#f59e0b'}15`, color: PRIO_COLOR[a.prioridade] || '#f59e0b' }}>
                      {a.prioridade || "media"}
                    </span>
                    <span className="text-[10px] text-white/25">{a.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {acoesFiltradas.length === 0 && <p className="text-center text-white/30 py-8 text-sm">Nenhuma ação pendente</p>}
          </div>
        </div>
      )}
    </div>
  );
}