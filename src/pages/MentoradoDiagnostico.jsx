import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import DiagnosticoNegocio from "@/components/mentorado/DiagnosticoNegocio";

export default function MentoradoDiagnostico() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");

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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Briefing.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Briefing.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["briefing", mentoradoId] })
  });

  const handleUpdateStatus = (status) => {
    if (briefing?.id) {
      updateMutation.mutate({ id: briefing.id, data: { ...briefing, diagnostico_status: status } });
    } else {
      createMutation.mutate({ mentorado_id: mentoradoId, diagnostico_status: status });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4">
          <ArrowLeft size={20} /> Voltar para {mentorado?.nome || "Mentorado"}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
            <ClipboardCheck className="text-[#FF4D00]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Diagnóstico do Negócio</h1>
            <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <DiagnosticoNegocio 
          diagnosticoStatus={briefing?.diagnostico_status || {}}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}