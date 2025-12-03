import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Camera, Video,
  MessageSquare, Upload, ChevronDown, ChevronRight, Flag, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

const statusConfig = {
  pendente: { color: "text-white/50", bg: "bg-white/10", label: "Pendente" },
  em_andamento: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Em Andamento" },
  concluido: { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Concluído" },
  atrasado: { color: "text-red-400", bg: "bg-red-500/20", label: "Atrasado" }
};

const pilarIcons = {
  processos: "🏆",
  desempenho: "📈",
  tempo_potencia: "⚡",
  norte_estrategico: "🎯",
  presenca_magnetica: "✨",
  geral: "📋"
};

export default function ChecklistCard({ execucao, onUpdate, onCreatePlanoAcao }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [reprovarDialog, setReprovarDialog] = useState(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState("");

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ExecucaoChecklist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["execucoes"] });
      onUpdate?.();
    }
  });

  const calcularProgresso = () => {
    if (!execucao.itens?.length) return 0;
    const concluidos = execucao.itens.filter(i => i.concluido && !i.reprovado).length;
    return Math.round((concluidos / execucao.itens.length) * 100);
  };

  const handleToggleItem = async (idx) => {
    const newItens = [...execucao.itens];
    const item = newItens[idx];
    
    if (!item.concluido) {
      item.concluido = true;
      item.data_conclusao = new Date().toISOString();
    } else {
      item.concluido = false;
      item.data_conclusao = null;
    }

    const progresso = calcularProgresso();
    const allConcluidos = newItens.every(i => i.concluido && !i.reprovado);
    
    updateMutation.mutate({
      id: execucao.id,
      data: {
        itens: newItens,
        progresso,
        status: allConcluidos ? "concluido" : progresso > 0 ? "em_andamento" : "pendente",
        data_conclusao: allConcluidos ? new Date().toISOString().split("T")[0] : null
      }
    });
  };

  const handleUploadEvidencia = async (idx, file) => {
    setUploading(idx);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newItens = [...execucao.itens];
      newItens[idx] = {
        ...newItens[idx],
        evidencia_url: file_url,
        evidencia_tipo: file.type.startsWith("video") ? "video" : "foto"
      };
      updateMutation.mutate({ id: execucao.id, data: { itens: newItens } });
    } finally {
      setUploading(null);
    }
  };

  const handleAddComentario = (idx, comentario) => {
    const newItens = [...execucao.itens];
    newItens[idx] = { ...newItens[idx], comentario };
    updateMutation.mutate({ id: execucao.id, data: { itens: newItens } });
  };

  const handleReprovarItem = () => {
    if (reprovarDialog === null) return;
    
    const newItens = [...execucao.itens];
    newItens[reprovarDialog] = {
      ...newItens[reprovarDialog],
      reprovado: true,
      motivo_reprovacao: motivoReprovacao
    };
    
    updateMutation.mutate({ id: execucao.id, data: { itens: newItens } });
    
    // Criar plano de ação automático
    onCreatePlanoAcao?.({
      mentorado_id: execucao.mentorado_id,
      execucao_id: execucao.id,
      item_checklist: execucao.itens[reprovarDialog].texto,
      problema: motivoReprovacao || `Item "${execucao.itens[reprovarDialog].texto}" não foi executado corretamente`,
      pilar: execucao.pilar
    });

    setReprovarDialog(null);
    setMotivoReprovacao("");
  };

  const progresso = calcularProgresso();
  const status = statusConfig[execucao.status] || statusConfig.pendente;
  const isAtrasado = execucao.data_limite && new Date(execucao.data_limite) < new Date() && execucao.status !== "concluido";

  return (
    <div className={`bg-white/5 border rounded-xl overflow-hidden ${isAtrasado ? "border-red-500/50" : "border-white/10"}`}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {expanded ? <ChevronDown size={18} className="text-white/50" /> : <ChevronRight size={18} className="text-white/50" />}
            <span className="text-xl">{pilarIcons[execucao.pilar]}</span>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-medium text-white truncate">{execucao.titulo}</h3>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className={`px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                  {isAtrasado ? "⚠️ Atrasado" : status.label}
                </span>
                {execucao.data_limite && (
                  <span className={isAtrasado ? "text-red-400" : ""}>
                    Prazo: {new Date(execucao.data_limite).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24">
              <Progress value={progresso} className="h-2" />
            </div>
            <span className={`text-sm font-bold min-w-[40px] text-right ${
              progresso >= 80 ? "text-emerald-400" : progresso >= 40 ? "text-amber-400" : "text-white/50"
            }`}>
              {progresso}%
            </span>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {execucao.itens?.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-colors ${
                  item.reprovado 
                    ? "bg-red-500/10 border-red-500/30" 
                    : item.concluido 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => !item.reprovado && handleToggleItem(idx)}
                    disabled={item.reprovado}
                    className="mt-0.5"
                  >
                    {item.reprovado ? (
                      <X size={18} className="text-red-400" />
                    ) : item.concluido ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} className="text-white/30 hover:text-white/50" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.concluido ? "text-white/50 line-through" : item.reprovado ? "text-red-300" : "text-white/80"}`}>
                      {item.texto}
                    </p>
                    {item.reprovado && item.motivo_reprovacao && (
                      <p className="text-xs text-red-400 mt-1">❌ {item.motivo_reprovacao}</p>
                    )}
                    {item.comentario && (
                      <p className="text-xs text-white/40 mt-1">💬 {item.comentario}</p>
                    )}
                    {item.evidencia_url && (
                      <a href={item.evidencia_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF4D00] mt-1 inline-flex items-center gap-1">
                        {item.evidencia_tipo === "video" ? <Video size={12} /> : <Camera size={12} />}
                        Ver evidência
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Upload de evidência */}
                    <label className="p-1.5 hover:bg-white/10 rounded cursor-pointer text-white/40 hover:text-white">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => e.target.files[0] && handleUploadEvidencia(idx, e.target.files[0])}
                      />
                      {uploading === idx ? (
                        <div className="w-4 h-4 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                    </label>
                    {/* Reprovar */}
                    {!item.concluido && !item.reprovado && (
                      <button
                        onClick={() => setReprovarDialog(idx)}
                        className="p-1.5 hover:bg-red-500/20 rounded text-red-400/50 hover:text-red-400"
                        title="Reprovar item"
                      >
                        <Flag size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog de Reprovação */}
      <Dialog open={reprovarDialog !== null} onOpenChange={() => setReprovarDialog(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Flag size={20} />
              Reprovar Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-white/70">
              Isso irá criar automaticamente um Plano de Ação para correção.
            </p>
            <div>
              <label className="text-sm text-white/60">Motivo da reprovação</label>
              <Textarea
                value={motivoReprovacao}
                onChange={(e) => setMotivoReprovacao(e.target.value)}
                placeholder="Descreva o problema identificado..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setReprovarDialog(null)} className="flex-1 border-white/10 text-white">
                Cancelar
              </Button>
              <Button onClick={handleReprovarItem} className="flex-1 bg-red-500 hover:bg-red-600">
                Reprovar e Criar Plano
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}