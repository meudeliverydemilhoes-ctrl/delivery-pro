import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, RefreshCw, Star, TrendingUp, Tag, Image, Clock, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/30" />}
    </button>
  );
}

function AIResult({ content, loading, label }) {
  const [collapsed, setCollapsed] = useState(false);
  if (loading) return (
    <div className="flex items-center gap-3 py-5">
      <div className="w-5 h-5 border-2 border-[#EA1D2C]/30 border-t-[#EA1D2C] rounded-full animate-spin" />
      <span className="text-white/40 text-sm">IA analisando iFood...</span>
    </div>
  );
  if (!content) return null;
  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(234,29,44,0.2)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
        style={{ background: 'rgba(234,29,44,0.08)' }}
        onClick={() => setCollapsed(c => !c)}>
        <span className="text-xs font-bold text-[#EA1D2C] uppercase tracking-wider">{label || "Resultado da IA"}</span>
        <div className="flex items-center gap-2">
          <CopyBtn text={content} />
          {collapsed ? <ChevronDown size={14} className="text-white/30" /> : <ChevronUp size={14} className="text-white/30" />}
        </div>
      </div>
      {!collapsed && (
        <div className="p-4" style={{ background: 'rgba(234,29,44,0.03)' }}>
          <ReactMarkdown className="text-sm text-white/80 prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

const SECTIONS = [
  { id: "geral", icon: TrendingUp, label: "Análise Geral & Posicionamento", color: "#EA1D2C" },
  { id: "fotos", icon: Image, label: "Fotos e Visual do Cardápio", color: "#f97316" },
  { id: "pricing", icon: Tag, label: "Precificação & Promoções", color: "#8b5cf6" },
  { id: "avaliacao", icon: Star, label: "Avaliações & Reputação", color: "#f59e0b" },
  { id: "horarios", icon: Clock, label: "Horários & Operação", color: "#10b981" },
];

export default function IFoodIA({ mentorado, briefing }) {
  const [ifoodUrl, setIfoodUrl] = useState("");
  const [dados, setDados] = useState({
    nota_media: "",
    qtd_avaliacoes: "",
    posicao_busca: "",
    tempo_entrega: "",
    taxa_entrega: "",
    ticket_medio: briefing?.ticket_medio || "",
    pedidos_dia: briefing?.media_pedidos_dia || "",
    promocoes_ativas: "",
    principais_problemas: "",
  });

  const [results, setResults] = useState({});
  const [loadings, setLoadings] = useState({});
  const [loadingAll, setLoadingAll] = useState(false);
  const [resultAll, setResultAll] = useState("");

  const contexto = `
Negócio: ${mentorado?.negocio} em ${mentorado?.cidade}
Ticket médio: R$ ${dados.ticket_medio || briefing?.ticket_medio || "?"}
Pedidos/dia: ${dados.pedidos_dia || briefing?.media_pedidos_dia || "?"}
Faturamento mensal: R$ ${briefing?.faturamento_mensal || "?"}
Nota iFood: ${dados.nota_media || "não informada"} (${dados.qtd_avaliacoes || "?"} avaliações)
Posição na busca: ${dados.posicao_busca || "não informada"}
Tempo de entrega: ${dados.tempo_entrega || "não informado"}
Taxa de entrega: R$ ${dados.taxa_entrega || "?"}
Promoções ativas: ${dados.promocoes_ativas || "nenhuma"}
Principais problemas: ${dados.principais_problemas || "não informados"}
${ifoodUrl ? `Link iFood: ${ifoodUrl}` : ""}
  `.trim();

  const analisarSecao = async (id) => {
    setLoadings(l => ({ ...l, [id]: true }));
    setResults(r => ({ ...r, [id]: "" }));

    const prompts = {
      geral: `Você é expert em iFood e delivery food. Analise o posicionamento geral deste negócio no iFood.
${contexto}

Forneça:
## Diagnóstico do Perfil
- O que está prejudicando a visibilidade e conversão
- Análise do nome, descrição e categoria

## Otimização para Algoritmo iFood
- Como melhorar o ranking na busca (SEO do iFood)
- Palavras-chave que devem constar no nome/descrição
- Horários de maior demanda no nicho

## Score de Performance
Avalie de 0-10 cada aspecto: Completude do perfil, Velocidade de entrega, Taxa de aceitação de pedidos, Tempo de preparo

## Top 7 Ações Prioritárias
Liste as ações com maior impacto em conversão e visibilidade, em ordem de prioridade, com passo a passo.`,

      fotos: `Você é especialista em fotografia e marketing visual para iFood/delivery.
${contexto}

Analise e forneça:
## Por que fotos fazem 40-60% da conversão no iFood
Dados e exemplos reais.

## Checklist de Fotos que Vendem
Para cada tipo de produto, o que a foto DEVE ter (ângulo, iluminação, contexto, tamanho, edição)

## Erros Comuns em Fotos de Delivery
Os 10 erros que destroem conversão.

## Guia de Produção Simples
Como fazer fotos profissionais só com celular, sem custo.

## Estratégia de Capa e Banner
Como usar a imagem de capa para converter clientes novos.`,

      pricing: `Você é consultor de pricing e promoções para iFood especializado em delivery food.
${contexto}

Gere:
## Análise de Precificação Atual
O que está certo e errado na estratégia de preços.

## Estratégia de Âncoras de Preço
Como usar preços âncora para aumentar o ticket médio no iFood.

## Promoções que Realmente Convertem no iFood
- Tipos: combo, desconto progressivo, frete grátis condicional, cupom de retorno
- Quando usar cada tipo
- Exemplos de promoções com alto ROI

## Calculadora de Viabilidade
Como calcular se uma promoção é lucrativa. Fórmulas práticas.

## Plano de Promoções 30 Dias
Calendário com ativações semanais para manter volume de pedidos constante.`,

      avaliacao: `Você é especialista em reputação digital e gestão de avaliações no iFood.
${contexto}

Forneça:
## Impacto das Avaliações no Algoritmo iFood
Como a nota afeta diretamente o ranking e a visibilidade.

## Diagnóstico da Nota Atual
O que a nota ${dados.nota_media || "atual"} indica e como melhorá-la.

## Estratégia de Captação de Avaliações Positivas
5 formas testadas de conseguir mais avaliações 5 estrelas.

## Como Responder Avaliações Negativas
Templates de resposta para os tipos mais comuns de reclamação (demora, qualidade, embalagem, produto errado).

## Programa de Fidelização via iFood
Como usar cupons de retorno e benefícios para aumentar a recorrência.

## Meta de Nota e Prazo
Plano realista para chegar a 4.8+ em 60 dias.`,

      horarios: `Você é especialista em operações de delivery e gestão de jornada no iFood.
${contexto}

Analise:
## Análise de Horários de Pico
Para o nicho e região, quais são os melhores horários para operar no iFood.

## Configuração Ideal de Funcionamento
- Dias e horários que maximizam pedidos sem sobrecarga
- Como configurar pausas sem perder ranking

## Tempo de Preparo e Entrega
- Como reduzir o tempo de preparo sem prejudicar qualidade
- Estratégias para melhorar o tempo de entrega
- Como o tempo de entrega impacta diretamente a conversão

## Gestão de Pico de Demanda
Como se preparar para sextas, sábados e eventos especiais.

## Automações e Configurações do App
Configurações específicas do iFood Parceiros que poucos sabem usar.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: prompts[id],
      add_context_from_internet: id === "geral" && !!ifoodUrl,
    });
    const text = typeof res === "string" ? res : res?.result || res?.response || JSON.stringify(res);
    setResults(r => ({ ...r, [id]: text }));
    setLoadings(l => ({ ...l, [id]: false }));
  };

  const analisarTudo = async () => {
    setLoadingAll(true);
    setResultAll("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o maior especialista em iFood do Brasil, com conhecimento profundo de algoritmo, conversão e operação.
${contexto}

Crie um RELATÓRIO COMPLETO DE OTIMIZAÇÃO iFood com:

# 🔍 Diagnóstico Geral
Avalie o negócio de 0-100 em: Visibilidade, Conversão, Reputação, Operação, Pricing

# 🚨 Problemas Críticos (resolver esta semana)
Liste os 3 maiores bloqueios de vendas com solução imediata.

# 📈 Estratégia de Crescimento 90 Dias
Divida em 3 fases de 30 dias com metas claras de pedidos e faturamento.

# ⚙️ Configurações do iFood Parceiros
Checklist das configurações que maximizam visibilidade no algoritmo.

# 📸 Visual & Cardápio
As mudanças de foto e cardápio com maior impacto em conversão.

# 💰 Precificação & Promoções
Estratégia completa de preços e campanhas para os próximos 30 dias.

# ⭐ Reputação & Avaliações
Plano para chegar em 4.8+ em 60 dias.

# 🕐 Operação & Horários
Setup ideal de funcionamento para maximizar pedidos.

# 🎯 KPIs para Acompanhar
Métricas semanais para saber se está evoluindo.

Seja ultra específico com ações práticas. Use dados reais do mercado delivery Brasil 2024.`,
    });
    setResultAll(typeof res === "string" ? res : res?.result || res?.response || JSON.stringify(res));
    setLoadingAll(false);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: '#EA1D2C' }}>🍕</span>
          Análise iFood com IA
        </h2>
        <p className="text-white/40 text-sm mt-0.5">Estratégias completas para aumentar conversão, visibilidade e vendas no iFood</p>
      </div>

      {/* Dados do perfil */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-bold text-white">📋 Dados do Perfil iFood</h3>
        <p className="text-xs text-white/35">Preencha o máximo possível para análises mais precisas (nenhum campo é obrigatório)</p>

        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">Link do perfil no iFood</label>
          <input value={ifoodUrl} onChange={e => setIfoodUrl(e.target.value)}
            placeholder="https://www.ifood.com.br/delivery/..."
            className={inputClass} style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: "nota_media", label: "Nota Média", placeholder: "Ex: 4.5" },
            { key: "qtd_avaliacoes", label: "Nº de Avaliações", placeholder: "Ex: 230" },
            { key: "posicao_busca", label: "Posição na Busca", placeholder: "Ex: 8º lugar" },
            { key: "tempo_entrega", label: "Tempo de Entrega", placeholder: "Ex: 35-50 min" },
            { key: "taxa_entrega", label: "Taxa de Entrega", placeholder: "Ex: 4.99" },
            { key: "pedidos_dia", label: "Pedidos/Dia", placeholder: "Ex: 25" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">{f.label}</label>
              <input value={dados[f.key]} onChange={e => setDados(d => ({ ...d, [f.key]: e.target.value }))}
                placeholder={f.placeholder} className={inputClass} style={inputStyle} />
            </div>
          ))}
        </div>

        <div>
          <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Promoções Ativas</label>
          <input value={dados.promocoes_ativas} onChange={e => setDados(d => ({ ...d, promocoes_ativas: e.target.value }))}
            placeholder="Ex: Frete grátis acima de R$50, Combo pizza + refri com 10% off"
            className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1">Principais Problemas / Queixas</label>
          <textarea value={dados.principais_problemas} onChange={e => setDados(d => ({ ...d, principais_problemas: e.target.value }))}
            placeholder="Ex: Nota caindo, poucas avaliações, baixo volume nos dias de semana, fotos ruins"
            rows={2} className={inputClass} style={inputStyle} />
        </div>

        {/* Botão análise completa */}
        <button onClick={analisarTudo} disabled={loadingAll}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #EA1D2C, #c0152a)', color: 'white', boxShadow: '0 4px 20px rgba(234,29,44,0.3)' }}>
          {loadingAll ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
          Gerar Relatório Completo iFood
        </button>
      </div>

      {/* Resultado da análise completa */}
      {(loadingAll || resultAll) && (
        <AIResult content={resultAll} loading={loadingAll} label="📊 Relatório Completo iFood" />
      )}

      {/* Análises por seção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                  <Icon size={14} style={{ color: s.color }} />
                </span>
                <h4 className="text-xs font-bold text-white flex-1">{s.label}</h4>
              </div>
              <button onClick={() => analisarSecao(s.id)} disabled={loadings[s.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color }}>
                {loadings[s.id] ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Analisar
              </button>
              <AIResult content={results[s.id]} loading={loadings[s.id]} label={s.label} />
            </div>
          );
        })}
      </div>
    </div>
  );
}