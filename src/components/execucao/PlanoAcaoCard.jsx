import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, Clock, CheckCircle2, Upload, MessageSquare, User, Calendar, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const statusConfig = {
  pendente: { color: "text-red-400", bg: "bg-red-500/20", label: "❌ Pendente" },
  em_andamento: { color: "text-amber-400", bg: "bg-amber-500/20", label: "⏳ Em Andamento" },
  aguardando_validacao: { color: "text-blue-400", bg: "bg-blue-500/20", label: "🔍 Aguardando Validação" },
  concluido: { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "✅ Concluído" },
  atrasado: { color: "text-red-400", bg: "bg-red-500/20", label: "⚠️ Atrasado" }
};

const prioridadeConfig = {
  baixa: { color: "text-gray-400", bg: "bg-gray-500/20" },
  media: { color: "text-blue-400", bg: "bg-blue-500/20" },
  alta: { color: "text-amber-400", bg: "bg-amber-500/20" },
  critica: { color: "text-red-400", bg: "bg-red-500/20" }
};

const pilarIcons = {
  processos: "🏆",
  desempenho: "📈",
  tempo_potencia: "⚡",
  norte_estrategico: "🎯",
  presenca_magnetica: "✨",
  geral: "📋"
};

export default function PlanoAcaoCard({ plano, onUpdate, onEdit }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlanoAcaoInteligente.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planosAcao"] });
      onUpdate?.();
    }
  });

  const handleUploadEvidencia = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateMutation.mutate({
        id: plano.id,
        data: {
          evidencia_correcao_url: file_url,
          status: "aguardando_validacao"
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleConcluir = () => {
    updateMutation.mutate({
      id: plano.id,
      data: {
        status: "concluido",
        data_conclusao: new Date().toISOString().split("T")[0],
        pontos_ganhos: 15
      }
    });
  };

  const handleEnviarFeedback = () => {
    updateMutation.mutate({
      id: plano.id,
      data: { feedback_mentor: feedback }
    });
    setFeedback("");
    setShowFeedback(false);
  };

  const status = statusConfig[plano.status] || statusConfig.pendente;
  const prioridade = prioridadeConfig[plano.prioridade] || prioridadeConfig.media;
  const isAtrasado = plano.prazo && new Date(plano.prazo) < new Date() && plano.status !== "concluido";

  return (
    <div className={`bg-white/5 border rounded-xl p-4 ${isAtrasado ? "border-red-500/50" : "border-white/10"}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl">{pilarIcons[plano.pilar]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
              {isAtrasado ? "⚠️ Atrasado" : status.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${prioridade.bg} ${prioridade.color}`}>
              {plano.prioridade?.toUpperCase()}
            </span>
          </div>
          <h4 className="font-medium text-white">{plano.problema}</h4>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white"
            title="Editar plano"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <AlertTriangle size={14} className="text-amber-400" />
          <span>Ação: {plano.acao_corretiva}</span>
        </div>
        {plano.responsavel && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <User size={14} />
            <span>Responsável: {plano.responsavel}</span>
          </div>
        )}
        {plano.prazo && (
          <div className={`flex items-center gap-2 text-sm ${isAtrasado ? "text-red-400" : "text-white/60"}`}>
            <Calendar size={14} />
            <span>Prazo: {format(new Date(plano.prazo), "dd/MM/yyyy")}</span>
          </div>
        )}
      </div>

      {/* Evidência */}
      {plano.evidencia_correcao_url ? (
        <div className="mb-4 p-3 bg-emerald-500/10 rounded-lg">
          <p className="text-xs text-emerald-400 mb-2">✅ Evidência enviada</p>
          <a href={plano.evidencia_correcao_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#FF4D00] hover:underline">
            Ver evidência
          </a>
        </div>
      ) : plano.status !== "concluido" && (
        <div className="mb-4">
          <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#FF4D00]/50 hover:bg-white/5 transition-colors">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleUploadEvidencia(e.target.files[0])}
            />
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload size={16} className="text-white/50" />
                <span className="text-sm text-white/50">Enviar evidência de correção</span>
              </>
            )}
          </label>
        </div>
      )}

      {/* Feedback do mentor */}
      {plano.feedback_mentor && (
        <div className="mb-4 p-3 bg-[#FF4D00]/10 rounded-lg">
          <p className="text-xs text-[#FF4D00] mb-1">💬 Feedback do Mentor</p>
          <p className="text-sm text-white/80">{plano.feedback_mentor}</p>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2">
        {plano.status === "aguardando_validacao" && (
          <Button onClick={handleConcluir} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
            <CheckCircle2 size={16} className="mr-2" />
            Validar e Concluir
          </Button>
        )}
        {plano.status !== "concluido" && (
          <Button
            variant="outline"
            onClick={() => setShowFeedback(!showFeedback)}
            className="border-white/10 text-white"
          >
            <MessageSquare size={16} className="mr-2" />
            Feedback
          </Button>
        )}
      </div>

      {showFeedback && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Escreva seu feedback..."
            className="bg-white/5 border-white/10 text-white"
          />
          <Button onClick={handleEnviarFeedback} disabled={!feedback.trim()} className="w-full bg-[#FF4D00] hover:bg-[#E64500]">
            Enviar Feedback
          </Button>
        </div>
      )}
    </div>
  );
}