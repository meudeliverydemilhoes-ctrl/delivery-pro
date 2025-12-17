import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, X, Check, CheckCheck, Trash2, Calendar, ListTodo, Users, Library, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notificacoes = [] } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: () => base44.entities.Notificacao.list("-created_date", 50),
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  const marcarLidaMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Notificacao.update(id, { 
      lida: true, 
      data_leitura: new Date().toISOString() 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    }
  });

  const marcarTodasLidasMutation = useMutation({
    mutationFn: async () => {
      const naoLidas = notificacoes.filter(n => !n.lida);
      await Promise.all(
        naoLidas.map(n => 
          base44.entities.Notificacao.update(n.id, { 
            lida: true, 
            data_leitura: new Date().toISOString() 
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    }
  });

  const deletarMutation = useMutation({
    mutationFn: (id) => base44.entities.Notificacao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    }
  });

  const handleNotificationClick = (notif) => {
    if (!notif.lida) {
      marcarLidaMutation.mutate({ id: notif.id });
    }
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida);
  const lidas = notificacoes.filter(n => n.lida);

  const tipoIcons = {
    agenda: Calendar,
    tarefa: ListTodo,
    status_mentorado: Users,
    novo_material: Library,
    geral: AlertCircle
  };

  const tipoColors = {
    agenda: "text-blue-400 bg-blue-500/20",
    tarefa: "text-amber-400 bg-amber-500/20",
    status_mentorado: "text-emerald-400 bg-emerald-500/20",
    novo_material: "text-violet-400 bg-violet-500/20",
    geral: "text-gray-400 bg-gray-500/20"
  };

  const prioridadeColors = {
    urgente: "border-l-4 border-red-500",
    alta: "border-l-4 border-amber-500",
    normal: "border-l-4 border-blue-500",
    baixa: "border-l-4 border-gray-500"
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-white" />
        {naoLidas.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4D00] rounded-full text-white text-xs flex items-center justify-center font-semibold">
            {naoLidas.length > 9 ? "9+" : naoLidas.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#FF4D00]" />
                <h3 className="font-semibold text-white">Notificações</h3>
                {naoLidas.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-[#FF4D00]/20 text-[#FF4D00] rounded-full">
                    {naoLidas.length} nova{naoLidas.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {naoLidas.length > 0 && (
                  <button
                    onClick={() => marcarTodasLidasMutation.mutate()}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[400px]">
              {notificacoes.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bell size={40} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/50 text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="p-2">
                  {naoLidas.length > 0 && (
                    <>
                      <p className="text-xs text-white/40 px-2 py-2 font-medium">Não lidas</p>
                      {naoLidas.map((notif) => {
                        const Icon = tipoIcons[notif.tipo] || AlertCircle;
                        return (
                          <div
                            key={notif.id}
                            className={`p-3 mb-2 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors group ${prioridadeColors[notif.prioridade] || prioridadeColors.normal}`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tipoColors[notif.tipo]}`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm">{notif.titulo}</p>
                                <p className="text-xs text-white/60 mt-1 line-clamp-2">{notif.mensagem}</p>
                                <p className="text-xs text-white/40 mt-2">
                                  {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true, locale: ptBR })}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletarMutation.mutate(notif.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/40 hover:text-red-400 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {lidas.length > 0 && (
                    <>
                      <p className="text-xs text-white/40 px-2 py-2 mt-4 font-medium">Lidas</p>
                      {lidas.map((notif) => {
                        const Icon = tipoIcons[notif.tipo] || AlertCircle;
                        return (
                          <div
                            key={notif.id}
                            className="p-3 mb-2 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors opacity-60 group"
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tipoColors[notif.tipo]}`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm">{notif.titulo}</p>
                                <p className="text-xs text-white/60 mt-1 line-clamp-2">{notif.mensagem}</p>
                                <p className="text-xs text-white/40 mt-2">
                                  {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true, locale: ptBR })}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletarMutation.mutate(notif.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/40 hover:text-red-400 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}