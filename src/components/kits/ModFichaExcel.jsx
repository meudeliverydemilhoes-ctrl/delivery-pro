import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileSpreadsheet, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

let _XLSX = null;
async function getXLSX() {
  if (_XLSX) return _XLSX;
  _XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
  return _XLSX;
}

const parsear = (cell) => {
  if (!cell || cell.toString().trim() === '') return [];
  const texto = cell.toString();
  const partes = texto.split(';').map(p => p.trim()).filter(p => p !== '');
  return partes
    .filter(p => !['PEQUENA','GRANDE','FAMÍLIA','FAMILIA','MÉDIO','MEDIO','PEQUENO','FAMILY'].includes(p.toUpperCase().trim()))
    .map(p => {
      const match = p.match(/^(\d[\d,\.]*?)\s*(?:[Gg][Rr]?\.?|[Mm][Ll]\.?|[Kk][Gg]\.?|[Uu][Nn]\.)\s+(.+)$/i);
      if (match) {
        const qtd = match[1].replace(',', '.');
        const nome = match[2].trim().toUpperCase();
        return { qtd, nome };
      }
      return { qtd: '', nome: p.trim().toUpperCase() };
    })
    .filter(ing => ing.nome !== '');
};
    });
};

const imprimir = (titulo) => {
  const html = document.getElementById('ficha-preview').innerHTML;
  const w = window.open('', '_blank', 'width=1400,height=900');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Ficha Técnica</title>
  <style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;margin:0;padding:0;box-sizing:border-box;}body{background:#000!important;font-family:Arial,sans-serif;}@page{size:landscape;margin:6mm;}@media print{body{background:#000!important;}}</style>
  </head><body>${html}<script>setTimeout(()=>{window.print();},400);<\/script></body></html>`);
  w.document.close();
};

export default function ModFichaExcel() {
  const [titulo, setTitulo] = useState("PIZZAS SALGADAS");
  const [mentoradoId, setMentoradoId] = useState("");
  const [headers, setHeaders] = useState([]);
  const [sabores, setSabores] = useState([]);
  const inputRef = useRef();

  const { data: mentorados = [] } = useQuery({ queryKey: ["mentorados"], queryFn: () => base44.entities.Mentorado.list() });
  const mentoradoObj = mentorados.find(m => m.id === mentoradoId);
  const nomeNegocio = mentoradoObj?.negocio || "";

  const lerExcel = async (file) => {
    const XLSX = await getXLSX();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        setHeaders(rows[0].filter(h => h && h.toString().trim() !== ''));
        setSabores(rows.slice(1).filter(r => r[0] && r[0].toString().trim() !== ''));
      } catch (err) {
        alert('Erro ao ler o arquivo. Verifique se é um .xlsx válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
      {/* Formulário */}
      <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold">Configuração</h3>
        <div>
          <Label className="text-white/60 text-sm">Mentorado</Label>
          <select value={mentoradoId} onChange={e => setMentoradoId(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm">
            <option value="" style={{ background: "#111" }}>Selecione...</option>
            {mentorados.map(m => <option key={m.id} value={m.id} style={{ background: "#111" }}>{m.nome} — {m.negocio}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-white/60 text-sm">Título da Ficha</Label>
          <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: PIZZAS SALGADAS"
            className="bg-white/5 border-white/10 text-white mt-1" />
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDrop={e => { e.preventDefault(); lerExcel(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-[#E8601C]/60 hover:bg-[#E8601C]/5 transition-all"
        >
          <FileSpreadsheet size={40} className="mx-auto text-white/30 mb-2" />
          <p className="text-white font-semibold">📊 Arraste o Excel aqui ou clique</p>
          <p className="text-white/30 text-xs mt-1">Aceita .xlsx e .xls</p>
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={e => { if (e.target.files[0]) lerExcel(e.target.files[0]); }} />

        {sabores.length > 0 && (
          <div className="space-y-2">
            <p className="text-[#10B981] text-sm font-semibold">✅ {sabores.length} sabores · {headers.slice(1).length} tamanhos carregados</p>
            <Button onClick={() => { setHeaders([]); setSabores([]); }} variant="ghost" className="text-white/40 text-xs gap-1 w-full">
              <RefreshCw size={12} /> Carregar novo arquivo
            </Button>
            <Button onClick={() => imprimir(titulo)} className="w-full bg-[#E8601C] hover:bg-[#d45218] text-white font-bold">
              <Printer size={16} className="mr-2" />🖨️ Imprimir Ficha Técnica
            </Button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        {sabores.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-white/20 text-sm">Preview aparece após upload</div>
        ) : (
          <div id="ficha-preview" style={{ background: '#000', padding: '4px', fontFamily: 'Arial,sans-serif' }}>
            <div style={{ background: '#000', color: '#FFD700', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', padding: '10px', border: '1px solid #333', letterSpacing: '1px' }}>
              FICHA TÉCNICA — {titulo.toUpperCase()}
            </div>
            <div style={{ background: '#111', color: '#666', textAlign: 'center', fontSize: '9px', padding: '3px', borderBottom: '1px solid #222', marginBottom: '2px' }}>
              {nomeNegocio?.toUpperCase()} · MATERIAL EXCLUSIVO DE MENTORIA PREMIUM
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr>
                  <th style={{ background: '#1A1A1A', color: '#fff', padding: '7px 8px', border: '1px solid #2A2A2A', textAlign: 'center', fontWeight: 'bold', minWidth: '100px' }}>SABOR</th>
                  {headers.slice(1).map((h, i) => (
                    <th key={i} style={{ background: '#E8601C', color: '#000', padding: '7px 8px', border: '1px solid #2A2A2A', textAlign: 'center', fontWeight: 'bold', minWidth: '160px' }}>
                      {h.toString().toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sabores.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? '#111' : '#1C1C1C' }}>
                    <td style={{ color: '#fff', fontWeight: 'bold', padding: '5px 8px', border: '1px solid #2A2A2A', textAlign: 'center', verticalAlign: 'middle', fontSize: '9px' }}>
                      {row[0]?.toString().toUpperCase()}
                    </td>
                    {headers.slice(1).map((_, ci) => {
                      const ings = parsear(row[ci + 1]);
                      return (
                        <td key={ci} style={{ padding: '4px 6px', border: '1px solid #2A2A2A', verticalAlign: 'top', lineHeight: '1.7' }}>
                          {ings.length === 0 ? <span style={{ color: '#333' }}>—</span> :
                            ings.map((ing, ii) => (
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
                          }}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ background: '#111', color: '#444', textAlign: 'center', fontSize: '8px', padding: '4px', marginTop: '2px' }}>
              MATERIAL EXCLUSIVO DE MENTORIA PREMIUM · DELIVERY PRO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}