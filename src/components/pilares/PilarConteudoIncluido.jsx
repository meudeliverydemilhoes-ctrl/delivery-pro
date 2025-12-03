import React, { useState } from "react";
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight, BookOpen, Target,
  ListChecks, Sparkles, Plus, Pencil, Trash2, X, Check, Play, FileText,
  Table2, ClipboardList, FormInput, ExternalLink, Flag
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TabelaInterativa from "./TabelaInterativa";
import { AnaliseSwot, FichaTecnica, SimuladorCMV, EscalaTrabalho, AvaliacaoDesempenho } from "./ExercicioInterativo";
import CheckpointSemanal from "./CheckpointSemanal";

const pilaresDataDefault = {
  processos: {
    titulo: "Pilar 1 – Processos",
    icon: "🏆",
    cor: "bg-blue-500",
    modulos: [
      {
        nome: "📦 Padronização e Setorização",
        topicos: [
          "Atendimento (balcão, despacho, call center)",
          "Produção (massa, montagem, uso da balança, fichas técnicas)",
          "Finalização (cozinha, molhos, pré-preparo, produção mínima)"
        ]
      },
      {
        nome: "📋 Documentação Operacional",
        topicos: [
          "Fichas técnicas de todos os produtos",
          "Checklists operacionais (diário, turno, semanal)",
          "SOPs (Padrões de Procedimento Operacional)",
          "Regulamento interno da operação"
        ]
      },
      {
        nome: "⚙️ Cultura e Rotina",
        topicos: [
          "Criação de cronograma de execução",
          "Cultura operacional e disciplina de rotina",
          "Definição de responsáveis por setor"
        ]
      }
    ],
    colunasTarefas: [
      { key: "atividade", label: "Atividade", editable: true },
      { key: "responsavel", label: "Responsável", editable: true },
      { key: "prazo", label: "Prazo", editable: true },
      { key: "status", label: "Status", editable: true },
      { key: "percentual", label: "% Concluído", editable: false }
    ],
    tarefasExemplo: [
      { atividade: "Implantar uso de fichas técnicas", responsavel: "Gerente", prazo: "7 dias", status: "pendente" },
      { atividade: "Habilitar controle por balança", responsavel: "Produção", prazo: "14 dias", status: "pendente" },
      { atividade: "Publicar e aplicar checklists", responsavel: "Dono", prazo: "7 dias", status: "em_andamento" },
      { atividade: "Revisar fluxos de atendimento e despacho", responsavel: "Supervisor", prazo: "10 dias", status: "pendente" },
      { atividade: "Validar regulamento interno com o time", responsavel: "RH", prazo: "14 dias", status: "pendente" }
    ],
    exercicios: [
      { nome: "Criar ficha técnica de produto", tipo: "ficha_tecnica", descricao: "Modelo interativo com cálculo de custo" },
      { nome: "Montar checklist de abertura/fechamento", tipo: "checklist", descricao: "Lista personalizada para sua operação" },
      { nome: "Simulação de CMV com dados reais", tipo: "cmv", descricao: "Planilha automática de controle" }
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
        nome: "💰 Financeiro",
        topicos: [
          "Avaliar histórico de faturamento",
          "Identificar gaps percentuais",
          "Criar indicadores de desempenho",
          "Calcular markup e precificação por ficha técnica"
        ]
      },
      {
        nome: "📱 iFood e Delivery",
        topicos: [
          "Cardápio, fotos, legendas e descrições",
          "Montagem de combos e promoções",
          "Remoção de produtos de baixo desempenho",
          "Ativação de cupons e tele grátis"
        ]
      },
      {
        nome: "📊 Indicadores e Metas",
        topicos: [
          "Indicadores operacionais (CMV, ticket médio, pedidos/dia)",
          "Painéis de controle e metas semanais",
          "Análise de performance por período"
        ]
      }
    ],
    colunasTarefas: [
      { key: "meta", label: "Meta", editable: true },
      { key: "indicador", label: "Indicador", editable: true },
      { key: "responsavel", label: "Responsável", editable: true },
      { key: "prazo", label: "Prazo", editable: true },
      { key: "status", label: "Status", editable: true },
      { key: "percentual", label: "% Concluído", editable: false }
    ],
    tarefasExemplo: [
      { meta: "Criar planilha de indicadores", indicador: "Dashboard", responsavel: "Financeiro", prazo: "7d", status: "pendente" },
      { meta: "Atualizar dados financeiros", indicador: "Faturamento", responsavel: "Dono", prazo: "3d", status: "em_andamento" },
      { meta: "Revisar preços no iFood com base no markup", indicador: "Markup %", responsavel: "Gerente", prazo: "14d", status: "pendente" },
      { meta: "Testar promoções e combos", indicador: "Conversão", responsavel: "Marketing", prazo: "7d", status: "pendente" },
      { meta: "Monitorar desempenho e corrigir gaps", indicador: "CMV", responsavel: "Operação", prazo: "Contínuo", status: "em_andamento" }
    ],
    exercicios: [
      { nome: "Preencher planilha de indicadores", tipo: "planilha", descricao: "Modelo com fórmulas automáticas" },
      { nome: "Calcular markup ideal", tipo: "cmv", descricao: "Simulador de precificação" },
      { nome: "Avaliar evolução semanal", tipo: "checklist", descricao: "Checklist de performance" }
    ],
    resultados: [
      "Aumento do faturamento",
      "Margem de lucro otimizada",
      "Cardápio rentável",
      "Decisões 100% baseadas em dados"
    ]
  },
  tempo_potencia: {
    titulo: "Pilar 3 – Tempo de Potência",
    icon: "⚡",
    cor: "bg-violet-500",
    modulos: [
      {
        nome: "📅 Organização e Agendamento",
        topicos: [
          "Organização e agendamento de encontros",
          "Entendimento de disponibilidade da equipe",
          "Alinhamento de horários e metas"
        ]
      },
      {
        nome: "📋 Cronogramas e Responsabilidades",
        topicos: [
          "Cronogramas de rotina por unidade",
          "Definição de tarefas e responsáveis",
          "Delegação efetiva de funções"
        ]
      },
      {
        nome: "🎯 Gestão de Produtividade",
        topicos: [
          "Gestão do tempo e produtividade do time",
          "Priorização (Kanban: A Fazer / Em Progresso / Concluído)",
          "Medição de produtividade individual e coletiva"
        ]
      }
    ],
    colunasTarefas: [
      { key: "atividade", label: "Atividade", editable: true },
      { key: "responsavel", label: "Responsável", editable: true },
      { key: "prazo", label: "Prazo", editable: true },
      { key: "status", label: "Status", editable: true },
      { key: "observacoes", label: "Observações", editable: true }
    ],
    tarefasExemplo: [
      { atividade: "Mapear gargalos de tempo", responsavel: "Gerente", prazo: "7d", status: "pendente", observacoes: "" },
      { atividade: "Criar cronograma de execução", responsavel: "Dono", prazo: "7d", status: "em_andamento", observacoes: "" },
      { atividade: "Implantar quadro de tarefas (Kanban)", responsavel: "Supervisor", prazo: "14d", status: "pendente", observacoes: "" },
      { atividade: "Delegar funções e acompanhar prazos", responsavel: "Gerente", prazo: "Contínuo", status: "pendente", observacoes: "" },
      { atividade: "Medir produtividade individual e da equipe", responsavel: "RH", prazo: "30d", status: "pendente", observacoes: "" }
    ],
    exercicios: [
      { nome: "Escala de Trabalho Semanal", tipo: "escala", descricao: "Tabela semanal editável" },
      { nome: "Avaliação de desempenho do time", tipo: "avaliacao", descricao: "Checklist com notas 1-5" },
      { nome: "Rodada de feedback", tipo: "formulario", descricao: "Formulário com perguntas abertas" }
    ],
    resultados: [
      "Equipe mais produtiva e engajada",
      "Menos retrabalho e desperdício de tempo",
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
        nome: "🧭 Intenção Estratégica",
        topicos: [
          "Missão → por que fazemos o que fazemos",
          "Visão → onde queremos chegar",
          "Valores → o que é inegociável"
        ]
      },
      {
        nome: "🏛️ Cultura e Governança",
        topicos: [
          "Cultura organizacional",
          "Governança e alinhamento de propósito",
          "Comunicação interna com base no propósito"
        ]
      },
      {
        nome: "🚀 Expansão e Crescimento",
        topicos: [
          "Plano de expansão e objetivos da marca",
          "Reuniões de alinhamento estratégico",
          "Revisão de decisões alinhadas ao norte"
        ]
      }
    ],
    colunasTarefas: [
      { key: "objetivo", label: "Objetivo", editable: true },
      { key: "kpi", label: "KPI", editable: true },
      { key: "prazo", label: "Prazo", editable: true },
      { key: "responsavel", label: "Resp.", editable: true },
      { key: "status", label: "Status", editable: true },
      { key: "percentual", label: "% Concluído", editable: false }
    ],
    tarefasExemplo: [
      { objetivo: "Definir missão, visão e valores", kpi: "Documento", responsavel: "Dono", prazo: "7d", status: "pendente" },
      { objetivo: "Comunicar e aplicar os princípios no time", kpi: "Reunião", responsavel: "Gerente", prazo: "14d", status: "pendente" },
      { objetivo: "Criar documento de cultura e propósito", kpi: "PDF", responsavel: "RH", prazo: "21d", status: "pendente" },
      { objetivo: "Revisar decisões alinhadas ao norte estratégico", kpi: "Checklist", responsavel: "Dono", prazo: "Mensal", status: "em_andamento" }
    ],
    exercicios: [
      { nome: "Preencher Missão, Visão e Valores", tipo: "formulario", descricao: "Modelo com exemplos" },
      { nome: "Plano de expansão 90 dias", tipo: "formulario", descricao: "Roteiro estratégico" },
      { nome: "Análise de alinhamento estratégico", tipo: "checklist", descricao: "Verificar coerência das decisões" }
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
        nome: "🎨 Comunicação Visual e Marketing",
        topicos: [
          "Comunicação visual e identidade da marca",
          "Estratégia no iFood (descrições e fotos atrativas)",
          "Storytelling e narrativa da marca"
        ]
      },
      {
        nome: "📱 Presença Digital",
        topicos: [
          "Conteúdo e presença nas redes sociais",
          "Fortalecimento da imagem da empresa e dos líderes",
          "Solicitar fotos e vídeos da operação"
        ]
      },
      {
        nome: "🎁 Experiência do Cliente",
        topicos: [
          "Padronização de experiência de marca",
          "Atendimento, embalagem e linguagem",
          "Consistência em todos os pontos de contato"
        ]
      }
    ],
    colunasTarefas: [
      { key: "acao", label: "Ação", editable: true },
      { key: "canal", label: "Canal", editable: true },
      { key: "prazo", label: "Prazo", editable: true },
      { key: "responsavel", label: "Resp.", editable: true },
      { key: "status", label: "Status", editable: true },
      { key: "percentual", label: "% Concluído", editable: false }
    ],
    tarefasExemplo: [
      { acao: "Atualizar descrição e imagens no iFood", canal: "iFood", prazo: "5d", responsavel: "MKT", status: "pendente" },
      { acao: "Padronizar comunicação visual das lojas", canal: "Loja", prazo: "14d", responsavel: "Design", status: "pendente" },
      { acao: "Criar plano de postagens e campanhas", canal: "Redes", prazo: "7d", responsavel: "MKT", status: "em_andamento" },
      { acao: "Produzir materiais visuais com storytelling", canal: "Todos", prazo: "21d", responsavel: "MKT", status: "pendente" },
      { acao: "Garantir consistência da marca em todos os pontos", canal: "Todos", prazo: "Contínuo", responsavel: "Gerente", status: "pendente" }
    ],
    exercicios: [
      { nome: "Calendário de campanhas", tipo: "formulario", descricao: "Planejamento mensal de conteúdo" },
      { nome: "Criar post de alta conversão", tipo: "formulario", descricao: "Modelo com gancho + CTA" },
      { nome: "Checklist de presença no iFood", tipo: "checklist", descricao: "Verificação completa do perfil" }
    ],
    resultados: [
      "Marca reconhecida e desejada",
      "Maior conversão de clientes",
      "Presença digital forte e consistente",
      "Experiência memorável para o cliente"
    ]
  }
};

const tipoIcons = {
  checklist: ClipboardList,
  video: Play,
  planilha: Table2,
  formulario: FormInput,
  documento: FileText,
  dashboard: Target
};

const tipoColors = {
  checklist: "text-emerald-400 bg-emerald-500/20",
  video: "text-blue-400 bg-blue-500/20",
  planilha: "text-amber-400 bg-amber-500/20",
  formulario: "text-violet-400 bg-violet-500/20",
  documento: "text-pink-400 bg-pink-500/20",
  dashboard: "text-cyan-400 bg-cyan-500/20"
};

export default function PilarConteudoIncluido({ 
  pilarKey, 
  progressoItems = [], 
  onToggleItem,
  customData,
  onUpdateCustomData
}) {
  const defaultPilar = pilaresDataDefault[pilarKey];
  const [tarefasData, setTarefasData] = useState(customData?.tarefas || defaultPilar?.tarefasExemplo || []);
  const [exerciciosData, setExerciciosData] = useState(customData?.exercicios || {});
  const [selectedExercicio, setSelectedExercicio] = useState(null);

  const pilar = defaultPilar;
  if (!pilar) return null;

  const handleUpdateTarefa = (idx, data) => {
    const newTarefas = [...tarefasData];
    newTarefas[idx] = data;
    setTarefasData(newTarefas);
    onUpdateCustomData?.({ ...customData, tarefas: newTarefas });
  };

  const handleAddTarefa = (data) => {
    const newTarefas = [...tarefasData, { ...data, status: data.status || "pendente" }];
    setTarefasData(newTarefas);
    onUpdateCustomData?.({ ...customData, tarefas: newTarefas });
  };

  const handleDeleteTarefa = (idx) => {
    const newTarefas = tarefasData.filter((_, i) => i !== idx);
    setTarefasData(newTarefas);
    onUpdateCustomData?.({ ...customData, tarefas: newTarefas });
  };

  const handleSaveExercicio = (tipo, data) => {
    const newExercicios = { ...exerciciosData, [tipo]: data };
    setExerciciosData(newExercicios);
    onUpdateCustomData?.({ ...customData, exercicios: newExercicios });
    setSelectedExercicio(null);
  };

  const renderExercicioContent = () => {
    if (!selectedExercicio) return null;

    switch (selectedExercicio.tipo) {
      case "swot":
        return <AnaliseSwot data={exerciciosData.swot} onSave={(d) => handleSaveExercicio("swot", d)} />;
      case "ficha_tecnica":
        return <FichaTecnica data={exerciciosData.ficha_tecnica} onSave={(d) => handleSaveExercicio("ficha_tecnica", d)} />;
      case "cmv":
        return <SimuladorCMV data={exerciciosData.cmv} onSave={(d) => handleSaveExercicio("cmv", d)} />;
      case "escala":
        return <EscalaTrabalho data={exerciciosData.escala} onSave={(d) => handleSaveExercicio("escala", d)} />;
      case "avaliacao":
        return <AvaliacaoDesempenho data={exerciciosData.avaliacao} onSave={(d) => handleSaveExercicio("avaliacao", d)} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-white/60">Exercício em desenvolvimento</p>
          </div>
        );
    }
  };

  const totalTopicos = pilar.modulos?.reduce((acc, m) => acc + m.topicos.length, 0) || 0;
  const completedTopicos = pilar.modulos?.reduce((acc, m) => {
    return acc + m.topicos.filter(t => {
      const texto = typeof t === 'string' ? t : t.texto;
      return progressoItems.some(p => p.texto === texto && p.concluido);
    }).length;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{pilar.icon}</span>
        <div>
          <h3 className="text-xl font-bold text-white">{pilar.titulo}</h3>
          <p className="text-sm text-white/50">Conteúdo interativo com tabelas e exercícios</p>
        </div>
      </div>

      {/* Tabs para separar Conteúdo e Módulos */}
      <Tabs defaultValue="conteudo" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-4">
          <TabsTrigger value="conteudo" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <BookOpen size={16} className="mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="modulos" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <ListChecks size={16} className="mr-2" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="exercicios" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <Target size={16} className="mr-2" />
            Exercícios
          </TabsTrigger>
        </TabsList>

        {/* Aba Conteúdo - Tópicos de estudo */}
        <TabsContent value="conteudo" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Progresso: {completedTopicos}/{totalTopicos} tópicos</span>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all" 
                style={{ width: `${totalTopicos > 0 ? (completedTopicos / totalTopicos) * 100 : 0}%` }} 
              />
            </div>
          </div>
          {pilar.modulos?.map((modulo, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-medium text-white mb-3">{modulo.nome}</h4>
              <div className="space-y-2">
                {modulo.topicos.map((topico, tIdx) => {
                  const topicoTexto = typeof topico === 'string' ? topico : topico.texto;
                  const isCompleted = progressoItems.some(p => p.texto === topicoTexto && p.concluido);
                  return (
                    <div
                      key={tIdx}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <button
                        onClick={() => onToggleItem?.("topico", topicoTexto)}
                        className="flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : (
                          <Circle size={18} className="text-white/30 group-hover:text-white/50" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${isCompleted ? "text-white/50 line-through" : "text-white/80"}`}>
                        {topicoTexto}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Aba Módulos - Tarefas práticas */}
        <TabsContent value="modulos" className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks size={18} className="text-[#FF4D00]" />
              <span className="font-medium text-white">📋 Tarefas & Checklists</span>
              <span className="text-xs text-white/40 ml-auto">{tarefasData.length} tarefas</span>
            </div>
            <TabelaInterativa
              colunas={pilar.colunasTarefas}
              dados={tarefasData}
              onUpdate={handleUpdateTarefa}
              onAdd={handleAddTarefa}
              onDelete={handleDeleteTarefa}
            />
          </div>

          {/* Resultados Esperados */}
          <div className="bg-gradient-to-br from-[#FF4D00]/10 to-transparent border border-[#FF4D00]/20 rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#FF4D00] mb-4">
              <Sparkles size={18} />
              <span className="font-medium">Resultados Esperados</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {pilar.resultados.map((resultado, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                  <Sparkles size={14} className="text-[#FF4D00]" />
                  <span className="text-sm text-white/80">{resultado}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Aba Exercícios */}
        <TabsContent value="exercicios" className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-[#FF4D00]" />
              <span className="font-medium text-white">🎯 Exercícios Práticos</span>
              <span className="text-xs text-white/40 ml-auto">{pilar.exercicios.length} exercícios</span>
            </div>
            <div className="space-y-2">
              {pilar.exercicios.map((ex, idx) => {
                const hasData = exerciciosData[ex.tipo] && Object.keys(exerciciosData[ex.tipo]).length > 0;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedExercicio(ex)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                      hasData 
                        ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" 
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-[#FF4D00]/30"
                    }`}
                  >
                    {hasData ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} className="text-white/30" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{ex.nome}</p>
                      <p className="text-xs text-white/50">{ex.descricao}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${hasData ? "bg-emerald-500/20 text-emerald-400" : "bg-[#FF4D00]/20 text-[#FF4D00]"}`}>
                      {hasData ? "✅ Preenchido" : "Abrir"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkpoint Semanal */}
          <CheckpointSemanal
            pilarKey={pilarKey}
            pilarTitulo={pilar.titulo}
            tarefasData={tarefasData}
            exerciciosData={exerciciosData}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Exercício */}
      <Dialog open={!!selectedExercicio} onOpenChange={() => setSelectedExercicio(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="text-[#FF4D00]" size={20} />
              {selectedExercicio?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderExercicioContent()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}