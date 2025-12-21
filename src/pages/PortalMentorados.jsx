import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalMentorados() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <Users size={64} className="mx-auto mb-4 text-[#FF4D00]" />
        <h1 className="text-4xl font-bold mb-4">Portal dos Mentorados</h1>
        <p className="text-white/70 mb-8">Área em desenvolvimento</p>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="bg-[#FF4D00] hover:bg-[#E64500]">
            <ArrowRight size={20} className="mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}