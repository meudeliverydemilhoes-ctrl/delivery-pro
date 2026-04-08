import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart2, Sparkles, RefreshCw, Target, Megaphone, Copy, Check, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/30" />}
    </button>
  );
}

function AIResult({ content, loading }) {
  if (loading) return (
    <div className="flex items-center gap-3 py-6">
      <div className="w-5 h-5 border-2 border-[#7c6bff]/30 border-t-[#7c6bff] rounded-full animate-spin" />
      <span className="text-white/40 text-sm">IA analisando campanhas...</span>
    </div>
  );
  if (!content) return null;
  return (
    <div className="mt-4 p-4 rounded-xl relative" style={{ background: 'rgba(124,107,255,0.05)', border: '1px solid rgba(124,107,255,0.15)' }}>
      <div className="absolute top-3 right-3"><CopyBtn text={content} /></div>
      <ReactMarkdown className="text-sm text-white/80 prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {content}
      </ReactMarkdown>
    </div>
  );
}

const PLATFORMS = [
  { id: "meta", label: "Meta Ads (FB/IG)", color: "#1877F2" },
  { id: "google", label: "Google Ads", color: "#34A853" },
  { id: "tiktok", label: "TikTok Ads", color: "#010101" },
  { id: "ifood", label: "iFood Ads", color: "#EA1D2C" },
];

export default function TrafegoPago({ mentorado, briefing }) {
  const [dados, setDados] = useState({
    plataformas: [],
    orcamento_mensal: "",
    objetivo: "mais_pedidos",
    publico: "",
    raio_km: briefing?.raio_entrega || "5",
    ticket_medio: briefing?.ticket_medio || "",
    campanhas_ativas: "",
    resultados_atuais: "",
    dores: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [loadingCriativo, setLoadingCriativo] = useState(false);
  const [criativo, setCriativo] = useState("");

  const togglePlataforma = (id) => {
    setDados(d => ({
      ...d,
      plataformas: d.plataformas.includes(id)
        ? d.plataformas.filter(p => p !== id)
        : [...d.plataformas, id]
    }));
  };

  const analisarCampanhas = async () => {
    setLoading(true);
    setResult("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em tráfego pago para delivery food.

Negócio: ${mentorado?.negocio} - ${mentorado?.cidade}
Ticket médio: R$ ${dados.ticket_medio || briefing?.ticket_medio || "?"}
Faturamento mensal atual: R$ ${briefing?.faturamento_mensal || "?"}
Pedidos/dia: ${briefing?.media_pedidos_dia || "?"}
Orçamento mensal disponível: R$ ${dados.orcamento_mensal || "não informado"}
Objetivo principal: ${dados.objetivo}
Plataformas de interesse: ${dados.plataformas.join(", ") || "não selecionadas"}
Raio de entrega: ${dados.raio_km} km
Público-alvo: ${dados.publico || "não definido"}
Campanhas ativas: ${dados.campanhas_ativas || "nenhuma"}
Resultados atuais: ${dados.resultados_atuais || "não informados"}
Problemas/dores: ${dados.dores || "não informados"}

Faça uma análise completa e gere:

## 1. Diagnóstico das Campanhas Atuais
Identifique o que está errado ou ausente.

## 2. Estratégia Recomendada por Plataforma
Para cada plataforma selecionada, detalhe:
- Tipo de campanha ideal
- Segmentação de público
- Orçamento sugerido
- Formato de anúncio

## 3. Estrutura de Campanhas (setup completo)
Detalhe campanhas, grupos de anúncios e objetivos.

## 4. Criativos que Convertem
Descreva textos, imagens e vídeos que funcionam para delivery.

## 5. KPIs e Metas
- CPC esperado
- CPM estimado
- ROAS alvo
- Custo por pedido aceitável

## 6. Plano de Otimização
O que fazer semana a semana para melhorar os resultados.

Seja ultra prático com números reais de benchmark para o setor delivery Brasil.`,
    });
    setResult(typeof res === "string" ? res : res?.result || res?.response || JSON.stringify(res));
    setLoading(false);
  };

  const gerarCriativos = async () => {
    setLoadingCriativo(true);
    setCriativo("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é copywriter especializado em anúncios para delivery food.

Negócio: ${mentorado?.negocio} em ${mentorado?.cidade}
Ticket médio: R$ ${dados.ticket_medio || briefing?.ticket_medio || "?"}
Plataformas: ${dados.plataformas.join(", ") || "Meta Ads"}
Objetivo: ${dados.objetivo}

Crie 5 conjuntos de criativos para anúncios:

Para cada criativo:
**📝 Headline:** (máx 30 caracteres para Google, 40 para Meta)
**📣 Texto primário:** (copy do anúncio)
**🎯 CTA:** botão de ação
**🖼 Descrição da imagem/vídeo:** o que mostrar visualmente
**🎯 Segmentação sugerida:** público alvo específico
**💡 Por que funciona:** breve explicação da persuasão

Varie entre:
- Urgência/escassez
- Prova social
- Benefício direto
- Curiosidade
- Oferta irresistível

Fale como delivery brasileiro, use linguagem natural e atual.`,
    });
    setCriativo(typeof res === "string" ? res : res?.result || res?.response || JSON.stringify(res));
    setLoadingCriativo(false);
  };

  const Field = ({ label, children, hint }) => (
    <div>
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  );

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

  const objetivos = [
    { id: "mais_pedidos", label: "📦 Mais pedidos" },
    { id: "novos_clientes", label: "👥 Novos clientes" },
    { id: "reativar_clientes", label: "🔄 Reativar clientes" },
    { id: "aumentar_ticket", label: "💰 Aumentar ticket" },
    { id: "lançamento", label: "🚀 Lançar produto" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          📊 Tráfego Pago com IA
        </h2>
        <p className="text-white/40 text-sm mt-0.5">Análise de campanhas, estratégia e criativos gerados por inteligência artificial</p>
      </div>

      {/* Formulário */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart2 size={15} className="text-[#7c6bff]" /> Dados das Campanhas
        </h3>

        {/* Plataformas */}
        <Field label="Plataformas de Anúncio">
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => togglePlataforma(p.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={dados.plataformas.includes(p.id)
                  ? { background: `${p.color}20`, border: `1px solid ${p.color}50`, color: p.color }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }>
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Objetivo */}
        <Field label="Objetivo Principal">
          <div className="flex flex-wrap gap-2">
            {objetivos.map(o => (
              <button key={o.id} onClick={() => setDados(d => ({ ...d, objetivo: o.id }))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={dados.objetivo === o.id
                  ? { background: 'rgba(124,107,255,0.2)', border: '1px solid rgba(124,107,255,0.4)', color: '#a89bff' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }>
                {o.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Orçamento Mensal (R$)" hint="Quanto tem disponível por mês">
            <input type="number" value={dados.orcamento_mensal} onChange={e => setDados(d => ({ ...d, orcamento_mensal: e.target.value }))}
              placeholder="Ex: 800" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Raio de Entrega (km)">
            <input type="number" value={dados.raio_km} onChange={e => setDados(d => ({ ...d, raio_km: e.target.value }))}
              placeholder="Ex: 5" className={inputClass} style={inputStyle} />
          </Field>
        </div>

        <Field label="Público-Alvo" hint="Descreva quem são os clientes ideais">
          <input value={dados.publico} onChange={e => setDados(d => ({ ...d, publico: e.target.value }))}
            placeholder="Ex: Jovens 18-35 anos, famílias, trabalhadores próximos ao bairro X"
            className={inputClass} style={inputStyle} />
        </Field>

        <Field label="Campanhas Ativas Atualmente">
          <textarea value={dados.campanhas_ativas} onChange={e => setDados(d => ({ ...d, campanhas_ativas: e.target.value }))}
            placeholder="Ex: Campanha de tráfego no Instagram com R$20/dia, segmentação por interesse em pizza"
            rows={2} className={inputClass} style={inputStyle} />
        </Field>

        <Field label="Resultados Atuais" hint="Custo por resultado, quantidade de pedidos gerados, etc.">
          <textarea value={dados.resultados_atuais} onChange={e => setDados(d => ({ ...d, resultados_atuais: e.target.value }))}
            placeholder="Ex: 3 pedidos/dia vindos de anúncios, CPC R$0.80, CTR 1.2%"
            rows={2} className={inputClass} style={inputStyle} />
        </Field>

        <Field label="Principais Problemas/Dores">
          <textarea value={dados.dores} onChange={e => setDados(d => ({ ...d, dores: e.target.value }))}
            placeholder="Ex: Alto custo por pedido, alcance baixo, anúncios não convertem"
            rows={2} className={inputClass} style={inputStyle} />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={analisarCampanhas} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c6bff, #9b8fff)', color: 'white' }}>
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Analisar e Criar Estratégia
          </button>
          <button onClick={gerarCriativos} disabled={loadingCriativo}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
            {loadingCriativo ? <RefreshCw size={14} className="animate-spin" /> : <Megaphone size={14} />}
            Gerar Criativos
          </button>
        </div>
      </div>

      {/* Resultados */}
      {(loading || result) && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(124,107,255,0.04)', border: '1px solid rgba(124,107,255,0.15)' }}>
          <h3 className="text-sm font-bold text-[#a89bff] flex items-center gap-2 mb-2">
            <Target size={14} /> Estratégia de Tráfego Pago
          </h3>
          <AIResult content={result} loading={loading} />
        </div>
      )}

      {(loadingCriativo || criativo) && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
            <Megaphone size={14} /> Criativos Gerados
          </h3>
          <AIResult content={criativo} loading={loadingCriativo} />
        </div>
      )}
    </div>
  );
}