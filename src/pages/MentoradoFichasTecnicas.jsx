import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChefHat } from "lucide-react";
import FichasTecnicasOperacionais from "@/components/mentorado/FichasTecnicasOperacionais";

export default function MentoradoFichasTecnicas() {
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4">
          <ArrowLeft size={20} /> Voltar para {mentorado?.nome || "Mentorado"}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
            <ChefHat className="text-[#FF4D00]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Fichas Técnicas</h1>
            <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <FichasTecnicasOperacionais mentoradoId={mentoradoId} />
      </div>
    </div>
  );
}