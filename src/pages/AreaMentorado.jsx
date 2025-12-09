import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText, ClipboardCheck, UtensilsCrossed, GitBranch,
  LayoutDashboard, ListTodo, StickyNote, Files, ChefHat,
  TrendingUp, Target
} from "lucide-react";

export default function AreaMentorado() {
  const [user, setUser] = React.useState(null);
  const [mentorado, setMentorado] = React.useState(null);
  const [debugInfo, setDebugInfo] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      
      // Buscar TODOS os mentorados para debug
      const todosMentorados = await base44.entities.Mentorado.list();
      
      // Tentar encontrar por email case-insensitive
      const mentoradoEncontrado = todosMentorados.find(m => 
        m.email?.toLowerCase().trim() === userData.email?.toLowerCase().trim()
      );
      
      // Salvar informações de debug
      setDebugInfo({
        emailUsuario: userData.email,
        roleUsuario: userData.role,
        totalMentorados: todosMentorados.length,
        emailsCadastrados: todosMentorados.map(m => m.email || 'vazio'),
        encontrado: !!mentoradoEncontrado
      });
      
      if (mentoradoEncontrado) {
        setMentorado(mentoradoEncontrado);
      }
    }).catch((error) => {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
    });
  }, []);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-white/50">Carregando...</p>
      </div>
    );
  }

  if (!mentorado && user && debugInfo) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="text-center mb-6">
          <p className="text-white/50">Nenhum perfil de mentorado encontrado para seu email.</p>
          <p className="text-white/30 mt-2">Entre em contato com seu mentor.</p>
        </div>
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 text-left max-w-2xl mx-auto">
          <p className="text-lg font-semibold text-white mb-4">🔍 Informações de Debug:</p>
          
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-xs text-white/40 mb-2">Seu email logado:</p>
              <p className="text-sm text-[#FF4D00] font-mono break-all">{debugInfo.emailUsuario}</p>
              <p className="text-xs text-white/40 mt-2">Email normalizado:</p>
              <p className="text-sm text-blue-400 font-mono break-all">{debugInfo.emailUsuario?.toLowerCase().trim()}</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-xs text-white/40 mb-2">Role do usuário:</p>
              <p className="text-sm text-white/70">{debugInfo.roleUsuario || 'não definido'}</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-xs text-white/40 mb-2">Total de mentorados cadastrados:</p>
              <p className="text-sm text-white/70">{debugInfo.totalMentorados}</p>
              <p className="text-xs text-white/40 mt-2">Emails cadastrados:</p>
              <div className="text-xs text-white/60 mt-1 space-y-1">
                {debugInfo.emailsCadastrados.map((email, idx) => (
                  <div key={idx} className="font-mono bg-black/20 px-2 py-1 rounded">
                    {email}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-xs text-amber-400 mb-2">💡 Próximo passo:</p>
              <p className="text-sm text-white/70">
                Entre em contato com seu mentor e informe o email: <strong className="text-[#FF4D00]">{debugInfo.emailUsuario}</strong>
              </p>
            </div>
          </div>
        </div>
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