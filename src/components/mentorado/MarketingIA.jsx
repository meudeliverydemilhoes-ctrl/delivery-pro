import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Instagram, Sparkles, RefreshCw, ChefHat, Target, TrendingUp, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
          <Icon size={14} style={{ color }} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/30" />}
    </button>
  );
}

function AIResult({ content, loading }) {
  if (loading) return (
    <div className="flex items-center gap-3 py-6">
      <div className="w-5 h-5 border-2 border-[#7c6bff]/30 border-t-[#7c6bff] rounded-full animate-spin" />
      <span className="text-white/40 text-sm">Analisando com IA...</span>
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

export default function MarketingIA({ mentorado, briefing }) {
  const [instagramUrl, setInstagramUrl] = useState(mentorado?.instagram_url || "");
  const [loadingInsta, setLoadingInsta] = useState(false);
  const [resultInsta, setResultInsta] = useState("");

  const [loadingCardapio, setLoadingCardapio] = useState(false);
  const [resultCardapio, setResultCardapio] = useState("");

  const [loadingPlano, setLoadingPlano] = useState(false);
  const [resultPlano, setResultPlano] = useState("");

  const contexto = `
Negócio: ${mentorado?.negocio || "delivery"}
Cidade: ${mentorado?.cidade || ""}
Ticket médio: R$ ${briefing?.ticket_medio || "?"}
Pedidos/dia: ${briefing?.media_pedidos_dia || "?"}
Faturamento mensal: R$ ${briefing?.faturamento_mensal || "?"}
Problemas: ${briefing?.problemas_identificados || "não informados"}
Objetivos: ${briefing?.objetivos || "não informados"}
  `.trim();

  const analisarInstagram = async () => {
    if (!instagramUrl) return;
    setLoadingInsta(true);
    setResultInsta("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em marketing digital para delivery food.

ACESSE E ANALISE AGORA o perfil real do Instagram: ${instagramUrl}

Busque e leia as informações diretamente do perfil (bio, posts recentes, seguidores, frequência de publicações, estilo visual, engajamento).

Contexto do negócio: ${contexto}

Com base no que você encontrou no perfil, forneça:
1. **Análise do Perfil** — bio atual, número de seguidores, frequência de posts, estilo visual, engajamento estimado
2. **Pontos Fortes** — o que está funcionando bem no perfil
3. **Problemas Identificados** — o que está prejudicando as vendas e o alcance
4. **Ações Imediatas** (top 5) — melhorias concretas e específicas para aumentar pedidos
5. **Conteúdo Recomendado** — tipos de posts, horários ideais, hashtags para delivery food

Seja específico sobre o que você encontrou no perfil. Use bullets e emojis.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
    });
    setResultInsta(typeof res === "string" ? res : res?.result || res?.response || JSON.stringify(res));
    setLoadingInsta(false);
  };

  const analisarCardapio = async () => {
    setLoadingCardapio(true);
    setResultCardapio("");
    const itens = briefing?.analise_cardapio?.itens || [];
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em engenharia de cardápio para delivery.
Contexto do negócio: ${contexto}
${itens.length > 0 ? `Itens do cardápio: ${JSON.stringify(itens.slice(0, 20))}` : "Cardápio não mapeado ainda."}

Crie uma análise completa com:
1. **Análise Estratégica** — o que o cardápio deve ter para maximizar vendas no delivery
2. **Itens Estrela** — produtos que devem ser destaque (alta margem + alta demanda)
3. **Precificação Inteligente** — âncoras de preço, kits e combos que aumentam ticket médio
4. **Fotos e Descrições** — como melhorar apresentação visual no app
5. **Plano de Ação do Cardápio** — 5 mudanças prioritárias para fazer essa semana

Use dados reais de mercado de delivery para dar contexto. Seja específico.`,
    });
    setResultCardapio(typeof res === "string" ? res : res?.result || res?.response || JSON.stringify(res));
    setLoadingCardapio(false);
  };

  const gerarPlanoAcao = async () => {
    setLoadingPlano(true);
    setResultPlano("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é consultor especialista em delivery food. Crie um plano de ação de 30 dias para aumentar as vendas.
${contexto}
${instagramUrl ? `Instagram: ${instagramUrl}` : ""}
${resultInsta ? `Análise de Instagram: ${resultInsta.slice(0, 500)}` : ""}
${resultCardapio ? `Análise de cardápio: ${resultCardapio.slice(0, 500)}` : ""}

Gere um **Plano de Ação 30 dias** com:

**Semana 1 — Base:**
- 3 ações concretas com responsável e prazo

**Semana 2 — Ativação:**
- 3 ações de marketing e captação

**Semana 3 — Otimização:**
- 3 ações de melhoria operacional e cardápio

**Semana 4 — Escala:**
- 3 ações para consolidar e escalar resultados

**Meta projetada:** estimativa de crescimento em pedidos e faturamento

Seja ultra específico, com nomes de ferramentas, textos de posts, e valores quando possível.`,
    });
    setResultPlano(typeof res === "string" ? res : res?.result || res?.response || JSON.stringify(res));
    setLoadingPlano(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          📲 Marketing com IA
        </h2>
        <p className="text-white/40 text-sm mt-0.5">Análise de Instagram, cardápio e plano de ação gerados por inteligência artificial</p>
      </div>

      {/* Instagram */}
      <Section icon={Instagram} title="Análise do Instagram" color="#E1306C">
        <div className="flex gap-2">
          <input
            value={instagramUrl}
            onChange={e => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/seunegocio ou @seunegocio"
            className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={analisarInstagram}
            disabled={loadingInsta || !instagramUrl}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #E1306C, #833ab4)', color: 'white' }}
          >
            {loadingInsta ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Analisar
          </button>
        </div>
        <p className="text-xs text-white/25 mt-2">Cole o link ou @ do perfil. A IA vai analisar o perfil e dar ações concretas para aumentar vendas.</p>
        <AIResult content={resultInsta} loading={loadingInsta} />
      </Section>

      {/* Cardápio */}
      <Section icon={ChefHat} title="Otimização do Cardápio" color="#f97316">
        <p className="text-xs text-white/45 mb-3">A IA analisa o cardápio com base no briefing do negócio e sugere melhorias para aumentar o ticket médio e as vendas.</p>
        <button
          onClick={analisarCardapio}
          disabled={loadingCardapio}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c' }}
        >
          {loadingCardapio ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Gerar análise do cardápio
        </button>
        <AIResult content={resultCardapio} loading={loadingCardapio} />
      </Section>

      {/* Plano de Ação */}
      <Section icon={Target} title="Plano de Ação 30 Dias" color="#7c6bff">
        <p className="text-xs text-white/45 mb-3">Gera um plano de ação completo e personalizado baseado no contexto do negócio e nas análises acima.</p>
        <button
          onClick={gerarPlanoAcao}
          disabled={loadingPlano}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'rgba(124,107,255,0.15)', border: '1px solid rgba(124,107,255,0.3)', color: '#a89bff' }}
        >
          {loadingPlano ? <RefreshCw size={14} className="animate-spin" /> : <TrendingUp size={14} />}
          Gerar plano de ação
        </button>
        <AIResult content={resultPlano} loading={loadingPlano} />
      </Section>
    </div>
  );
}