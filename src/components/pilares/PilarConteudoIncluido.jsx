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
        nome: "📋 Tarefas & Checklists",
        topicos: [
          "Mapear processo atual (modelo de diagnóstico pronto para preencher gargalos)",
          "Criar cronograma de melhorias (prazos semanais/mensais já listados)",
          "Implementar a primeira otimização (começar pelo controle de CMV)",
          "Checklist pronto para abertura da operação",
          "Checklist pronto para fechamento da operação",
          "Checklist de auditorias periódicas"
        ]
      },
      {
        nome: "🎯 Exercícios Práticos",
        topicos: [
          "Análise SWOT do processo (modelo em branco para preenchimento)",
          "Preencher ficha técnica padrão de 1 produto (modelo entregue)",
          "Simulação de CMV (planilha automática)"
        ]
      }
    ],
    tarefas: [
      "Preencher diagnóstico de gargalos no modelo fornecido",
      "Definir cronograma semanal de melhorias",
      "Aplicar checklist de abertura por 7 dias consecutivos",
      "Aplicar checklist de fechamento por 7 dias consecutivos",
      "Completar análise SWOT do processo",
      "Criar ficha técnica de 1 produto principal",
      "Executar simulação de CMV na planilha"
    ],
    resultados: [
      "Operação padronizada e replicável",
      "Redução de desperdício comprovada",
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
        nome: "📋 Tarefas & Checklists",
        topicos: [
          "Preencher diagnóstico inicial (ticket médio, CMV, pedidos/dia)",
          "Acompanhar dashboard de indicadores (gráficos prontos)",
          "Montar rotina de execução semanal (agenda já estruturada)",
          "Revisar indicadores toda segunda-feira",
          "Atualizar planilha de faturamento semanalmente"
        ]
      },
      {
        nome: "🎯 Exercícios Práticos",
        topicos: [
          "Preencher metas de 90 dias no modelo sugerido",
          "Avaliar evolução semanal no checklist premium",
          "Inserir Missão no campo institucional: Transformar negócios de entrega em operações lucrativas, organizadas e escaláveis",
          "Inserir Visão: Ser a maior referência de mentoria em delivery no Brasil",
          "Inserir Valores: Resultado, transparência, liderança, evolução contínua, trabalho em equipe"
        ]
      }
    ],
    tarefas: [
      "Completar diagnóstico inicial com dados reais",
      "Definir metas de 90 dias usando modelo fornecido",
      "Preencher Missão, Visão e Valores da operação",
      "Acompanhar dashboard por 4 semanas",
      "Fazer avaliação semanal no checklist premium",
      "Criar rotina de execução na agenda estruturada"
    ],
    resultados: [
      "Aumento do faturamento",
      "Margem de lucro otimizada",
      "Cardápio rentável",
      "Decisões 100% baseadas em dados"
    ]
  },
  tempo_potencia: {
    titulo: "Pilar 3 – Time de Potência",
    icon: "⚡",
    cor: "bg-violet-500",
    modulos: [
      {
        nome: "📋 Tarefas & Checklists",
        topicos: [
          "Montar organograma da operação (modelo pronto)",
          "Delegar funções: atendimento, produção, entrega",
          "Treinamento inicial com base no manual do colaborador (arquivo pronto)",
          "Definir responsável por cada setor",
          "Criar escala semanal de trabalho"
        ]
      },
      {
        nome: "🎯 Exercícios Práticos",
        topicos: [
          "Criar escala de trabalho (modelo já entregue)",
          "Avaliar desempenho do time com checklist de treinamento",
          "Rodada de feedback usando formulário pronto",
          "Identificar colaborador destaque da semana"
        ]
      }
    ],
    tarefas: [
      "Preencher organograma com nomes e funções",
      "Distribuir manual do colaborador para equipe",
      "Criar primeira escala de trabalho no modelo",
      "Aplicar checklist de avaliação de desempenho",
      "Realizar primeira rodada de feedback com formulário",
      "Definir metas individuais para cada colaborador"
    ],
    resultados: [
      "Equipe mais produtiva e engajada",
      "Menos retrabalho",
      "Entregas sempre no prazo",
      "Gestão visual das tarefas do time"
    ]
  },
  norte_estrategico: {
    titulo: "Pilar 4 – Norte Estratégico",
    icon: "🎯",
    cor: "bg-amber-500",
    modulos: [
      {
        nome: "📋 Tarefas & Checklists",
        topicos: [
          "Definir meta de faturamento mensal (modelo pronto)",
          "Definir meta de ticket médio ideal",
          "Escolher 3 KPIs prioritários: CMV, pedidos/dia, satisfação",
          "Preencher plano de expansão (roteiro em etapas sugeridas)",
          "Revisar metas quinzenalmente"
        ]
      },
      {
        nome: "🎯 Exercícios Práticos",
        topicos: [
          "Analisar lacuna entre meta e resultado atual",
          "Criar roadmap de 3 meses (modelo pronto)",
          "Simulação de projeção de vendas (planilha automática)",
          "Definir ações corretivas para gaps identificados"
        ]
      }
    ],
    tarefas: [
      "Definir meta de faturamento dos próximos 90 dias",
      "Estabelecer ticket médio ideal da operação",
      "Selecionar e configurar 3 KPIs prioritários",
      "Completar plano de expansão no roteiro",
      "Criar roadmap trimestral no modelo",
      "Executar simulação de projeção de vendas"
    ],
    resultados: [
      "Direção clara para o negócio",
      "Decisões estratégicas coerentes",
      "Metas mensuráveis e alcançáveis",
      "Planejamento de crescimento estruturado"
    ]
  },
  presenca_magnetica: {
    titulo: "Pilar 5 – Presença Magnética",
    icon: "✨",
    cor: "bg-pink-500",
    modulos: [
      {
        nome: "📋 Tarefas & Checklists",
        topicos: [
          "Revisar cardápio no iFood (checklist: fotos, normas, preços)",
          "Criar 1 combo estratégico (sugestão: 2 pizzas + refrigerante)",
          "Responder 5 avaliações de clientes (respostas padrão fornecidas)",
          "Atualizar fotos dos 5 produtos mais vendidos",
          "Verificar descrições de todos os itens do cardápio"
        ]
      },
      {
        nome: "🎯 Exercícios Práticos",
        topicos: [
          "Preencher calendário de campanhas semanais (modelo pronto)",
          "Criar um post de alta conversão (modelo com título + CTA sugerido)",
          "Simulação de precificação no iFood (planilha automática)",
          "Montar promoção relâmpago usando template"
        ]
      }
    ],
    tarefas: [
      "Aplicar checklist completo de revisão do cardápio",
      "Criar e publicar 1 combo estratégico",
      "Responder 5 avaliações usando respostas padrão",
      "Preencher calendário de campanhas do mês",
      "Criar 1 post de alta conversão com template",
      "Executar simulação de precificação na planilha"
    ],
    resultados: [
      "Marca reconhecida e desejada",
      "Maior conversão de clientes",
      "Presença digital forte e consistente",
      "Experiência memorável para o cliente"
    ]
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