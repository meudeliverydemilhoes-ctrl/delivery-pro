import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Files, ExternalLink, Edit2, Save, X } from "lucide-react";
import MeusArquivos from "@/components/mentorado/MeusArquivos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MentoradoArquivos() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");

  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkDrive, setLinkDrive] = useState("");

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  React.useEffect(() => {
    if (mentorado?.link_drive) {
      setLinkDrive(mentorado.link_drive);
    }
  }, [mentorado]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mentorado.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorado", mentoradoId] });
      setIsEditingLink(false);
    }
  });

  const handleSaveLink = () => {
    if (mentorado?.id) {
      updateMutation.mutate({ id: mentorado.id, data: { link_drive: linkDrive } });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4">
          <ArrowLeft size={20} /> Voltar para {mentorado?.nome || "Mentorado"}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
            <Files className="text-[#FF4D00]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Arquivos</h1>
            <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Link da Pasta do Drive</h3>
          {!isEditingLink && (
            <Button
              size="sm"
              onClick={() => setIsEditingLink(true)}
              className="bg-[#FF4D00] hover:bg-[#E64500] text-white"
            >
              <Edit2 size={14} className="mr-2" /> Editar
            </Button>
          )}
        </div>

        {isEditingLink ? (
          <div className="space-y-4">
            <div>
              <Label className="text-white/70">URL do Google Drive</Label>
              <Input
                value={linkDrive}
                onChange={(e) => setLinkDrive(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingLink(false);
                  setLinkDrive(mentorado?.link_drive || "");
                }}
                className="border-white/10 text-white"
              >
                <X size={14} className="mr-2" /> Cancelar
              </Button>
              <Button
                onClick={handleSaveLink}
                className="bg-[#FF4D00] hover:bg-[#E64500] text-white"
              >
                <Save size={14} className="mr-2" /> Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {mentorado?.link_drive ? (
              <a
                href={mentorado.link_drive}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#FF4D00] hover:text-[#FF4D00]/80"
              >
                {mentorado.link_drive}
                <ExternalLink size={14} />
              </a>
            ) : (
              <p className="text-white/40">Nenhum link cadastrado</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <MeusArquivos mentoradoId={mentoradoId} />
      </div>
    </div>
  );
}