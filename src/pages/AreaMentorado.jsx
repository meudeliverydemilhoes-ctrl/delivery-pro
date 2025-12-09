import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText, ClipboardCheck, UtensilsCrossed, GitBranch,
  LayoutDashboard, ListTodo, StickyNote, Files, ChefHat,
  TrendingUp, Target, Users
} from "lucide-react";

export default function AreaMentorado() {
  const [user, setUser] = React.useState(null);
  const [mentorado, setMentorado] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mentoradoIdFromUrl = urlParams.get("id");

    base44.auth.me().then(async (userData) => {
      setUser(userData);
      
      if (mentoradoIdFromUrl) {
        const mentoradoEspecifico = await base44.entities.Mentorado.filter({ id: mentoradoIdFromUrl });
        if (mentoradoEspecifico.length > 0) {
          const m = mentoradoEspecifico[0];
          if (m.email === userData.email || userData.role === 'admin') {
            setMentorado(m);
          }
        }
      } else {
        const mentorados = await base44.entities.Mentorado.filter({ email: userData.email });
        if (mentorados.length > 0) {
          setMentorado(mentorados[0]);
        }
      }
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-white/50">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-white/50">Você precisa estar logado.</p>
      </div>
    );
  }

  if (!mentorado) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-white/50">Acesso negado ou perfil não encontrado.</p>
        <p className="text-white/30 mt-2">Entre em contato com seu mentor.</p>
      </div>
    );
  }

  const mentoradoId = mentorado.id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-[#FF4D00]/20 rounded-2xl flex items-center justify-center">
              <span className="text-[#FF4D00] font-bold text-3xl">
                {mentorado.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">Olá, {mentorado.nome}!</h1>
              <p className="text-white/60">{mentorado.negocio}</p>
              <div className="mt-3">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {mentorado.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seções */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acesse suas áreas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link to={createPageUrl(`Fornecedores?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <Users size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Fornecedores</span>
          </Link>
          <Link to={createPageUrl(`MentoradoBriefing?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <FileText size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Briefing</span>
          </Link>
          <Link to={createPageUrl(`MentoradoDiagnostico?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <ClipboardCheck size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Diagnóstico</span>
          </Link>
          <Link to={createPageUrl(`MentoradoCardapio?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <UtensilsCrossed size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Cardápio</span>
          </Link>
          <Link to={createPageUrl(`MentoradoFluxogramas?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <GitBranch size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Fluxogramas</span>
          </Link>
          <Link to={createPageUrl(`MentoradoPainel?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <LayoutDashboard size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Painel</span>
          </Link>
          <Link to={createPageUrl(`MentoradoPilares?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <Target size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Pilares</span>
          </Link>
          <Link to={createPageUrl(`MentoradoTarefas?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <ListTodo size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Tarefas</span>
          </Link>
          <Link to={createPageUrl(`MentoradoNotas?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <StickyNote size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Notas</span>
          </Link>
          <Link to={createPageUrl(`MentoradoArquivos?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <Files size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Arquivos</span>
          </Link>
          <Link to={createPageUrl(`MentoradoFichasTecnicas?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <ChefHat size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Fichas Técnicas</span>
          </Link>
          <Link to={createPageUrl(`MentoradoEvolucao?id=${mentoradoId}`)} className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 hover:bg-[#FF4D00]/20 border border-white/10 hover:border-[#FF4D00]/30 rounded-xl transition-all group">
            <TrendingUp size={28} className="text-white/50 group-hover:text-[#FF4D00]" />
            <span className="text-white text-center text-sm group-hover:text-[#FF4D00] font-medium">Evolução</span>
          </Link>
        </div>
      </div>
    </div>
  );
}