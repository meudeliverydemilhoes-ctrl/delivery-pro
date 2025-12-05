import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Bot, Send, X, Minimize2, Maximize2, Sparkles, Loader2,
  ClipboardList, Target, BookOpen, Lightbulb, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

const sugestoesProntas = [
  { icon: ClipboardList, texto: "Como criar um checklist eficiente?", cor: "text-blue-400" },
  { icon: Target, texto: "Sugestões para plano de ação", cor: "text-emerald-400" },
  { icon: BookOpen, texto: "Como estruturar um SOP?", cor: "text-violet-400" },
  { icon: Lightbulb, texto: "Dicas para aumentar a performance dos mentorados", cor: "text-amber-400" }
];

export default function AssistenteIA({ contexto = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
- Sugerir melhorias para aumentar a performance dos mentorados

Seja direto, prático e focado em resultados. Use exemplos específicos do setor de delivery quando possível.
Formate suas respostas com markdown quando apropriado.

${contexto.execucoes ? `Contexto: Há ${contexto.execucoes} execuções de checklists ativas.` : ""}
${contexto.planosAcao ? `Há ${contexto.planosAcao} planos de ação pendentes.` : ""}
${contexto.mentorados ? `Total de ${contexto.mentorados} mentorados ativos.` : ""}`;

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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#FF4D00] to-[#E64500] rounded-full shadow-lg shadow-[#FF4D00]/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Bot size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
          <Sparkles size={10} className="text-white" />
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-300 ${
        isMinimized 
          ? "bottom-6 right-6 w-72 h-14 rounded-xl" 
          : "bottom-6 right-6 w-96 h-[500px] rounded-2xl"
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
              <p className="text-[10px] text-white/50">Execução Inteligente</p>
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
          <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
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
                  <p className="text-xs text-white/40 mb-2">Sugestões:</p>
                  {sugestoesProntas.map((sug, idx) => {
                    const Icon = sug.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSugestao(sug.texto)}
                        className="w-full flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
                      >
                        <Icon size={14} className={sug.cor} />
                        <span className="text-xs text-white/70">{sug.texto}</span>
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
                        <div className="text-sm prose prose-invert prose-sm max-w-none">
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
                    <div className="bg-white/10 p-3 rounded-xl">
                      <Loader2 size={16} className="animate-spin text-[#FF4D00]" />
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