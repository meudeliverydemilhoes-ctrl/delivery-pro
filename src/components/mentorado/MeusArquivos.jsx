import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Upload, Trash2, Download, FileText, FileSpreadsheet,
  Image, File, Video, ExternalLink, Loader2
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

const tipoIcons = {
  documento: FileText,
  planilha: FileSpreadsheet,
  imagem: Image,
  pdf: FileText,
  video: Video,
  outro: File
};

const tipoColors = {
  documento: "bg-blue-500/20 text-blue-400",
  planilha: "bg-emerald-500/20 text-emerald-400",
  imagem: "bg-pink-500/20 text-pink-400",
  pdf: "bg-red-500/20 text-red-400",
  video: "bg-violet-500/20 text-violet-400",
  outro: "bg-gray-500/20 text-gray-400"
};

export default function MeusArquivos({ mentoradoId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pilarFilter, setPilarFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    pilar: "geral",
    tipo: "documento",
    arquivo_url: ""
  });

  const { data: arquivos = [] } = useQuery({
    queryKey: ["arquivosMentorado", mentoradoId],
    queryFn: () => base44.entities.ArquivoMentorado.filter({ mentorado_id: mentoradoId }, "-created_date"),
    enabled: !!mentoradoId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ArquivoMentorado.create({ ...data, mentorado_id: mentoradoId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arquivosMentorado", mentoradoId] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ArquivoMentorado.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["arquivosMentorado", mentoradoId] })
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ titulo: "", descricao: "", pilar: "geral", tipo: "documento", arquivo_url: "" });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ 
      ...form, 
      arquivo_url: file_url, 
      titulo: form.titulo || file.name,
      tamanho: formatFileSize(file.size)
    });
    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = () => {
    createMutation.mutate(form);
  };

  const filtered = arquivos.filter((a) => {
    const matchSearch = a.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchPilar = pilarFilter === "todos" || a.pilar === pilarFilter;
    const matchTipo = tipoFilter === "todos" || a.tipo === tipoFilter;
    return matchSearch && matchPilar && matchTipo;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar arquivos..."
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
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="documento">Documento</SelectItem>
            <SelectItem value="planilha">Planilha</SelectItem>
            <SelectItem value="imagem">Imagem</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
          <Upload size={18} className="mr-2" /> Enviar Arquivo
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <File size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/50">Nenhum arquivo encontrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((arquivo) => {
            const Icon = tipoIcons[arquivo.tipo] || File;
            return (
              <div key={arquivo.id} className="p-4 bg-white/5 border border-white/10 rounded-xl group">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${tipoColors[arquivo.tipo]}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{arquivo.titulo}</h4>
                    <p className="text-xs text-white/40 mt-1">{pilarLabels[arquivo.pilar]}</p>
                    {arquivo.tamanho && <p className="text-xs text-white/30">{arquivo.tamanho}</p>}
                  </div>
                </div>
                {arquivo.descricao && (
                  <p className="text-sm text-white/50 mt-3 line-clamp-2">{arquivo.descricao}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <span className="text-xs text-white/30">
                    {arquivo.created_date && format(new Date(arquivo.created_date), "dd/MM/yyyy")}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={arquivo.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-white/10 rounded-lg text-[#FF4D00]"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => deleteMutation.mutate(arquivo.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-red-400/60 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Arquivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Arquivo *</Label>
              <div className="mt-1">
                <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#FF4D00]/50 transition-colors">
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-[#FF4D00]" />
                  ) : form.arquivo_url ? (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <FileText size={20} /> Arquivo enviado
                    </span>
                  ) : (
                    <span className="text-white/50 flex items-center gap-2">
                      <Upload size={20} /> Clique para selecionar
                    </span>
                  )}
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
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
                <Label className="text-white/70">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="documento">Documento</SelectItem>
                    <SelectItem value="planilha">Planilha</SelectItem>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={2}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseDialog} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.titulo || !form.arquivo_url}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}