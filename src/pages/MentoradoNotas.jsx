import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, StickyNote } from "lucide-react";
import MinhasNotas from "@/components/mentorado/MinhasNotas";

export default function MentoradoNotas() {
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");

  const [user, setUser] = React.useState(null);
  const [hasPermission, setHasPermission] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  React.useEffect(() => {
    if (user && mentorado) {
      setHasPermission(user.role === "admin" || user.email === mentorado.email);
    }
  }, [user, mentorado]);

  if (!hasPermission) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <p className="text-white/50">Você não tem permissão para acessar esta página</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4">
          <ArrowLeft size={20} /> Voltar para {mentorado?.nome || "Mentorado"}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF4D00]/20 rounded-xl flex items-center justify-center">
            <StickyNote className="text-[#FF4D00]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notas</h1>
            <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <MinhasNotas mentoradoId={mentoradoId} />
      </div>
    </div>
  );
}