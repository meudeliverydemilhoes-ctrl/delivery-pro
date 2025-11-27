import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  ListChecks,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Check
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const pilaresDataDefault = {
  processos: {
    titulo: "Pilar 1 – Processos",
    icon: "🏆",
    cor: "bg-blue-500",
    modulos: [
      {
        nome: "Padronização e Setorização",
        topicos: [
          "Atendimento (balcão, despacho, call center)",
          "Produção (massa, montagem, uso da balança, fichas técnicas)",
          "Finalização (cozinha, molhos, pré-preparo, produção mínima)",
          "Fichas técnicas"
        ]
      },
      {
        nome: "Checklists Operacionais",
        topicos: ["Checklist diário", "Checklist por turno", "Checklist semanal"]
      },
      {
        nome: "SOPs (Padrões de Procedimento)",
        topicos: ["Documentação de processos", "Fluxogramas operacionais", "Manual de operações"]
      },
      {
        nome: "Regulamento Interno",
        topicos: ["Regras e normas da operação", "Políticas de conduta", "Penalidades e bonificações"]
      },
      {
        nome: "Cronograma de Execução",
        topicos: ["Planejamento semanal", "Distribuição de tarefas", "Acompanhamento de prazos"]
      },
      {
        nome: "Cultura Operacional",
        topicos: ["Disciplina de rotina", "Engajamento da equipe", "Padronização de comportamentos"]
      }
    ],
    tarefas: [
      "Implantar uso de fichas técnicas",
      "Habilitar controle por balança",
      "Publicar e aplicar checklists",
      "Revisar fluxos de atendimento e despacho",
      "Validar regulamento interno com o time"
    ],
    resultados: [
      "Operação padronizada e replicável",
      "Redução de desperdício",
      "Equipe alinhada aos processos",
      "Maior controle e previsibilidade"
    ]
  },
  desempenho: {
    titulo: "Pilar 2 – Desempenho",
    icon: "📈",
    cor: "bg-emerald-500",
    modulos: [
      {
        nome: "Financeiro",
        topicos: [
          "Avaliar histórico de faturamento",
          "Identificar gaps percentuais",
          "Criar indicadores de desempenho",
          "Calcular markup e precificação por ficha técnica"
        ]
      },
      {
        nome: "iFood",
        topicos: [
          "Cardápio, fotos, legendas e descrições",
          "Montagem de combos e promoções",
          "Remoção de produtos de baixo desempenho",
          "Ativação de cupons e tele grátis"
        ]
      },
      {
        nome: "Indicadores Operacionais",
        topicos: ["CMV (Custo de Mercadoria Vendida)", "Ticket médio", "Pedidos por dia", "Taxa de conversão"]
      },
      {
        nome: "Painéis de Controle",
        topicos: ["Dashboard de métricas", "Metas semanais", "Relatórios de performance"]
      }
    ],
    tarefas: [
      "Criar planilha de indicadores",
      "Atualizar dados financeiros",
      "Revisar preços no iFood com base no markup",
      "Testar promoções e combos",
      "Monitorar desempenho e corrigir gaps"
    ],
    resultados: ["Aumento do faturamento", "Margem de lucro otimizada", "Cardápio rentável", "Decisões baseadas em dados"]
  },
  tempo_potencia: {
    titulo: "Pilar 3 – Tempo de Potência",
    icon: "⚡",
    cor: "bg-violet-500",
    modulos: [
      {
        nome: "Organização e Agendamento",
        topicos: ["Organização de encontros", "Entendimento de disponibilidade da equipe", "Alinhamento de horários e metas"]
      },
      {
        nome: "Cronogramas de Rotina",
        topicos: ["Cronograma por unidade", "Definição de tarefas e responsáveis", "Calendário de atividades"]
      },
      {
        nome: "Gestão do Tempo",
        topicos: ["Produtividade do time", "Eliminação de desperdício de tempo", "Foco nas prioridades"]
      },
      {
        nome: "Priorização (Kanban)",
        topicos: ["A Fazer", "Em Progresso", "Concluído"]
      }
    ],
    tarefas: [
      "Mapear gargalos de tempo",
      "Criar cronograma de execução",
      "Implantar quadro de tarefas",
      "Delegar funções e acompanhar prazos",
      "Medir produtividade individual e da equipe"
    ],
    resultados: ["Equipe mais produtiva", "Menos retrabalho", "Entregas no prazo", "Gestão visual das tarefas"]
  },
  norte_estrategico: {
    titulo: "Pilar 4 – Norte Estratégico",
    icon: "🎯",
    cor: "bg-amber-500",
    modulos: [
      {
        nome: "Intenção Estratégica",
        topicos: ["Missão → por que fazemos o que fazemos", "Visão → onde queremos chegar", "Valores → o que é inegociável"]
      },
      {
        nome: "Cultura Organizacional",
        topicos: ["Definição de cultura", "Comportamentos esperados", "Rituais e práticas"]
      },
      {
        nome: "Governança",
        topicos: ["Alinhamento de propósito", "Estrutura de decisão", "Responsabilidades claras"]
      },
      {
        nome: "Plano de Expansão",
        topicos: ["Objetivos da marca", "Metas de crescimento", "Estratégia de mercado"]
      },
      {
        nome: "Comunicação Interna",
        topicos: ["Comunicação baseada no propósito", "Reuniões de alinhamento estratégico", "Feedback e transparência"]
      }
    ],
    tarefas: [
      "Definir missão, visão e valores",
      "Comunicar e aplicar os princípios no time",
      "Criar documento de cultura e propósito",
      "Revisar se todas as decisões estão alinhadas ao norte estratégico"
    ],
    resultados: ["Equipe alinhada ao propósito", "Decisões coerentes", "Cultura forte e consistente", "Direção clara para o negócio"]
  },
  presenca_magnetica: {
    titulo: "Pilar 5 – Presença Magnética",
    icon: "✨",
    cor: "bg-pink-500",
    modulos: [
      {
        nome: "Comunicação Visual e Marketing",
        topicos: ["Identidade visual da marca", "Materiais gráficos", "Padronização de comunicação"]
      },
      {
        nome: "Estratégia no iFood",
        topicos: ["Descrições atrativas", "Fotos profissionais", "Destaque de diferenciais"]
      },
      {
        nome: "Storytelling e Identidade",
        topicos: ["História da marca", "Narrativa de valor", "Conexão emocional"]
      },
      {
        nome: "Redes Sociais",
        topicos: ["Conteúdo e presença digital", "Plano de postagens", "Engajamento com seguidores"]
      },
      {
        nome: "Imagem da Empresa",
        topicos: ["Fortalecimento da marca", "Posicionamento dos líderes", "Reputação online"]
      },
      {
        nome: "Experiência de Marca",
        topicos: ["Padronização de atendimento", "Embalagem e apresentação", "Linguagem e tom de voz"]
      }
    ],
    tarefas: [
      "Atualizar descrição e imagens no iFood",
      "Padronizar comunicação visual das lojas",
      "Criar plano de postagens e campanhas",
      "Produzir materiais visuais com storytelling",
      "Garantir consistência da marca em todos os pontos de contato",
      "Solicitar fotos e vídeos da operação"
    ],
    resultados: ["Marca reconhecida e desejada", "Maior conversão de clientes", "Presença digital forte", "Experiência memorável"]
  }
};

export default function PilarConteudoIncluido({ 
  pilarKey, 
  progressoItems = [], 
  onToggleItem,
  customData,
  onUpdateCustomData
}) {
  const defaultPilar = pilaresDataDefault[pilarKey];
  const [expandedModulos, setExpandedModulos] = useState({});
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [editingTopico, setEditingTopico] = useState(null);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novoTopico, setNovoTopico] = useState({});
  const [editText, setEditText] = useState("");

  // Usa customData se existir, senão usa o padrão
  const pilar = customData || defaultPilar;

  if (!pilar) return null;

  const toggleModulo = (idx) => {
    setExpandedModulos((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isItemCompleted = (tipo, texto) => {
    return progressoItems.some(
      (item) => item.tipo === tipo && item.texto === texto && item.concluido
    );
  };

  const getModuloProgress = (modulo) => {
    const completedTopicos = modulo.topicos.filter((t) =>
      isItemCompleted("topico", t)
    ).length;
    return {
      completed: completedTopicos,
      total: modulo.topicos.length,
      percentage: modulo.topicos.length > 0 ? Math.round((completedTopicos / modulo.topicos.length) * 100) : 0
    };
  };

  const getTarefasProgress = () => {
    const completed = pilar.tarefas.filter((t) =>
      isItemCompleted("tarefa", t)
    ).length;
    return {
      completed,
      total: pilar.tarefas.length,
      percentage: pilar.tarefas.length > 0 ? Math.round((completed / pilar.tarefas.length) * 100) : 0
    };
  };

  // Funções de edição
  const handleAddTarefa = () => {
    if (!novaTarefa.trim()) return;
    const newTarefas = [...pilar.tarefas, novaTarefa.trim()];
    onUpdateCustomData?.({ ...pilar, tarefas: newTarefas });
    setNovaTarefa("");
  };

  const handleEditTarefa = (idx) => {
    const newTarefas = [...pilar.tarefas];
    newTarefas[idx] = editText;
    onUpdateCustomData?.({ ...pilar, tarefas: newTarefas });
    setEditingTarefa(null);
    setEditText("");
  };

  const handleDeleteTarefa = (idx) => {
    const newTarefas = pilar.tarefas.filter((_, i) => i !== idx);
    onUpdateCustomData?.({ ...pilar, tarefas: newTarefas });
  };

  const handleAddTopico = (moduloIdx) => {
    const texto = novoTopico[moduloIdx];
    if (!texto?.trim()) return;
    const newModulos = [...pilar.modulos];
    newModulos[moduloIdx] = {
      ...newModulos[moduloIdx],
      topicos: [...newModulos[moduloIdx].topicos, texto.trim()]
    };
    onUpdateCustomData?.({ ...pilar, modulos: newModulos });
    setNovoTopico({ ...novoTopico, [moduloIdx]: "" });
  };

  const handleEditTopico = (moduloIdx, topicoIdx) => {
    const newModulos = [...pilar.modulos];
    newModulos[moduloIdx].topicos[topicoIdx] = editText;
    onUpdateCustomData?.({ ...pilar, modulos: newModulos });
    setEditingTopico(null);
    setEditText("");
  };

  const handleDeleteTopico = (moduloIdx, topicoIdx) => {
    const newModulos = [...pilar.modulos];
    newModulos[moduloIdx] = {
      ...newModulos[moduloIdx],
      topicos: newModulos[moduloIdx].topicos.filter((_, i) => i !== topicoIdx)
    };
    onUpdateCustomData?.({ ...pilar, modulos: newModulos });
  };

  const tarefasProgress = getTarefasProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{pilar.icon}</span>
        <div>
          <h3 className="text-xl font-bold text-white">{pilar.titulo}</h3>
          <p className="text-sm text-white/50">Roteiro de aprendizagem interativo</p>
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/70 mb-2">
          <BookOpen size={18} />
          <span className="font-medium">Módulos e Tópicos</span>
        </div>

        {pilar.modulos.map((modulo, idx) => {
          const progress = getModuloProgress(modulo);
          const isExpanded = expandedModulos[idx];

          return (
            <Collapsible key={idx} open={isExpanded} onOpenChange={() => toggleModulo(idx)}>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={18} className="text-white/50" />
                    ) : (
                      <ChevronRight size={18} className="text-white/50" />
                    )}
                    <span className="font-medium text-white">{modulo.nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pilar.cor} transition-all duration-300`}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/50 min-w-[40px]">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-2">
                    {modulo.topicos.map((topico, tIdx) => {
                      const isCompleted = isItemCompleted("topico", topico);
                      const isEditing = editingTopico === `${idx}-${tIdx}`;
                      
                      if (isEditing) {
                        return (
                          <div key={tIdx} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditTopico(idx, tIdx);
                                if (e.key === "Escape") { setEditingTopico(null); setEditText(""); }
                              }}
                              className="flex-1 bg-white/10 border-white/20 text-white text-sm h-8"
                              autoFocus
                            />
                            <button onClick={() => handleEditTopico(idx, tIdx)} className="text-emerald-400 p-1">
                              <Check size={16} />
                            </button>
                            <button onClick={() => { setEditingTopico(null); setEditText(""); }} className="text-white/50 p-1">
                              <X size={16} />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={tIdx}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                        >
                          <button onClick={() => onToggleItem?.("topico", topico)} className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 size={18} className="text-emerald-400" />
                            ) : (
                              <Circle size={18} className="text-white/30 group-hover:text-white/50" />
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${isCompleted ? "text-white/50 line-through" : "text-white/80"}`}>
                            {topico}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingTopico(`${idx}-${tIdx}`); setEditText(topico); }}
                              className="text-white/40 hover:text-white p-1"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTopico(idx, tIdx)}
                              className="text-red-400/60 hover:text-red-400 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Adicionar novo item */}
                    <div className="flex items-center gap-2 pt-2">
                      <Input
                        value={novoTopico[idx] || ""}
                        onChange={(e) => setNovoTopico({ ...novoTopico, [idx]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTopico(idx)}
                        placeholder="Adicionar item..."
                        className="flex-1 bg-white/5 border-white/10 text-white text-sm h-8 placeholder:text-white/30"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddTopico(idx)}
                        disabled={!novoTopico[idx]?.trim()}
                        className="h-8 px-2 bg-[#FF4D00] hover:bg-[#E64500]"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Tarefas Principais */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white/70">
            <ListChecks size={18} />
            <span className="font-medium">Tarefas Principais</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF4D00] transition-all duration-300"
                style={{ width: `${tarefasProgress.percentage}%` }}
              />
            </div>
            <span className="text-xs text-white/50">
              {tarefasProgress.completed}/{tarefasProgress.total}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {pilar.tarefas.map((tarefa, idx) => {
            const isCompleted = isItemCompleted("tarefa", tarefa);
            const isEditing = editingTarefa === idx;

            if (isEditing) {
              return (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditTarefa(idx);
                      if (e.key === "Escape") { setEditingTarefa(null); setEditText(""); }
                    }}
                    className="flex-1 bg-white/10 border-white/20 text-white text-sm h-8"
                    autoFocus
                  />
                  <button onClick={() => handleEditTarefa(idx)} className="text-emerald-400 p-1">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setEditingTarefa(null); setEditText(""); }} className="text-white/50 p-1">
                    <X size={16} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <button onClick={() => onToggleItem?.("tarefa", tarefa)} className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  ) : (
                    <Circle size={18} className="text-white/30 group-hover:text-white/50" />
                  )}
                </button>
                <span className={`flex-1 text-sm ${isCompleted ? "text-white/50 line-through" : "text-white/80"}`}>
                  {tarefa}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingTarefa(idx); setEditText(tarefa); }}
                    className="text-white/40 hover:text-white p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTarefa(idx)}
                    className="text-red-400/60 hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Adicionar nova tarefa */}
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTarefa()}
              placeholder="Adicionar nova tarefa..."
              className="flex-1 bg-white/5 border-white/10 text-white text-sm h-9 placeholder:text-white/30"
            />
            <Button
              size="sm"
              onClick={handleAddTarefa}
              disabled={!novaTarefa.trim()}
              className="h-9 px-3 bg-[#FF4D00] hover:bg-[#E64500]"
            >
              <Plus size={16} className="mr-1" /> Nova Tarefa
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados Esperados */}
      <div className="bg-gradient-to-br from-[#FF4D00]/10 to-transparent border border-[#FF4D00]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 text-[#FF4D00] mb-4">
          <Target size={18} />
          <span className="font-medium">Resultados Esperados</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {pilar.resultados.map((resultado, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"
            >
              <Sparkles size={14} className="text-[#FF4D00]" />
              <span className="text-sm text-white/80">{resultado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}