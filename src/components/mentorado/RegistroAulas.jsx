import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit2, Calendar, BookOpen, CheckSquare, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RegistroAulas({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAula, setEditingAula] = useState(null);
  const [form, setForm] = useState({
    data: format(new Date(), "yyyy-MM-dd"),
    anotacoes: "",
    tarefas_proximos_passos: ""
  });

  const { data: aulas = [], isLoading } = useQuery({
    queryKey: ["registroAulas", mentoradoId],
    queryFn: () => base44.entities.RegistroAula.filter({ mentorado_id: mentoradoId }, "-data"),
    enabled: !!mentoradoId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RegistroAula.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registroAulas", mentoradoId] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RegistroAula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registroAulas", mentoradoId] });
      handleCloseDialog();
    }
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAula(null);
    setForm({
      data: format(new Date(), "yyyy-MM-dd"),
      anotacoes: "",
      tarefas_proximos_passos: ""
    });
  };

  const handleOpenNew = () => {
    setEditingAula(null);
    setForm({
      data: format(new Date(), "yyyy-MM-dd"),
      anotacoes: "",
      tarefas_proximos_passos: ""
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (aula) => {
    setEditingAula(aula);
    setForm({
      data: aula.data,
      anotacoes: aula.anotacoes || "",
      tarefas_proximos_passos: aula.tarefas_proximos_passos || ""
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.data) return;

    if (editingAula) {
      updateMutation.mutate({ id: editingAula.id, data: form });
    } else {
      createMutation.mutate({ ...form, mentorado_id: mentoradoId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="text-[#FF4D00]" size={20} />
            Registro de Aulas
          </h3>
          <p className="text-sm text-white/50">
            {aulas.length > 0 && (
              <>Última aula: {format(new Date(aulas[0].data), "dd/MM/yyyy", { locale: ptBR })}</>
            )}
          </p>
        </div>
        <Button onClick={handleOpenNew} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Plus size={16} className="mr-2" /> Adicionar Nova Aula
        </Button>
      </div>

      {/* Lista de Aulas */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-32 mb-3" />
              <div className="h-4 bg-white/10 rounded w-full mb-2" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : aulas.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 mb-4">Nenhuma aula registrada ainda</p>
          <Button onClick={handleOpenNew} variant="outline" className="border-[#FF4D00]/50 text-[#FF4D00]">
            <Plus size={16} className="mr-2" /> Registrar Primeira Aula
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {aulas.map((aula) => (
            <div
              key={aula.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#FF4D00]/30 transition-colors group"
            >
              {/* Header da Aula */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar size={16} className="text-[#FF4D00]" />
                  <span className="font-semibold">
                    {format(new Date(aula.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <Button
                  onClick={() => handleOpenEdit(aula)}
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white"
                >
                  <Edit2 size={14} className="mr-1" /> Editar
                </Button>
              </div>

              {/* Anotações */}
              {aula.anotacoes && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-white/50 mb-1 flex items-center gap-1">
                    <BookOpen size={12} /> Anotações
                  </p>
                  <p className="text-white/80 whitespace-pre-wrap text-sm">{aula.anotacoes}</p>
                </div>
              )}

              {/* Tarefas/Próximos Passos */}
              {aula.tarefas_proximos_passos && (
                <div className="bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-[#FF4D00] mb-1 flex items-center gap-1">
                    <CheckSquare size={12} /> Tarefas / Próximos Passos
                  </p>
                  <p className="text-white/80 whitespace-pre-wrap text-sm">{aula.tarefas_proximos_passos}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAula ? "Editar Registro de Aula" : "Nova Aula"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Data */}
            <div>
              <Label className="text-white/70 mb-2 block">Data da Aula *</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Anotações */}
            <div>
              <Label className="text-white/70 mb-2 block flex items-center gap-2">
                <BookOpen size={14} className="text-[#FF4D00]" />
                Anotações da Aula
              </Label>
              <Textarea
                value={form.anotacoes}
                onChange={(e) => setForm({ ...form, anotacoes: e.target.value })}
                placeholder="Descreva o que foi abordado na aula, insights, observações importantes..."
                className="bg-white/5 border-white/10 text-white min-h-[120px]"
              />
            </div>

            {/* Tarefas/Próximos Passos */}
            <div>
              <Label className="text-white/70 mb-2 block flex items-center gap-2">
                <CheckSquare size={14} className="text-[#FF4D00]" />
                Tarefas ou Próximos Passos (Opcional)
              </Label>
              <Textarea
                value={form.tarefas_proximos_passos}
                onChange={(e) => setForm({ ...form, tarefas_proximos_passos: e.target.value })}
                placeholder="Liste as tarefas que o mentorado deve realizar ou os próximos passos..."
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCloseDialog}
                variant="outline"
                className="flex-1 border-white/10 text-white"
              >
                <X size={16} className="mr-2" /> Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.data || createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <Save size={16} className="mr-2" />
                {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}