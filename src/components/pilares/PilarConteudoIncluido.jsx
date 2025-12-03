import React, { useState } from "react";
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight, BookOpen, Target,
  ListChecks, Sparkles, Plus, Pencil, Trash2, X, Check, Play, FileText,
  Table2, ClipboardList, FormInput, ExternalLink, Flag
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    materiais: [
      { nome: "Checklist de Abertura, Fechamento e Auditoria", tipo: "checklist", descricao: "Lista interativa completa" },
      { nome: "Tutorial: Preenchendo a Ficha Técnica", tipo: "video", descricao: "Vídeo + modelo editável" },
      { nome: "Planilha Automática de Simulação de CMV", tipo: "planilha", descricao: "Cálculos automáticos" }
    ],
    colunasTarefas: [
      { key: "atividade", label: "Atividade", editable: true },
      { key: "responsavel", label: "Responsável", editable: true },
      { key: "prazo", label: "Prazo", editable: true },
      { key: "status", label: "Status", editable: true },
      { key: "percentual", label: "% Concluído", editable: false }
    ],
    tarefasExemplo: [
      { atividade: "Mapear processo atual", responsavel: "Dono", prazo: "7 dias", status: "pendente" },
      { atividade: "Criar cronograma de melhorias", responsavel: "Gerente", prazo: "14 dias", status: "em_andamento" },
      { atividade: "Implementar primeira otimização (CMV)", responsavel: "Operação", prazo: "21 dias", status: "pendente" }
    ],
    exercicios: [
      { nome: "Análise SWOT do processo", tipo: "swot", descricao: "Tabela: Forças | Fraquezas | Oportunidades | Ameaças" },
      { nome: "Ficha técnica de 1 produto", tipo: "ficha_tecnica", descricao: "Modelo interativo com cálculo de custo" },
      { nome: "Simulação de CMV com dados reais", tipo: "cmv", descricao: "Planilha automática" }
    ],
    resultados: ["Operação padronizada e replicável", "Redução de desperdício comprovada", "Equipe alinhada aos processos", "Maior controle e previsibilidade"]
  },
  desempenho: {
    titulo: "Pilar 2 – Performance",
    icon: "📈",
    cor: "bg-emerald-500",
    materiais: [
      { nome: "Modelo de Metas 90 Dias", tipo: "documento", descricao: "Documento clicável" },
      { nome: "Tutorial: Como acompanhar o Dashboard", tipo: "video", descricao: "Vídeo explicativo" },
      { nome: "Checklist Premium de Evolução Semanal", tipo: "checklist", descricao: "Acompanhamento semanal" }
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
      { meta: "Aumentar ticket médio", indicador: "Ticket médio", responsavel: "Gerente", prazo: "30d", status: "em_andamento" },
      { meta: "Reduzir CMV", indicador: "CMV %", responsavel: "Financeiro", prazo: "45d", status: "pendente" },
      { meta: "Aumentar pedidos/dia", indicador: "Pedidos", responsavel: "Marketing", prazo: "30d", status: "pendente" }
    ],
    exercicios: [
      { nome: "Preencher metas de 90 dias", tipo: "formulario", descricao: "Modelo estruturado" },
      { nome: "Avaliar evolução semanal", tipo: "checklist", descricao: "Checklist automático" },
      { nome: "Inserir Missão, Visão e Valores", tipo: "mvv", descricao: "Texto pronto já incluído" }
    ],
    resultados: ["Aumento do faturamento", "Margem de lucro otimizada", "Cardápio rentável", "Decisões 100% baseadas em dados"]
  },
  tempo_potencia: {
    titulo: "Pilar 3 – Time de Potência",
    icon: "⚡",
    cor: "bg-violet-500",
    materiais: [
      { nome: "Modelo de Organograma", tipo: "formulario", descricao: "Clicável, arrastar nomes" },
      { nome: "Manual do Colaborador", tipo: "documento", descricao: "PDF interativo" },
      { nome: "Checklist de Treinamento", tipo: "checklist", descricao: "Lista de verificação" }
    ],
    colunasTarefas: [
      { key: "funcao", label: "Função", editable: true },
      { key: "nome", label: "Nome", editable: true },
      { key: "responsavel", label: "Responsável", editable: true },
      { key: "status", label: "Status", editable: true },
      { key: "observacoes", label: "Observações", editable: true }
    ],
    tarefasExemplo: [
      { funcao: "Produção", nome: "João", responsavel: "Gerente", status: "concluido", observacoes: "Treinado completo" },
      { funcao: "Atendimento", nome: "Maria", responsavel: "Supervisor", status: "em_andamento", observacoes: "Em fase de testes" },
      { funcao: "Entrega", nome: "Carlos", responsavel: "Gerente", status: "pendente", observacoes: "Aguardando início" }
    ],
    exercicios: [
      { nome: "Escala de Trabalho Semanal", tipo: "escala", descricao: "Tabela semanal editável" },
      { nome: "Avaliação de desempenho", tipo: "avaliacao", descricao: "Checklist com notas 1-5" },
      { nome: "Rodada de feedback", tipo: "formulario", descricao: "Formulário com perguntas abertas" }
    ],
    resultados: ["Equipe mais produtiva e engajada", "Menos retrabalho", "Entregas sempre no prazo", "Gestão visual das tarefas do time"]
  },
  norte_estrategico: {
    titulo: "Pilar 4 – Norte Estratégico",
    icon: "🎯",
    cor: "bg-amber-500",
    materiais: [
      { nome: "Modelo de Plano Estratégico 90 dias", tipo: "documento", descricao: "Template completo" },
      { nome: "Matriz de KPIs", tipo: "planilha", descricao: "Clicável e editável" },
      { nome: "Checklist de Expansão", tipo: "checklist", descricao: "Passos para crescer" }
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
      { objetivo: "Aumentar pedidos/dia", kpi: "+20%", prazo: "30d", responsavel: "Dono", status: "em_andamento" },
      { objetivo: "Expandir para nova região", kpi: "Loja piloto", prazo: "90d", responsavel: "Mentor", status: "pendente" },
      { objetivo: "Reduzir tempo de entrega", kpi: "-10min", prazo: "45d", responsavel: "Operação", status: "pendente" }
    ],
    exercicios: [
      { nome: "Gap de metas x resultados", tipo: "planilha", descricao: "Planilha automática" },
      { nome: "Roteiro de 3 meses", tipo: "formulario", descricao: "Modelo editável" },
      { nome: "Projeção de vendas", tipo: "cmv", descricao: "Cálculo automático" }
    ],
    resultados: ["Direção clara para o negócio", "Decisões estratégicas coerentes", "Metas mensuráveis e alcançáveis", "Planejamento de crescimento estruturado"]
  },
  presenca_magnetica: {
    titulo: "Pilar 5 – Presença Magnética",
    icon: "✨",
    cor: "bg-pink-500",
    materiais: [
      { nome: "Plano de Marketing 30 dias", tipo: "documento", descricao: "Modelo pronto" },
      { nome: "Guia de otimização do cardápio iFood", tipo: "documento", descricao: "Passo a passo" },
      { nome: "Modelos de respostas para avaliações", tipo: "documento", descricao: "Copiar e colar" }
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
      { acao: "Atualizar fotos cardápio", canal: "iFood", prazo: "5d", responsavel: "MKT", status: "concluido" },
      { acao: "Criar combo estratégico", canal: "iFood", prazo: "7d", responsavel: "Dono", status: "em_andamento" },
      { acao: "Responder avaliações", canal: "iFood", prazo: "Diária", responsavel: "Atend.", status: "pendente" }
    ],
    exercicios: [
      { nome: "Calendário de campanhas", tipo: "formulario", descricao: "Modelo clicável" },
      { nome: "Criar post de alta conversão", tipo: "formulario", descricao: "Modelo pronto com gancho + CTA" },
      { nome: "Precificação simulada no iFood", tipo: "cmv", descricao: "Planilha automática" }
    ],
    resultados: ["Marca reconhecida e desejada", "Maior conversão de clientes", "Presença digital forte e consistente", "Experiência memorável para o cliente"]
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
  const [expandedSections, setExpandedSections] = useState({ materiais: true, tarefas: true, exercicios: false });
  const [tarefasData, setTarefasData] = useState(customData?.tarefas || defaultPilar?.tarefasExemplo || []);
  const [exerciciosData, setExerciciosData] = useState(customData?.exercicios || {});
  const [selectedExercicio, setSelectedExercicio] = useState(null);

  const pilar = defaultPilar;
  if (!pilar) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

      {/* Materiais Exclusivos */}
      <Collapsible open={expandedSections.materiais} onOpenChange={() => toggleSection("materiais")}>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-white/5">
            <div className="flex items-center gap-3">
              {expandedSections.materiais ? <ChevronDown size={18} className="text-white/50" /> : <ChevronRight size={18} className="text-white/50" />}
              <BookOpen size={18} className="text-[#FF4D00]" />
              <span className="font-medium text-white">📚 Materiais Exclusivos</span>
            </div>
            <span className="text-xs text-white/40">{pilar.materiais.length} itens</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-2">
              {pilar.materiais.map((mat, idx) => {
                const Icon = tipoIcons[mat.tipo] || FileText;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <span className={`p-2 rounded-lg ${tipoColors[mat.tipo]}`}>
                      <Icon size={16} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{mat.nome}</p>
                      <p className="text-xs text-white/50">{mat.descricao}</p>
                    </div>
                    <ExternalLink size={14} className="text-[#FF4D00]" />
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Tarefas e Checklists - Tabela Interativa */}
      <Collapsible open={expandedSections.tarefas} onOpenChange={() => toggleSection("tarefas")}>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-white/5">
            <div className="flex items-center gap-3">
              {expandedSections.tarefas ? <ChevronDown size={18} className="text-white/50" /> : <ChevronRight size={18} className="text-white/50" />}
              <ListChecks size={18} className="text-[#FF4D00]" />
              <span className="font-medium text-white">📋 Tarefas & Checklists</span>
            </div>
            <span className="text-xs text-white/40">{tarefasData.length} tarefas</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <TabelaInterativa
                colunas={pilar.colunasTarefas}
                dados={tarefasData}
                onUpdate={handleUpdateTarefa}
                onAdd={handleAddTarefa}
                onDelete={handleDeleteTarefa}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Exercícios Práticos */}
      <Collapsible open={expandedSections.exercicios} onOpenChange={() => toggleSection("exercicios")}>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-white/5">
            <div className="flex items-center gap-3">
              {expandedSections.exercicios ? <ChevronDown size={18} className="text-white/50" /> : <ChevronRight size={18} className="text-white/50" />}
              <Target size={18} className="text-[#FF4D00]" />
              <span className="font-medium text-white">🎯 Exercícios Práticos</span>
            </div>
            <span className="text-xs text-white/40">{pilar.exercicios.length} exercícios</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-2">
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
          </CollapsibleContent>
        </div>
      </Collapsible>

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

      {/* Checkpoint Semanal */}
      <CheckpointSemanal
        pilarKey={pilarKey}
        pilarTitulo={pilar.titulo}
        tarefasData={tarefasData}
        exerciciosData={exerciciosData}
      />

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