import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PullToRefresh from "@/components/PullToRefresh";
import { createPageUrl } from "./utils";
import {
  Users, BookOpen, Library, Calendar, Lightbulb,
  LayoutDashboard, X, ChevronRight, ChevronLeft, ClipboardList,
  GitBranch, Zap, Brain, FileText, ChefHat, MoreHorizontal, Wand2, Activity
} from "lucide-react";
import AssistenteIAGlobal from "@/components/AssistenteIAGlobal";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const rootPages = ["Dashboard", "Mentorados", "AulasMentoria", "ExecucaoInteligente",
    "FluxogramasOperacionais", "GestaoFinanceira", "Cursos", "Biblioteca",
    "Agenda", "Notas", "AnaliseGargalos", "KitDocumentos", "FichasTecnicas",
    "Automacoes", "PerfilMentorado", "GeradorKits"];
  const isRootPage = rootPages.includes(currentPageName) || location.pathname === "/";

  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    base44.auth.me().then(user => { setUserEmail(user?.email); setUserRole(user?.role); }).catch(() => {});
  }, []);

  const allNavigation = [
    { name: "Monitoramento", page: "CentralMonitoramento", icon: Activity, adminOnly: true },
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
    { name: "Encontros", page: "Encontros", icon: Calendar, adminOnly: true },
    { name: "Gerador Kits", page: "GeradorKits", icon: Wand2, adminOnly: true },
    { name: "Integrações", page: "Integracoes", icon: Zap, adminOnly: true },
    { name: "Perfil", page: "PerfilMentorado", icon: Users, mentoradoOnly: true },
  ];

  const navigation = allNavigation.filter(item => {
    const isAdmin = userRole === 'admin';
    if (item.adminOnly) return isAdmin;
    if (item.mentoradoOnly) return !isAdmin;
    return true;
  });

  const bottomTabs = navigation.slice(0, 4);
  const moreItems = navigation.slice(4);

  return (
    <div className="min-h-screen bg-black text-white" style={{ overscrollBehaviorY: 'none' }}>
      <style>{`
        :root { --accent: #7c6bff; }
        body { font-family: 'DM Sans', sans-serif !important; overscroll-behavior-y: none; -webkit-font-smoothing: antialiased; }

        /* Safe area */
        @supports (padding: env(safe-area-inset-top)) {
          .safe-top { padding-top: env(safe-area-inset-top); }
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        }

        /* Touch targets */
        table button, table a, table [role="checkbox"],
        [role="row"] button, [role="row"] a,
        .touch-target { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; }

        button, a, nav, [role="tab"] {
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Premium nav hover */
        .nav-item-hover:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>

      {/* ── DESKTOP: Sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 flex-col z-40"
        style={{ background: 'linear-gradient(180deg, #08080f 0%, #06060d 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c6bff 0%, #9b8fff 100%)', boxShadow: '0 4px 16px rgba(124,107,255,0.4)' }}>
              <span className="text-white font-black text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>D</span>
            </div>
            <div>
              <h1 className="font-bold text-[15px] tracking-tight leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Delivery Pro</h1>
              <p className="text-[10px] text-white/30 mt-0.5 tracking-widest uppercase">Gestão de Mentorias</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 group relative ${
                  isActive ? "text-white" : "text-white/45 nav-item-hover hover:text-white/80"
                }`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(124,107,255,0.18) 0%, rgba(124,107,255,0.08) 100%)",
                  boxShadow: "0 2px 12px rgba(124,107,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
                  border: "1px solid rgba(124,107,255,0.3)"
                } : {}}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-[#7c6bff]" />
                )}
                <item.icon size={17} className={`flex-shrink-0 ${isActive ? "text-[#7c6bff]" : "group-hover:text-white/70 transition-colors"}`} />
                <span className={`text-[13px] font-medium flex-1`}>{item.name}</span>
                {isActive && <ChevronRight size={13} className="text-[#7c6bff]/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="px-3.5 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">Sistema Interno</p>
            <p className="text-[12px] font-medium text-white/50">Uso exclusivo do mentor</p>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: Top Header ───────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 safe-top"
        style={{ background: 'rgba(8,8,15,0.95)', backdropFilter: 'blur(20px) saturate(1.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-2" style={{ minHeight: 52 }}>
          {!isRootPage ? (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-0.5 text-[#7c6bff] active:opacity-50"
              style={{ minHeight: 44, minWidth: 44 }}
              aria-label="Voltar"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
              <span className="text-[16px] font-medium">Voltar</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c6bff 0%, #9b8fff 100%)' }}>
                <span className="text-white font-black text-xs" style={{ fontFamily: 'Syne, sans-serif' }}>D</span>
              </div>
              <span className="font-semibold text-[15px] tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Delivery Pro</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            {sidebarOpen ? <X size={21} /> : <MoreHorizontal size={21} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE: Slide-up More Menu ───────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl lg:hidden"
              style={{ background: '#0d0d16', border: '1px solid rgba(255,255,255,0.08)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-3 mb-4" />
              <div className="grid grid-cols-3 gap-2 p-4">
                {moreItems.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                        isActive ? "text-white" : "text-white/45"
                      }`}
                      style={isActive ? {
                        background: "rgba(124,107,255,0.15)",
                        border: "1px solid rgba(124,107,255,0.25)"
                      } : {}}
                    >
                      <item.icon size={19} className={isActive ? "text-[#7c6bff]" : ""} />
                      <span className="text-[11px] font-medium text-center leading-tight">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE: Bottom Tab Bar ───────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{ background: 'rgba(8,8,15,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-stretch">
          {bottomTabs.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all relative"
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: '#7c6bff' }} />
                )}
                <item.icon size={21} className={isActive ? "text-[#7c6bff]" : "text-white/35"} />
                <span className={`text-[10px] font-medium leading-none ${isActive ? "text-[#7c6bff]" : "text-white/35"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            <MoreHorizontal size={21} className="text-white/35" />
            <span className="text-[10px] font-medium text-white/35 leading-none">Mais</span>
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

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/5551980814626"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 whatsapp-pulse"
        style={{
          background: 'linear-gradient(135deg, #25D366 0%, #1da851 100%)',
        }}
        aria-label="Fale no WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="26" height="26" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.002 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.34.634 4.596 1.84 6.562L2.667 29.333l6.97-1.824A13.267 13.267 0 0 0 16.002 29.333c7.363 0 13.331-5.97 13.331-13.333S23.365 2.667 16.002 2.667zm0 24.267a11.06 11.06 0 0 1-5.64-1.543l-.404-.24-4.136 1.082 1.104-4.026-.264-.415A11.04 11.04 0 0 1 4.934 16c0-6.106 4.964-11.067 11.068-11.067S27.07 9.894 27.07 16 22.108 26.934 16.002 26.934zm6.07-8.28c-.33-.165-1.956-.965-2.26-1.074-.305-.11-.526-.165-.748.165-.22.33-.855 1.074-1.047 1.296-.193.22-.385.247-.715.082-.33-.165-1.393-.513-2.652-1.636-.98-.874-1.641-1.953-1.834-2.284-.193-.33-.02-.508.145-.672.15-.148.33-.385.495-.578.165-.193.22-.33.33-.55.11-.22.055-.413-.027-.578-.083-.165-.748-1.804-1.025-2.47-.27-.648-.545-.56-.748-.57l-.637-.01c-.22 0-.578.082-.882.413-.303.33-1.156 1.13-1.156 2.756 0 1.626 1.183 3.196 1.348 3.416.165.22 2.328 3.553 5.642 4.984.789.34 1.405.543 1.885.695.792.252 1.513.216 2.082.131.635-.094 1.956-.8 2.232-1.572.275-.77.275-1.43.193-1.568-.082-.138-.303-.22-.633-.386z"/>
        </svg>
      </a>
    </div>
  );
}