import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Star, StarOff, Trash2, Edit2, StickyNote
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
import { ptBR } from "date-fns/locale";

const pilarLabels = {
  processos: "🏆 Processos",
  desempenho: "📈 Desempenho",
  tempo_potencia: "⚡ Tempo de Potência",
  norte_estrategico: "🎯 Norte Estratégico",
  presenca_magnetica: "✨ Presença Magnética",
  geral: "📋 Geral"
};

const pilarColors = {
  processos: "border-blue-500/30 bg-blue-500/10",
  desempenho: "border-emerald-500/30 bg-emerald-500/10",
  tempo_potencia: "border-violet-500/30 bg-violet-500/10",
  norte_estrategico: "border-amber-500/30 bg-amber-500/10",
  presenca_magnetica: "border-pink-500/30 bg-pink-500/10",
  geral: "border-white/20 bg-white/5"
};

export default function MinhasNotas({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    conteudo: "",
    pilar: "geral",
    favorito: false
  });

  const { data: notas = [] } = useQuery({
    queryKey: ["notasMentorado", mentoradoId],
    queryFn: () => base44.entities.NotaMentorado.filter({ mentorado_id: mentoradoId }, "-created_date"),
    enabled: !!mentoradoId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NotaMentorado.create({ ...data, mentorado_id: mentoradoId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notasMentorado", mentoradoId] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NotaMentorado.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notasMentorado", mentoradoId] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NotaMentorado.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notasMentorado", mentoradoId] })
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingNota(null);
    setForm({ titulo: "", conteudo: "", pilar: "geral", favorito: false });
  };

  const handleEdit = (nota) => {
    setEditingNota(nota);
    setForm({
      titulo: nota.titulo || "",
      conteudo: nota.conteudo || "",
      pilar: nota.pilar || "geral",
      favorito: nota.favorito || false
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingNota) {
      updateMutation.mutate({ id: editingNota.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const toggleFavorito = (nota) => {
    updateMutation.mutate({ id: nota.id, data: { favorito: !nota.favorito } });
  };

  const filtered = notas.filter((n) => {
    const matchSearch = n.titulo?.toLowerCase().includes(search.toLowerCase()) ||
                        n.conteudo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || n.pilar === pilarFilter;
    return matchSearch && matchPilar;
  });

  const favoritas = filtered.filter(n => n.favorito);
  const outras = filtered.filter(n => !n.favorito);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={pilarFilter} onValueChange={setPilarFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filtrar por pilar" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos os Pilares</SelectItem>
            {Object.entries(pilarLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Plus size={18} className="mr-2" /> Nova Nota
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <StickyNote size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/50">Nenhuma nota encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {favoritas.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                <Star size={14} className="text-amber-400" /> Favoritas
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritas.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    onEdit={() => handleEdit(nota)}
                    onDelete={() => deleteMutation.mutate(nota.id)}
                    onToggleFavorito={() => toggleFavorito(nota)}
                  />
                ))}
              </div>
            </div>
          )}
          {outras.length > 0 && (
            <div>
              {favoritas.length > 0 && <h3 className="text-sm font-medium text-white/60 mb-3">Outras Notas</h3>}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {outras.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    onEdit={() => handleEdit(nota)}
                    onDelete={() => deleteMutation.mutate(nota.id)}
                    onToggleFavorito={() => toggleFavorito(nota)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNota ? "Editar Nota" : "Nova Nota"}</DialogTitle>
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
              <Label className="text-white/70">Conteúdo</Label>
              <Textarea
                value={form.conteudo}
                onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[150px]"
                placeholder="Escreva sua nota aqui..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseDialog} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!form.titulo} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                {editingNota ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotaCard({ nota, onEdit, onDelete, onToggleFavorito }) {
  return (
    <div className={`p-4 rounded-xl border ${pilarColors[nota.pilar]} group`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-white/50">{pilarLabels[nota.pilar]}</span>
        <div className="flex items-center gap-1">
          <button onClick={onToggleFavorito} className={nota.favorito ? "text-amber-400" : "text-white/30 hover:text-amber-400"}>
            {nota.favorito ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
          </button>
          <button onClick={onEdit} className="text-white/30 hover:text-white p-1 opacity-0 group-hover:opacity-100">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="text-red-400/50 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h4 className="font-medium text-white mb-2">{nota.titulo}</h4>
      {nota.conteudo && (
        <p className="text-sm text-white/60 line-clamp-3 whitespace-pre-wrap">{nota.conteudo}</p>
      )}
      <p className="text-xs text-white/30 mt-3">
        {nota.created_date && format(new Date(nota.created_date), "dd/MM/yyyy", { locale: ptBR })}
      </p>
    </div>
  );
}