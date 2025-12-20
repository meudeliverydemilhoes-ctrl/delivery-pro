import React, { useState } from "react";
import {
  FileText, Play, Image, ChevronDown, ChevronRight, Rocket, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

const pilarIcons = {
  processos: "🏆",
  desempenho: "📈",
  tempo_potencia: "⚡",
  norte_estrategico: "🎯",
  presenca_magnetica: "✨",
  geral: "📋"
};

const categoriaLabels = {
  atendimento: "Atendimento",
  producao: "Produção",
  gestao: "Gestão",
  financeiro: "Financeiro",
  marketing: "Marketing",
  equipe: "Equipe",
  operacional: "Operacional",
  outro: "Outro"
};

export default function SOPCard({ sop, onAplicarChecklist }) {
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#FF4D00]/30 transition-colors">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {expanded ? <ChevronDown size={18} className="text-white/50" /> : <ChevronRight size={18} className="text-white/50" />}
              <span className="text-xl">{pilarIcons[sop.pilar]}</span>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-medium text-white truncate">{sop.titulo}</h3>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="px-2 py-0.5 rounded-full bg-white/10">
                    {categoriaLabels[sop.categoria]}
                  </span>
                  <span>v{sop.versao || "1.0"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sop.video_url && <Play size={16} className="text-blue-400" />}
              {sop.imagens?.length > 0 && <Image size={16} className="text-amber-400" />}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {sop.descricao && (
                <p className="text-sm text-white/60">{sop.descricao}</p>
              )}

              {/* Passos do SOP */}
              {sop.passos?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/70">Passos</h4>
                  {sop.passos.map((passo, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#FF4D00] rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {passo.ordem || idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{passo.titulo}</p>
                        {passo.descricao && (
                          <p className="text-xs text-white/50 mt-1">{passo.descricao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conteúdo em Markdown */}
              {sop.conteudo && (
                <div className="p-3 bg-white/5 rounded-lg prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{sop.conteudo}</ReactMarkdown>
                </div>
              )}

              {/* Vídeo */}
              {sop.video_url && (
                <a
                  href={sop.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <Play size={18} />
                  <span className="text-sm">Assistir vídeo explicativo</span>
                  <ExternalLink size={14} className="ml-auto" />
                </a>
              )}

              {/* Imagens */}
              {sop.imagens?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {sop.imagens.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                      <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    </a>
                  ))}
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setDetailsOpen(true)}
                  className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white"
                >
                  <FileText size={16} className="mr-2" />
                  Ver Completo
                </Button>
                <Button
                  onClick={() => onAplicarChecklist?.(sop)}
                  className="flex-1 bg-[#FF4D00] hover:bg-[#E64500] text-white"
                >
                  <Rocket size={16} className="mr-2" />
                  Aplicar Agora
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Dialog de Detalhes Completos */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{pilarIcons[sop.pilar]}</span>
              {sop.titulo}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {sop.descricao && (
              <p className="text-white/70">{sop.descricao}</p>
            )}

            {sop.video_url && (
              <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
                <iframe
                  src={sop.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {sop.passos?.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-white">Passo a Passo</h4>
                {sop.passos.map((passo, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#FF4D00] rounded-full flex items-center justify-center font-bold text-white">
                      {passo.ordem || idx + 1}
                    </span>
                    <div className="flex-1">
                      <h5 className="font-medium text-white mb-1">{passo.titulo}</h5>
                      {passo.descricao && (
                        <p className="text-sm text-white/60">{passo.descricao}</p>
                      )}
                      {passo.imagem_url && (
                        <img src={passo.imagem_url} alt={passo.titulo} className="mt-3 rounded-lg max-h-48 object-cover" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sop.conteudo && (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{sop.conteudo}</ReactMarkdown>
              </div>
            )}

            <Button
              onClick={() => {
                setDetailsOpen(false);
                onAplicarChecklist?.(sop);
              }}
              className="w-full bg-[#FF4D00] hover:bg-[#E64500]"
            >
              <Rocket size={16} className="mr-2" />
              Aplicar este SOP como Checklist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}