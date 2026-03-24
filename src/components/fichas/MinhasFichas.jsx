import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, FileText, ChefHat, Pizza, Package } from "lucide-react";
import { toast } from "sonner";

const CAT_ICON = {
  "Pizza Doce": Pizza,
  "Pizza Salgada": Pizza,
  "Hambúrguer": ChefHat,
  "Açaí": Package,
  default: ChefHat,
};

const CAT_COR = {
  "Pizza Doce": "#F97316",
  "Pizza Salgada": "#EF4444",
  "Hambúrguer": "#A855F7",
  "Açaí": "#3B82F6",
  "Marmita": "#10B981",
  default: "#6B7280",
};

function FichaCard({ ficha, onVer, onEditar, onExcluir }) {
  const Icon = CAT_ICON[ficha.categoria] || CAT_ICON.default;
  const cor = CAT_COR[ficha.categoria] || CAT_COR.default;
  const totalIngredientes = ficha.tamanhos?.reduce((acc, t) => acc + (t.ingredientes?.length || 0), 0) || 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all group">
      <div className="flex items-start gap-4">
        {ficha.foto_url
          ? <img src={ficha.foto_url} alt={ficha.nome_produto} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display = 'none'} />
          : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cor}15`, border: `1px solid ${cor}30` }}>
              <Icon size={22} style={{ color: cor }} />
            </div>
          )
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-white text-sm">{ficha.nome_produto}</h3>
            {ficha.categoria && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${cor}15`, color: cor }}>
                {ficha.categoria}
              </span>
            )}
          </div>
          <p className="text-xs text-white/40">
            {ficha.tamanhos?.length || 0} tamanho{ficha.tamanhos?.length !== 1 ? 's' : ''} · {totalIngredientes} ingrediente{totalIngredientes !== 1 ? 's' : ''}
          </p>
          {ficha.observacoes && <p className="text-xs text-white/35 mt-1 line-clamp-1">{ficha.observacoes}</p>}
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
        <Button onClick={() => onVer(ficha)} size="sm" variant="ghost" className="flex-1 text-xs text-white/60 hover:text-white hover:bg-white/5">
          <Eye size={13} className="mr-1" /> Ver
        </Button>
        <Button onClick={() => onEditar(ficha)} size="sm" variant="ghost" className="flex-1 text-xs text-white/60 hover:text-white hover:bg-white/5">
          <Pencil size={13} className="mr-1" /> Editar
        </Button>
        <Button onClick={() => onExcluir(ficha)} size="sm" variant="ghost" className="text-xs text-white/30 hover:text-red-400 hover:bg-red-500/5 px-2">
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}

function ModalVerFicha({ ficha, onClose }) {
  if (!ficha) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-zinc-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">{ficha.nome_produto}</h2>
            <p className="text-xs text-white/40">{ficha.categoria}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {ficha.tamanhos?.map((tam, i) => (
            <div key={i} className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
              <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-bold text-[#FF4D00]">{tam.nome}</span>
                <span className="text-xs text-white/40">{tam.ingredientes?.length} ingredientes</span>
              </div>
              <div className="p-3 space-y-1">
                {tam.ingredientes?.map((ing, j) => (
                  <div key={j} className="flex items-center gap-3 py-1">
                    <span className="text-sm font-bold text-white/90 w-16 text-right">+{ing.qtd}{ing.unidade}</span>
                    <span className="text-sm text-white/70">{ing.nome}</span>
                  </div>
                ))}
              </div>
              {tam.custo && <div className="px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/10 text-xs text-emerald-400">Custo estimado: R$ {tam.custo}</div>}
            </div>
          ))}
          {ficha.modo_preparo?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white/70 mb-2">Modo de Preparo</h3>
              {ficha.modo_preparo.map((p, i) => (
                <div key={i} className="flex gap-3 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#FF4D00] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-xs text-white/65">{p}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MinhasFichas({ onNova, onEditar }) {
  const [mentoradoId, setMentoradoId] = useState("");
  const [fichaVer, setFichaVer] = useState(null);
  const qc = useQueryClient();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0], enabled: !!mentoradoId
  });

  const fichas = briefing?.fichas_tecnicas || [];

  const excluirMutation = useMutation({
    mutationFn: (ficha) => {
      const novas = fichas.filter(f => f.id !== ficha.id);
      return base44.entities.Briefing.update(briefing.id, { ...briefing, fichas_tecnicas: novas });
    },
    onSuccess: () => { qc.invalidateQueries(["briefing", mentoradoId]); toast.success("Ficha excluída"); }
  });

  const handlePrintAll = () => {
    if (!fichas.length) return toast.error("Nenhuma ficha para imprimir");
    const html = fichas.map(ficha => `
      <div style="page-break-after:always;font-family:Arial;padding:16px;background:#fff;">
        <div style="background:#0a0a0f;color:#fff;padding:12px 16px;border-radius:6px 6px 0 0;display:flex;justify-content:space-between;align-items:center">
          <div><strong style="color:#FF6B00;font-size:15px">${ficha.nome_produto}</strong><br/><span style="font-size:10px;opacity:0.5">${ficha.categoria || ''}</span></div>
          <span style="font-size:10px;opacity:0.4">Ficha Técnica</span>
        </div>
        ${ficha.tamanhos?.map(t => `
          <div style="margin-top:12px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
            <div style="background:#1a1a1a;color:#FF6B00;padding:6px 12px;font-weight:700;font-size:12px">${t.nome}</div>
            ${t.ingredientes?.map((ing, j) => `
              <div style="padding:5px 12px;background:${j%2===0?'#fff':'#f9fafb'};font-size:11px;display:flex;gap:12px">
                <strong style="color:#FF6B00;width:60px">+${ing.qtd}${ing.unidade}</strong>
                <span>${ing.nome}</span>
              </div>`).join('')}
          </div>`).join('')}
      </div>`).join('');

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Fichas Técnicas</title><style>@page{size:A6;margin:6mm}body{margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${html}</body></html>`);
    w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close(); }, 500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={mentoradoId} onValueChange={setMentoradoId}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
            <SelectValue placeholder="Selecionar mentorado..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {mentorados.map(m => <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button onClick={handlePrintAll} variant="outline" className="border-white/20 text-white hover:bg-white/10" disabled={!fichas.length}>
            <FileText size={14} className="mr-1.5" /> PDF
          </Button>
          <Button onClick={() => onNova(mentoradoId)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            + Nova Ficha
          </Button>
        </div>
      </div>

      {!mentoradoId && (
        <div className="text-center py-14 text-white/25">
          <ChefHat size={40} className="mx-auto mb-3 opacity-20" />
          <p>Selecione um mentorado para ver as fichas</p>
        </div>
      )}

      {mentoradoId && fichas.length === 0 && (
        <div className="text-center py-14 text-white/25">
          <Pizza size={40} className="mx-auto mb-3 opacity-20" />
          <p className="mb-4">Nenhuma ficha técnica cadastrada</p>
          <Button onClick={() => onNova(mentoradoId)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            + Criar Primeira Ficha
          </Button>
        </div>
      )}

      {fichas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fichas.map(ficha => (
            <FichaCard key={ficha.id}
              ficha={ficha}
              onVer={setFichaVer}
              onEditar={f => onEditar(f, mentoradoId, briefing)}
              onExcluir={f => { if (confirm(`Excluir "${f.nome_produto}"?`)) excluirMutation.mutate(f); }}
            />
          ))}
        </div>
      )}

      <ModalVerFicha ficha={fichaVer} onClose={() => setFichaVer(null)} />
    </div>
  );
}