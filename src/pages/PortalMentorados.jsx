import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function PortalMentorados() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function buscarMentorado() {
      try {
        const user = await base44.auth.me();
        
        // Se for admin, redirecionar para dashboard
        if (user.role === "admin") {
          navigate(createPageUrl("Dashboard"));
          return;
        }

        // Buscar mentorado pelo email
        const mentorados = await base44.entities.Mentorado.filter({ email: user.email });

        if (mentorados && mentorados.length > 0) {
          // Redirecionar para página de detalhe do mentorado
          navigate(createPageUrl(`MentoradoDetalhe?id=${mentorados[0].id}`));
        } else {
          setError("Nenhum perfil de mentorado encontrado para seu email.");
          setLoading(false);
        }
      } catch (err) {
        setError("Erro ao buscar perfil: " + err.message);
        setLoading(false);
      }
    }

    buscarMentorado();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#FF4D00] animate-spin mx-auto mb-4" />
          <p className="text-white">Carregando sua área...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-lg mb-2">{error}</p>
          <p className="text-white/30 text-sm">Entre em contato com seu mentor.</p>
        </div>
      </div>
    );
  }

  return null;
}