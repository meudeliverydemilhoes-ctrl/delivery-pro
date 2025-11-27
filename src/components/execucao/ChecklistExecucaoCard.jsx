import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Camera,
  Upload,
  MessageSquare,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

export default function ChecklistExecucaoCard({ execucao, onUpdate, onCreatePlanoAcao }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(null);

  const handleToggleItem = async (idx) => {
    const newItens = [...execucao.itens];
    newItens[idx] = {
      ...newItens[idx],
      concluido: !newItens[idx].concluido,
      data_conclusao: !newItens[idx].concluido ? new Date().toISOString() : null
    };

    const concluidos = newItens.filter(i => i.concluido).length;
    const progresso = Math.round((concluidos / newItens.length) * 100);
    const status = progresso === 100 ? "concluido" : progresso > 0 ? "em_andamento" : "pendente";

    onUpdate({
      itens: newItens,
      progresso,
      status,
      data_conclusao: progresso === 100 ? new Date().toISOString().split("T")[0] : null
    });
  };

  const handleUploadEvidencia = async (idx, file) => {
    setIsUploading(idx);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const newItens = [...execucao.itens];
    newItens[idx] = { ...newItens[idx], evidencia_url: file_url };
    onUpdate({ itens: newItens });
    setIsUploading(null);
  };

  const handleComentario = (idx, comentario) => {
    const newItens = [...execucao.itens];
    newItens[idx] = { ...newItens[idx], comentario };
    onUpdate({ itens: newItens });
  };

  const handleReportarProblema = (item) => {
    onCreatePlanoAcao({
      problema: `Problema no item: ${item.texto}`,
      acao: "",
      pilar: execucao.pilar,
      checklist_id: execucao.id
    });
  };

  const statusColors = {
    pendente: "bg-gray-500/20 text-gray-400",
    em_andamento: "bg-blue-500/20 text-blue-400",
    concluido: "bg-emerald-500/20 text-emerald-400",
    atrasado: "bg-red-500/20 text-red-400"
  };

  const pilarIcons = {
    processos: "🏆",
    desempenho: "📈",
    tempo_potencia: "⚡",
    norte_estrategico: "🎯",
    presenca_magnetica: "✨",
    geral: "📋"
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{pilarIcons[execucao.pilar]}</span>
            <div>
              <h4 className="font-medium text-white">{execucao.titulo}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[execucao.status]}`}>
                  {execucao.status?.replace("_", " ")}
                </span>
                {execucao.data_execucao && (
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock size={12} />
                    {format(new Date(execucao.data_execucao), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{execucao.progresso || 0}%</p>
              <Progress value={execucao.progresso || 0} className="w-24 h-2 bg-white/10" />
            </div>
            {isExpanded ? (
              <ChevronUp size={20} className="text-white/40" />
            ) : (
              <ChevronDown size={20} className="text-white/40" />
            )}
          </div>
        </div>
      </div>

      {/* Itens */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-3">
          {execucao.itens?.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl transition-colors ${
                item.concluido ? "bg-emerald-500/10" : "bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <button onClick={() => handleToggleItem(idx)} className="mt-0.5">
                  {item.concluido ? (
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  ) : (
                    <Circle size={22} className="text-white/30 hover:text-white/50" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`${item.concluido ? "text-white/50 line-through" : "text-white"}`}>
                    {item.texto}
                  </p>

                  {/* Evidência */}
                  {item.requer_evidencia && !item.concluido && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tipo_evidencia !== "comentario" && (
                        <label className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                          {isUploading === idx ? (
                            <span className="text-xs text-white/60">Enviando...</span>
                          ) : (
                            <>
                              <Upload size={14} className="text-white/60" />
                              <span className="text-xs text-white/60">
                                {item.tipo_evidencia === "foto" ? "Enviar Foto" : 
                                 item.tipo_evidencia === "video" ? "Enviar Vídeo" : "Enviar Arquivo"}
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept={item.tipo_evidencia === "foto" ? "image/*" : 
                                    item.tipo_evidencia === "video" ? "video/*" : "*"}
                            onChange={(e) => e.target.files?.[0] && handleUploadEvidencia(idx, e.target.files[0])}
                            disabled={isUploading !== null}
                          />
                        </label>
                      )}
                      {(item.tipo_evidencia === "comentario" || item.tipo_evidencia === "qualquer") && (
                        <Input
                          placeholder="Adicionar comentário..."
                          value={item.comentario || ""}
                          onChange={(e) => handleComentario(idx, e.target.value)}
                          className="bg-white/10 border-white/10 text-white text-sm h-9"
                        />
                      )}
                    </div>
                  )}

                  {/* Evidência enviada */}
                  {item.evidencia_url && (
                    <div className="mt-2">
                      <a
                        href={item.evidencia_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#FF4D00] hover:underline flex items-center gap-1"
                      >
                        <Camera size={12} /> Ver evidência
                      </a>
                    </div>
                  )}
                </div>

                {!item.concluido && (
                  <button
                    onClick={() => handleReportarProblema(item)}
                    className="text-amber-400/60 hover:text-amber-400 p-1"
                    title="Reportar problema"
                  >
                    <AlertTriangle size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Feedback do mentor */}
          {execucao.feedback_mentor && (
            <div className="p-4 bg-[#FF4D00]/10 rounded-xl border border-[#FF4D00]/20">
              <p className="text-xs text-[#FF4D00] mb-1 font-medium">Feedback do Mentor</p>
              <p className="text-sm text-white/80">{execucao.feedback_mentor}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}