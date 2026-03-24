import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * Shows a native-style back button on mobile only when there's history to go back to.
 * label: optional page name to show next to the arrow (like iOS)
 */
export default function NativeBackButton({ label = "Voltar" }) {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;

  if (!canGoBack) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="lg:hidden flex items-center gap-0.5 text-[#7c6bff] active:opacity-60 transition-opacity"
      style={{ minHeight: 44, minWidth: 44, paddingLeft: 0 }}
      aria-label="Voltar"
    >
      <ChevronLeft size={28} strokeWidth={2} />
      <span className="text-[17px] font-normal">{label}</span>
    </button>
  );
}