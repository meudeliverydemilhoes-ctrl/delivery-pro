import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PilarConteudoIncluido from "@/components/pilares/PilarConteudoIncluido";

const pilaresConfig = [
  { key: "processos", label: "Pilar 1 - Processos", color: "bg-blue-500", icon: "🏆" },
  { key: "desempenho", label: "Pilar 2 - Desempenho", color: "bg-emerald-500", icon: "📈" },
  { key: "tempo_potencia", label: "Pilar 3 - Tempo de Potência", color: "bg-violet-500", icon: "⚡" },
  { key: "norte_estrategico", label: "Pilar 4 - Norte Estratégico", color: "bg-amber-500", icon: "🎯" },
  { key: "presenca_magnetica", label: "Pilar 5 - Presença Magnética", color: "bg-pink-500", icon: "✨" },
];

export default function MentoradoPilares() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");
  const pilarParam = urlParams.get("pilar");

  const [selectedPilar, setSelectedPilar] = useState(pilarParam || null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pilarForm, setPilarForm] = useState({ pilar: "processos", titulo: "", tipo: "aula", descricao: "", link_externo: "" });

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  const { data: pilarProgressos = [] } = useQuery({
    queryKey: ["pilarProgressos", mentoradoId],
    queryFn: () => base44.entities.PilarProgresso.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const { data: pilarCustomDataList = [] } = useQuery({
    queryKey: ["pilarCustomData", mentoradoId],
    queryFn: () => base44.entities.PilarCustomData.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const toggleProgressoMutation = useMutation({
    mutationFn: async ({ pilar, tipo, texto }) => {
      const existing = pilarProgressos.find(p => p.pilar === pilar && p.tipo === tipo && p.texto === texto);
      if (existing) {
        return base44.entities.PilarProgresso.update(existing.id, {
          concluido: !existing.concluido,
          data_conclusao: !existing.concluido ? new Date().toISOString().split("T")[0] : null
        });
      } else {
        return base44.entities.PilarProgresso.create({
          mentorado_id: mentoradoId, pilar, tipo, texto, concluido: true,
          data_conclusao: new Date().toISOString().split("T")[0]
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pilarProgressos", mentoradoId] })
  });

  const updateCustomDataMutation = useMutation({
    mutationFn: async ({ pilarKey, data }) => {
      const existing = pilarCustomDataList.find(p => p.pilar === pilarKey);
      if (existing) {
        return base44.entities.PilarCustomData.update(existing.id, { data });
      } else {
        return base44.entities.PilarCustomData.create({ mentorado_id: mentoradoId, pilar: pilarKey, data });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pilarCustomData", mentoradoId] })
  });

  const getProgressosForPilar = (pilarKey) => pilarProgressos.filter(p => p.pilar === pilarKey);
  const getCustomDataForPilar = (pilarKey) => pilarCustomDataList.find(p => p.pilar === pilarKey)?.data || null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4">
          <ArrowLeft size={20} /> Voltar para {mentorado?.nome || "Mentorado"}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
              <Target className="text-[#FF4D00]" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Pilares da Mentoria</h1>
              <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={16} className="mr-2" /> Adicionar Conteúdo
          </Button>
        </div>
      </div>

      {selectedPilar ? (
        <div className="space-y-6">
          <button onClick={() => setSelectedPilar(null)} className="flex items-center gap-2 text-white/50 hover:text-white">
            <ArrowLeft size={18} /> Voltar aos pilares
          </button>
          {(() => {
            const pilar = pilaresConfig.find(p => p.key === selectedPilar);
            return (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{pilar?.icon}</span>
                  <h2 className="text-2xl font-bold text-white">{pilar?.label}</h2>
                </div>
                <PilarConteudoIncluido
                  pilarKey={selectedPilar}
                  progressoItems={getProgressosForPilar(selectedPilar)}
                  onToggleItem={(tipo, texto) => toggleProgressoMutation.mutate({ pilar: selectedPilar, tipo, texto })}
                  customData={getCustomDataForPilar(selectedPilar)}
                  onUpdateCustomData={(data) => updateCustomDataMutation.mutate({ pilarKey: selectedPilar, data })}
                />
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pilaresConfig.map((pilar) => (
            <button
              key={pilar.key}
              onClick={() => setSelectedPilar(pilar.key)}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:border-[#FF4D00]/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{pilar.icon}</span>
                <div className={`w-2 h-2 rounded-full ${pilar.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#FF4D00] transition-colors">{pilar.label}</h3>
              <div className="mt-4 flex items-center gap-2 text-[#FF4D00] text-sm font-medium">
                <span>Entrar</span>
                <ArrowLeft size={16} className="rotate-180" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Conteúdo ao Pilar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/70">Pilar</Label>
              <Select value={pilarForm.pilar} onValueChange={(v) => setPilarForm({ ...pilarForm, pilar: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {pilaresConfig.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Título</Label>
              <Input value={pilarForm.titulo} onChange={(e) => setPilarForm({ ...pilarForm, titulo: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/70">Tipo</Label>
              <Select value={pilarForm.tipo} onValueChange={(v) => setPilarForm({ ...pilarForm, tipo: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="aula">Aula</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="exercicio">Exercício</SelectItem>
                  <SelectItem value="modelo">Modelo</SelectItem>
                  <SelectItem value="anotacao">Anotação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">Descrição</Label>
              <Textarea value={pilarForm.descricao} onChange={(e) => setPilarForm({ ...pilarForm, descricao: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/70">Link Externo</Label>
              <Input value={pilarForm.link_externo} onChange={(e) => setPilarForm({ ...pilarForm, link_externo: e.target.value })} placeholder="https://..." className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-white/10 text-white hover:bg-white/10">Cancelar</Button>
              <Button disabled={!pilarForm.titulo} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}