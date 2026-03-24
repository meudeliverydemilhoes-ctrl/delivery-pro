import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer, Pizza } from "lucide-react";
import { toast } from "sonner";

export default function TabelaFichas() {
  const [mentoradoId, setMentoradoId] = useState("");
  const tabelaRef = useRef();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0], enabled: !!mentoradoId
  });

  const fichas = briefing?.fichas_tecnicas || [];

  // Agrupar por categoria
  const categorias = [...new Set(fichas.map(f => f.categoria || "Sem categoria"))];

  const handlePrint = () => {
    const html = tabelaRef.current?.innerHTML;
    if (!html) return;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Tabela Fichas Técnicas</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #0a0a0f; color: #fff; }
  @page { size: A3 landscape; margin: 10mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px; }
  th { background: #FF6B00; color: #fff; padding: 8px 6px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border: 1px solid #FF6B0030; }
  th:first-child { background: #1a1a1a; color: #FF6B00; text-align: left; min-width: 100px; }
  td { padding: 6px; border: 1px solid #ffffff10; vertical-align: top; font-size: 9px; }
  td:first-child { background: #111; color: #fff; font-weight: 700; font-size: 10px; }
  tr:nth-child(even) td { background: #0f0f14; }
  tr:nth-child(even) td:first-child { background: #111; }
  .qtd { color: #FF6B00; font-weight: 700; }
  .cat-title { color: #FF6B00; font-size: 14px; font-weight: 900; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #FF6B00; }
</style></head><body>${html}</body></html>`);
    w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close(); }, 600);
  };

  if (!mentoradoId || !fichas.length) {
    return (
      <div className="space-y-4">
        <Select value={mentoradoId} onValueChange={setMentoradoId}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Selecionar mentorado..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {mentorados.map(m => <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>)}
          </SelectContent>
        </Select>
        {mentoradoId && fichas.length === 0 && (
          <div className="text-center py-14 text-white/25">
            <Pizza size={40} className="mx-auto mb-3 opacity-20" />
            <p>Nenhuma ficha cadastrada. Crie na aba "Nova Ficha".</p>
          </div>
        )}
        {!mentoradoId && (
          <div className="text-center py-14 text-white/25">
            <Pizza size={40} className="mx-auto mb-3 opacity-20" />
            <p>Selecione um mentorado para ver as fichas</p>
          </div>
        )}
      </div>
    );
  }

  // Coletar todos os tamanhos únicos das fichas
  const todosOsTamanhos = [...new Set(fichas.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Select value={mentoradoId} onValueChange={setMentoradoId}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {mentorados.map(m => <SelectItem key={m.id} value={m.id} className="text-white">{m.nome} — {m.negocio}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={handlePrint} className="bg-[#FF4D00] hover:bg-[#E64500] shrink-0">
          <Printer size={14} className="mr-2" /> 🖨️ Imprimir Tabela
        </Button>
      </div>

      {/* Tabela estilo Brenda */}
      <div ref={tabelaRef} className="overflow-x-auto">
        {categorias.map(cat => {
          const fichasCat = fichas.filter(f => (f.categoria || "Sem categoria") === cat);
          // Tamanhos desta categoria
          const tamCat = [...new Set(fichasCat.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];

          return (
            <div key={cat} className="mb-8">
              <p className="text-sm font-black text-[#FF6B00] uppercase tracking-widest mb-3 pb-2 border-b border-[#FF6B00]/30 cat-title">{cat}</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#1a1a1a', color: '#FF6B00', padding: '10px 14px', textAlign: 'left', fontWeight: 900, fontSize: 12, border: '1px solid rgba(255,107,0,0.2)', minWidth: 120 }}>
                        SABOR
                      </th>
                      {tamCat.map(tam => (
                        <th key={tam} style={{ background: '#FF6B00', color: '#fff', padding: '10px 10px', textAlign: 'center', fontWeight: 900, fontSize: 11, border: '1px solid rgba(255,255,255,0.1)', minWidth: 140, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {tam}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fichasCat.map((ficha, fi) => (
                      <tr key={ficha.id} style={{ background: fi % 2 === 0 ? '#0f0f14' : '#0a0a0f' }}>
                        <td style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', background: '#111', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                          {ficha.nome_produto}
                        </td>
                        {tamCat.map(tam => {
                          const tamanho = ficha.tamanhos?.find(t => t.nome === tam);
                          return (
                            <td key={tam} style={{ padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top', background: fi % 2 === 0 ? '#0f0f14' : '#0a0a0f' }}>
                              {tamanho ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  {tamanho.ingredientes?.map((ing, j) => (
                                    <div key={j} style={{ color: '#fff', fontSize: 10, lineHeight: 1.4 }}>
                                      <span style={{ color: '#FF6B00', fontWeight: 700 }}>+{ing.qtd}{ing.unidade} </span>
                                      <span style={{ color: '#ccc' }}>{ing.nome}</span>
                                    </div>
                                  ))}
                                  {tamanho.custo && (
                                    <div style={{ marginTop: 4, color: '#10B981', fontSize: 9 }}>R$ {tamanho.custo}</div>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#ffffff15', fontSize: 10 }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}