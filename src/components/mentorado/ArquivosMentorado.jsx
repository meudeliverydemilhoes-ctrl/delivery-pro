import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FolderOpen, FileText, FileSpreadsheet, Image, FileVideo, File, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const tipoIcons = {
  documento: FileText,
  planilha: FileSpreadsheet,
  imagem: Image,
  pdf: FileText,
  video: FileVideo,
  outro: File
};

const tipoColors = {
  documento: "text-blue-400",
  planilha: "text-emerald-400",
  imagem: "text-purple-400",
  pdf: "text-red-400",
  video: "text-pink-400",
  outro: "text-gray-400"
};

export default function ArquivosMentorado({ mentoradoId }) {
  const { data: arquivos = [], isLoading } = useQuery({
    queryKey: ["arquivos", mentoradoId],
    queryFn: () => base44.entities.ArquivoMentorado.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const handleOpenFile = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (arquivos.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
        <FolderOpen size={48} className="mx-auto mb-4 text-white/20" />
        <p className="text-white/50 mb-2">Nenhum arquivo disponível</p>
        <p className="text-sm text-white/30">Os materiais de apoio aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
          <FolderOpen size={24} className="text-[#FF4D00]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Materiais de Apoio</h2>
          <p className="text-sm text-white/50">{arquivos.length} arquivo{arquivos.length !== 1 ? 's' : ''} disponível{arquivos.length !== 1 ? 'is' : ''}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {arquivos.map((arquivo) => {
          const Icon = tipoIcons[arquivo.tipo] || File;
          const colorClass = tipoColors[arquivo.tipo] || "text-gray-400";

          return (
            <div
              key={arquivo.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={24} className={colorClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white mb-1">{arquivo.titulo}</h3>
                  {arquivo.descricao && (
                    <p className="text-sm text-white/50 line-clamp-2">{arquivo.descricao}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/40 capitalize">{arquivo.tipo}</span>
                    {arquivo.tamanho && (
                      <span className="text-xs text-white/40">{arquivo.tamanho}</span>
                    )}
                    {arquivo.pilar && arquivo.pilar !== 'geral' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 capitalize">
                        {arquivo.pilar.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleOpenFile(arquivo.arquivo_url)}
                  className="bg-[#FF4D00] hover:bg-[#E64500] text-white flex-shrink-0"
                  size="sm"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Abrir Arquivo
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}