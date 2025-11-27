import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Filter, CheckCircle2, Circle, Clock, AlertTriangle,
  Trash2, Edit2, X, Check, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { format } from "date-fns";

const pilarLabels = {
  processos: "🏆 Processos",
  desempenho: "📈 Desempenho",
  tempo_potencia: "⚡ Tempo de Potência",
  norte_estrategico: "🎯 Norte Estratégico",
  presenca_magnetica: "✨ Presença Magnética",
  geral: "📋 Geral"
};

const prioridadeColors = {
  baixa: "bg-gray-500/20 text-gray-400",
  media: "bg-blue-500/20 text-blue-400",
  alta: "bg-amber-500/20 text-amber-400",
  urgente: "bg-red-500/20 text-red-400"
};

const statusColors = {
  pendente: "text-white/30",
  em_andamento: "text-blue-400",
  concluida: "text-emerald-400"
};

export default function MinhasTarefas({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    pilar: "geral",
    prioridade: "media",
    status: "pendente",
    data_limite: ""
  });

  const { data: tarefas = [] } = useQuery({
    queryKey: ["tarefasMentorado", mentoradoId],
    queryFn: () => base44.entities.TarefaMentorado.filter({ mentorado_id: mentoradoId }, "-created_date"),
    enabled: !!mentoradoId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TarefaMentorado.create({ ...data, mentorado_id: mentoradoId }),
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
    setForm({ titulo: "", descricao: "", pilar: "geral", prioridade: "media", status: "pendente", data_limite: "" });
  };

  const handleEdit = (tarefa) => {
    setEditingTarefa(tarefa);
    setForm({
      titulo: tarefa.titulo || "",
      descricao: tarefa.descricao || "",
      pilar: tarefa.pilar || "geral",
      prioridade: tarefa.prioridade || "media",
      status: tarefa.status || "pendente",
      data_limite: tarefa.data_limite || ""
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

  const toggleStatus = (tarefa) => {
    const newStatus = tarefa.status === "concluida" ? "pendente" : "concluida";
    updateMutation.mutate({
      id: tarefa.id,
      data: {
        status: newStatus,
        data_conclusao: newStatus === "concluida" ? format(new Date(), "yyyy-MM-dd") : null
      }
    });
  };

  const filtered = tarefas.filter((t) => {
    const matchSearch = t.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || t.pilar === pilarFilter;
    const matchStatus = statusFilter === "todos" || t.status === statusFilter;
    return matchSearch && matchPilar && matchStatus;
  });

  const pendentes = filtered.filter(t => t.status !== "concluida");
  const concluidas = filtered.filter(t => t.status === "concluida");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={pilarFilter} onValueChange={setPilarFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Pilar" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos</SelectItem>
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
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Plus size={18} className="mr-2" /> Nova Tarefa
        </Button>
      </div>

      {/* Tarefas Pendentes */}
      <div className="space-y-3">
        {pendentes.length === 0 && concluidas.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/50">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          <>
            {pendentes.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                onToggle={() => toggleStatus(tarefa)}
                onEdit={() => handleEdit(tarefa)}
                onDelete={() => deleteMutation.mutate(tarefa.id)}
              />
            ))}
            {concluidas.length > 0 && (
              <div className="pt-4">
                <p className="text-sm text-white/40 mb-3">Concluídas ({concluidas.length})</p>
                {concluidas.map((tarefa) => (
                  <TarefaCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    onToggle={() => toggleStatus(tarefa)}
                    onEdit={() => handleEdit(tarefa)}
                    onDelete={() => deleteMutation.mutate(tarefa.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
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
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={3}
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

function TarefaCard({ tarefa, onToggle, onEdit, onDelete }) {
  const isCompleted = tarefa.status === "concluida";
  const isOverdue = tarefa.data_limite && new Date(tarefa.data_limite) < new Date() && !isCompleted;

  return (
    <div className={`flex items-start gap-3 p-4 bg-white/5 rounded-xl group ${isCompleted ? "opacity-60" : ""}`}>
      <button onClick={onToggle} className="flex-shrink-0 mt-0.5">
        {isCompleted ? (
          <CheckCircle2 size={20} className="text-emerald-400" />
        ) : (
          <Circle size={20} className={statusColors[tarefa.status]} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`font-medium ${isCompleted ? "line-through text-white/40" : "text-white"}`}>
            {tarefa.titulo}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${prioridadeColors[tarefa.prioridade]}`}>
            {tarefa.prioridade}
          </span>
        </div>
        {tarefa.descricao && (
          <p className="text-sm text-white/50 mb-2">{tarefa.descricao}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span>{pilarLabels[tarefa.pilar]}</span>
          {tarefa.data_limite && (
            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>
              <Calendar size={12} />
              {format(new Date(tarefa.data_limite), "dd/MM/yyyy")}
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