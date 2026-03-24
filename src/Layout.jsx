import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PullToRefresh from "@/components/PullToRefresh";
import { createPageUrl } from "./utils";
import {
  Users, BookOpen, Library, Calendar, Lightbulb,
  LayoutDashboard, Menu, X, ChevronRight, ClipboardList,
  GitBranch, Zap, Brain, FileText, ChefHat, MoreHorizontal
} from "lucide-react";
import AssistenteIAGlobal from "@/components/AssistenteIAGlobal";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email)).catch(() => {});
  }, []);

  const allNavigation = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
    { name: "Mentorados", page: "Mentorados", icon: Users, adminOnly: true },
    { name: "Aulas", page: "AulasMentoria", icon: BookOpen, adminOnly: true },
    { name: "Execução", page: "ExecucaoInteligente", icon: ClipboardList },
    { name: "Fluxogramas", page: "FluxogramasOperacionais", icon: GitBranch },
    { name: "Processos", page: "GestaoFinanceira", icon: ClipboardList },
    { name: "Cursos", page: "Cursos", icon: BookOpen },
    { name: "Biblioteca", page: "Biblioteca", icon: Library },
    { name: "Agenda", page: "Agenda", icon: Calendar },
    { name: "Notas", page: "Notas", icon: Lightbulb },
    { name: "Gargalos IA", page: "AnaliseGargalos", icon: Brain, adminOnly: true },
    { name: "Kit Docs", page: "KitDocumentos", icon: FileText, adminOnly: true },
    { name: "Fichas", page: "FichasTecnicas", icon: ChefHat, adminOnly: true },
    { name: "Automações", page: "Automacoes", icon: Zap, adminOnly: true },
    { name: "Perfil", page: "PerfilMentorado", icon: Users, mentoradoOnly: true },
  ];

  const navigation = allNavigation.filter(item => {
    const isAdmin = userEmail === "meudeliverydemilhoes@gmail.com";
    if (item.adminOnly) return isAdmin;
    if (item.mentoradoOnly) return !isAdmin;
    return true;
  });

  // Bottom tab bar: first 4 items + "More"
  const bottomTabs = navigation.slice(0, 4);
  const moreItems = navigation.slice(4);

  return (
    <div className="min-h-screen bg-black text-white" style={{ overscrollBehaviorY: 'none' }}>
      <style>{`
        :root { --accent: #7c6bff; }
        body { font-family: 'DM Sans', sans-serif !important; overscroll-behavior-y: none; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #7c6bff; }

        /* Safe area */
        @supports (padding: env(safe-area-inset-top)) {
          .safe-top { padding-top: env(safe-area-inset-top); }
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        }

        /* System dark mode */
        @media (prefers-color-scheme: dark) {
          :root {
            --background: 0 0% 3.9%;
            --foreground: 0 0% 98%;
            --card: 0 0% 5%;
            --border: 0 0% 14.9%;
          }
        }

        /* No select on interactive elements */
        button, a, nav, [role="tab"] {
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* ── DESKTOP: Sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 flex-col bg-black border-r border-white/10 z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: '#7c6bff', boxShadow: '0 0 20px rgba(124,107,255,0.3)' }}>
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Delivery Pro</h1>
              <p className="text-xs text-white/50">Gestão de Mentorias</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
                style={isActive ? {
                  background: "rgba(124,107,255,0.25)",
                  boxShadow: "0 0 20px rgba(124,107,255,0.15)",
                  border: "1px solid rgba(124,107,255,0.4)"
                } : {}}
              >
                <item.icon size={20} className={isActive ? "text-[#7c6bff]" : "group-hover:text-white"} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && <ChevronRight size={16} className="ml-auto text-[#7c6bff]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3 bg-white/5 rounded-xl">
            <p className="text-xs text-white/40">Sistema Interno</p>
            <p className="text-sm font-medium text-white/80">Uso exclusivo do mentor</p>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: Top Header ───────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#7c6bff' }}>
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-base tracking-tight">Delivery Pro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={22} /> : <MoreHorizontal size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE: Slide-up More Menu ───────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d14] border-t border-white/10 rounded-t-2xl lg:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />
              <div className="grid grid-cols-3 gap-2 p-4">
                {moreItems.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                        isActive ? "text-white" : "text-white/50"
                      }`}
                      style={isActive ? {
                        background: "rgba(124,107,255,0.2)",
                        border: "1px solid rgba(124,107,255,0.3)"
                      } : {}}
                    >
                      <item.icon size={20} className={isActive ? "text-[#7c6bff]" : ""} />
                      <span className="text-xs font-medium text-center leading-tight">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE: Bottom Tab Bar ───────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-white/10 safe-bottom">
        <div className="flex items-stretch">
          {bottomTabs.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
              >
                <item.icon
                  size={22}
                  className={isActive ? "text-[#7c6bff]" : "text-white/40"}
                />
                <span className={`text-[10px] font-medium leading-none ${isActive ? "text-[#7c6bff]" : "text-white/40"}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-0 h-0.5 w-8 rounded-full" style={{ background: '#7c6bff' }} />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            <MoreHorizontal size={22} className="text-white/40" />
            <span className="text-[10px] font-medium text-white/40 leading-none">Mais</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────── */}
      <main
        className="lg:ml-64 min-h-screen pt-14 pb-20 lg:pt-0 lg:pb-0 overflow-hidden"
        style={{ overscrollBehaviorY: 'none' }}
      >
        <PullToRefresh>
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-30%', opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.32, 0, 0.67, 0] }}
                style={{ willChange: 'transform' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </PullToRefresh>
      </main>

      <AssistenteIAGlobal currentPage={currentPageName} />
    </div>
  );
}