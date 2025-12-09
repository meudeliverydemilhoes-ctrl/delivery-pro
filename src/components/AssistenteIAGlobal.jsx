import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Bot, Send, X, Minimize2, Maximize2, Sparkles, Loader2,
  ClipboardList, Target, BookOpen, Lightbulb, RefreshCw,
  BarChart3, Users, FileText, Settings, TrendingUp, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

const sugestoesPorPagina = {
  Dashboard: [
    { icon: BarChart3, texto: "Analisar indicadores de desempenho", cor: "text-blue-400" },
    { icon: TrendingUp, texto: "Como melhorar os resultados dos mentorados?", cor: "text-emerald-400" },
    { icon: Users, texto: "Sugestões para acompanhamento de mentorados", cor: "text-violet-400" },
    { icon: Lightbulb, texto: "Dicas para identificar problemas rapidamente", cor: "text-amber-400" }
  ],
  Mentorados: [
    { icon: Users, texto: "Como diagnosticar um novo mentorado?", cor: "text-blue-400" },
    { icon: Target, texto: "Sugestões para definir metas para mentorados", cor: "text-emerald-400" },
    { icon: ClipboardList, texto: "Checklist para onboarding de mentorado", cor: "text-violet-400" },
    { icon: TrendingUp, texto: "Como medir evolução do mentorado?", cor: "text-amber-400" }
  ],
  ExecucaoInteligente: [
    { icon: ClipboardList, texto: "Como criar um checklist eficiente?", cor: "text-blue-400" },
    { icon: Target, texto: "Sugestões para plano de ação", cor: "text-emerald-400" },
    { icon: BookOpen, texto: "Como estruturar um SOP?", cor: "text-violet-400" },
    { icon: Lightbulb, texto: "Dicas para aumentar a performance", cor: "text-amber-400" }
  ],
  FluxogramasOperacionais: [
    { icon: Settings, texto: "Como otimizar processos operacionais?", cor: "text-blue-400" },
    { icon: Zap, texto: "Dicas para reduzir tempo de operação", cor: "text-emerald-400" },
    { icon: FileText, texto: "Como documentar fluxos de trabalho?", cor: "text-violet-400" },
    { icon: Target, texto: "Sugestões para treinamento de equipe", cor: "text-amber-400" }
  ],
  AulasMentoria: [
    { icon: BookOpen, texto: "Como estruturar uma aula eficiente?", cor: "text-blue-400" },
    { icon: Lightbulb, texto: "Dicas para engajar mentorados nas aulas", cor: "text-emerald-400" },
    { icon: Target, texto: "Como definir temas de casa efetivos?", cor: "text-violet-400" },
    { icon: TrendingUp, texto: "Métricas para avaliar aprendizado", cor: "text-amber-400" }
  ],
  default: [
    { icon: Lightbulb, texto: "Como posso te ajudar hoje?", cor: "text-blue-400" },
    { icon: Target, texto: "Dicas para melhorar resultados", cor: "text-emerald-400" },
    { icon: ClipboardList, texto: "Sugestões de organização", cor: "text-violet-400" },
    { icon: TrendingUp, texto: "Análise de performance", cor: "text-amber-400" }
  ]
};

const contextoPorPagina = {
  Dashboard: `Você está na página de Dashboard onde o mentor visualiza métricas gerais, mentorados ativos, tarefas pendentes e progresso geral da mentoria.`,
  Mentorados: `Você está na página de Mentorados onde o mentor gerencia todos os mentorados, seus status, etapas e informações de contato.`,
  MentoradoDetalhe: `Você está vendo os detalhes de um mentorado específico, incluindo briefing, diagnóstico, cardápio, pilares, tarefas e evolução.`,
  ExecucaoInteligente: `Você está na página de Execução Inteligente, focada em checklists, SOPs, planos de ação e acompanhamento de execução dos mentorados.`,
  FluxogramasOperacionais: `Você está na página de Fluxogramas Operacionais, onde são gerenciados os processos padronizados de todos os setores do delivery.`,
  AulasMentoria: `Você está na página de Aulas da Mentoria, com as 12 aulas completas do programa de mentoria.`,
  Cursos: `Você está na página de Cursos, onde são gerenciados cursos, módulos e aulas para os mentorados.`,
  Biblioteca: `Você está na página de Biblioteca, com materiais de apoio como PDFs, planilhas, templates e documentos.`,
  Agenda: `Você está na página de Agenda, gerenciando compromissos, reuniões e eventos da mentoria.`,
  Notas: `Você está na página de Notas e Insights, para registrar ideias, estratégias e observações importantes.`
};

export default function AssistenteIAGlobal({ currentPage = "default", contexto = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const sugestoes = sugestoesPorPagina[currentPage] || sugestoesPorPagina.default;
  const contextoPagina = contextoPorPagina[currentPage] || "";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Limpar mensagens quando mudar de página
  useEffect(() => {
    setMessages([]);
  }, [currentPage]);

  const handleSend = async (textoOverride = null) => {
    const texto = textoOverride || input.trim();
    if (!texto || isLoading) return;

    const userMessage = { role: "user", content: texto };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const sistemaPrompt = `Você é um assistente de IA especializado em gestão de mentorias para deliveries e restaurantes. 
Seu papel é ajudar o mentor a:
- Criar checklists eficientes para os mentorados
- Desenvolver planos de ação para resolver problemas
- Estruturar SOPs (Procedimentos Operacionais Padrão)
- Dar dicas sobre os 5 pilares da mentoria: Processos, Desempenho, Tempo de Potência, Norte Estratégico e Presença Magnética
- Analisar indicadores e métricas do dashboard
- Sugerir melhorias para aumentar a performance dos mentorados
- Ajudar na organização de fluxos operacionais
- Orientar sobre boas práticas de gestão de delivery

${contextoPagina}

${contexto.totalMentorados ? `Total de ${contexto.totalMentorados} mentorados cadastrados.` : ""}
${contexto.mentoradosAtivos ? `${contexto.mentoradosAtivos} mentorados ativos.` : ""}
${contexto.execucoes ? `Há ${contexto.execucoes} execuções de checklists ativas.` : ""}
${contexto.planosAcao ? `Há ${contexto.planosAcao} planos de ação pendentes.` : ""}
${contexto.tarefasPendentes ? `${contexto.tarefasPendentes} tarefas pendentes.` : ""}
${contexto.proximosCompromissos ? `${contexto.proximosCompromissos} compromissos próximos na agenda.` : ""}

Seja direto, prático e focado em resultados. Use exemplos específicos do setor de delivery quando possível.
Formate suas respostas com markdown quando apropriado (listas, negrito, etc).
Responda sempre em português brasileiro.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${sistemaPrompt}\n\nUsuário: ${texto}`,
        response_json_schema: null
      });

      const assistantMessage = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { 
        role: "assistant", 
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente." 
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleSugestao = (texto) => {
    handleSend(texto);
  };

  const handleClear = () => {
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#FF4D00] to-[#E64500] rounded-full shadow-lg shadow-[#FF4D00]/30 flex items-center justify-center hover:scale-110 transition-transform group"
        title="Assistente IA"
      >
        <Bot size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles size={10} className="text-white" />
        </span>
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Assistente IA
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-300 ${
        isMinimized 
          ? "bottom-6 right-6 w-72 h-14 rounded-xl" 
          : "bottom-6 right-6 w-[400px] h-[550px] rounded-2xl"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-[#FF4D00]/20 to-transparent rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF4D00] rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <span className="font-medium text-white text-sm">Assistente IA</span>
            {!isMinimized && (
              <p className="text-[10px] text-white/50">
                {currentPage === "default" ? "Mentoria Delivery" : currentPage.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
              title="Limpar conversa"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-[#FF4D00]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={32} className="text-[#FF4D00]" />
                  </div>
                  <h3 className="font-medium text-white mb-1">Como posso ajudar?</h3>
                  <p className="text-xs text-white/50">Sou seu assistente para gestão de mentorias</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-white/40 mb-2">Sugestões para esta página:</p>
                  {sugestoes.map((sug, idx) => {
                    const Icon = sug.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSugestao(sug.texto)}
                        className="w-full flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group"
                      >
                        <Icon size={14} className={sug.cor} />
                        <span className="text-xs text-white/70 group-hover:text-white">{sug.texto}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xl ${
                        msg.role === "user"
                          ? "bg-[#FF4D00] text-white"
                          : "bg-white/10 text-white/90"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="text-sm prose prose-invert prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:mb-2 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-3 rounded-xl flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#FF4D00]" />
                      <span className="text-xs text-white/50">Pensando...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua pergunta..."
                className="bg-white/5 border-white/10 text-white text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}