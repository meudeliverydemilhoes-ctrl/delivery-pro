import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer, Pizza, Save } from "lucide-react";
import { toast } from "sonner";

// Célula de sabor editável
function SaborCell({ valor, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(valor);
  const inputRef = useRef();

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const confirmar = () => {
    onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={confirmar}
        onKeyDown={e => { if (e.key === 'Enter') confirmar(); if (e.key === 'Escape') { setDraft(valor); setEditing(false); } }}
        style={{ background: '#222', color: '#fff', border: '1px solid #FF6B00', borderRadius: 4, padding: '2px 6px', width: '100%', fontSize: 12, fontWeight: 700 }}
      />
    );
  }
  return (
    <span
      onClick={() => { setDraft(valor); setEditing(true); }}
      title="Clique para editar"
      style={{ cursor: 'pointer', display: 'block', padding: '2px 4px', borderRadius: 4, border: '1px solid transparent' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#FF6B0060'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
    >
      {valor}
    </span>
  );
}

// Linha de ingrediente editável
function IngredienteRow({ ing, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draftQtd, setDraftQtd] = useState(`${ing.qtd || ''}${ing.unidade || ''}`);
  const [draftNome, setDraftNome] = useState(ing.nome || '');

  const confirmar = () => {
    onSave({ ...ing, qtd: draftQtd.replace(/[a-zA-Z]+$/, ''), unidade: draftQtd.match(/[a-zA-Z]+$/)?.[0] || ing.unidade || '', nome: draftNome });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 2 }}>
        <input
          value={draftQtd}
          onChange={e => setDraftQtd(e.target.value)}
          placeholder="qtd+un"
          style={{ background: '#222', color: '#FF6B00', border: '1px solid #FF6B00', borderRadius: 4, padding: '1px 4px', width: 60, fontSize: 10, fontWeight: 700 }}
        />
        <input
          value={draftNome}
          onChange={e => setDraftNome(e.target.value)}
          placeholder="ingrediente"
          onKeyDown={e => { if (e.key === 'Enter') confirmar(); if (e.key === 'Escape') setEditing(false); }}
          style={{ background: '#222', color: '#ccc', border: '1px solid #ffffff30', borderRadius: 4, padding: '1px 4px', flex: 1, fontSize: 10 }}
          autoFocus
        />
        <button onClick={confirmar} title="Salvar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#10B981' }}>✅</button>
        <button onClick={() => setEditing(false)} title="Cancelar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#999' }}>✕</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2, group: true }}>
      <span style={{ color: '#FF6B00', fontWeight: 700 }}>+{ing.qtd}{ing.unidade} </span>
      <span style={{ color: '#ccc', flex: 1 }}>{ing.nome}</span>
      <button onClick={() => { setDraftQtd(`${ing.qtd || ''}${ing.unidade || ''}`); setDraftNome(ing.nome || ''); setEditing(true); }} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, opacity: 0.5 }}>✏️</button>
      <button onClick={onDelete} title="Deletar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, opacity: 0.5 }}>🗑️</button>
    </div>
  );
}

export default function TabelaFichas() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [fichas, setFichas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const queryClient = useQueryClient();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0], enabled: !!mentoradoId
  });

  useEffect(() => {
    if (briefing?.fichas_tecnicas) setFichas(JSON.parse(JSON.stringify(briefing.fichas_tecnicas)));
  }, [briefing]);

  const categorias = [...new Set(fichas.map(f => f.categoria || "Sem categoria"))];

  // ── Mutations ──────────────────────────────────────────────
  const updateSabor = (fichaId, novoNome) => {
    setFichas(prev => prev.map(f => f.id === fichaId ? { ...f, nome_produto: novoNome } : f));
  };

  const updateIngrediente = (fichaId, tamNome, ingIdx, novoIng) => {
    setFichas(prev => prev.map(f => {
      if (f.id !== fichaId) return f;
      return { ...f, tamanhos: f.tamanhos?.map(t => {
        if (t.nome !== tamNome) return t;
        const ings = [...(t.ingredientes || [])];
        ings[ingIdx] = novoIng;
        return { ...t, ingredientes: ings };
      })};
    }));
  };

  const deleteIngrediente = (fichaId, tamNome, ingIdx) => {
    setFichas(prev => prev.map(f => {
      if (f.id !== fichaId) return f;
      return { ...f, tamanhos: f.tamanhos?.map(t => {
        if (t.nome !== tamNome) return t;
        const ings = [...(t.ingredientes || [])];
        ings.splice(ingIdx, 1);
        return { ...t, ingredientes: ings };
      })};
    }));
  };

  const addIngrediente = (fichaId, tamNome) => {
    setFichas(prev => prev.map(f => {
      if (f.id !== fichaId) return f;
      return { ...f, tamanhos: f.tamanhos?.map(t => {
        if (t.nome !== tamNome) return t;
        return { ...t, ingredientes: [...(t.ingredientes || []), { qtd: '', unidade: '', nome: 'Novo ingrediente' }] };
      })};
    }));
  };

  const addSabor = () => {
    const newFicha = {
      id: `new_${Date.now()}`,
      nome_produto: 'Novo Sabor',
      categoria: categorias[0] || 'Sem categoria',
      tamanhos: fichas[0]?.tamanhos?.map(t => ({ nome: t.nome, ingredientes: [] })) || []
    };
    setFichas(prev => [...prev, newFicha]);
  };

  const salvar = async () => {
    if (!briefing?.id) return;
    setSalvando(true);
    await base44.entities.Briefing.update(briefing.id, { fichas_tecnicas: fichas });
    queryClient.invalidateQueries(["briefing", mentoradoId]);
    toast.success("Alterações salvas!");
    setSalvando(false);
  };

  // ── Print ──────────────────────────────────────────────────
  const handlePrint = () => {
    // Gerar HTML da tabela a partir do estado atual
    const tabelaHTML = categorias.map(cat => {
      const fichasCat = fichas.filter(f => (f.categoria || "Sem categoria") === cat);
      const tamCat = [...new Set(fichasCat.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];
      return `
        <p class="cat-title">${cat}</p>
        <table><thead><tr>
          <th style="background:#1a1a1a;color:#FF6B00;text-align:left;">SABOR</th>
          ${tamCat.map(tam => `<th style="background:#FF6B00;color:#fff;text-align:center;">${tam}</th>`).join('')}
        </tr></thead><tbody>
        ${fichasCat.map((ficha, fi) => `<tr style="background:${fi % 2 === 0 ? '#0f0f14' : '#0a0a0f'}">
          <td style="background:#111;color:#fff;font-weight:700;font-size:12px;">${ficha.nome_produto}</td>
          ${tamCat.map(tam => {
            const tamanho = ficha.tamanhos?.find(t => t.nome === tam);
            return `<td style="vertical-align:top;">
              ${tamanho ? (tamanho.ingredientes || []).map(ing =>
                `<div><span class="qtd">+${ing.qtd}${ing.unidade} </span><span style="color:#ccc">${ing.nome}</span></div>`
              ).join('') : '<span style="color:#ffffff15">—</span>'}
            </td>`;
          }).join('')}
        </tr>`).join('')}
        </tbody></table>`;
    }).join('');

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Tabela Fichas</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #0a0a0f; color: #fff; }
  @page { size: A3 landscape; margin: 10mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px; }
  th { padding: 8px 6px; font-weight: 900; text-transform: uppercase; border: 1px solid #FF6B0030; }
  td { padding: 6px; border: 1px solid #ffffff10; vertical-align: top; font-size: 9px; }
  .qtd { color: #FF6B00; font-weight: 700; }
  .cat-title { color: #FF6B00; font-size: 14px; font-weight: 900; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #FF6B00; }
</style></head><body>${tabelaHTML}
<script>setTimeout(() => { window.print(); window.close(); }, 600);<\/script>
</body></html>`);
    w.document.close();
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
        <div className="flex gap-2">
          <Button onClick={salvar} disabled={salvando} variant="outline" className="border-white/20 text-white hover:bg-white/10 shrink-0">
            <Save size={14} className="mr-2" /> 💾 Salvar
          </Button>
          <Button onClick={handlePrint} className="bg-[#FF4D00] hover:bg-[#E64500] shrink-0">
            <Printer size={14} className="mr-2" /> 🖨️ Imprimir
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {categorias.map(cat => {
          const fichasCat = fichas.filter(f => (f.categoria || "Sem categoria") === cat);
          const tamCat = [...new Set(fichasCat.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];

          return (
            <div key={cat} className="mb-8">
              <p className="text-sm font-black text-[#FF6B00] uppercase tracking-widest mb-3 pb-2 border-b border-[#FF6B00]/30">{cat}</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#1a1a1a', color: '#FF6B00', padding: '10px 14px', textAlign: 'left', fontWeight: 900, fontSize: 12, border: '1px solid rgba(255,107,0,0.2)', minWidth: 120 }}>SABOR</th>
                      {tamCat.map(tam => (
                        <th key={tam} style={{ background: '#FF6B00', color: '#fff', padding: '10px 10px', textAlign: 'center', fontWeight: 900, fontSize: 11, border: '1px solid rgba(255,255,255,0.1)', minWidth: 160, textTransform: 'uppercase' }}>
                          {tam}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fichasCat.map((ficha, fi) => (
                      <tr key={ficha.id} style={{ background: fi % 2 === 0 ? '#0f0f14' : '#0a0a0f' }}>
                        <td style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', background: '#111', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                          <SaborCell valor={ficha.nome_produto} onChange={v => updateSabor(ficha.id, v)} />
                        </td>
                        {tamCat.map(tam => {
                          const tamanho = ficha.tamanhos?.find(t => t.nome === tam);
                          return (
                            <td key={tam} style={{ padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top', background: fi % 2 === 0 ? '#0f0f14' : '#0a0a0f' }}>
                              {tamanho ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {(tamanho.ingredientes || []).map((ing, j) => (
                                    <IngredienteRow
                                      key={j}
                                      ing={ing}
                                      onSave={novo => updateIngrediente(ficha.id, tam, j, novo)}
                                      onDelete={() => deleteIngrediente(ficha.id, tam, j)}
                                    />
                                  ))}
                                  <button
                                    onClick={() => addIngrediente(ficha.id, tam)}
                                    title="Adicionar ingrediente"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF6B00', fontSize: 11, textAlign: 'left', marginTop: 4, opacity: 0.7 }}
                                  >➕ ingrediente</button>
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

      <button
        onClick={addSabor}
        style={{ background: 'rgba(255,107,0,0.1)', border: '1px dashed rgba(255,107,0,0.4)', borderRadius: 8, padding: '8px 16px', color: '#FF6B00', cursor: 'pointer', fontSize: 13, width: '100%' }}
      >
        ➕ Adicionar sabor
      </button>
    </div>
  );
}