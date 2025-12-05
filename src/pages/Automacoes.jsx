import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  Mail,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Settings,
  History,
  Activity,
  Target,
  Users,
  ListTodo,
  FileText,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const gatilhoConfig = {
  novo_registro: { label: "Novo Registro Criado", icon: Plus, color: "bg-emerald-500" },
  atualizacao_status: { label: "Status Atualizado", icon: Activity, color: "bg-blue-500" },
  data_limite: { label: "Data Limite Atingida", icon: Clock, color: "bg-amber-500" },
  progresso_pilar: { label: "Progresso em Pilar", icon: Target, color: "bg-violet-500" },
  checklist_concluido: { label: "Checklist Concluído", icon: CheckCircle2, color: "bg-emerald-500" },
  tarefa_atrasada: { label: "Tarefa Atrasada", icon: AlertTriangle, color: "bg-red-500" }
};

const acaoConfig = {
  enviar_email: { label: "Enviar E-mail", icon: Mail, color: "bg-blue-500" },
  atualizar_status: { label: "Atualizar Status", icon: Activity, color: "bg-violet-500" },
  criar_tarefa: { label: "Criar Tarefa", icon: ListTodo, color: "bg-emerald-500" },
  enviar_notificacao: { label: "Enviar Notificação", icon: Bell, color: "bg-amber-500" },
  atualizar_etapa: { label: "Atualizar Etapa", icon: TrendingUp, color: "bg-pink-500" }
};

const entidadeConfig = {
  mentorado: { label: "Mentorado", icon: Users },
  tarefa: { label: "Tarefa", icon: ListTodo },
  briefing: { label: "Briefing", icon: FileText },
  evolucao: { label: "Evolução", icon: TrendingUp },
  checklist: { label: "Checklist", icon: CheckCircle2 }
};

export default function Automacoes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomacao, setEditingAutomacao] = useState(null);
  const [activeTab, setActiveTab] = useState("automacoes");

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    ativa: true,
    gatilho_tipo: "",
    gatilho_entidade: "",
    gatilho_condicao: {},
    acao_tipo: "",
    acao_config: {}
  });

  const { data: automacoes = [], isLoading } = useQuery({
    queryKey: ["automacoes"],
    queryFn: () => base44.entities.Automacao.list("-created_date")
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["logs_automacao"],
    queryFn: () => base44.entities.LogAutomacao.list("-created_date", 50)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Automacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automacoes"] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Automacao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automacoes"] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Automacao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automacoes"] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, ativa }) => base44.entities.Automacao.update(id, { ativa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automacoes"] });
    }
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAutomacao(null);
    setForm({
      nome: "",
      descricao: "",
      ativa: true,
      gatilho_tipo: "",
      gatilho_entidade: "",
      gatilho_condicao: {},
      acao_tipo: "",
      acao_config: {}
    });
  };

  const handleEdit = (automacao) => {
    setEditingAutomacao(automacao);
    setForm({
      nome: automacao.nome || "",
      descricao: automacao.descricao || "",
      ativa: automacao.ativa !== false,
      gatilho_tipo: automacao.gatilho_tipo || "",
      gatilho_entidade: automacao.gatilho_entidade || "",
      gatilho_condicao: automacao.gatilho_condicao || {},
      acao_tipo: automacao.acao_tipo || "",
      acao_config: automacao.acao_config || {}
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingAutomacao) {
      updateMutation.mutate({ id: editingAutomacao.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const renderCondicaoFields = () => {
    if (!form.gatilho_tipo) return null;

    switch (form.gatilho_tipo) {
      case "atualizacao_status":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-white/70">Status que dispara</Label>
              <Select
                value={form.gatilho_condicao?.status || ""}
                onValueChange={(v) => setForm({ ...form, gatilho_condicao: { ...form.gatilho_condicao, status: v } })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="desistente">Desistente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "progresso_pilar":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-white/70">Pilar</Label>
              <Select
                value={form.gatilho_condicao?.pilar || ""}
                onValueChange={(v) => setForm({ ...form, gatilho_condicao: { ...form.gatilho_condicao, pilar: v } })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Selecione o pilar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="processos">Pilar 1 - Processos</SelectItem>
                  <SelectItem value="desempenho">Pilar 2 - Desempenho</SelectItem>
                  <SelectItem value="tempo_potencia">Pilar 3 - Tempo de Potência</SelectItem>
                  <SelectItem value="norte_estrategico">Pilar 4 - Norte Estratégico</SelectItem>
                  <SelectItem value="presenca_magnetica">Pilar 5 - Presença Magnética</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Percentual mínimo (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.gatilho_condicao?.percentual || ""}
                onChange={(e) => setForm({ ...form, gatilho_condicao: { ...form.gatilho_condicao, percentual: Number(e.target.value) } })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAcaoFields = () => {
    if (!form.acao_tipo) return null;

    switch (form.acao_tipo) {
      case "enviar_email":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-white/70">Assunto do E-mail</Label>
              <Input
                value={form.acao_config?.assunto || ""}
                onChange={(e) => setForm({ ...form, acao_config: { ...form.acao_config, assunto: e.target.value } })}
                placeholder="Ex: Novo mentorado cadastrado!"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Corpo do E-mail</Label>
              <Textarea
                value={form.acao_config?.corpo || ""}
                onChange={(e) => setForm({ ...form, acao_config: { ...form.acao_config, corpo: e.target.value } })}
                placeholder="Use {nome}, {email}, {negocio} para dados dinâmicos"
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label className="text-white/70">Destinatário</Label>
              <Select
                value={form.acao_config?.destinatario || ""}
                onValueChange={(v) => setForm({ ...form, acao_config: { ...form.acao_config, destinatario: v } })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Quem recebe o e-mail?" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="mentor">Mentor (você)</SelectItem>
                  <SelectItem value="mentorado">Mentorado</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "atualizar_status":
        return (
          <div>
            <Label className="text-white/70">Novo Status</Label>
            <Select
              value={form.acao_config?.novo_status || ""}
              onValueChange={(v) => setForm({ ...form, acao_config: { ...form.acao_config, novo_status: v } })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue placeholder="Selecione o novo status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "criar_tarefa":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-white/70">Título da Tarefa</Label>
              <Input
                value={form.acao_config?.titulo_tarefa || ""}
                onChange={(e) => setForm({ ...form, acao_config: { ...form.acao_config, titulo_tarefa: e.target.value } })}
                placeholder="Ex: Fazer reunião de boas-vindas"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Prazo (dias após gatilho)</Label>
              <Input
                type="number"
                min="1"
                value={form.acao_config?.prazo_dias || ""}
                onChange={(e) => setForm({ ...form, acao_config: { ...form.acao_config, prazo_dias: Number(e.target.value) } })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Prioridade</Label>
              <Select
                value={form.acao_config?.prioridade || ""}
                onValueChange={(v) => setForm({ ...form, acao_config: { ...form.acao_config, prioridade: v } })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "atualizar_etapa":
        return (
          <div>
            <Label className="text-white/70">Nova Etapa</Label>
            <Select
              value={form.acao_config?.nova_etapa || ""}
              onValueChange={(v) => setForm({ ...form, acao_config: { ...form.acao_config, nova_etapa: v } })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue placeholder="Selecione a nova etapa" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                <SelectItem value="pilar1">Pilar 1</SelectItem>
                <SelectItem value="pilar2">Pilar 2</SelectItem>
                <SelectItem value="pilar3">Pilar 3</SelectItem>
                <SelectItem value="pilar4">Pilar 4</SelectItem>
                <SelectItem value="pilar5">Pilar 5</SelectItem>
                <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "enviar_notificacao":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-white/70">Título da Notificação</Label>
              <Input
                value={form.acao_config?.titulo_notif || ""}
                onChange={(e) => setForm({ ...form, acao_config: { ...form.acao_config, titulo_notif: e.target.value } })}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Mensagem</Label>
              <Textarea
                value={form.acao_config?.mensagem || ""}
                onChange={(e) => setForm({ ...form, acao_config: { ...form.acao_config, mensagem: e.target.value } })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={3}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="text-[#FF4D00]" />
            Automações
          </h1>
          <p className="text-white/50">Configure gatilhos e ações automáticas para otimizar seus processos</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#FF4D00] hover:bg-[#E64500] text-white"
        >
          <Plus size={20} className="mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="automacoes" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <Settings size={16} className="mr-2" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white">
            <History size={16} className="mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Automações Tab */}
        <TabsContent value="automacoes">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-white/10 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : automacoes.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <Zap size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/50 mb-4">Nenhuma automação configurada</p>
              <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
                <Plus size={16} className="mr-2" />
                Criar primeira automação
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {automacoes.map((automacao) => {
                const gatilho = gatilhoConfig[automacao.gatilho_tipo];
                const acao = acaoConfig[automacao.acao_tipo];
                const GatilhoIcon = gatilho?.icon || Zap;
                const AcaoIcon = acao?.icon || Zap;

                return (
                  <div
                    key={automacao.id}
                    className={`bg-white/5 border rounded-2xl p-6 transition-all ${
                      automacao.ativa ? "border-white/10" : "border-white/5 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{automacao.nome}</h3>
                          {!automacao.ativa && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">
                              Pausada
                            </span>
                          )}
                        </div>
                        {automacao.descricao && (
                          <p className="text-sm text-white/50 mb-4">{automacao.descricao}</p>
                        )}

                        {/* Fluxo visual */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${gatilho?.color}/20`}>
                            <GatilhoIcon size={16} className={`${gatilho?.color?.replace("bg-", "text-")}`} />
                            <span className="text-sm text-white/80">{gatilho?.label}</span>
                          </div>
                          <ArrowRight size={20} className="text-white/30" />
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${acao?.color}/20`}>
                            <AcaoIcon size={16} className={`${acao?.color?.replace("bg-", "text-")}`} />
                            <span className="text-sm text-white/80">{acao?.label}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                          <span>Execuções: {automacao.total_execucoes || 0}</span>
                          {automacao.ultima_execucao && (
                            <span>Última: {format(new Date(automacao.ultima_execucao), "dd/MM/yyyy HH:mm")}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={automacao.ativa !== false}
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: automacao.id, ativa: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(automacao)}
                          className="text-white/50 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(automacao.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="historico">
          {logs.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <History size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/50">Nenhuma execução registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    log.status === "sucesso" ? "bg-emerald-500/20" : 
                    log.status === "erro" ? "bg-red-500/20" : "bg-amber-500/20"
                  }`}>
                    {log.status === "sucesso" ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : log.status === "erro" ? (
                      <AlertTriangle size={20} className="text-red-400" />
                    ) : (
                      <Clock size={20} className="text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{log.automacao_nome || "Automação"}</p>
                    <p className="text-sm text-white/50 truncate">{log.detalhes || `${log.gatilho_tipo} → ${log.acao_tipo}`}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={`font-medium ${
                      log.status === "sucesso" ? "text-emerald-400" : 
                      log.status === "erro" ? "text-red-400" : "text-amber-400"
                    }`}>
                      {log.status === "sucesso" ? "Sucesso" : log.status === "erro" ? "Erro" : "Pendente"}
                    </p>
                    <p className="text-white/40">
                      {log.created_date && format(new Date(log.created_date), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="text-[#FF4D00]" />
              {editingAutomacao ? "Editar Automação" : "Nova Automação"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Info Básica */}
            <div className="space-y-4">
              <div>
                <Label className="text-white/70">Nome da Automação *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Boas-vindas ao novo mentorado"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Descrição</Label>
                <Textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva o que essa automação faz..."
                  className="bg-white/5 border-white/10 text-white mt-1"
                  rows={2}
                />
              </div>
            </div>

            {/* Gatilho */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-white flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Quando isso acontecer (Gatilho)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70">Tipo de Gatilho *</Label>
                  <Select
                    value={form.gatilho_tipo}
                    onValueChange={(v) => setForm({ ...form, gatilho_tipo: v, gatilho_condicao: {} })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue placeholder="Selecione o gatilho" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      {Object.entries(gatilhoConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <config.icon size={14} />
                            {config.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/70">Entidade</Label>
                  <Select
                    value={form.gatilho_entidade}
                    onValueChange={(v) => setForm({ ...form, gatilho_entidade: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue placeholder="Selecione a entidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      {Object.entries(entidadeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <config.icon size={14} />
                            {config.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {renderCondicaoFields()}
            </div>

            {/* Ação */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-white flex items-center gap-2">
                <Play size={16} className="text-emerald-400" />
                Fazer isso (Ação)
              </h4>
              <div>
                <Label className="text-white/70">Tipo de Ação *</Label>
                <Select
                  value={form.acao_tipo}
                  onValueChange={(v) => setForm({ ...form, acao_tipo: v, acao_config: {} })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue placeholder="Selecione a ação" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(acaoConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <config.icon size={14} />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {renderAcaoFields()}
            </div>

            {/* Ativa */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">Automação Ativa</p>
                <p className="text-sm text-white/50">Desative para pausar temporariamente</p>
              </div>
              <Switch
                checked={form.ativa}
                onCheckedChange={(checked) => setForm({ ...form, ativa: checked })}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1 border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.nome || !form.gatilho_tipo || !form.acao_tipo}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                {editingAutomacao ? "Salvar" : "Criar Automação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}