import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  Users,
  BookOpen,
  Library,
  Calendar,
  Lightbulb,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
  GitBranch,
  Zap,
  BarChart3
} from "lucide-react";
import AssistenteIAGlobal from "@/components/AssistenteIAGlobal";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  const isMentor = user?.role === "admin";
  const isMentorado = user?.role === "user";

  // Loading inicial
  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Carregando...</p>
    </div>;
  }

  // Páginas de mentorado não precisam de autenticação pesada
  const paginasMentorado = [
    "AreaMentorado", "MentoradoBriefing", "MentoradoDiagnostico", 
    "MentoradoCardapio", "MentoradoFluxogramas", "MentoradoPainel",
    "MentoradoPilares", "MentoradoTarefas", "MentoradoNotas", 
    "MentoradoArquivos", "MentoradoFichasTecnicas", "MentoradoEvolucao",
    "Fornecedores"
  ];
  const isPaginaMentorado = paginasMentorado.includes(currentPageName);
  
  if (!user && !isPaginaMentorado) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Carregando autenticação...</p>
    </div>;
  }

  const navigationMentor = [
            { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
            { name: "Mentorados", page: "Mentorados", icon: Users },
            { name: "Aulas", page: "AulasMentoria", icon: BookOpen },
            { name: "Execução Inteligente", page: "ExecucaoInteligente", icon: ClipboardList },
            { name: "Fluxogramas", page: "FluxogramasOperacionais", icon: GitBranch },
            { name: "Detalhamento de Processos", page: "GestaoFinanceira", icon: ClipboardList },
            { name: "Cursos", page: "Cursos", icon: BookOpen },
            { name: "Biblioteca", page: "Biblioteca", icon: Library },
            { name: "Agenda", page: "Agenda", icon: Calendar },
            { name: "Notas", page: "Notas", icon: Lightbulb },
          { name: "Automações", page: "Automacoes", icon: Zap },
          { name: "Relatórios", page: "Relatorios", icon: BarChart3 },
          ];

  const navigationMentorado = [
    { name: "Minha Mentoria", page: "AreaMentorado", icon: Users },
  ];

  const navigation = isMentor ? navigationMentor : navigationMentorado;

  // Se for mentorado ou página de mentorado, não mostrar sidebar
  if (isMentorado || isPaginaMentorado) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
                    :root {
                      --orange: #FF4D00;
                      --orange-hover: #E64500;
                    }
                    .text-orange { color: var(--orange); }
                    .bg-orange { background-color: var(--orange); }
                    .border-orange { border-color: var(--orange); }
                    .hover\\:bg-orange:hover { background-color: var(--orange); }
                    .hover\\:text-orange:hover { color: var(--orange); }

                    /* All buttons - default white text on dark backgrounds */
                    button,
                    button * {
                      color: white !important;
                    }

                    /* White/outline buttons - change to orange */
                    button.bg-white,
                    button.bg-gray-100,
                    button[class*="bg-white"],
                    .bg-white button,
                    .bg-gray-100 button,
                    button[data-variant="outline"],
                    button.border-white\/10:not([class*="bg-"]),
                    button.border-white\/10,
                    a button[class*="border-white"] {
                      background-color: var(--orange) !important;
                      border-color: var(--orange) !important;
                      color: white !important;
                    }

                    button.bg-white *,
                    button.bg-gray-100 *,
                    button[class*="bg-white"] *,
                    .bg-white button *,
                    .bg-gray-100 button *,
                    button[data-variant="outline"] *,
                    button.border-white\/10:not([class*="bg-"]) * {
                      color: white !important;
                    }

                                  /* Ensure colored buttons keep white text */
                                                button.bg-\\[\\#FF4D00\\],
                                                button.bg-\\[\\#FF4D00\\] *,
                                                button.bg-emerald-500,
                                                button.bg-emerald-500 *,
                                                button.bg-red-500,
                                                button.bg-red-500 *,
                                                button.bg-blue-500,
                                                button.bg-blue-500 * {
                                                  color: white !important;
                                                }

                                                /* Calendar numbers white on mobile and desktop */
                                                [role="gridcell"],
                                                [role="gridcell"] *,
                                                .rdp-day,
                                                .rdp-day *,
                                                [class*="day"],
                                                [class*="calendar"] button,
                                                [class*="calendar"] button * {
                                                  color: white !important;
                                                }

                                                /* Links de voltar - laranja */
                                                a[class*="text-white/50"]:has(svg) {
                                                  color: var(--orange) !important;
                                                }

                                                a[class*="text-white/50"]:has(svg):hover {
                                                  color: white !important;
                                                }

                                                /* Force white text on dark backgrounds */
                                                .bg-black *:not(button.bg-white):not(button.bg-white *),
                                                .bg-zinc-900 *:not(button.bg-white):not(button.bg-white *),
                                                .bg-gray-900 *:not(button.bg-white):not(button.bg-white *),
                                                [class*="bg-black"] *:not(button.bg-white):not(button.bg-white *),
                                                [class*="bg-zinc-9"] *:not(button.bg-white):not(button.bg-white *) {
                                                  color: white !important;
                                                }

                                                /* Inputs and selects on dark backgrounds */
                                                input:not([type="checkbox"]):not([type="radio"]),
                                                textarea,
                                                select,
                                                [role="combobox"] {
                                                  color: white !important;
                                                }

                    /* Custom scrollbar */
                    ::-webkit-scrollbar { width: 6px; height: 6px; }
                    ::-webkit-scrollbar-track { background: #1a1a1a; }
                    ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
                    ::-webkit-scrollbar-thumb:hover { background: var(--orange); }
                  `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF4D00] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Delivery Pro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-white/10 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF4D00] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF4D00]/20">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">Delivery Pro</h1>
                <p className="text-xs text-white/50">Gestão de Mentorias</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/20"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-[#FF4D00]"} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="px-4 py-3 bg-white/5 rounded-xl">
              <p className="text-xs text-white/40">Sistema Interno</p>
              <p className="text-sm font-medium text-white/80">Uso exclusivo do mentor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Assistente IA Global */}
      <AssistenteIAGlobal currentPage={currentPageName} />
    </div>
  );
}