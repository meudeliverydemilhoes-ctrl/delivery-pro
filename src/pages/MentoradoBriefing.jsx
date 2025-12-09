import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, Edit2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function MentoradoBriefing() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");

  const [isEditing, setIsEditing] = useState(false);
  const [briefingForm, setBriefingForm] = useState({});

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  useEffect(() => {
    if (briefing) setBriefingForm(briefing);
  }, [briefing]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Briefing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] });
      setIsEditing(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] });
      setIsEditing(false);
    }
  });

  const handleSave = () => {
    if (briefing?.id) {
      updateMutation.mutate({ id: briefing.id, data: briefingForm });
    } else {
      createMutation.mutate({ ...briefingForm, mentorado_id: mentoradoId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)} className="inline-flex items-center gap-2 text-[#FF4D00] hover:text-white mb-4">
          <ArrowLeft size={20} /> Voltar para {mentorado?.nome || "Mentorado"}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
              <FileText className="text-[#FF4D00]" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Briefing do Negócio</h1>
              <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
            </div>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="border-white/10 text-black hover:bg-white/10">
                <X size={16} className="mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-[#FF4D00] hover:bg-[#E64500] text-white">
                <Save size={16} className="mr-2" /> Salvar
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="border-white/10 text-white hover:bg-white/10">
              <Edit2 size={16} className="mr-2" /> Editar
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-white/70">Raio de Entrega</Label>
                <Input value={briefingForm.raio_entrega || ""} onChange={(e) => setBriefingForm({ ...briefingForm, raio_entrega: e.target.value })} placeholder="Ex: 5km" className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
              <div>
                <Label className="text-white/70">Média Pedidos/Dia</Label>
                <Input type="number" value={briefingForm.media_pedidos_dia || ""} onChange={(e) => setBriefingForm({ ...briefingForm, media_pedidos_dia: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
              <div>
                <Label className="text-white/70">CMV (%)</Label>
                <Input type="number" value={briefingForm.cmv || ""} onChange={(e) => setBriefingForm({ ...briefingForm, cmv: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
              <div>
                <Label className="text-white/70">Ticket Médio (R$)</Label>
                <Input type="number" value={briefingForm.ticket_medio || ""} onChange={(e) => setBriefingForm({ ...briefingForm, ticket_medio: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-white/70">Faturamento Mensal (R$)</Label>
              <Input type="number" value={briefingForm.faturamento_mensal || ""} onChange={(e) => setBriefingForm({ ...briefingForm, faturamento_mensal: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/70">Estrutura da Equipe</Label>
              <Textarea value={briefingForm.estrutura_equipe || ""} onChange={(e) => setBriefingForm({ ...briefingForm, estrutura_equipe: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" rows={3} />
            </div>
            <div>
              <Label className="text-white/70">Problemas Identificados</Label>
              <Textarea value={briefingForm.problemas_identificados || ""} onChange={(e) => setBriefingForm({ ...briefingForm, problemas_identificados: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" rows={3} />
            </div>
            <div>
              <Label className="text-white/70">Objetivos</Label>
              <Textarea value={briefingForm.objetivos || ""} onChange={(e) => setBriefingForm({ ...briefingForm, objetivos: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" rows={3} />
            </div>
            <div>
              <Label className="text-white/70">Diagnóstico Inicial</Label>
              <Textarea value={briefingForm.diagnostico_inicial || ""} onChange={(e) => setBriefingForm({ ...briefingForm, diagnostico_inicial: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" rows={4} />
            </div>
            <div>
              <Label className="text-white/70 mb-3 block">Checklist de Maturidade</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "cardapio_otimizado", label: "Cardápio Otimizado" },
                  { key: "processos_definidos", label: "Processos Definidos" },
                  { key: "financeiro_organizado", label: "Financeiro Organizado" },
                  { key: "marketing_ativo", label: "Marketing Ativo" },
                  { key: "equipe_treinada", label: "Equipe Treinada" },
                  { key: "delivery_eficiente", label: "Delivery Eficiente" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <Checkbox checked={briefingForm.checklist_maturidade?.[item.key] || false} onCheckedChange={(checked) => setBriefingForm({ ...briefingForm, checklist_maturidade: { ...briefingForm.checklist_maturidade, [item.key]: checked } })} />
                    <label className="text-sm text-white/70">{item.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-white/70">Anotações</Label>
              <Textarea value={briefingForm.anotacoes || ""} onChange={(e) => setBriefingForm({ ...briefingForm, anotacoes: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" rows={4} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {!briefing ? (
              <p className="text-white/40 text-center py-8">Nenhum briefing cadastrado. Clique em Editar para começar.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Raio de Entrega</p>
                    <p className="text-lg font-semibold text-white">{briefing.raio_entrega || "-"}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Pedidos/Dia</p>
                    <p className="text-lg font-semibold text-white">{briefing.media_pedidos_dia || "-"}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">CMV</p>
                    <p className="text-lg font-semibold text-white">{briefing.cmv ? `${briefing.cmv}%` : "-"}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Ticket Médio</p>
                    <p className="text-lg font-semibold text-white">{briefing.ticket_medio ? `R$ ${briefing.ticket_medio}` : "-"}</p>
                  </div>
                </div>
                {briefing.faturamento_mensal && (
                  <div className="bg-[#FF4D00]/10 rounded-xl p-4">
                    <p className="text-xs text-[#FF4D00] mb-1">Faturamento Mensal</p>
                    <p className="text-2xl font-bold text-[#FF4D00]">R$ {briefing.faturamento_mensal?.toLocaleString()}</p>
                  </div>
                )}
                {briefing.estrutura_equipe && (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Estrutura da Equipe</h4>
                    <p className="text-white/80 whitespace-pre-wrap">{briefing.estrutura_equipe}</p>
                  </div>
                )}
                {briefing.problemas_identificados && (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Problemas Identificados</h4>
                    <p className="text-white/80 whitespace-pre-wrap">{briefing.problemas_identificados}</p>
                  </div>
                )}
                {briefing.objetivos && (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Objetivos</h4>
                    <p className="text-white/80 whitespace-pre-wrap">{briefing.objetivos}</p>
                  </div>
                )}
                {briefing.diagnostico_inicial && (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Diagnóstico Inicial</h4>
                    <p className="text-white/80 whitespace-pre-wrap">{briefing.diagnostico_inicial}</p>
                  </div>
                )}
                {briefing.anotacoes && (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Anotações</h4>
                    <p className="text-white/80 whitespace-pre-wrap">{briefing.anotacoes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}