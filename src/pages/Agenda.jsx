import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  Circle,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Agenda() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [form, setForm] = useState({
    titulo: "",
    tipo: "reuniao",
    data: format(new Date(), "yyyy-MM-dd"),
    horario: "",
    duracao: "",
    descricao: "",
    link_reuniao: "",
    status: "pendente"
  });

  const { data: agenda = [], isLoading } = useQuery({
    queryKey: ["agenda"],
    queryFn: () => base44.entities.Agenda.list("-data")
  });

  const { data: mentorados = [] } = useQuery({
    queryKey: ["mentorados"],
    queryFn: () => base44.entities.Mentorado.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Agenda.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Agenda.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Agenda.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agenda"] })
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({
      titulo: "",
      tipo: "reuniao",
      data: format(new Date(), "yyyy-MM-dd"),
      horario: "",
      duracao: "",
      descricao: "",
      link_reuniao: "",
      status: "pendente"
    });
  };

  const handleAddFromDate = (date) => {
    setForm({ ...form, data: format(date, "yyyy-MM-dd") });
    setDialogOpen(true);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  const getEventsForDay = (day) => {
    return agenda.filter((item) => {
      if (!item.data) return false;
      return isSameDay(parseISO(item.data), day);
    });
  };

  const filtered = agenda.filter((item) => {
    const matchTipo = tipoFilter === "todos" || item.tipo === tipoFilter;
    const matchStatus = statusFilter === "todos" || item.status === statusFilter;
    const matchDate = !selectedDate || (item.data && isSameDay(parseISO(item.data), selectedDate));
    return matchTipo && matchStatus && matchDate;
  });

  const tipoColors = {
    reuniao: "bg-blue-500",
    acompanhamento: "bg-violet-500",
    auditoria: "bg-amber-500",
    entrega: "bg-emerald-500",
    aula_vivo: "bg-[#FF4D00]",
    tarefa: "bg-pink-500",
    lembrete: "bg-gray-500",
  };

  const tipoBadgeColors = {
    reuniao: "bg-blue-500/20 text-blue-400",
    acompanhamento: "bg-violet-500/20 text-violet-400",
    auditoria: "bg-amber-500/20 text-amber-400",
    entrega: "bg-emerald-500/20 text-emerald-400",
    aula_vivo: "bg-[#FF4D00]/20 text-[#FF4D00]",
    tarefa: "bg-pink-500/20 text-pink-400",
    lembrete: "bg-gray-500/20 text-gray-400",
  };

  const statusBadgeColors = {
    pendente: "bg-amber-500/20 text-amber-400",
    concluido: "bg-emerald-500/20 text-emerald-400",
    cancelado: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
          <p className="text-white/50">{agenda.filter((a) => a.status === "pendente").length} compromissos pendentes</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Plus size={20} className="mr-2" /> Novo Compromisso
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-white/60" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-white/60" />
              </button>
            </div>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs text-white/40 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`aspect-square p-1 rounded-xl transition-colors relative ${
                    isSelected
                      ? "bg-[#FF4D00] text-white"
                      : isTodayDate
                      ? "bg-white/10 text-white"
                      : "hover:bg-white/5 text-white/70"
                  }`}
                >
                  <span className="text-sm">{format(day, "d")}</span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${tipoColors[event.tipo] || "bg-gray-500"}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/60">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddFromDate(selectedDate)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <Plus size={14} className="mr-1" /> Adicionar
                </Button>
              </div>
              {getEventsForDay(selectedDate).length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">Nenhum compromisso</p>
              ) : (
                <div className="space-y-2">
                  {getEventsForDay(selectedDate).map((item) => (
                    <div key={item.id} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white text-sm">{item.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tipoBadgeColors[item.tipo]}`}>
                          {item.tipo?.replace("_", " ")}
                        </span>
                      </div>
                      {item.horario && (
                        <p className="text-xs text-white/40 mt-1">{item.horario}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Próximos Compromissos</h2>

          <div className="flex gap-2 mb-4">
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
                <SelectItem value="auditoria">Auditoria</SelectItem>
                <SelectItem value="entrega">Entrega</SelectItem>
                <SelectItem value="aula_vivo">Aula ao Vivo</SelectItem>
                <SelectItem value="tarefa">Tarefa</SelectItem>
                <SelectItem value="lembrete">Lembrete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum compromisso</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white/5 rounded-xl group"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          id: item.id,
                          data: { status: item.status === "concluido" ? "pendente" : "concluido" }
                        })
                      }
                      className="flex-shrink-0 mt-0.5"
                    >
                      {item.status === "concluido" ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : (
                        <Circle size={18} className="text-white/30" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${item.status === "concluido" ? "text-white/40 line-through" : "text-white"}`}>
                        {item.titulo}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tipoBadgeColors[item.tipo]}`}>
                          {item.tipo?.replace("_", " ")}
                        </span>
                        {item.data && (
                          <span className="text-xs text-white/40">
                            {format(parseISO(item.data), "dd/MM")}
                          </span>
                        )}
                        {item.horario && (
                          <span className="text-xs text-white/40">{item.horario}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
        else setDialogOpen(open);
      }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Compromisso</DialogTitle>
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
                <Label className="text-white/70">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
                    <SelectItem value="auditoria">Auditoria</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="aula_vivo">Aula ao Vivo</SelectItem>
                    <SelectItem value="tarefa">Tarefa</SelectItem>
                    <SelectItem value="lembrete">Lembrete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Data *</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Horário</Label>
                <Input
                  type="time"
                  value={form.horario}
                  onChange={(e) => setForm({ ...form, horario: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Duração</Label>
                <Input
                  value={form.duracao}
                  onChange={(e) => setForm({ ...form, duracao: e.target.value })}
                  placeholder="Ex: 1h30"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/70">Link da Reunião</Label>
              <Input
                value={form.link_reuniao}
                onChange={(e) => setForm({ ...form, link_reuniao: e.target.value })}
                placeholder="https://meet.google.com/..."
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
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.titulo || !form.data}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}