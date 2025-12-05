import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, TrendingUp, Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const pilaresConfig = [
  { key: "processos", label: "Pilar 1 - Processos" },
  { key: "desempenho", label: "Pilar 2 - Desempenho" },
  { key: "tempo_potencia", label: "Pilar 3 - Tempo de Potência" },
  { key: "norte_estrategico", label: "Pilar 4 - Norte Estratégico" },
  { key: "presenca_magnetica", label: "Pilar 5 - Presença Magnética" },
];

const evolucaoColors = {
  feito: "bg-emerald-500/20 text-emerald-400",
  pendencia: "bg-amber-500/20 text-amber-400",
  resultado: "bg-blue-500/20 text-blue-400",
  proximo_passo: "bg-violet-500/20 text-violet-400",
  observacao: "bg-gray-500/20 text-gray-400",
};

export default function MentoradoEvolucao() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", tipo: "feito", pilar: "geral", descricao: "", data: format(new Date(), "yyyy-MM-dd"), concluido: false });

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  const { data: evolucoes = [] } = useQuery({
    queryKey: ["evolucoes", mentoradoId],
    queryFn: () => base44.entities.Evolucao.filter({ mentorado_id: mentoradoId }, "-data"),
    enabled: !!mentoradoId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Evolucao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolucoes", mentoradoId] });
      setDialogOpen(false);
      setForm({ titulo: "", tipo: "feito", pilar: "geral", descricao: "", data: format(new Date(), "yyyy-MM-dd"), concluido: false });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Evolucao.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["evolucoes", mentoradoId] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Evolucao.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["evolucoes", mentoradoId] })
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4">
          <ArrowLeft size={20} /> Voltar para {mentorado?.nome || "Mentorado"}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-[#FF4D00]" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Evolução</h1>
              <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={16} className="mr-2" /> Adicionar Registro
          </Button>
        </div>
      </div>

      {evolucoes.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <TrendingUp size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">Nenhum registro de evolução</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evolucoes.map((evo) => (
            <div key={evo.id} className="bg-white/5 border border-white/10 rounded-xl p-4 group">
              <div className="flex items-start gap-3">
                <button onClick={() => updateMutation.mutate({ id: evo.id, data: { concluido: !evo.concluido } })} className="flex-shrink-0 mt-1">
                  {evo.concluido ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Circle size={20} className="text-white/30" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium ${evo.concluido ? "text-white/40 line-through" : "text-white"}`}>{evo.titulo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${evolucaoColors[evo.tipo]}`}>{evo.tipo?.replace("_", " ")}</span>
                  </div>
                  {evo.descricao && <p className="text-sm text-white/60">{evo.descricao}</p>}
                  <p className="text-xs text-white/40 mt-2">
                    {evo.data && format(new Date(evo.data), "dd/MM/yyyy")}
                    {evo.pilar && evo.pilar !== "geral" && ` • ${evo.pilar.replace("_", " ")}`}
                  </p>
                </div>
                <button onClick={() => deleteMutation.mutate(evo.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Adicionar Registro de Evolução</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="feito">Feito</SelectItem>
                    <SelectItem value="pendencia">Pendência</SelectItem>
                    <SelectItem value="resultado">Resultado</SelectItem>
                    <SelectItem value="proximo_passo">Próximo Passo</SelectItem>
                    <SelectItem value="observacao">Observação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">Pilar</Label>
                <Select value={form.pilar} onValueChange={(v) => setForm({ ...form, pilar: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="geral">Geral</SelectItem>
                    {pilaresConfig.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70">Data</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-white/10 text-white hover:bg-white/10">Cancelar</Button>
              <Button onClick={() => createMutation.mutate({ ...form, mentorado_id: mentoradoId })} disabled={!form.titulo} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}