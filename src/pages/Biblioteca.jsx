import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus,
  Search,
  Library,
  FileText,
  Image,
  Table,
  File,
  BookOpen,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Biblioteca() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    categoria: "pdf",
    descricao: "",
    arquivo_url: "",
    link_externo: "",
    pasta: "",
    tags: []
  });
  const [tagInput, setTagInput] = useState("");

  const { data: biblioteca = [], isLoading } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: () => base44.entities.Biblioteca.list("-created_date"),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Biblioteca.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biblioteca"] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Biblioteca.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biblioteca"] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Biblioteca.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["biblioteca"] })
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm({
      titulo: "",
      categoria: "pdf",
      descricao: "",
      arquivo_url: "",
      link_externo: "",
      pasta: "",
      tags: []
    });
    setTagInput("");
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      titulo: item.titulo || "",
      categoria: item.categoria || "pdf",
      descricao: item.descricao || "",
      arquivo_url: item.arquivo_url || "",
      link_externo: item.link_externo || "",
      pasta: item.pasta || "",
      tags: item.tags || []
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, arquivo_url: file_url });
    setIsUploading(false);
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

  const filtered = (biblioteca || []).filter((item) => {
    const matchSearch =
      item.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategoria = categoriaFilter === "todos" || item.categoria === categoriaFilter;
    return matchSearch && matchCategoria;
  });

  const categoriaIcons = {
    pdf: FileText,
    ebook: BookOpen,
    planilha: Table,
    ficha_tecnica: File,
    template: File,
    roteiro: FileText,
    imagem: Image,
    documento: FileText,
    outro: File,
  };

  const categoriaColors = {
    pdf: "bg-red-500/20 text-red-400",
    ebook: "bg-blue-500/20 text-blue-400",
    planilha: "bg-emerald-500/20 text-emerald-400",
    ficha_tecnica: "bg-amber-500/20 text-amber-400",
    template: "bg-violet-500/20 text-violet-400",
    roteiro: "bg-pink-500/20 text-pink-400",
    imagem: "bg-cyan-500/20 text-cyan-400",
    documento: "bg-gray-500/20 text-gray-400",
    outro: "bg-gray-500/20 text-gray-400",
  };

  const pastas = [...new Set((biblioteca || []).filter((b) => b.pasta).map((b) => b.pasta))];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Biblioteca</h1>
          <p className="text-white/50">{biblioteca.length} materiais cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-[#FF4D00] hover:bg-[#E64500] text-white">
              <Home size={18} className="mr-2" /> Início
            </Button>
          </Link>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={20} className="mr-2" /> Novo Material
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar por título, descrição ou tags..."
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
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="ebook">E-book</SelectItem>
            <SelectItem value="planilha">Planilha</SelectItem>
            <SelectItem value="ficha_tecnica">Ficha Técnica</SelectItem>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="roteiro">Roteiro</SelectItem>
            <SelectItem value="imagem">Imagem</SelectItem>
            <SelectItem value="documento">Documento</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="w-12 h-12 bg-white/10 rounded-xl mb-4" />
              <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <Library size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/50">Nenhum material encontrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const Icon = categoriaIcons[item.categoria] || File;
            return (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoriaColors[item.categoria]}`}>
                    <Icon size={24} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} className="text-white/50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-900 border-white/10">
                      <DropdownMenuItem onClick={() => handleEdit(item)} className="text-white hover:bg-white/10">
                        <Edit2 size={14} className="mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteMutation.mutate(item.id)} className="text-red-400 hover:bg-red-500/10">
                        <Trash2 size={14} className="mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-white mb-2">{item.titulo}</h3>
                {item.descricao && (
                  <p className="text-sm text-white/50 mb-3 line-clamp-2">{item.descricao}</p>
                )}

                {item.pasta && (
                  <p className="text-xs text-white/40 mb-2">📁 {item.pasta}</p>
                )}

                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-white/20 text-white/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {item.arquivo_url && (
                    <a
                      href={item.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#FF4D00]/10 text-[#FF4D00] rounded-xl hover:bg-[#FF4D00]/20 transition-colors text-sm font-medium"
                    >
                      <ExternalLink size={14} /> Abrir Arquivo
                    </a>
                  )}
                  {item.link_externo && (
                    <a
                      href={item.link_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 text-white/70 rounded-xl hover:bg-white/20 transition-colors text-sm font-medium"
                    >
                      <ExternalLink size={14} /> Link
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
        else setDialogOpen(open);
      }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Material" : "Novo Material"}</DialogTitle>
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
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="ebook">E-book</SelectItem>
                  <SelectItem value="planilha">Planilha</SelectItem>
                  <SelectItem value="ficha_tecnica">Ficha Técnica</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="roteiro">Roteiro</SelectItem>
                  <SelectItem value="imagem">Imagem</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
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
            <div>
              <Label className="text-white/70">Arquivo</Label>
              <div className="mt-1">
                {form.arquivo_url ? (
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                    <FileText size={20} className="text-[#FF4D00]" />
                    <span className="text-sm text-white/70 flex-1 truncate">{form.arquivo_url}</span>
                    <button onClick={() => setForm({ ...form, arquivo_url: "" })} className="text-red-400">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#FF4D00]/50 transition-colors">
                    <Upload size={20} className="text-white/40" />
                    <span className="text-sm text-white/40">
                      {isUploading ? "Enviando..." : "Clique para fazer upload"}
                    </span>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label className="text-white/70">Link Externo</Label>
              <Input
                value={form.link_externo}
                onChange={(e) => setForm({ ...form, link_externo: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/70">Pasta</Label>
              <Input
                value={form.pasta}
                onChange={(e) => setForm({ ...form, pasta: e.target.value })}
                placeholder="Ex: Materiais de Vendas"
                className="bg-white/5 border-white/10 text-white mt-1"
                list="pastas"
              />
              <datalist id="pastas">
                {pastas.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
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
                <Button type="button" onClick={handleAddTag} variant="outline" className="border-white/10 text-white">
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
              <Button variant="outline" onClick={handleCloseDialog} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!form.titulo} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                {editingItem ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}