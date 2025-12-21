import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ClipboardCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentoradoExecucao() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to={createPageUrl("Dashboard")}
          className="inline-flex items-center gap-2 text-[#FF4D00] hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
        
        <div className="text-center py-16">
          <ClipboardCheck size={64} className="mx-auto mb-4 text-[#FF4D00]" />
          <h1 className="text-3xl font-bold mb-4">Execução de Checklists</h1>
          <p className="text-white/70">Área em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}