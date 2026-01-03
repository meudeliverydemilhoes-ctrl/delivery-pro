import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus,
  Search,
  Lightbulb,
  Star,
  StarOff,
  Trash2,
  Edit2,
  X,
  Filter,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Notas() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    conteudo: "",
    categoria: "outro",
    tags: [],
    favorito: false
  });
  const [tagInput, setTagInput] = useState("");

  const { data: notas = [], isLoading } = useQuery({
    queryKey: ["notas"],
    queryFn: () => base44.entities.Nota.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Nota.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Nota.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Nota.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notas"] })
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingNota(null);
    setForm({
      titulo: "",
      conteudo: "",
      categoria: "outro",
      tags: [],
      favorito: false
    });
    setTagInput("");
  };

  const handleEdit = (nota) => {
    setEditingNota(nota);
    setForm({
      titulo: nota.titulo || "",
      conteudo: nota.conteudo || "",
      categoria: nota.categoria || "outro",
      tags: nota.tags || [],
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

  const handleToggleFavorito = (nota) => {
    updateMutation.mutate({ id: nota.id, data: { favorito: !nota.favorito } });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const filtered = notas.filter((nota) => {
    const matchSearch =
      nota.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      nota.conteudo?.toLowerCase().includes(search.toLowerCase()) ||
      nota.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategoria = categoriaFilter === "todos" || nota.categoria === categoriaFilter;
    return matchSearch && matchCategoria;
  });

  const favoritas = filtered.filter((n) => n.favorito);
  const outras = filtered.filter((n) => !n.favorito);

  const categoriaColors = {
    ideia_aula: "bg-blue-500/20 text-blue-400",
    insight: "bg-violet-500/20 text-violet-400",
    estrategia: "bg-emerald-500/20 text-emerald-400",
    roteiro: "bg-amber-500/20 text-amber-400",
    risco: "bg-red-500/20 text-red-400",
    acao: "bg-pink-500/20 text-pink-400",
    frase: "bg-cyan-500/20 text-cyan-400",
    outro: "bg-gray-500/20 text-gray-400",
  };

  const categoriaLabels = {
    ideia_aula: "Ideia de Aula",
    insight: "Insight",
    estrategia: "Estratégia",
    roteiro: "Roteiro",
    risco: "Risco",
    acao: "Ação",
    frase: "Frase",
    outro: "Outro",
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notas & Insights</h1>
          <p className="text-white/50">{notas.length} notas criadas</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#FF4D00] hover:bg-[#E64500] text-white">
              <Home size={18} className="mr-2" /> Início
            </Button>
          </Link>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={20} className="mr-2" /> Nova Nota
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar por título, conteúdo ou tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todas Categorias</SelectItem>
            <SelectItem value="ideia_aula">Ideia de Aula</SelectItem>
            <SelectItem value="insight">Insight</SelectItem>
            <SelectItem value="estrategia">Estratégia</SelectItem>
            <SelectItem value="roteiro">Roteiro</SelectItem>
            <SelectItem value="risco">Risco</SelectItem>
            <SelectItem value="acao">Ação</SelectItem>
            <SelectItem value="frase">Frase</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
              <div className="h-4 bg-white/10 rounded w-full mb-2" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <Lightbulb size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/50">Nenhuma nota encontrada</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Favoritas */}
          {favoritas.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star size={20} className="text-amber-400" />
                Favoritas
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritas.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    categoriaColors={categoriaColors}
                    categoriaLabels={categoriaLabels}
                    onEdit={handleEdit}
                    onDelete={deleteMutation.mutate}
                    onToggleFavorito={handleToggleFavorito}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Outras */}
          {outras.length > 0 && (
            <div>
              {favoritas.length > 0 && (
                <h2 className="text-lg font-semibold text-white mb-4">Todas as Notas</h2>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {outras.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    categoriaColors={categoriaColors}
                    categoriaLabels={categoriaLabels}
                    onEdit={handleEdit}
                    onDelete={deleteMutation.mutate}
                    onToggleFavorito={handleToggleFavorito}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
        else setDialogOpen(open);
      }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
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
              <Label className="text-white/70">Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="ideia_aula">Ideia de Aula</SelectItem>
                  <SelectItem value="insight">Insight</SelectItem>
                  <SelectItem value="estrategia">Estratégia</SelectItem>
                  <SelectItem value="roteiro">Roteiro</SelectItem>
                  <SelectItem value="risco">Risco</SelectItem>
                  <SelectItem value="acao">Ação</SelectItem>
                  <SelectItem value="frase">Frase</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
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
            <div>
              <Label className="text-white/70">Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder="Digite e pressione Enter"
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button type="button" onClick={handleAddTag} className="bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
                  Add
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/20 text-white/70">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-red-400">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleCloseDialog} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white whitespace-nowrap">
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

function NotaCard({ nota, categoriaColors, categoriaLabels, onEdit, onDelete, onToggleFavorito }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${categoriaColors[nota.categoria]}`}>
          {categoriaLabels[nota.categoria] || nota.categoria}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorito(nota)}
            className={`p-1.5 rounded-lg transition-colors ${
              nota.favorito ? "text-amber-400" : "text-white/30 hover:text-amber-400"
            }`}
          >
            {nota.favorito ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
          </button>
          <button
            onClick={() => onEdit(nota)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(nota.id)}
            className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-white mb-2">{nota.titulo}</h3>

      {nota.conteudo && (
        <p className="text-sm text-white/60 mb-3 line-clamp-3 whitespace-pre-wrap">{nota.conteudo}</p>
      )}

      {nota.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {nota.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-white/20 text-white/50">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-white/30">
        {nota.created_date && format(new Date(nota.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </p>
    </div>
  );
}