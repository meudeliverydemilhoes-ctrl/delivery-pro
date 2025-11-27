import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Upload,
  MessageSquare,
  User,
  Calendar
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";

export default function PlanoAcaoCard({ plano, onUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const isAtrasado = plano.prazo && isPast(parseISO(plano.prazo)) && plano.status !== "concluido";

  const handleUploadEvidencia = async (file) => {
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpdate({ evidencia_url: file_url });
    setIsUploading(false);
  };

  const handleConcluir = () => {
    onUpdate({ status: "concluido" });
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) return;
    onUpdate({ feedback_mentor: feedback });
    setFeedback("");
  };

  const statusColors = {
    pendente: "border-gray-500/30 bg-gray-500/5",
    em_andamento: "border-blue-500/30 bg-blue-500/5",
    concluido: "border-emerald-500/30 bg-emerald-500/5",
    atrasado: "border-red-500/30 bg-red-500/5"
  };

  const prioridadeColors = {
    baixa: "bg-gray-500/20 text-gray-400",
    media: "bg-blue-500/20 text-blue-400",
    alta: "bg-amber-500/20 text-amber-400",
    critica: "bg-red-500/20 text-red-400"
  };

  const pilarIcons = {
    processos: "🏆",
    desempenho: "📈",
    tempo_potencia: "⚡",
    norte_estrategico: "🎯",
    presenca_magnetica: "✨",
    geral: "📋"
  };

  const displayStatus = isAtrasado ? "atrasado" : plano.status;

  return (
    <div className={`border rounded-2xl p-5 ${statusColors[displayStatus]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{pilarIcons[plano.pilar]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${prioridadeColors[plano.prioridade]}`}>
            {plano.prioridade}
          </span>
          {isAtrasado && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} /> Atrasado
            </span>
          )}
        </div>
        {plano.status !== "concluido" && (
          <Button
            size="sm"
            onClick={handleConcluir}
            className="bg-emerald-600 hover:bg-emerald-700 h-8"
          >
            <CheckCircle2 size={14} className="mr-1" /> Concluir
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-white/40 mb-1">Problema Identificado</p>
          <p className="text-white font-medium">{plano.problema}</p>
        </div>

        <div>
          <p className="text-xs text-white/40 mb-1">Ação Corretiva</p>
          <p className="text-white/80">{plano.acao}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {plano.responsavel && (
            <div className="flex items-center gap-1 text-white/60">
              <User size={14} />
              {plano.responsavel}
            </div>
          )}
          {plano.prazo && (
            <div className={`flex items-center gap-1 ${isAtrasado ? "text-red-400" : "text-white/60"}`}>
              <Calendar size={14} />
              {format(parseISO(plano.prazo), "dd/MM/yyyy")}
            </div>
          )}
        </div>

        {/* Evidência */}
        {plano.status !== "concluido" && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 mb-2">Evidência de Correção</p>
            {plano.evidencia_url ? (
              <a
                href={plano.evidencia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#FF4D00] hover:underline"
              >
                Ver evidência enviada
              </a>
            ) : (
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                {isUploading ? (
                  <span className="text-xs text-white/60">Enviando...</span>
                ) : (
                  <>
                    <Upload size={14} className="text-white/60" />
                    <span className="text-xs text-white/60">Enviar evidência</span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadEvidencia(e.target.files[0])}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        )}

        {/* Feedback */}
        {plano.feedback_mentor && (
          <div className="p-3 bg-[#FF4D00]/10 rounded-xl border border-[#FF4D00]/20">
            <p className="text-xs text-[#FF4D00] mb-1 font-medium">Feedback do Mentor</p>
            <p className="text-sm text-white/80">{plano.feedback_mentor}</p>
          </div>
        )}

        {/* Adicionar feedback (apenas mentor) */}
        {!plano.feedback_mentor && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Adicionar feedback..."
                className="bg-white/5 border-white/10 text-white text-sm"
              />
              <Button
                onClick={handleSendFeedback}
                disabled={!feedback.trim()}
                className="bg-[#FF4D00] hover:bg-[#E64500]"
              >
                <MessageSquare size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}