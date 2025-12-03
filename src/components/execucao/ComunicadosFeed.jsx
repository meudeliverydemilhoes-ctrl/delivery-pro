import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Bell, AlertTriangle, CheckCircle2, Info, Star, Megaphone, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoConfig = {
  aviso: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/20" },
  tarefa: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  feedback: { icon: Megaphone, color: "text-violet-400", bg: "bg-violet-500/20" },
  novidade: { icon: Star, color: "text-amber-400", bg: "bg-amber-500/20" },
  urgente: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
  parabens: { icon: Star, color: "text-pink-400", bg: "bg-pink-500/20" }
};

export default function ComunicadosFeed({ comunicados = [], mentoradoId }) {
  const queryClient = useQueryClient();

  const marcarLidoMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.ComunicadoMentoria.update(id, {
      lido: true,
      data_leitura: new Date().toISOString().split("T")[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
    }
  });

  const confirmarMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.ComunicadoMentoria.update(id, {
      confirmado: true,
      lido: true,
      data_leitura: new Date().toISOString().split("T")[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
    }
  });

  const naoLidos = comunicados.filter(c => !c.lido);
  const lidos = comunicados.filter(c => c.lido);

  if (comunicados.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-xl">
        <Bell size={40} className="mx-auto mb-3 text-white/20" />
        <p className="text-white/50">Nenhum comunicado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Não Lidos */}
      {naoLidos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
            <Bell size={14} className="text-[#FF4D00]" />
            Novos ({naoLidos.length})
          </h4>
          <div className="space-y-3">
            {naoLidos.map((com) => (
              <ComunicadoCard
                key={com.id}
                comunicado={com}
                onMarcarLido={() => marcarLidoMutation.mutate({ id: com.id })}
                onConfirmar={() => confirmarMutation.mutate({ id: com.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lidos */}
      {lidos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/40 mb-3">
            Anteriores ({lidos.length})
          </h4>
          <div className="space-y-3 opacity-70">
            {lidos.slice(0, 5).map((com) => (
              <ComunicadoCard
                key={com.id}
                comunicado={com}
                lido
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComunicadoCard({ comunicado, onMarcarLido, onConfirmar, lido }) {
  const config = tipoConfig[comunicado.tipo] || tipoConfig.aviso;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      lido 
        ? "bg-white/5 border-white/10" 
        : comunicado.tipo === "urgente"
          ? "bg-red-500/10 border-red-500/30"
          : "bg-white/5 border-[#FF4D00]/30"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon size={18} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-white">{comunicado.titulo}</h4>
            {!lido && (
              <span className="w-2 h-2 bg-[#FF4D00] rounded-full" />
            )}
          </div>
          <p className="text-sm text-white/60 mb-2">{comunicado.mensagem}</p>
          <p className="text-xs text-white/40">
            {comunicado.created_date && format(new Date(comunicado.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>

      {!lido && (
        <div className="flex gap-2 mt-3">
          {comunicado.requer_confirmacao ? (
            <Button
              onClick={onConfirmar}
              className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              size="sm"
            >
              <Check size={14} className="mr-2" />
              Confirmar Leitura
            </Button>
          ) : (
            <Button
              onClick={onMarcarLido}
              variant="outline"
              className="flex-1 border-white/10 text-white"
              size="sm"
            >
              Marcar como Lido
            </Button>
          )}
        </div>
      )}

      {lido && comunicado.requer_confirmacao && comunicado.confirmado && (
        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 size={12} />
          Confirmado em {comunicado.data_leitura && format(new Date(comunicado.data_leitura), "dd/MM/yyyy")}
        </div>
      )}
    </div>
  );
}