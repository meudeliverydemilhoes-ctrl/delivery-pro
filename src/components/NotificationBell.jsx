import React from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NotificationBell() {
  const { data: notificacoes = [] } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: () => base44.entities.Notificacao.filter({ lida: false }),
    refetchInterval: 30000 // Refetch a cada 30 segundos
  });

  const naoLidas = notificacoes.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Bell size={20} className="text-white" />
          {naoLidas > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4D00] rounded-full text-white text-xs flex items-center justify-center font-bold">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-zinc-900 border-white/10 text-white">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm mb-3">Notificações</h3>
          {naoLidas === 0 ? (
            <p className="text-xs text-white/50 py-4 text-center">Nenhuma notificação nova</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notificacoes.map((notif) => (
                <div key={notif.id} className="p-3 bg-white/5 rounded-lg text-xs">
                  <p className="font-medium text-white">{notif.titulo}</p>
                  <p className="text-white/60 mt-1">{notif.mensagem}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}