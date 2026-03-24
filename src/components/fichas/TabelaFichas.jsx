import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer, Pizza, Save } from "lucide-react";
import { toast } from "sonner";

// Input inline genérico
function InlineInput({ value, onChange, style = {}, type = "text", autoFocus = false }) {
  const [draft, setDraft] = useState(value);
  const ref = useRef();

  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  const commit = () => onChange(draft);
  return (
    <input
      ref={ref}
      type={type}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') { commit(); ref.current?.blur(); } if (e.key === 'Escape') { setDraft(value); ref.current?.blur(); } }}
      style={{
        background: 'transparent', border: 'none', outline: 'none',
        padding: '0 2px', fontFamily: 'inherit', fontSize: 'inherit',
        fontWeight: 'inherit', color: 'inherit',
        borderBottom: '1px solid rgba(255,200,0,0.4)',
        width: type === 'number' ? 50 : '100%',
        minWidth: type === 'number' ? 30 : undefined,
        ...style
      }}
    />
  );
}

// Linha de ingrediente
function IngRow({ ing, fichaIdx, tamIdx, ingIdx, setFichas }) {
  const [hover, setHover] = useState(false);
  const [editQtd, setEditQtd] = useState(false);
  const [editNome, setEditNome] = useState(false);

  const update = (field, val) => {
    setFichas(prev => {
      const next = structuredClone(prev);
      next[fichaIdx].tamanhos[tamIdx].ingredientes[ingIdx][field] = val;
      return next;
    });
  };

  const del = () => {
    setFichas(prev => {
      const next = structuredClone(prev);
      next[fichaIdx].tamanhos[tamIdx].ingredientes.splice(ingIdx, 1);
      return next;
    });
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, lineHeight: 1.5, position: 'relative' }}
    >
      <span style={{ color: '#FFD700', fontWeight: 700 }}>+</span>
      {editQtd ? (
        <InlineInput
          value={ing.qtd || ''}
          type="text"
          autoFocus
          style={{ color: '#FFD700', fontWeight: 700, width: 50 }}
          onChange={v => { update('qtd', v); setEditQtd(false); }}
        />
      ) : (
        <span
          onClick={() => setEditQtd(true)}
          title="Editar quantidade"
          style={{ color: '#FFD700', fontWeight: 700, cursor: 'text', minWidth: 30 }}
        >{ing.qtd}{ing.unidade}</span>
      )}
      {editNome ? (
        <InlineInput
          value={ing.nome || ''}
          autoFocus
          style={{ color: '#ccc', flex: 1 }}
          onChange={v => { update('nome', v); setEditNome(false); }}
        />
      ) : (
        <span
          onClick={() => setEditNome(true)}
          title="Editar nome"
          style={{ color: '#ccc', cursor: 'text', flex: 1 }}
        >{ing.nome}</span>
      )}
      {hover && (
        <button
          onClick={del}
          title="Remover ingrediente"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: 11, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
        >×</button>
      )}
    </div>
  );
}

export default function TabelaFichas() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [fichas, setFichas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const queryClient = useQueryClient();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefing } = useQuery({
    queryKey: ["briefing", mentoradoId],
    queryFn: () => base44.entities.Briefing.filter({ mentorado_id: mentoradoId }),
    select: d => d[0], enabled: !!mentoradoId
  });

  useEffect(() => {
    if (briefing?.fichas_tecnicas) setFichas(structuredClone(briefing.fichas_tecnicas));
  }, [briefing]);

  const categorias = [...new Set(fichas.map(f => f.categoria || "Sem categoria"))];

  const salvar = async () => {
    if (!briefing?.id) return;
    setSalvando(true);
    await base44.entities.Briefing.update(briefing.id, { fichas_tecnicas: fichas });
    queryClient.invalidateQueries(["briefing", mentoradoId]);
    setSalvando(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2000);
    toast.success("Fichas salvas!");
  };

  const addIngrediente = (fichaIdx, tamIdx) => {
    setFichas(prev => {
      const next = structuredClone(prev);
      next[fichaIdx].tamanhos[tamIdx].ingredientes = [
        ...(next[fichaIdx].tamanhos[tamIdx].ingredientes || []),
        { qtd: '', unidade: '', nome: '' }
      ];
      return next;
    });
  };

  const deleteSabor = (fichaIdx) => {
    setFichas(prev => prev.filter((_, i) => i !== fichaIdx));
  };

  const addSabor = (cat) => {
    const tamNomes = fichas.length > 0
      ? [...new Set(fichas.flatMap(f => f.tamanhos?.map(t => t.nome) || []))]
      : [];
    const newFicha = {
      id: `new_${Date.now()}`,
      nome_produto: 'Novo Sabor',
      categoria: cat,
      tamanhos: tamNomes.map(n => ({ nome: n, ingredientes: [] }))
    };
    setFichas(prev => [...prev, newFicha]);
  };

  const handlePrint = () => {
    const rows = categorias.map(cat => {
      const fichasCat = fichas.filter(f => (f.categoria || "Sem categoria") === cat);
      const tamCat = [...new Set(fichasCat.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];
      return `
        <p class="cat-title">${cat}</p>
        <table><thead><tr>
          <th style="background:#1a1a1a;color:#E8601C;text-align:left;min-width:100px">SABOR</th>
          ${tamCat.map(t => `<th style="background:#E8601C;color:#fff;text-align:center">${t}</th>`).join('')}
        </tr></thead><tbody>
        ${fichasCat.map((f, fi) => `<tr style="background:${fi%2===0?'#0f0f14':'#0a0a0f'}">
          <td style="background:#111;color:#fff;font-weight:700">${f.nome_produto}</td>
          ${tamCat.map(tn => {
            const t = f.tamanhos?.find(x => x.nome === tn);
            return `<td>${t ? (t.ingredientes||[]).map(i =>
              `<div><span style="color:#FFD700;font-weight:700">+${i.qtd}${i.unidade||''} </span><span style="color:#ccc">${i.nome}</span></div>`
            ).join('') : '<span style="color:#ffffff15">—</span>'}</td>`;
          }).join('')}
        </tr>`).join('')}
        </tbody></table>`;
    }).join('');
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Fichas</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0} body{font-family:Arial,sans-serif;background:#0a0a0f;color:#fff}
  @page{size:A3 landscape;margin:10mm}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  table{width:100%;border-collapse:collapse;font-size:9px;margin-bottom:20px}
  th,td{padding:6px;border:1px solid rgba(255,255,255,0.1);vertical-align:top}
  .cat-title{color:#E8601C;font-size:13px;font-weight:900;margin:14px 0 6px;border-bottom:2px solid #E8601C;padding-bottom:3px}
</style></head><body>${rows}
<script>setTimeout(()=>{window.print();window.close();},600)<\/script>
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
          <Button onClick={salvar} disabled={salvando} variant="outline" className="border-white/20 text-white hover:bg-white/10 shrink-0">
            <Save size={14} className="mr-1" />
            {savedOk ? '✅ Salvo!' : salvando ? 'Salvando...' : '💾 Salvar'}
          </Button>
          <Button onClick={handlePrint} className="bg-[#FF4D00] hover:bg-[#E64500] shrink-0">
            <Printer size={14} className="mr-1" /> 🖨️ Imprimir
          </Button>
        </div>
      </div>

      {/* Tabela por categoria */}
      <div className="overflow-x-auto">
        {categorias.map(cat => {
          const fichasCat = fichas.filter(f => (f.categoria || "Sem categoria") === cat);
          const tamCat = [...new Set(fichasCat.flatMap(f => f.tamanhos?.map(t => t.nome) || []))];

          return (
            <div key={cat} className="mb-8">
              <p className="text-sm font-black text-[#E8601C] uppercase tracking-widest mb-3 pb-2 border-b border-[#E8601C]/30">{cat}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{ background: '#1a1a1a', color: '#E8601C', padding: '10px 14px', textAlign: 'left', fontWeight: 900, fontSize: 12, border: '1px solid rgba(232,96,28,0.2)', minWidth: 120 }}>SABOR</th>
                    {tamCat.map(tam => (
                      <th key={tam} style={{ background: '#E8601C', color: '#fff', padding: '7px 8px', textAlign: 'center', fontWeight: 900, fontSize: 11, border: '1px solid rgba(255,255,255,0.1)', minWidth: 150, textTransform: 'uppercase', position: 'relative' }}>
                        {tam}
                        <button
                          onClick={() => {
                            if (window.confirm(`Apagar a coluna "${tam}" de todos os sabores?`)) {
                              setFichas(prev => prev.map(f => ({ ...f, tamanhos: (f.tamanhos || []).filter(t => t.nome !== tam) })));
                            }
                          }}
                          style={{ position: 'absolute', top: 2, right: 2, background: '#cc0000', color: '#fff', border: 'none', borderRadius: '50%', width: 14, height: 14, fontSize: 9, cursor: 'pointer', lineHeight: '14px', textAlign: 'center', padding: 0, fontWeight: 'bold' }}
                        >×</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fichasCat.map((ficha, fi) => {
                    const fichaIdx = fichas.indexOf(ficha);
                    return (
                      <SaborRow
                        key={ficha.id || fi}
                        ficha={ficha}
                        fichaIdx={fichaIdx}
                        tamCat={tamCat}
                        rowBg={fi % 2 === 0 ? '#0f0f14' : '#0a0a0f'}
                        setFichas={setFichas}
                        onDelete={() => deleteSabor(fichaIdx)}
                        onAddIng={tamIdx => addIngrediente(fichaIdx, tamIdx)}
                      />
                    );
                  })}
                </tbody>
              </table>
              <button
                onClick={() => addSabor(cat)}
                style={{ marginTop: 6, background: 'rgba(232,96,28,0.08)', border: '1px dashed rgba(232,96,28,0.35)', borderRadius: 6, padding: '5px 14px', color: '#E8601C', cursor: 'pointer', fontSize: 12, width: '100%' }}
              >＋ Novo sabor</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SaborRow({ ficha, fichaIdx, tamCat, rowBg, setFichas, onDelete, onAddIng }) {
  const [hover, setHover] = useState(false);
  const [editNome, setEditNome] = useState(false);

  const updateNome = (val) => {
    setFichas(prev => {
      const next = structuredClone(prev);
      next[fichaIdx].nome_produto = val;
      return next;
    });
    setEditNome(false);
  };

  return (
    <tr
      style={{ background: rowBg }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Célula sabor */}
      <td style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', background: '#111', color: '#fff', fontWeight: 700, fontSize: 12, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {editNome ? (
            <InlineInput
              value={ficha.nome_produto || ''}
              autoFocus
              style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}
              onChange={updateNome}
            />
          ) : (
            <span onClick={() => setEditNome(true)} style={{ cursor: 'text', flex: 1 }} title="Clique para editar">{ficha.nome_produto}</span>
          )}
          {hover && (
            <button onClick={onDelete} title="Remover sabor" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: 14, lineHeight: 1, flexShrink: 0 }}>×</button>
          )}
        </div>
      </td>
      {/* Células de tamanho */}
      {tamCat.map((tam, tamIdx) => {
        const tamanho = ficha.tamanhos?.find(t => t.nome === tam);
        const realTamIdx = ficha.tamanhos?.findIndex(t => t.nome === tam);
        return (
          <td key={tam} style={{ padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top', background: rowBg }}>
            {tamanho && realTamIdx !== -1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(tamanho.ingredientes || []).map((ing, ingIdx) => (
                  <IngRow key={ingIdx} ing={ing} fichaIdx={fichaIdx} tamIdx={realTamIdx} ingIdx={ingIdx} setFichas={setFichas} />
                ))}
                <button
                  onClick={() => onAddIng(realTamIdx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 10, textAlign: 'left', padding: '2px 0', marginTop: 2 }}
                >+ add</button>
              </div>
            ) : (
              <span style={{ color: '#ffffff15', fontSize: 10 }}>—</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}