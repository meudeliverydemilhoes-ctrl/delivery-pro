import React, { useState } from "react";
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight, BookOpen, Target,
  ListChecks, Sparkles, Plus, Pencil, Trash2, X, Check, Play, FileText,
  Table2, ClipboardList, FormInput, ExternalLink, Flag, Gift, Video,
  Download, Lock, Unlock, StickyNote, MessageSquare, Save
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

const materiaisExclusivos = {
  processos: [
    { nome: "🎬 Aula: Como criar fichas técnicas perfeitas", tipo: "video", url: "", descricao: "Passo a passo completo" },
    { nome: "📄 Modelo: Ficha Técnica Padrão", tipo: "download", url: "", descricao: "Template editável" },
    { nome: "📋 Checklist de Abertura e Fechamento", tipo: "download", url: "", descricao: "PDF pronto para imprimir" },
    { nome: "🎬 Aula: Organizando sua operação", tipo: "video", url: "", descricao: "Método completo de organização" },
    { nome: "📄 Modelo: SOP - Procedimento Padrão", tipo: "download", url: "", descricao: "Template de procedimentos" },
    { nome: "📊 Planilha: Controle de Estoque", tipo: "download", url: "", descricao: "Excel automatizado" }
  ],
  desempenho: [
    { nome: "🎬 Aula: Dominando o iFood", tipo: "video", url: "", descricao: "Estratégias avançadas" },
    { nome: "📊 Planilha: Indicadores de Performance", tipo: "download", url: "", descricao: "Dashboard completo" },
    { nome: "📄 Modelo: Precificação por Markup", tipo: "download", url: "", descricao: "Calculadora de preços" },
    { nome: "🎬 Aula: Como criar combos irresistíveis", tipo: "video", url: "", descricao: "Técnicas de vendas" },
    { nome: "📋 Checklist: Otimização de Cardápio", tipo: "download", url: "", descricao: "Guia passo a passo" },
    { nome: "📊 Planilha: Simulador de CMV", tipo: "download", url: "", descricao: "Controle de custos" }
  ],
  tempo_potencia: [
    { nome: "🎬 Aula: Gestão de Tempo para Donos", tipo: "video", url: "", descricao: "Produtividade máxima" },
    { nome: "📄 Modelo: Escala de Trabalho Semanal", tipo: "download", url: "", descricao: "Template editável" },
    { nome: "📋 Checklist: Avaliação de Desempenho", tipo: "download", url: "", descricao: "Formulário completo" },
    { nome: "🎬 Aula: Delegação Efetiva", tipo: "video", url: "", descricao: "Como delegar sem medo" },
    { nome: "📄 Modelo: Quadro Kanban", tipo: "download", url: "", descricao: "Template visual" },
    { nome: "📊 Planilha: Controle de Produtividade", tipo: "download", url: "", descricao: "Métricas do time" }
  ],
  norte_estrategico: [
    { nome: "🎬 Aula: Definindo seu Norte", tipo: "video", url: "", descricao: "Missão, Visão e Valores" },
    { nome: "📄 Modelo: Planejamento Estratégico", tipo: "download", url: "", descricao: "Template 90 dias" },
    { nome: "📋 Canvas: Modelo de Negócio", tipo: "download", url: "", descricao: "Business Model Canvas" },
    { nome: "🎬 Aula: Cultura Organizacional", tipo: "video", url: "", descricao: "Construindo cultura forte" },
    { nome: "📄 Modelo: Plano de Expansão", tipo: "download", url: "", descricao: "Roteiro de crescimento" },
    { nome: "📊 Planilha: OKRs e Metas", tipo: "download", url: "", descricao: "Gestão de objetivos" }
  ],
  presenca_magnetica: [
    { nome: "🎬 Aula: Marketing para Delivery", tipo: "video", url: "", descricao: "Estratégias comprovadas" },
    { nome: "📄 Modelo: Calendário de Postagens", tipo: "download", url: "", descricao: "Planejamento mensal" },
    { nome: "📋 Guia: Fotos que Vendem", tipo: "download", url: "", descricao: "Dicas de fotografia" },
    { nome: "🎬 Aula: Storytelling de Marca", tipo: "video", url: "", descricao: "Conte sua história" },
    { nome: "📄 Modelo: Scripts de Atendimento", tipo: "download", url: "", descricao: "Respostas padrão" },
    { nome: "📊 Planilha: ROI de Marketing", tipo: "download", url: "", descricao: "Controle de investimentos" }
  ]
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
  const [anotacoes, setAnotacoes] = useState(customData?.anotacoes || {});
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [notaDialogOpen, setNotaDialogOpen] = useState(false);
  const [notaContext, setNotaContext] = useState({ tipo: "", id: "", titulo: "" });
  const [notaTexto, setNotaTexto] = useState("");

  const pilar = defaultPilar;
  const materiais = materiaisExclusivos[pilarKey] || [];
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



  const openNotaDialog = (tipo, id, titulo) => {
    setNotaContext({ tipo, id, titulo });
    setNotaTexto(anotacoes[`${tipo}_${id}`] || "");
    setNotaDialogOpen(true);
  };

  const handleSaveNota = () => {
    const key = `${notaContext.tipo}_${notaContext.id}`;
    const newAnotacoes = { ...anotacoes, [key]: notaTexto };
    setAnotacoes(newAnotacoes);
    onUpdateCustomData?.({ ...customData, anotacoes: newAnotacoes });
    setNotaDialogOpen(false);
  };

  const getNotaForItem = (tipo, id) => {
    return anotacoes[`${tipo}_${id}`] || "";
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
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-4 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="conteudo" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white text-white/70">
            <BookOpen size={16} className="mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="modulos" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white text-white/70">
            <ListChecks size={16} className="mr-2" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="materiais" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white text-white/70">
            <Gift size={16} className="mr-2" />
            Material Exclusivo
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
                  const hasNota = !!getNotaForItem("topico", `${idx}_${tIdx}`);
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
                      <button
                        onClick={() => openNotaDialog("topico", `${idx}_${tIdx}`, topicoTexto)}
                        className={`p-1.5 rounded-lg transition-all ${
                          hasNota 
                            ? "bg-amber-500/20 text-amber-400" 
                            : "opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-white"
                        }`}
                        title={hasNota ? "Ver anotação" : "Adicionar anotação"}
                      >
                        <StickyNote size={14} />
                      </button>
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



        {/* Aba Material Exclusivo */}
        <TabsContent value="materiais" className="space-y-4">
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Gift size={18} />
              <span className="font-medium">Material Exclusivo da Mentoria</span>
            </div>
            <p className="text-sm text-white/60 mt-1">Acesse aulas, planilhas e modelos exclusivos para acelerar seus resultados</p>
          </div>

          <div className="grid gap-3">
            {materiais.map((material, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedMaterial(material)}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-[#FF4D00]/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  material.tipo === "video" ? "bg-blue-500/20" : "bg-emerald-500/20"
                }`}>
                  {material.tipo === "video" ? (
                    <Play size={24} className="text-blue-400" />
                  ) : (
                    <Download size={24} className="text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white group-hover:text-[#FF4D00] transition-colors">{material.nome}</p>
                  <p className="text-sm text-white/50">{material.descricao}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  material.tipo === "video" 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {material.tipo === "video" ? "Assistir" : "Download"}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>


      </Tabs>

      {/* Modal de Material */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMaterial?.tipo === "video" ? (
                <Play className="text-blue-400" size={20} />
              ) : (
                <Download className="text-emerald-400" size={20} />
              )}
              {selectedMaterial?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedMaterial?.tipo === "video" ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play size={48} className="mx-auto mb-3 text-[#FF4D00]" />
                    <p className="text-white/60">Vídeo em breve</p>
                    <p className="text-white/40 text-sm mt-1">O conteúdo será disponibilizado aqui</p>
                  </div>
                </div>
                <p className="text-white/70">{selectedMaterial?.descricao}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Download size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{selectedMaterial?.nome}</h3>
                <p className="text-white/60 mb-6">{selectedMaterial?.descricao}</p>
                <Button className="bg-[#FF4D00] hover:bg-[#E64500]">
                  <Download size={16} className="mr-2" />
                  Fazer Download
                </Button>
                <p className="text-xs text-white/40 mt-4">O arquivo será disponibilizado em breve</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>



      {/* Modal de Anotação */}
      <Dialog open={notaDialogOpen} onOpenChange={setNotaDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="text-amber-400" size={20} />
              Anotação Pessoal
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40 mb-1">Referente a:</p>
              <p className="text-sm text-white">{notaContext.titulo}</p>
            </div>
            <Textarea
              value={notaTexto}
              onChange={(e) => setNotaTexto(e.target.value)}
              placeholder="Escreva suas anotações, aprendizados, insights ou ações a tomar..."
              className="bg-white/5 border-white/10 text-white min-h-[150px] resize-none"
            />
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setNotaDialogOpen(false)} 
                className="flex-1 border-white/10 text-white"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveNota} 
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <Save size={16} className="mr-2" />
                Salvar Anotação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}