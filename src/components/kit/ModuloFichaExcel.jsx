import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Printer, Save, Loader2, FileSpreadsheet, RefreshCw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

let _XLSX = null;
async function getXLSX() {
  if (_XLSX) return _XLSX;
  _XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
  return _XLSX;
}

function parsear(celula) {
  if (!celula || celula.toString().trim() === '') return [];
  const texto = celula.toString();
  const partes = texto.split(';').map(p => p.trim()).filter(p => p !== '');
  return partes
    .filter(p => !['PEQUENA','GRANDE','FAMÍLIA','FAMILIA','MÉDIO','MEDIO','PEQUENO','FAMILY'].includes(p.toUpperCase().trim()))
    .map(p => {
      const match = p.match(/^(\d[\d,\.]*?)\s*(?:[Gg][Rr]?\.?|[Mm][Ll]\.?|[Kk][Gg]\.?|[Uu][Nn]\.)\s+(.+)$/i);
      if (match) return { qtd: match[1].replace(',', '.'), nome: match[2].trim().toUpperCase() };
      return { qtd: '', nome: p.trim().toUpperCase() };
    })
    .filter(ing => ing.nome !== '');
}

// Input inline
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
      style={{ display: 'flex', alignItems: 'center', gap: 2, lineHeight: 1.8, whiteSpace: 'nowrap' }}
    >
      {ing.qtd !== '' && <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 10 }}>+</span>}
      {ing.qtd !== '' ? (
        editQtd ? (
          <InlineInput
            value={ing.qtd}
            autoFocus
            style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 10, width: 50 }}
            onChange={v => { update('qtd', v); setEditQtd(false); }}
          />
        ) : (
          <span
            onClick={() => setEditQtd(true)}
            style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 10, cursor: 'text', minWidth: 30 }}
            title="Clique para editar quantidade"
          >{ing.qtd}g </span>
        )
      ) : null}
      {editNome ? (
        <InlineInput
          value={ing.nome}
          autoFocus
          style={{ color: '#FFFFFF', fontSize: 9.5, borderBottom: '1px solid rgba(255,255,255,0.3)', flex: 1 }}
          onChange={v => { update('nome', v); setEditNome(false); }}
        />
      ) : (
        <span
          onClick={() => setEditNome(true)}
          style={{ color: ing.qtd ? '#FFFFFF' : '#AAAAAA', fontSize: ing.qtd ? 9.5 : 9, cursor: 'text', flex: 1 }}
          title="Clique para editar nome"
        >{ing.nome}</span>
      )}
      {hover && (
        <button
          onClick={del}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: 12, lineHeight: 1, padding: '0 2px', flexShrink: 0, marginLeft: 2 }}
          title="Remover"
        >×</button>
      )}
    </div>
  );
}

// Linha de sabor
function SaborRow({ ficha, fichaIdx, tamHeaders, rowBg, setFichas }) {
  const [hover, setHover] = useState(false);
  const [editNome, setEditNome] = useState(false);

  const updateSabor = (val) => {
    setFichas(prev => { const next = structuredClone(prev); next[fichaIdx].sabor = val; return next; });
    setEditNome(false);
  };
  const deleteSabor = () => setFichas(prev => prev.filter((_, i) => i !== fichaIdx));
  const addIng = (tamIdx) => setFichas(prev => {
    const next = structuredClone(prev);
    next[fichaIdx].tamanhos[tamIdx].ingredientes.push({ qtd: '', nome: '' });
    return next;
  });

  return (
    <tr
      style={{ background: rowBg }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <td style={{ color: '#fff', fontWeight: 'bold', padding: '5px 8px', border: '1px solid #2A2A2A', textAlign: 'center', verticalAlign: 'middle', fontSize: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {editNome ? (
            <InlineInput
              value={ficha.sabor}
              autoFocus
              style={{ color: '#fff', fontWeight: 'bold', fontSize: 9, textAlign: 'center' }}
              onChange={updateSabor}
            />
          ) : (
            <span onClick={() => setEditNome(true)} style={{ cursor: 'text', flex: 1 }} title="Clique para editar">{ficha.sabor}</span>
          )}
          {hover && (
            <button onClick={deleteSabor} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: 12, flexShrink: 0 }} title="Remover sabor">×</button>
          )}
        </div>
      </td>
      {tamHeaders.map((tam, tamIdx) => {
        const tamanho = ficha.tamanhos.find(t => t.nome === tam);
        const realTamIdx = ficha.tamanhos.findIndex(t => t.nome === tam);
        return (
          <td key={tam} style={{ padding: '4px 6px', border: '1px solid #2A2A2A', verticalAlign: 'top' }}>
            {tamanho && realTamIdx !== -1 ? (
              <div>
                {(tamanho.ingredientes || []).map((ing, ingIdx) => (
                  <IngRow key={ingIdx} ing={ing} fichaIdx={fichaIdx} tamIdx={realTamIdx} ingIdx={ingIdx} setFichas={setFichas} />
                ))}
                <button
                  onClick={() => addIng(realTamIdx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 9, padding: '1px 0', marginTop: 2 }}
                >+ add</button>
              </div>
            ) : <span style={{ color: '#444' }}>—</span>}
          </td>
        );
      })}
    </tr>
  );
}

export default function ModuloFichaExcel() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [titulo, setTitulo] = useState("PIZZAS SALGADAS");
  const [tamHeaders, setTamHeaders] = useState([]);
  const [fichas, setFichas] = useState([]); // [{sabor, tamanhos:[{nome, ingredientes:[{qtd,nome}]}]}]
  const [carregado, setCarregado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const inputRef = useRef();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const { data: briefings = [] } = useQuery({ queryKey: ["briefings-all"], queryFn: () => base44.entities.Briefing.list() });
  const queryClient = useQueryClient();

  const mentoradoSelecionado = mentorados.find(m => m.id === mentoradoId);
  const briefingMentorado = briefings.find(b => b.mentorado_id === mentoradoId);
  const fichasHistorico = briefingMentorado?.fichas_tecnicas || [];

  const handleFile = async (file) => {
    const XLSX = await getXLSX();
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const headers = rows[0].filter(h => h !== "");
      const tamNomes = headers.slice(1).map(h => h.toString().toUpperCase());
      setTamHeaders(tamNomes);
      const structured = rows.slice(1).filter(r => r[0] !== "").map(row => ({
        sabor: row[0]?.toString().toUpperCase(),
        tamanhos: tamNomes.map((nom, i) => ({
          nome: nom,
          ingredientes: parsear(row[i + 1])
        }))
      }));
      setFichas(structured);
      setCarregado(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const onInputChange = (e) => { const f = e.target.files[0]; if (f) handleFile(f); };
  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const resetar = () => { setTamHeaders([]); setFichas([]); setCarregado(false); if (inputRef.current) inputRef.current.value = ""; };

  const addSabor = () => {
    setFichas(prev => [...prev, {
      sabor: 'NOVO SABOR',
      tamanhos: tamHeaders.map(n => ({ nome: n, ingredientes: [] }))
    }]);
  };

  const salvar = async () => {
    if (!mentoradoId || !carregado) return;
    setSalvando(true);
    const fichaRecord = {
      id: Date.now().toString(),
      titulo: `FICHA TÉCNICA — ${titulo.toUpperCase()}`,
      data_geracao: new Date().toISOString(),
      total_sabores: fichas.length,
      tamanhos: tamHeaders,
      dados: fichas.map(f => ({
        sabor: f.sabor,
        colunas: f.tamanhos.map(t => t.ingredientes)
      }))
    };
    const fichasAtuais = briefingMentorado?.fichas_tecnicas || [];
    if (briefingMentorado?.id) {
      await base44.entities.Briefing.update(briefingMentorado.id, { fichas_tecnicas: [...fichasAtuais, fichaRecord] });
    } else {
      await base44.entities.Briefing.create({ mentorado_id: mentoradoId, fichas_tecnicas: [fichaRecord] });
    }
    await queryClient.invalidateQueries({ queryKey: ["briefings-all"] });
    setSalvando(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2000);
  };

  const imprimir = () => {
    const rows = fichas.map((ficha, ri) => `
      <tr style="background:${ri % 2 === 0 ? '#111111' : '#1C1C1C'}">
        <td style="color:#fff;font-weight:bold;padding:5px 8px;border:1px solid #2A2A2A;text-align:center;font-size:9px">${ficha.sabor}</td>
        ${tamHeaders.map(tam => {
          const t = ficha.tamanhos.find(x => x.nome === tam);
          return `<td style="padding:4px 6px;border:1px solid #2A2A2A;vertical-align:top;line-height:1.7">
            ${(t?.ingredientes || []).length === 0
              ? '<span style="color:#444">—</span>'
              : (t.ingredientes).map(ing => ing.qtd
                ? `<div><span style="color:#FFD700;font-weight:bold;font-size:10px">+${ing.qtd}g </span><span style="color:#FFFFFF;font-size:9.5px">${ing.nome}</span></div>`
                : `<div><span style="color:#AAAAAA;font-size:9px">${ing.nome}</span></div>`
              ).join('')
            }
          </td>`;
        }).join('')}
      </tr>`).join('');

    const win = window.open("", "_blank", "width=1200,height=800");
    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>Ficha Técnica - ${titulo}</title>
<style>
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin:0; padding:0; box-sizing:border-box; }
  body { background:#000 !important; font-family: Arial, sans-serif; }
  @page { size: landscape; margin: 6mm; }
  @media print { body { background:#000 !important; } }
  table { width:100%; border-collapse:collapse; font-size:9.5px; }
</style>
</head><body>
<div style="background:#000;color:#FFD700;text-align:center;font-weight:bold;font-size:15px;padding:8px 4px;border:1px solid #333;letter-spacing:1px">FICHA TÉCNICA — ${titulo.toUpperCase()}</div>
${mentoradoSelecionado ? `<div style="background:#111;color:#888;text-align:center;font-size:9px;padding:3px;border:1px solid #222;margin-bottom:2px">${mentoradoSelecionado.nome?.toUpperCase()} · ${mentoradoSelecionado.negocio?.toUpperCase()}</div>` : ''}
<table>
  <thead><tr>
    <th style="background:#1A1A1A;color:#fff;padding:6px 8px;border:1px solid #2A2A2A;font-weight:bold;text-align:center;width:110px">SABOR</th>
    ${tamHeaders.map(h => `<th style="background:#E8601C;color:#000;padding:6px 8px;border:1px solid #2A2A2A;font-weight:bold;text-align:center">${h}</th>`).join('')}
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div style="background:#111;color:#555;text-align:center;font-size:8px;padding:4px;border-top:1px solid #333;margin-top:2px">MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · DELIVERY PRO</div>
<script>setTimeout(function(){ window.print(); }, 500);<\/script>
</body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/60 text-sm">Mentorado</Label>
            <select value={mentoradoId} onChange={e => setMentoradoId(e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm">
              <option value="" style={{background:"#111"}}>Selecione...</option>
              {mentorados.map(m => <option key={m.id} value={m.id} style={{background:"#111"}}>{m.nome} — {m.negocio}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-white/60 text-sm">Título da Ficha</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: PIZZAS SALGADAS"
              className="bg-white/5 border-white/10 text-white mt-1" />
          </div>
        </div>

        {!carregado ? (
          <div
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:border-[#E8601C]/60 hover:bg-[#E8601C]/5 transition-all"
          >
            <FileSpreadsheet size={48} className="mx-auto text-white/30 mb-3" />
            <p className="text-white font-semibold text-lg mb-1">Arraste seu Excel aqui ou clique para selecionar</p>
            <p className="text-white/40 text-sm">Aceita .xlsx e .xls</p>
            <div className="mt-4 inline-block bg-white/5 rounded-xl px-4 py-3 text-xs text-white/40 text-left">
              <p className="font-bold text-white/60 mb-1">Formato esperado:</p>
              <p>Coluna A: Sabor | Colunas B, C, D...: Tamanhos</p>
              <p>Célula: "PEQUENA; 115 Gr Brigadeiro Preto; 35 Gr Granulado"</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl px-4 py-3">
            <span className="text-[#10B981] text-sm font-semibold">
              ✅ {fichas.length} sabores · {tamHeaders.length} tamanhos carregados
            </span>
            <Button onClick={resetar} variant="ghost" className="text-white/50 hover:text-white text-xs gap-1">
              <RefreshCw size={13} /> Carregar novo arquivo
            </Button>
          </div>
        )}
        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={onInputChange} className="hidden" />
      </div>

      {/* Preview + ações */}
      {carregado && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-white font-bold">Preview da Ficha <span className="text-white/40 text-xs font-normal">(clique nas células para editar)</span></h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={salvar} disabled={salvando || !mentoradoId} className="bg-[#10B981] hover:bg-[#059669] text-white">
                {salvando ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                {savedOk ? '✅ Salvo!' : 'Salvar no Perfil'}
              </Button>
              <Button onClick={imprimir} className="bg-[#E8601C] hover:bg-[#d45218] text-white font-bold">
                <Printer size={16} className="mr-2" />🖨️ Imprimir Ficha Técnica
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <div style={{background:"#000", padding:"4px"}}>
              <div style={{background:"#000", color:"#FFD700", textAlign:"center", fontWeight:"bold", fontSize:"15px", padding:"8px 4px", border:"1px solid #333", letterSpacing:"1px"}}>
                FICHA TÉCNICA — {titulo.toUpperCase()}
              </div>
              {mentoradoSelecionado && (
                <div style={{background:"#111", color:"#888", textAlign:"center", fontSize:"9px", padding:"3px", border:"1px solid #222", marginBottom:"2px"}}>
                  {mentoradoSelecionado.nome?.toUpperCase()} · {mentoradoSelecionado.negocio?.toUpperCase()}
                </div>
              )}
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:"9.5px", fontFamily:"Arial, sans-serif"}}>
                <thead>
                  <tr>
                    <th style={{background:"#1A1A1A", color:"#fff", padding:"6px 8px", border:"1px solid #2A2A2A", fontWeight:"bold", textAlign:"center", width:"110px", verticalAlign:"middle"}}>SABOR</th>
                    {tamHeaders.map((h, i) => (
                      <th key={i} style={{background:"#E8601C", color:"#000", padding:"7px 8px", border:"1px solid #2A2A2A", fontWeight:"bold", textAlign:"center", verticalAlign:"middle", position:"relative"}}>
                        {h}
                        <button
                          onClick={() => {
                            if (window.confirm(`Apagar a coluna "${h}" de todos os sabores?`)) {
                              setTamHeaders(prev => prev.filter((_, idx) => idx !== i));
                              setFichas(prev => prev.map(f => ({ ...f, tamanhos: f.tamanhos.filter(t => t.nome !== h) })));
                            }
                          }}
                          style={{position:'absolute', top:2, right:2, background:'#cc0000', color:'#fff', border:'none', borderRadius:'50%', width:14, height:14, fontSize:9, cursor:'pointer', lineHeight:'14px', textAlign:'center', padding:0, fontWeight:'bold'}}
                        >×</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fichas.map((ficha, ri) => (
                    <SaborRow
                      key={ri}
                      ficha={ficha}
                      fichaIdx={ri}
                      tamHeaders={tamHeaders}
                      rowBg={ri % 2 === 0 ? "#111111" : "#1C1C1C"}
                      setFichas={setFichas}
                    />
                  ))}
                </tbody>
              </table>
              <button
                onClick={addSabor}
                style={{width:"100%", background:"rgba(232,96,28,0.07)", border:"1px dashed rgba(232,96,28,0.3)", color:"#E8601C", cursor:"pointer", fontSize:11, padding:"5px", marginTop:2}}
              >＋ Novo sabor</button>
              <div style={{background:"#111", color:"#555", textAlign:"center", fontSize:"8px", padding:"4px", borderTop:"1px solid #333", marginTop:"2px"}}>
                MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · DELIVERY PRO
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      {mentoradoId && fichasHistorico.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <History size={16} className="text-white/40" /> Fichas Salvas para {mentoradoSelecionado?.nome}
          </h4>
          <div className="space-y-2">
            {fichasHistorico.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <div>
                  <p className="text-white text-sm font-semibold">{f.titulo}</p>
                  <p className="text-white/40 text-xs">{f.total_sabores} sabores · {new Date(f.data_geracao).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}