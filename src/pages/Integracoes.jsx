import React, { useState } from "react";
import { CheckCircle2, Zap, Users, Phone, Tag, MessageSquare, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

const leads = [
  { nome: "Carlos Silva", telefone: "+55 51 99999-1234", categoria: "hot_lead", mensagem: "Quero saber mais sobre o plano premium!", tempo: "há 2 min" },
  { nome: "Ana Rodrigues", telefone: "+55 51 98888-5678", categoria: "hot_lead", mensagem: "Qual o valor da mentoria?", tempo: "há 15 min" },
  { nome: "João Ferreira", telefone: "+55 51 97777-9012", categoria: "hot_lead", mensagem: "Tenho interesse, como funciona?", tempo: "há 1h" },
  { nome: "Márcia Lima", telefone: "+55 51 96666-3456", categoria: "hot_lead", mensagem: "Me envie mais informações por favor", tempo: "há 2h" },
  { nome: "Pedro Alves", telefone: "+55 51 95555-7890", categoria: "hot_lead", mensagem: "Vi o anúncio, quero falar com alguém", tempo: "há 3h" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="ml-2 p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0" title="Copiar">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/40" />}
    </button>
  );
}

function CodeBlock({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-sm font-mono text-white/80 flex-1 break-all">{value}</span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function Integracoes() {
  const [showWebhook, setShowWebhook] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
          🔗 Integrações
        </h1>
        <p className="text-white/40 text-sm mt-1">Conecte ferramentas externas ao seu pipeline de vendas</p>
      </div>

      {/* Card de Status — ZapAI Flow */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Zap size={26} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>ZapAI Flow — WhatsApp com IA</h2>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #10B981' }} />
                Conectado
              </span>
            </div>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              Conversas do WhatsApp com categoria <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(124,107,255,0.15)', color: '#a89bff' }}>hot_lead</span> são enviadas automaticamente para o pipeline de Vendas do HubSpot.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "App ID", value: "69c7ccae0711d46d4bdd9111" },
                { label: "Pipeline", value: "VENDAS (882509315)" },
                { label: "Stage padrão", value: "Novo lead (1325608246)" },
                { label: "Valor dos deals", value: "R$ 3.600" },
              ].map((item) => (
                <div key={item.label} className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-white/80 font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Token HubSpot */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)' }}>🔑</span>
          Configuração HubSpot
        </h3>
        <CodeBlock label="Token de Acesso (HubSpot)" value="pat-na1-5e2317e6-26a6-4260-9e53-189cc766e40e" />
        <CodeBlock label="Pipeline ID" value="882509315" />
        <CodeBlock label="Stage ID (Novo lead)" value="1325608246" />
      </div>

      {/* Feed de leads */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(124,107,255,0.15)', border: '1px solid rgba(124,107,255,0.3)' }}>
              <Users size={14} className="text-[#7c6bff]" />
            </span>
            Leads Recebidos do ZapAI Flow
          </h3>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(124,107,255,0.12)', border: '1px solid rgba(124,107,255,0.25)', color: '#9b8fff' }}>
            {leads.length} leads
          </span>
        </div>

        <div className="space-y-2">
          {leads.map((lead, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl group transition-all hover:bg-white/[0.03]"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-base"
                style={{ background: 'rgba(124,107,255,0.12)', border: '1px solid rgba(124,107,255,0.2)', color: '#9b8fff' }}>
                {lead.nome.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white">{lead.nome}</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
                    {lead.categoria}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Phone size={10} /> {lead.telefone}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={10} /> {lead.mensagem.length > 45 ? lead.mensagem.slice(0, 45) + "…" : lead.mensagem}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-[10px] text-white/25">{lead.tempo}</span>
                <a
                  href="https://app.hubspot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)', color: '#FF6B00' }}
                >
                  <ExternalLink size={11} /> HubSpot
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instruções Webhook */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={() => setShowWebhook(!showWebhook)}
          className="w-full flex items-center justify-between p-5 transition-all hover:bg-white/[0.02]"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>⚙️</span>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Configurar Webhook WhatsWave</p>
              <p className="text-[11px] text-white/35 mt-0.5">Instruções de conexão com o ZapAI Flow</p>
            </div>
          </div>
          {showWebhook ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
        </button>

        {showWebhook && (
          <div className="p-5 pt-0 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <div className="space-y-3">
              {[
                { n: 1, text: <>Acesse <a href="https://app.whatswave.com.br" target="_blank" rel="noopener noreferrer" className="text-[#7c6bff] hover:underline">app.whatswave.com.br</a> → <strong>Configurações</strong> → <strong>Chaves de API</strong></> },
                { n: 2, text: <>Na seção <strong>"Conectar Primeiro Serviço"</strong>, selecione <strong>HubSpot</strong></> },
                { n: 3, text: <>Cole o token: <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#a89bff' }}>pat-na1-5e2317e6-26a6-4260-9e53-189cc766e40e</span></> },
                { n: 4, text: <>Company ID WhatsWave: <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#a89bff' }}>239a8874-c4fc-4e54-ade9-cc6e6abf7e3a</span></> },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(124,107,255,0.2)', border: '1px solid rgba(124,107,255,0.35)', color: '#9b8fff' }}>
                    {step.n}
                  </span>
                  <p className="text-sm text-white/70 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <CodeBlock label="Token HubSpot" value="pat-na1-5e2317e6-26a6-4260-9e53-189cc766e40e" />
              <CodeBlock label="Company ID WhatsWave" value="239a8874-c4fc-4e54-ade9-cc6e6abf7e3a" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}