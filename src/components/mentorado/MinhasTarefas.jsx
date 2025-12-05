import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Filter, CheckCircle2, Circle, Clock, AlertTriangle,
  Trash2, Edit2, X, Check, Calendar, Bell, User, Users, 
  ArrowUpCircle, Flag, LayoutGrid, List, TrendingUp, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { format, differenceInDays, isToday, isTomorrow, isPast, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const pilarLabels = {
  processos: "🏆 Processos",
  desempenho: "📈 Desempenho",
  tempo_potencia: "⚡ Tempo de Potência",
  norte_estrategico: "🎯 Norte Estratégico",
  presenca_magnetica: "✨ Presença Magnética",
  geral: "📋 Geral"
};

const prioridadeConfig = {
  baixa: { label: "Baixa", color: "bg-gray-500/20 text-gray-400", icon: null, order: 4 },
  media: { label: "Média", color: "bg-blue-500/20 text-blue-400", icon: null, order: 3 },
  alta: { label: "Alta", color: "bg-amber-500/20 text-amber-400", icon: ArrowUpCircle, order: 2 },
  urgente: { label: "Urgente", color: "bg-red-500/20 text-red-400", icon: Zap, order: 1 }
};

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-gray-500/20 text-gray-400", iconColor: "text-white/30" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-500/20 text-blue-400", iconColor: "text-blue-400" },
  concluida: { label: "Concluída", color: "bg-emerald-500/20 text-emerald-400", iconColor: "text-emerald-400" }
};

const lembreteOptions = [
  { value: "none", label: "Sem lembrete" },
  { value: "same_day", label: "No dia" },
  { value: "1_day", label: "1 dia antes" },
  { value: "3_days", label: "3 dias antes" },
  { value: "7_days", label: "1 semana antes" }
];

export default function MinhasTarefas({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [prioridadeFilter, setPrioridadeFilter] = useState("todos");
  const [viewMode, setViewMode] = useState("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    pilar: "geral",
    prioridade: "media",
    status: "pendente",
    data_limite: "",
    responsavel: "",
    equipe: [],
    lembrete: "none",
    lembrete_enviado: false
  });

  const { data: tarefas = [] } = useQuery({
    queryKey: ["tarefasMentorado", mentoradoId],
    queryFn: () => base44.entities.TarefaMentorado.filter({ mentorado_id: mentoradoId }, "-created_date"),
    enabled: !!mentoradoId
  });

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  // Verificar lembretes pendentes
  const tarefasComLembrete = tarefas.filter(t => {
    if (t.status === "concluida" || !t.data_limite || t.lembrete === "none") return false;
    const dataLimite = new Date(t.data_limite);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const diasRestantes = differenceInDays(dataLimite, hoje);
    
    if (t.lembrete === "same_day" && diasRestantes === 0) return true;
    if (t.lembrete === "1_day" && diasRestantes <= 1 && diasRestantes >= 0) return true;
    if (t.lembrete === "3_days" && diasRestantes <= 3 && diasRestantes >= 0) return true;
    if (t.lembrete === "7_days" && diasRestantes <= 7 && diasRestantes >= 0) return true;
    return false;
  });

  const tarefasAtrasadas = tarefas.filter(t => 
    t.status !== "concluida" && t.data_limite && isPast(new Date(t.data_limite))
  );

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const tarefa = await base44.entities.TarefaMentorado.create({ ...data, mentorado_id: mentoradoId });
      
      // Criar notificação se tiver lembrete
      if (data.lembrete !== "none" && data.data_limite) {
        await base44.entities.ComunicadoMentoria.create({
          titulo: `📅 Lembrete: ${data.titulo}`,
          mensagem: `Tarefa com prazo em ${format(new Date(data.data_limite), "dd/MM/yyyy")}`,
          tipo: "tarefa",
          pilar: data.pilar,
          mentorado_id: mentoradoId
        });
      }
      return tarefa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefasMentorado", mentoradoId] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TarefaMentorado.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefasMentorado", mentoradoId] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TarefaMentorado.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarefasMentorado", mentoradoId] })
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTarefa(null);
    setForm({ 
      titulo: "", descricao: "", pilar: "geral", prioridade: "media", 
      status: "pendente", data_limite: "", responsavel: "", equipe: [], 
      lembrete: "none", lembrete_enviado: false 
    });
  };

  const handleEdit = (tarefa) => {
    setEditingTarefa(tarefa);
    setForm({
      titulo: tarefa.titulo || "",
      descricao: tarefa.descricao || "",
      pilar: tarefa.pilar || "geral",
      prioridade: tarefa.prioridade || "media",
      status: tarefa.status || "pendente",
      data_limite: tarefa.data_limite || "",
      responsavel: tarefa.responsavel || "",
      equipe: tarefa.equipe || [],
      lembrete: tarefa.lembrete || "none",
      lembrete_enviado: tarefa.lembrete_enviado || false
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingTarefa) {
      updateMutation.mutate({ id: editingTarefa.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const toggleStatus = (tarefa, newStatus) => {
    updateMutation.mutate({
      id: tarefa.id,
      data: {
        status: newStatus,
        data_conclusao: newStatus === "concluida" ? format(new Date(), "yyyy-MM-dd") : null
      }
    });
  };

  const changeStatus = (tarefa, status) => {
    toggleStatus(tarefa, status);
  };

  const filtered = tarefas.filter((t) => {
    const matchSearch = t.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || t.pilar === pilarFilter;
    const matchStatus = statusFilter === "todos" || t.status === statusFilter;
    const matchPrioridade = prioridadeFilter === "todos" || t.prioridade === prioridadeFilter;
    return matchSearch && matchPilar && matchStatus && matchPrioridade;
  }).sort((a, b) => {
    // Ordenar por prioridade primeiro, depois por data
    const prioA = prioridadeConfig[a.prioridade]?.order || 5;
    const prioB = prioridadeConfig[b.prioridade]?.order || 5;
    if (prioA !== prioB) return prioA - prioB;
    
    if (a.data_limite && b.data_limite) {
      return new Date(a.data_limite) - new Date(b.data_limite);
    }
    return 0;
  });

  const pendentes = filtered.filter(t => t.status === "pendente");
  const emAndamento = filtered.filter(t => t.status === "em_andamento");
  const concluidas = filtered.filter(t => t.status === "concluida");

  // Estatísticas
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter(t => t.status === "concluida").length;
  const progressoGeral = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/50 mb-1">
            <List size={14} />
            <span className="text-xs">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalTarefas}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 size={14} />
            <span className="text-xs">Concluídas</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{tarefasConcluidas}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Clock size={14} />
            <span className="text-xs">Em Andamento</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{emAndamento.length}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 relative">
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <AlertTriangle size={14} />
            <span className="text-xs">Atrasadas</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{tarefasAtrasadas.length}</p>
          {tarefasAtrasadas.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Progresso Geral</span>
          <span className="text-sm font-bold text-[#FF4D00]">{progressoGeral}%</span>
        </div>
        <Progress value={progressoGeral} className="h-2 bg-white/10" />
      </div>

      {/* Alertas de Lembrete */}
      {tarefasComLembrete.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-amber-400" />
            <span className="font-medium text-amber-400">Lembretes Ativos ({tarefasComLembrete.length})</span>
          </div>
          <div className="space-y-2">
            {tarefasComLembrete.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Flag size={14} className="text-amber-400" />
                  <span className="text-sm text-white">{t.titulo}</span>
                </div>
                <span className="text-xs text-amber-400">
                  {format(new Date(t.data_limite), "dd/MM", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={pilarFilter} onValueChange={setPilarFilter}>
            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Pilar" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="todos">Todos Pilares</SelectItem>
              {Object.entries(pilarLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>
          <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-[#FF4D00] text-white" : "text-white/50"}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded ${viewMode === "kanban" ? "bg-[#FF4D00] text-white" : "text-white/50"}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={18} className="mr-2" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Visualização */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/50">Nenhuma tarefa encontrada</p>
            </div>
          ) : (
            <>
              {pendentes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/40 flex items-center gap-2">
                    <Circle size={12} className="text-gray-400" />
                    Pendentes ({pendentes.length})
                  </p>
                  {pendentes.map((tarefa) => (
                    <TarefaCard
                      key={tarefa.id}
                      tarefa={tarefa}
                      onChangeStatus={(status) => changeStatus(tarefa, status)}
                      onEdit={() => handleEdit(tarefa)}
                      onDelete={() => deleteMutation.mutate(tarefa.id)}
                    />
                  ))}
                </div>
              )}
              {emAndamento.length > 0 && (
                <div className="space-y-2 pt-4">
                  <p className="text-sm text-blue-400 flex items-center gap-2">
                    <Clock size={12} />
                    Em Andamento ({emAndamento.length})
                  </p>
                  {emAndamento.map((tarefa) => (
                    <TarefaCard
                      key={tarefa.id}
                      tarefa={tarefa}
                      onChangeStatus={(status) => changeStatus(tarefa, status)}
                      onEdit={() => handleEdit(tarefa)}
                      onDelete={() => deleteMutation.mutate(tarefa.id)}
                    />
                  ))}
                </div>
              )}
              {concluidas.length > 0 && (
                <div className="space-y-2 pt-4">
                  <p className="text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={12} />
                    Concluídas ({concluidas.length})
                  </p>
                  {concluidas.map((tarefa) => (
                    <TarefaCard
                      key={tarefa.id}
                      tarefa={tarefa}
                      onChangeStatus={(status) => changeStatus(tarefa, status)}
                      onEdit={() => handleEdit(tarefa)}
                      onDelete={() => deleteMutation.mutate(tarefa.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        // Visualização Kanban
        <div className="grid md:grid-cols-3 gap-4">
          <KanbanColumn 
            title="Pendente" 
            tarefas={pendentes} 
            status="pendente"
            onChangeStatus={changeStatus}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          <KanbanColumn 
            title="Em Andamento" 
            tarefas={emAndamento} 
            status="em_andamento"
            onChangeStatus={changeStatus}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          <KanbanColumn 
            title="Concluída" 
            tarefas={concluidas} 
            status="concluida"
            onChangeStatus={changeStatus}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </div>
      )}

      {/* Dialog de Nova/Editar Tarefa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTarefa ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                placeholder="Digite o título da tarefa"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={form.pilar} onValueChange={(v) => setForm({ ...form, pilar: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(pilarLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(prioridadeConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        <div className="flex items-center gap-2">
                          {v.icon && <v.icon size={14} />}
                          {v.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Data Limite</Label>
                <Input
                  type="date"
                  value={form.data_limite}
                  onChange={(e) => setForm({ ...form, data_limite: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Responsável</Label>
                <Input
                  value={form.responsavel}
                  onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <Label className="text-white/70">Lembrete</Label>
                <Select value={form.lembrete} onValueChange={(v) => setForm({ ...form, lembrete: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {lembreteOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white/70">Equipe (membros separados por vírgula)</Label>
              <Input
                value={form.equipe?.join(", ") || ""}
                onChange={(e) => setForm({ 
                  ...form, 
                  equipe: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                })}
                className="bg-white/5 border-white/10 text-white mt-1"
                placeholder="João, Maria, Pedro"
              />
            </div>

            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={3}
                placeholder="Detalhes da tarefa..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseDialog} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!form.titulo} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                {editingTarefa ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KanbanColumn({ title, tarefas, status, onChangeStatus, onEdit, onDelete }) {
  const config = statusConfig[status];
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            status === "pendente" ? "bg-gray-400" :
            status === "em_andamento" ? "bg-blue-400" : "bg-emerald-400"
          }`} />
          <span className="font-medium text-white">{title}</span>
        </div>
        <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">{tarefas.length}</span>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {tarefas.map((tarefa) => (
          <TarefaCardKanban
            key={tarefa.id}
            tarefa={tarefa}
            onChangeStatus={onChangeStatus}
            onEdit={() => onEdit(tarefa)}
            onDelete={() => onDelete(tarefa.id)}
          />
        ))}
        {tarefas.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            Nenhuma tarefa
          </div>
        )}
      </div>
    </div>
  );
}

function TarefaCardKanban({ tarefa, onChangeStatus, onEdit, onDelete }) {
  const isOverdue = tarefa.data_limite && isPast(new Date(tarefa.data_limite)) && tarefa.status !== "concluida";
  const prioConfig = prioridadeConfig[tarefa.prioridade];
  const PrioIcon = prioConfig?.icon;

  return (
    <div className={`bg-white/5 border ${isOverdue ? "border-red-500/50" : "border-white/10"} rounded-lg p-3 group`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-white line-clamp-2">{tarefa.titulo}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white">
            <Edit2 size={12} />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-white/10 rounded text-red-400/60 hover:text-red-400">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${prioConfig.color} flex items-center gap-1`}>
          {PrioIcon && <PrioIcon size={10} />}
          {prioConfig.label}
        </span>
        {tarefa.responsavel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 flex items-center gap-1">
            <User size={10} />
            {tarefa.responsavel}
          </span>
        )}
      </div>

      {tarefa.data_limite && (
        <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-400" : "text-white/40"}`}>
          <Calendar size={10} />
          {format(new Date(tarefa.data_limite), "dd/MM")}
          {isOverdue && <AlertTriangle size={10} />}
        </div>
      )}

      {/* Quick status change */}
      <div className="flex gap-1 mt-2 pt-2 border-t border-white/10">
        {tarefa.status !== "pendente" && (
          <button
            onClick={() => onChangeStatus(tarefa, "pendente")}
            className="text-[10px] px-2 py-1 rounded bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
          >
            Pendente
          </button>
        )}
        {tarefa.status !== "em_andamento" && (
          <button
            onClick={() => onChangeStatus(tarefa, "em_andamento")}
            className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          >
            Em Andamento
          </button>
        )}
        {tarefa.status !== "concluida" && (
          <button
            onClick={() => onChangeStatus(tarefa, "concluida")}
            className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          >
            Concluída
          </button>
        )}
      </div>
    </div>
  );
}

function TarefaCard({ tarefa, onChangeStatus, onEdit, onDelete }) {
  const isCompleted = tarefa.status === "concluida";
  const isOverdue = tarefa.data_limite && isPast(new Date(tarefa.data_limite)) && !isCompleted;
  const isTodays = tarefa.data_limite && isToday(new Date(tarefa.data_limite));
  const isTomorrows = tarefa.data_limite && isTomorrow(new Date(tarefa.data_limite));
  const prioConfig = prioridadeConfig[tarefa.prioridade];
  const PrioIcon = prioConfig?.icon;

  const getDateLabel = () => {
    if (!tarefa.data_limite) return null;
    if (isOverdue) return { text: "Atrasada", color: "text-red-400 bg-red-500/20" };
    if (isTodays) return { text: "Hoje", color: "text-amber-400 bg-amber-500/20" };
    if (isTomorrows) return { text: "Amanhã", color: "text-blue-400 bg-blue-500/20" };
    return { text: format(new Date(tarefa.data_limite), "dd/MM/yyyy"), color: "text-white/40" };
  };

  const dateLabel = getDateLabel();

  return (
    <div className={`flex items-start gap-3 p-4 bg-white/5 border ${isOverdue ? "border-red-500/30" : "border-white/10"} rounded-xl group ${isCompleted ? "opacity-60" : ""}`}>
      <Select value={tarefa.status} onValueChange={(v) => onChangeStatus(v)}>
        <SelectTrigger className="w-auto p-0 h-auto border-0 bg-transparent">
          {tarefa.status === "concluida" ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : tarefa.status === "em_andamento" ? (
            <Clock size={20} className="text-blue-400" />
          ) : (
            <Circle size={20} className="text-white/30" />
          )}
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-white/10">
          <SelectItem value="pendente">
            <div className="flex items-center gap-2">
              <Circle size={14} className="text-gray-400" />
              Pendente
            </div>
          </SelectItem>
          <SelectItem value="em_andamento">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-400" />
              Em Andamento
            </div>
          </SelectItem>
          <SelectItem value="concluida">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Concluída
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className={`font-medium ${isCompleted ? "line-through text-white/40" : "text-white"}`}>
            {tarefa.titulo}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${prioConfig.color}`}>
            {PrioIcon && <PrioIcon size={12} />}
            {prioConfig.label}
          </span>
          {tarefa.lembrete && tarefa.lembrete !== "none" && (
            <Bell size={12} className="text-amber-400" />
          )}
        </div>
        {tarefa.descricao && (
          <p className="text-sm text-white/50 mb-2 line-clamp-2">{tarefa.descricao}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
          <span>{pilarLabels[tarefa.pilar]}</span>
          {tarefa.responsavel && (
            <span className="flex items-center gap-1">
              <User size={12} />
              {tarefa.responsavel}
            </span>
          )}
          {tarefa.equipe?.length > 0 && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {tarefa.equipe.length} pessoas
            </span>
          )}
          {dateLabel && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${dateLabel.color}`}>
              <Calendar size={12} />
              {dateLabel.text}
              {isOverdue && <AlertTriangle size={12} />}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 hover:bg-white/10 rounded-lg text-red-400/60 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}