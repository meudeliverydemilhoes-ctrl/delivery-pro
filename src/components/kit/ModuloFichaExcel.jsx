import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Printer, Save, Loader2, FileSpreadsheet, RefreshCw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// SheetJS via CDN dinâmico (evita erro de build)
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
} : { qtd: "", nome: p };
    });
}

export default function ModuloFichaExcel() {
  const [mentoradoId, setMentoradoId] = useState("");
  const [titulo, setTitulo] = useState("PIZZAS SALGADAS");
  const [headers, setHeaders] = useState([]);
  const [sabores, setSabores] = useState([]);
  const [carregado, setCarregado] = useState(false);
  const [salvando, setSalvando] = useState(false);
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
      setHeaders(rows[0].filter(h => h !== ""));
      setSabores(rows.slice(1).filter(r => r[0] !== ""));
      setCarregado(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const onInputChange = (e) => { const f = e.target.files[0]; if (f) handleFile(f); };
  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const resetar = () => { setHeaders([]); setSabores([]); setCarregado(false); if (inputRef.current) inputRef.current.value = ""; };

  const salvar = async () => {
    if (!mentoradoId || !carregado) return;
    setSalvando(true);
    const fichaRecord = {
      id: Date.now().toString(),
      titulo: `FICHA TÉCNICA — ${titulo.toUpperCase()}`,
      data_geracao: new Date().toISOString(),
      total_sabores: sabores.length,
      tamanhos: headers.slice(1),
      dados: sabores.map(r => ({
        sabor: r[0]?.toString().toUpperCase(),
        colunas: headers.slice(1).map((_, i) => parsear(r[i + 1]))
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
    alert("Ficha salva com sucesso!");
  };

  const imprimir = () => {
    const html = document.getElementById("ficha-para-imprimir").innerHTML;
    const win = window.open("", "_blank", "width=1200,height=800");
    win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Ficha Técnica - ${titulo}</title>
<style>
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin:0; padding:0; box-sizing:border-box; }
  body { background:#000 !important; font-family: Arial, sans-serif; }
  @page { size: landscape; margin: 6mm; }
  @media print { body { background:#000 !important; } .no-print { display:none; } }
</style>
</head>
<body>
${html}
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

        {/* Upload */}
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
              ✅ {sabores.length} sabores · {headers.slice(1).length} tamanhos carregados
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
            <h3 className="text-white font-bold">Preview da Ficha</h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={salvar} disabled={salvando || !mentoradoId} className="bg-[#10B981] hover:bg-[#059669] text-white">
                {salvando ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                Salvar no Perfil
              </Button>
              <Button onClick={imprimir} className="bg-[#E8601C] hover:bg-[#d45218] text-white font-bold">
                <Printer size={16} className="mr-2" />🖨️ Imprimir Ficha Técnica
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <div id="ficha-para-imprimir" style={{background:"#000", padding:"4px"}}>
              {/* Título */}
              <div style={{background:"#000", color:"#FFD700", textAlign:"center", fontWeight:"bold", fontSize:"15px", padding:"8px 4px", border:"1px solid #333", letterSpacing:"1px"}}>
                FICHA TÉCNICA — {titulo.toUpperCase()}
              </div>
              {/* Subtítulo */}
              {mentoradoSelecionado && (
                <div style={{background:"#111", color:"#888", textAlign:"center", fontSize:"9px", padding:"3px", border:"1px solid #222", marginBottom:"2px"}}>
                  {mentoradoSelecionado.nome?.toUpperCase()} · {mentoradoSelecionado.negocio?.toUpperCase()}
                </div>
              )}
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:"9.5px", fontFamily:"Arial, sans-serif"}}>
                <thead>
                  <tr>
                    <th style={{background:"#1A1A1A", color:"#fff", padding:"6px 8px", border:"1px solid #2A2A2A", fontWeight:"bold", textAlign:"center", width:"110px", verticalAlign:"middle"}}>
                      SABOR
                    </th>
                    {headers.slice(1).map((h, i) => (
                      <th key={i} style={{background:"#E8601C", color:"#000", padding:"6px 8px", border:"1px solid #2A2A2A", fontWeight:"bold", textAlign:"center", verticalAlign:"middle"}}>
                        {h.toString().toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sabores.map((row, ri) => (
                    <tr key={ri} style={{background: ri % 2 === 0 ? "#111111" : "#1C1C1C"}}>
                      <td style={{color:"#fff", fontWeight:"bold", padding:"5px 8px", border:"1px solid #2A2A2A", textAlign:"center", verticalAlign:"middle", fontSize:"9px"}}>
                        {row[0]?.toString().toUpperCase()}
                      </td>
                      {headers.slice(1).map((_, ci) => {
                        const ings = parsear(row[ci + 1]);
                        return (
                          <td key={ci} style={{padding:"4px 6px", border:"1px solid #2A2A2A", verticalAlign:"top", lineHeight:"1.7"}}>
                            {ings.length === 0
                              ? <span style={{color:"#444"}}>—</span>
                              : ings.map((ing, ii) => (
                                <div key={ii} style={{ lineHeight: '1.8', whiteSpace: 'nowrap' }}>
                                  {ing.qtd ? (
                                    <>
                                      <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '10px', letterSpacing: '0.3px' }}>+{ing.qtd}g{' '}</span>
                                      <span style={{ color: '#FFFFFF', fontWeight: 'normal', fontSize: '9.5px' }}>{ing.nome}</span>
                                    </>
                                  ) : (
                                    <span style={{ color: '#AAAAAA', fontSize: '9px' }}>{ing.nome}</span>
                                  )}
                                </div>
                              ))
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
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