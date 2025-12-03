import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";

// SWOT Analysis Component
export function AnaliseSwot({ data, onSave }) {
  const [swot, setSwot] = useState(data || {
    forcas: "",
    fraquezas: "",
    oportunidades: "",
    ameacas: ""
  });

  const quadrantes = [
    { key: "forcas", label: "💪 Forças", color: "bg-emerald-500/10 border-emerald-500/30", placeholder: "Ex: Qualidade do produto, atendimento rápido, localização..." },
    { key: "fraquezas", label: "⚠️ Fraquezas", color: "bg-red-500/10 border-red-500/30", placeholder: "Ex: CMV alto, falta de processos, equipe pequena..." },
    { key: "oportunidades", label: "🚀 Oportunidades", color: "bg-blue-500/10 border-blue-500/30", placeholder: "Ex: Novos bairros, parcerias, combos especiais..." },
    { key: "ameacas", label: "🔥 Ameaças", color: "bg-amber-500/10 border-amber-500/30", placeholder: "Ex: Concorrência, aumento de custos, sazonalidade..." }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {quadrantes.map((q) => (
          <div key={q.key} className={`p-4 rounded-xl border ${q.color}`}>
            <label className="block text-sm font-medium text-white mb-2">{q.label}</label>
            <Textarea
              value={swot[q.key]}
              onChange={(e) => setSwot({ ...swot, [q.key]: e.target.value })}
              placeholder={q.placeholder}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>
        ))}
      </div>
      <Button onClick={() => onSave?.(swot)} className="w-full bg-[#FF4D00] hover:bg-[#E64500]">
        <Save size={16} className="mr-2" /> Salvar Análise SWOT
      </Button>
    </div>
  );
}

// Ficha Técnica Component
export function FichaTecnica({ data, onSave }) {
  const [ficha, setFicha] = useState(data || {
    produto: "",
    ingredientes: [{ nome: "", quantidade: "", unidade: "g", custo: "" }],
    rendimento: "",
    custoTotal: 0,
    precoVenda: "",
    markup: 0
  });

  const addIngrediente = () => {
    setFicha({
      ...ficha,
      ingredientes: [...ficha.ingredientes, { nome: "", quantidade: "", unidade: "g", custo: "" }]
    });
  };

  const updateIngrediente = (idx, field, value) => {
    const newIngredientes = [...ficha.ingredientes];
    newIngredientes[idx] = { ...newIngredientes[idx], [field]: value };
    
    const custoTotal = newIngredientes.reduce((acc, ing) => acc + (parseFloat(ing.custo) || 0), 0);
    const markup = ficha.precoVenda ? ((parseFloat(ficha.precoVenda) / custoTotal - 1) * 100) : 0;
    
    setFicha({ ...ficha, ingredientes: newIngredientes, custoTotal, markup });
  };

  const removeIngrediente = (idx) => {
    const newIngredientes = ficha.ingredientes.filter((_, i) => i !== idx);
    setFicha({ ...ficha, ingredientes: newIngredientes });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-white/70">Nome do Produto</label>
        <Input
          value={ficha.produto}
          onChange={(e) => setFicha({ ...ficha, produto: e.target.value })}
          placeholder="Ex: Pizza Margherita Grande"
          className="bg-white/5 border-white/10 text-white mt-1"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Ingredientes</label>
        {ficha.ingredientes.map((ing, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Input
              value={ing.nome}
              onChange={(e) => updateIngrediente(idx, "nome", e.target.value)}
              placeholder="Ingrediente"
              className="flex-1 bg-white/5 border-white/10 text-white text-sm h-9"
            />
            <Input
              value={ing.quantidade}
              onChange={(e) => updateIngrediente(idx, "quantidade", e.target.value)}
              placeholder="Qtd"
              className="w-20 bg-white/5 border-white/10 text-white text-sm h-9"
            />
            <select
              value={ing.unidade}
              onChange={(e) => updateIngrediente(idx, "unidade", e.target.value)}
              className="w-16 bg-white/5 border border-white/10 text-white text-sm h-9 rounded-md"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="L">L</option>
              <option value="un">un</option>
            </select>
            <Input
              value={ing.custo}
              onChange={(e) => updateIngrediente(idx, "custo", e.target.value)}
              placeholder="R$"
              className="w-24 bg-white/5 border-white/10 text-white text-sm h-9"
            />
            <button onClick={() => removeIngrediente(idx)} className="text-red-400 hover:text-red-300 p-1">✕</button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addIngrediente} className="border-white/10 text-white">
          + Ingrediente
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white/70">Rendimento</label>
          <Input
            value={ficha.rendimento}
            onChange={(e) => setFicha({ ...ficha, rendimento: e.target.value })}
            placeholder="Ex: 1 pizza"
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Preço de Venda</label>
          <Input
            value={ficha.precoVenda}
            onChange={(e) => {
              const preco = e.target.value;
              const markup = ficha.custoTotal ? ((parseFloat(preco) / ficha.custoTotal - 1) * 100) : 0;
              setFicha({ ...ficha, precoVenda: preco, markup });
            }}
            placeholder="R$ 0,00"
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-[#FF4D00]/10 rounded-xl">
        <div>
          <p className="text-xs text-white/50">Custo Total</p>
          <p className="text-xl font-bold text-white">R$ {ficha.custoTotal.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-white/50">Markup</p>
          <p className={`text-xl font-bold ${ficha.markup >= 200 ? "text-emerald-400" : ficha.markup >= 100 ? "text-amber-400" : "text-red-400"}`}>
            {ficha.markup.toFixed(0)}%
          </p>
        </div>
      </div>

      <Button onClick={() => onSave?.(ficha)} className="w-full bg-[#FF4D00] hover:bg-[#E64500]">
        <Save size={16} className="mr-2" /> Salvar Ficha Técnica
      </Button>
    </div>
  );
}

// Simulador CMV Component
export function SimuladorCMV({ data, onSave }) {
  const [cmv, setCmv] = useState(data || {
    faturamento: "",
    custoInsumos: "",
    custoEmbalagens: "",
    outrosCustos: ""
  });

  const faturamento = parseFloat(cmv.faturamento) || 0;
  const custoTotal = (parseFloat(cmv.custoInsumos) || 0) + 
                     (parseFloat(cmv.custoEmbalagens) || 0) + 
                     (parseFloat(cmv.outrosCustos) || 0);
  const percentualCMV = faturamento ? (custoTotal / faturamento * 100) : 0;
  const lucroOperacional = faturamento - custoTotal;

  const getCMVStatus = () => {
    if (percentualCMV === 0) return { color: "text-white/50", label: "Preencha os valores" };
    if (percentualCMV <= 28) return { color: "text-emerald-400", label: "🎉 Excelente! CMV muito bom" };
    if (percentualCMV <= 35) return { color: "text-emerald-400", label: "✅ Bom! Dentro do ideal" };
    if (percentualCMV <= 40) return { color: "text-amber-400", label: "⚠️ Atenção! CMV alto" };
    return { color: "text-red-400", label: "❌ Crítico! CMV muito alto" };
  };

  const status = getCMVStatus();

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">📊 Fórmula: CMV = (Custo Insumos + Embalagens + Outros) ÷ Faturamento × 100</p>
        <p className="text-blue-300/70 text-xs mt-1">Meta ideal: entre 28% e 35%</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white/70">Faturamento Mensal</label>
          <Input
            type="number"
            value={cmv.faturamento}
            onChange={(e) => setCmv({ ...cmv, faturamento: e.target.value })}
            placeholder="R$ 50.000"
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Custo com Insumos</label>
          <Input
            type="number"
            value={cmv.custoInsumos}
            onChange={(e) => setCmv({ ...cmv, custoInsumos: e.target.value })}
            placeholder="R$ 15.000"
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Custo com Embalagens</label>
          <Input
            type="number"
            value={cmv.custoEmbalagens}
            onChange={(e) => setCmv({ ...cmv, custoEmbalagens: e.target.value })}
            placeholder="R$ 2.000"
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Outros Custos Variáveis</label>
          <Input
            type="number"
            value={cmv.outrosCustos}
            onChange={(e) => setCmv({ ...cmv, outrosCustos: e.target.value })}
            placeholder="R$ 1.000"
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl">
        <div className="text-center">
          <p className="text-xs text-white/50">Custo Total</p>
          <p className="text-lg font-bold text-white">R$ {custoTotal.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/50">CMV</p>
          <p className={`text-2xl font-bold ${status.color}`}>{percentualCMV.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/50">Lucro Operacional</p>
          <p className={`text-lg font-bold ${lucroOperacional >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            R$ {lucroOperacional.toLocaleString()}
          </p>
        </div>
      </div>

      <div className={`p-3 rounded-lg border ${
        percentualCMV <= 35 ? "bg-emerald-500/10 border-emerald-500/20" : 
        percentualCMV <= 40 ? "bg-amber-500/10 border-amber-500/20" : 
        "bg-red-500/10 border-red-500/20"
      }`}>
        <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
      </div>

      <Button onClick={() => onSave?.(cmv)} className="w-full bg-[#FF4D00] hover:bg-[#E64500]">
        <Save size={16} className="mr-2" /> Salvar Simulação
      </Button>
    </div>
  );
}

// Escala de Trabalho Component
export function EscalaTrabalho({ data, onSave }) {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const [escala, setEscala] = useState(data || {
    colaboradores: [
      { nome: "Colaborador 1", turnos: { Seg: "M", Ter: "M", Qua: "M", Qui: "M", Sex: "M", Sáb: "F", Dom: "F" } }
    ]
  });

  const turnoColors = {
    M: "bg-blue-500/30 text-blue-300",
    T: "bg-amber-500/30 text-amber-300",
    N: "bg-violet-500/30 text-violet-300",
    F: "bg-red-500/30 text-red-300",
    "": "bg-white/5 text-white/30"
  };

  const addColaborador = () => {
    setEscala({
      ...escala,
      colaboradores: [...escala.colaboradores, { nome: `Colaborador ${escala.colaboradores.length + 1}`, turnos: {} }]
    });
  };

  const updateTurno = (colabIdx, dia, turno) => {
    const newColabs = [...escala.colaboradores];
    newColabs[colabIdx] = {
      ...newColabs[colabIdx],
      turnos: { ...newColabs[colabIdx].turnos, [dia]: turno }
    };
    setEscala({ ...escala, colaboradores: newColabs });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs text-white/60">
        <span className="px-2 py-1 bg-blue-500/30 rounded">M = Manhã</span>
        <span className="px-2 py-1 bg-amber-500/30 rounded">T = Tarde</span>
        <span className="px-2 py-1 bg-violet-500/30 rounded">N = Noite</span>
        <span className="px-2 py-1 bg-red-500/30 rounded">F = Folga</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-white/60">Colaborador</th>
              {dias.map(dia => (
                <th key={dia} className="text-center p-2 text-white/60 w-12">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {escala.colaboradores.map((colab, colabIdx) => (
              <tr key={colabIdx} className="border-b border-white/5">
                <td className="p-2">
                  <Input
                    value={colab.nome}
                    onChange={(e) => {
                      const newColabs = [...escala.colaboradores];
                      newColabs[colabIdx] = { ...newColabs[colabIdx], nome: e.target.value };
                      setEscala({ ...escala, colaboradores: newColabs });
                    }}
                    className="bg-white/5 border-white/10 text-white h-8 text-sm"
                  />
                </td>
                {dias.map(dia => (
                  <td key={dia} className="p-1 text-center">
                    <select
                      value={colab.turnos[dia] || ""}
                      onChange={(e) => updateTurno(colabIdx, dia, e.target.value)}
                      className={`w-10 h-8 rounded text-xs text-center border-0 ${turnoColors[colab.turnos[dia] || ""]}`}
                    >
                      <option value="">-</option>
                      <option value="M">M</option>
                      <option value="T">T</option>
                      <option value="N">N</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={addColaborador} className="border-white/10 text-white">
        + Colaborador
      </Button>

      <Button onClick={() => onSave?.(escala)} className="w-full bg-[#FF4D00] hover:bg-[#E64500]">
        <Save size={16} className="mr-2" /> Salvar Escala
      </Button>
    </div>
  );
}

// Avaliação de Desempenho Component
export function AvaliacaoDesempenho({ data, onSave }) {
  const criterios = [
    "Assiduidade e Pontualidade",
    "Agilidade na Execução",
    "Trabalho em Equipe",
    "Qualidade no Atendimento",
    "Cumprimento de Processos",
    "Proatividade",
    "Organização e Limpeza"
  ];

  const [avaliacao, setAvaliacao] = useState(data || {
    colaborador: "",
    notas: {},
    observacoes: ""
  });

  const calcularMedia = () => {
    const notas = Object.values(avaliacao.notas).filter(n => n > 0);
    return notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : 0;
  };

  const media = calcularMedia();

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-white/70">Nome do Colaborador</label>
        <Input
          value={avaliacao.colaborador}
          onChange={(e) => setAvaliacao({ ...avaliacao, colaborador: e.target.value })}
          placeholder="Nome completo"
          className="bg-white/5 border-white/10 text-white mt-1"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm text-white/70">Critérios de Avaliação (1 a 5)</label>
        {criterios.map((criterio, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-white/80">{criterio}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(nota => (
                <button
                  key={nota}
                  onClick={() => setAvaliacao({ ...avaliacao, notas: { ...avaliacao.notas, [criterio]: nota } })}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    avaliacao.notas[criterio] === nota
                      ? nota >= 4 ? "bg-emerald-500 text-white" : nota >= 3 ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                      : "bg-white/10 text-white/50 hover:bg-white/20"
                  }`}
                >
                  {nota}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#FF4D00]/10 rounded-xl text-center">
        <p className="text-xs text-white/50">Média Geral</p>
        <p className={`text-3xl font-bold ${
          media >= 4 ? "text-emerald-400" : media >= 3 ? "text-amber-400" : "text-red-400"
        }`}>
          {media}
        </p>
      </div>

      <div>
        <label className="text-sm text-white/70">Observações</label>
        <Textarea
          value={avaliacao.observacoes}
          onChange={(e) => setAvaliacao({ ...avaliacao, observacoes: e.target.value })}
          placeholder="Pontos de melhoria, feedbacks, etc."
          className="bg-white/5 border-white/10 text-white mt-1"
        />
      </div>

      <Button onClick={() => onSave?.(avaliacao)} className="w-full bg-[#FF4D00] hover:bg-[#E64500]">
        <Save size={16} className="mr-2" /> Salvar Avaliação
      </Button>
    </div>
  );
}