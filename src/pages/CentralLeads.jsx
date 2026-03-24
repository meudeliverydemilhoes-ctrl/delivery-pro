import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Plus, MessageSquare, UserCheck, Clock, AlertTriangle, ChevronRight, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const ESTAGIOS = ["novo_lead", "contato_feito", "reuniao_agendada", "proposta_enviada", "negociacao", "fechado", "perdido"];
const ESTAGIO_LABEL = { novo_lead: "Novo Lead", contato_feito: "Contato Feito", reuniao_agendada: "Reunião Agendada", proposta_enviada: "Proposta Enviada", negociacao: "Negociação", fechado: "✅ Fechado", perdido: "❌ Perdido" };
const ESTAGIO_COR = { novo_lead: "#7c6bff", contato_feito: "#3B82F6", reuniao_agendada: "#F59E0B", proposta_enviada: "#F97316", negociacao: "#A855F7", fechado: "#10B981", perdido: "#EF4444" };

function LeadCard({ lead, onScript, onOnboarding }) {
  const diasSemContato = lead.data_contato
    ? Math.floor((Date.now() - new Date(lead.data_contato).getTime()) / (1000 * 60 * 60 * 24)) : null;
  const urgente = diasSemContato !== null && diasSemContato >= 1;
  const cor = ESTAGIO_COR[lead.estagio] || "#7c6bff";

  return (
    <div className={`bg-white/5 border rounded-2xl p-4 transition-all hover:bg-white/[0.07] ${urgente ? 'border-red-500/30' : 'border-white/10'}`}
      style={urgente ? { background: "rgba(239,68,68,0.04)" } : {}}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0"
          style={{ background: `${cor}18`, border: `2px solid ${cor}40`, color: cor }}>
          {lead.nome?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-white text-sm">{lead.nome}</p>
            {urgente && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                <AlertTriangle size={9} /> {diasSemContato}d sem contato
              </span>
            )}
          </div>
          <p className="text-xs text-white/50">{lead.negocio} · {lead.cidade}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${cor}15`, color: cor }}>{ESTAGIO_LABEL[lead.estagio] || lead.estagio}</span>
            {lead.faturamento_estimado && <span className="text-[10px] text-white/30">~R$ {lead.faturamento_estimado?.toLocaleString('pt-BR')}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => onScript(lead)} className="text-[10px] px-2.5 py-1.5 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(124,107,255,0.15)", color: "#7c6bff", border: "1px solid rgba(124,107,255,0.3)" }}>
            📝 Script
          </button>
          {lead.estagio === "fechado" && (
            <button onClick={() => onOnboarding(lead)} className="text-[10px] px-2.5 py-1.5 rounded-xl font-semibold transition-all hover:opacity-80"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
              🚀 Iniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CentralLeads() {
  const qc = useQueryClient();
  const [showNovoLead, setShowNovoLead] = useState(false);
  const [showCaptura, setShowCaptura] = useState(false);
  const [showScript, setShowScript] = useState(null);
  const [conversa, setConversa] = useState("");
  const [scriptResult, setScriptResult] = useState("");
  const [capturaResult, setCapturaResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtroEstagio, setFiltroEstagio] = useState("todos");
  const [novoLead, setNovoLead] = useState({ nome: "", negocio: "", cidade: "", contato: "", estagio: "novo_lead", faturamento_estimado: "" });

  // Usando entidade Mentorado com status "lead" para simular central de leads
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Mentorado.filter({ status: "pausado" })
  });

  // Usamos mentorados com etapa "diagnostico" como pipeline de vendas também
  const { data: pipeline = [] } = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => base44.entities.Mentorado.list("-created_date", 50)
  });

  const criarLead = useMutation({
    mutationFn: (dados) => base44.entities.Mentorado.create({ ...dados, status: "pausado", etapa: "diagnostico" }),
    onSuccess: () => { qc.invalidateQueries(["leads"]); qc.invalidateQueries(["pipeline"]); setShowNovoLead(false); toast.success("Lead adicionado!"); }
  });

  const iniciarOnboarding = useMutation({
    mutationFn: (id) => base44.entities.Mentorado.update(id, { status: "ativo", etapa: "diagnostico", data_entrada: new Date().toISOString().split('T')[0] }),
    onSuccess: () => { qc.invalidateQueries(["leads"]); toast.success("Mentorado iniciado no sistema!"); }
  });

  const handleScript = async (lead) => {
    setShowScript(lead);
    setScriptResult("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("gerarDocumento", {
        tipo: "analise_gargalos",
        dados: {
          briefing: { faturamento_mensal: lead.faturamento_estimado, problemas_identificados: lead.observacoes || "" },
          mentorado: lead
        }
      });
      const r = res.data.result;
      setScriptResult(r?.panorama_executivo || "Script gerado com base nos dados do lead.");
    } catch (e) { setScriptResult("Erro ao gerar script."); }
    finally { setLoading(false); }
  };

  const handleCaptura = async () => {
    if (!conversa.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("gerarDocumento", {
        tipo: "analise_gargalos",
        dados: {
          briefing: { problemas_identificados: conversa, diagnostico_inicial: "Extraído de conversa WhatsApp" },
          mentorado: { nome: "Lead WhatsApp", negocio: "A identificar" }
        }
      });
      const r = res.data.result;
      setCapturaResult({
        nome: "Lead WhatsApp",
        negocio: "Delivery (identificado)",
        diagnostico: r?.panorama_executivo || conversa.substring(0, 200),
      });
    } catch (e) { toast.error("Erro: " + e.message); }
    finally { setLoading(false); }
  };

  const todosPipeline = pipeline.filter(m => filtroEstagio === "todos" || m.status === filtroEstagio);
  const urgentes = pipeline.filter(m => m.status === "pausado");
  const ativos = pipeline.filter(m => m.status === "ativo");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>🎯 Central de Leads</h1>
          <p className="text-white/40 text-sm mt-1">Pipeline de vendas e onboarding da Mentoria Delivery Pro</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCaptura(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <MessageSquare size={14} className="mr-2" /> Capturar WhatsApp
          </Button>
          <Button onClick={() => setShowNovoLead(true)} style={{ background: "#7c6bff" }} className="hover:opacity-90">
            <Plus size={14} className="mr-2" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: "Leads no Pipeline", v: pipeline.filter(m => m.status === "pausado").length, cor: "#7c6bff" },
          { l: "Mentorados Ativos", v: ativos.length, cor: "#10B981" },
          { l: "Fechados este mês", v: ativos.filter(m => m.data_entrada?.startsWith(new Date().toISOString().slice(0,7))).length, cor: "#F59E0B" },
        ].map((k, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black" style={{ color: k.cor }}>{k.v}</p>
            <p className="text-xs text-white/50 mt-1">{k.l}</p>
          </div>
        ))}
      </div>

      {/* Urgentes */}
      {urgentes.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={15} /> {urgentes.length} Lead(s) precisam de atenção
          </h3>
          <div className="space-y-2">
            {urgentes.slice(0, 3).map(lead => (
              <LeadCard key={lead.id} lead={{ ...lead, estagio: "negociacao", data_contato: lead.updated_date }}
                onScript={handleScript} onOnboarding={m => iniciarOnboarding.mutate(m.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Pipeline completo */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap size={15} style={{ color: "#7c6bff" }} /> Todos os Leads
          </h3>
          <select value={filtroEstagio} onChange={e => setFiltroEstagio(e.target.value)}
            className="text-xs bg-white/10 border border-white/20 text-white rounded-xl px-3 py-1.5 outline-none">
            <option value="todos" style={{ background: "#111" }}>Todos</option>
            <option value="pausado" style={{ background: "#111" }}>Leads (pausado)</option>
            <option value="ativo" style={{ background: "#111" }}>Ativos</option>
          </select>
        </div>
        <div className="space-y-2">
          {todosPipeline.length === 0 && <p className="text-center text-white/30 py-8 text-sm">Nenhum lead cadastrado</p>}
          {todosPipeline.map(lead => (
            <LeadCard key={lead.id} lead={{ ...lead, estagio: lead.status === "ativo" ? "fechado" : "negociacao" }}
              onScript={handleScript} onOnboarding={m => iniciarOnboarding.mutate(m.id)} />
          ))}
        </div>
      </div>

      {/* Modal Script IA */}
      {showScript && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowScript(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">Script de Follow-up — {showScript.nome}</h3>
              <button onClick={() => setShowScript(null)}><X size={18} className="text-white/50" /></button>
            </div>
            {loading ? (
              <div className="py-10 text-center">
                <div className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "rgba(124,107,255,0.2)", borderTopColor: "#7c6bff" }} />
                <p className="text-sm text-white/60">Gerando script personalizado...</p>
              </div>
            ) : scriptResult ? (
              <div className="space-y-3">
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Script Sugerido</p>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{scriptResult}</p>
                </div>
                <Button onClick={() => setShowScript(null)} className="w-full" style={{ background: "#7c6bff" }}>Fechar</Button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal Captura WhatsApp */}
      {showCaptura && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowCaptura(false)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">📱 Capturar Conversa WhatsApp</h3>
              <button onClick={() => setShowCaptura(false)}><X size={18} className="text-white/50" /></button>
            </div>
            <p className="text-xs text-white/50">Cole aqui a conversa do WhatsApp e a IA vai extrair os dados do lead automaticamente</p>
            <Textarea value={conversa} onChange={e => setConversa(e.target.value)}
              placeholder="Cole aqui a conversa do WhatsApp..." className="bg-white/10 border-white/20 text-white min-h-[150px] text-sm" />
            <Button onClick={handleCaptura} disabled={loading || !conversa.trim()} style={{ background: "#7c6bff" }} className="w-full hover:opacity-90">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Analisando...</> : <><Brain size={14} className="mr-2" />Extrair Dados com IA</>}
            </Button>
            {capturaResult && (
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                <p className="text-xs font-bold text-white/50 uppercase">Dados Extraídos</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded-lg p-2"><p className="text-[10px] text-white/40">Nome</p><p className="text-xs font-bold text-white">{capturaResult.nome}</p></div>
                  <div className="bg-white/5 rounded-lg p-2"><p className="text-[10px] text-white/40">Negócio</p><p className="text-xs font-bold text-white">{capturaResult.negocio}</p></div>
                </div>
                <p className="text-xs text-white/60">{capturaResult.diagnostico?.substring(0, 200)}...</p>
                <Button onClick={() => { criarLead.mutate({ nome: capturaResult.nome, negocio: capturaResult.negocio, observacoes: capturaResult.diagnostico }); setShowCaptura(false); }} style={{ background: "#10B981" }} className="w-full">
                  <UserCheck size={14} className="mr-2" /> Cadastrar Lead
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Novo Lead */}
      {showNovoLead && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowNovoLead(false)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">Novo Lead</h3>
              <button onClick={() => setShowNovoLead(false)}><X size={18} className="text-white/50" /></button>
            </div>
            {[
              { l: "Nome", k: "nome", ph: "Nome do dono" },
              { l: "Negócio", k: "negocio", ph: "Nome do delivery" },
              { l: "Cidade", k: "cidade", ph: "Cidade - UF" },
              { l: "WhatsApp", k: "contato", ph: "(11) 99999-9999" },
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs text-white/50 mb-1 block">{f.l}</label>
                <Input value={novoLead[f.k]} onChange={e => setNovoLead(n => ({ ...n, [f.k]: e.target.value }))}
                  placeholder={f.ph} className="bg-white/10 border-white/20 text-white" />
              </div>
            ))}
            <Button onClick={() => criarLead.mutate(novoLead)} disabled={!novoLead.nome} style={{ background: "#7c6bff" }} className="w-full hover:opacity-90">
              Cadastrar Lead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}