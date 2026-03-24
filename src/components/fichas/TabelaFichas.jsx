import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer, Pizza, Save } from "lucide-react";
import { toast } from "sonner";

// Input inline genérico
function InlineInput({ value, onChange, style = {}, type = "text", autoFocus = false }) {
  const [val, setVal] = useState(value);
  const ref = useRef();
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  const commit = () => onChange(val);
  const onKey = e => {
    if (e.key === 'Enter') { commit(); e.target.blur(); }
    if (e.key === 'Escape') { setVal(value); e.target.blur(); }
  };

  return (
    <input
      ref={ref}
      type={type}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,200,0,0.5)',
        outline: 'none',
        padding: 0,
        color: 'inherit',
        font: 'inherit',
        ...style
      }}
    />
  );
}

// Célula editável de sabor
function SaborCell({ valor, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {editing ? (
        <InlineInput
          value={valor}
          onChange={v => { onSave(v); setEditing(false); }}
          autoFocus
          style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 700, fontSize: 12, width: '100%' }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          style={{ cursor: 'text', flex: 1, color: '#fff', fontWeight: 700, fontSize: 12 }}
        >{valor || <span style={{ color: '#555' }}>Clique para editar</span>}</span>
      )}
      {hover && !editing && (
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, lineHeight: 1, padding: 0, flexShrink: 0 }}
          title="Remover sabor"
        >×</button>
      )}
    </div>
  );
}

// Linha de ingrediente
function IngredienteRow({ ing, onUpdate, onDelete }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3, minHeight: 18 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ color: '#FF6B00', fontWeight: 700, fontSize: 10 }}>+</span>
      <InlineInput
        value={`${ing.qtd || ''}${ing.unidade || ''}`}
        onChange={v => {
          const match = v.match(/^([0-9.,]*)(.*)$/);
          onUpdate({ ...ing, qtd: match?.[1] || v, unidade: match?.[2] || '' });
        }}
        style={{ width: 46, minWidth: 30, color: '#FF6B00', fontWeight: 700, fontSize: 10, borderBottom: '1px solid rgba(255,200,0,0.4)', textAlign: 'right' }}
      />
      <InlineInput
        value={ing.nome || ''}
        onChange={v => onUpdate({ ...ing, nome: v })}
        style={{ flex: 1, color: '#ccc', fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.2)', minWidth: 40 }}
      />
      {hover && (
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, lineHeight: 1, padding: 0, flexShrink: 0 }}
          title="Remover ingrediente"
        >×</button>
      )}
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

  const updateSabor = (fichaId, nome) =>
    setFichas(prev => prev.map(f => f.id === fichaId ? { ...f, nome_produto: nome } : f));

  const deleteSabor = (fichaId) =>
    setFichas(prev => prev.filter(f => f.id !== fichaId));

  const updateIngrediente = (fichaId, tamNome, idx, novoIng) =>
    setFichas(prev => prev.map(f => f.id !== fichaId ? f : {
      ...f, tamanhos: f.tamanhos?.map(t => t.nome !== tamNome ? t : {
        ...t, ingredientes: t.ingredientes.map((ing, i) => i === idx ? novoIng : ing)
      })
    }));

  const deleteIngrediente = (fichaId, tamNome, idx) =>
    setFichas(prev => prev.map(f => f.id !== fichaId ? f : {
      ...f, tamanhos: f.tamanhos?.map(t => t.nome !== tamNome ? t : {
        ...t, ingredientes: t.ingredientes.filter((_, i) => i !== idx)
      })
    }));

  const addIngrediente = (fichaId, tamNome) =>
    setFichas(prev => prev.map(f => f.id !== fichaId ? f : {
      ...f, tamanhos: f.tamanhos?.map(t => t.nome !== tamNome ? t : {
        ...t, ingredientes: [...(t.ingredientes || []), { qtd: '', unidade: '', nome: '' }]
      })
    }));

  const addSabor = () => {
    const tamCat = [...new Set(fichas.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];
    setFichas(prev => [...prev, {
      id: `new_${Date.now()}`,
      nome_produto: '',
      categoria: categorias[0] || 'Sem categoria',
      tamanhos: tamCat.map(nome => ({ nome, ingredientes: [] }))
    }]);
  };

  const salvar = async () => {
    if (!briefing?.id) return;
    setSalvando(true);
    await base44.entities.Briefing.update(briefing.id, { fichas_tecnicas: fichas });
    queryClient.invalidateQueries(["briefing", mentoradoId]);
    toast.success("Alterações salvas!");
    setSalvando(false);
  };

  const handlePrint = () => {
    const rows = categorias.map(cat => {
      const fichasCat = fichas.filter(f => (f.categoria || "Sem categoria") === cat);
      const tamCat = [...new Set(fichasCat.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];
      return `
        <p class="cat-title">${cat}</p>
        <table><thead><tr>
          <th style="background:#1a1a1a;color:#FF6B00;text-align:left;">SABOR</th>
          ${tamCat.map(t => `<th style="background:#FF6B00;color:#fff;text-align:center;">${t}</th>`).join('')}
        </tr></thead><tbody>
        ${fichasCat.map((ficha, fi) => `<tr style="background:${fi % 2 === 0 ? '#0f0f14' : '#0a0a0f'}">
          <td style="background:#111;color:#fff;font-weight:700;font-size:12px;">${ficha.nome_produto}</td>
          ${tamCat.map(tam => {
            const t = ficha.tamanhos?.find(t => t.nome === tam);
            return `<td style="vertical-align:top;">${t ? (t.ingredientes || []).map(i =>
              `<div><span style="color:#FF6B00;font-weight:700">+${i.qtd}${i.unidade} </span><span style="color:#ccc">${i.nome}</span></div>`
            ).join('') : '<span style="color:#ffffff15">—</span>'}</td>`;
          }).join('')}
        </tr>`).join('')}
        </tbody></table>`;
    }).join('');

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Fichas</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; background:#0a0a0f; color:#fff; }
  @page { size:A3 landscape; margin:10mm; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  table { width:100%; border-collapse:collapse; font-size:9px; margin-bottom:20px; }
  th { padding:8px 6px; font-weight:900; text-transform:uppercase; border:1px solid #FF6B0030; }
  td { padding:6px; border:1px solid #ffffff10; vertical-align:top; font-size:9px; }
  .cat-title { color:#FF6B00; font-size:14px; font-weight:900; margin:16px 0 8px; padding-bottom:4px; border-bottom:2px solid #FF6B00; }
</style></head><body>${rows}
<script>setTimeout(()=>{window.print();window.close();},600);<\/script>
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
      {/* Toolbar */}
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
          <Button onClick={salvar} disabled={salvando} className="bg-green-700 hover:bg-green-600 shrink-0">
            <Save size={14} className="mr-1" /> 💾 Salvar
          </Button>
          <Button onClick={handlePrint} className="bg-[#FF4D00] hover:bg-[#E64500] shrink-0">
            <Printer size={14} className="mr-1" /> 🖨️ Imprimir
          </Button>
        </div>
      </div>

      {/* Tabela */}
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
                      <th style={{ background: '#1a1a1a', color: '#FF6B00', padding: '10px 14px', textAlign: 'left', fontWeight: 900, fontSize: 12, border: '1px solid rgba(255,107,0,0.2)', minWidth: 130 }}>SABOR</th>
                      {tamCat.map(tam => (
                        <th key={tam} style={{ background: '#FF6B00', color: '#fff', padding: '10px', textAlign: 'center', fontWeight: 900, fontSize: 11, border: '1px solid rgba(255,255,255,0.1)', minWidth: 150, textTransform: 'uppercase' }}>
                          {tam}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fichasCat.map((ficha, fi) => (
                      <tr key={ficha.id} style={{ background: fi % 2 === 0 ? '#0f0f14' : '#0a0a0f' }}>
                        <td style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>
                          <SaborCell
                            valor={ficha.nome_produto}
                            onSave={v => updateSabor(ficha.id, v)}
                            onDelete={() => deleteSabor(ficha.id)}
                          />
                        </td>
                        {tamCat.map(tam => {
                          const tamanho = ficha.tamanhos?.find(t => t.nome === tam);
                          return (
                            <td key={tam} style={{ padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top', background: fi % 2 === 0 ? '#0f0f14' : '#0a0a0f' }}>
                              {tamanho ? (
                                <div>
                                  {(tamanho.ingredientes || []).map((ing, j) => (
                                    <IngredienteRow
                                      key={j}
                                      ing={ing}
                                      onUpdate={novo => updateIngrediente(ficha.id, tam, j, novo)}
                                      onDelete={() => deleteIngrediente(ficha.id, tam, j)}
                                    />
                                  ))}
                                  <button
                                    onClick={() => addIngrediente(ficha.id, tam)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 10, marginTop: 3, padding: 0 }}
                                  >+ add</button>
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
        style={{ background: 'rgba(255,107,0,0.08)', border: '1px dashed rgba(255,107,0,0.35)', borderRadius: 8, padding: '8px 16px', color: '#FF6B00', cursor: 'pointer', fontSize: 13, width: '100%' }}
      >
        ＋ Novo sabor
      </button>
    </div>
  );
}