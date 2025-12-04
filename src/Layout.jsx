import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
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
  GitBranch
} from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
            { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
            { name: "Mentorados", page: "Mentorados", icon: Users },
            { name: "Execução Inteligente", page: "ExecucaoInteligente", icon: ClipboardList },
            { name: "Fluxogramas", page: "FluxogramasOperacionais", icon: GitBranch },
            { name: "Cursos", page: "Cursos", icon: BookOpen },
            { name: "Biblioteca", page: "Biblioteca", icon: Library },
            { name: "Agenda", page: "Agenda", icon: Calendar },
            { name: "Notas", page: "Notas", icon: Lightbulb },
          ];

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
    </div>
  );
}