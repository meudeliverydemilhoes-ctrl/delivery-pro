import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Filter,
  Home,
  TrendingDown,
  TrendingUp,
  Minus,
  FileSpreadsheet,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categoriaLabels = {
  carnes: "🥩 Carnes",
  laticinios: "🧀 Laticínios",
  hortifruti: "🥬 Hortifruti",
  bebidas: "🥤 Bebidas",
  embalagens: "📦 Embalagens",
  insumos_secos: "🌾 Insumos Secos",
  temperos: "🌿 Temperos",
  outros: "📋 Outros",
};

export default function Fornecedores() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mentoradoId = urlParams.get("id");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [produtoFilter, setProdutoFilter] = useState("todos");
  const [cidadeFilter, setCidadeFilter] = useState("todos");

  const [form, setForm] = useState({
    produto: "",
    categoria: "carnes",
    nome_fornecedor: "",
    contato_telefone: "",
    contato_email: "",
    valor_unitario: "",
    unidade_medida: "kg",
    condicao_pagamento: "",
    cidade_regiao: "",
    observacoes: "",
    ativo: true,
  });

  const [user, setUser] = React.useState(null);
  const [hasPermission, setHasPermission] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", mentoradoId],
    queryFn: () => base44.entities.Mentorado.filter({ id: mentoradoId }),
    select: (data) => data[0],
    enabled: !!mentoradoId
  });

  React.useEffect(() => {
    if (user && mentorado) {
      setHasPermission(user.role === "admin" || user.email === mentorado.email);
    }
  }, [user, mentorado]);

  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ["fornecedores", mentoradoId],
    queryFn: () => base44.entities.Fornecedor.filter({ mentorado_id: mentoradoId }),
    enabled: !!mentoradoId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Fornecedor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Fornecedor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Fornecedor.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fornecedores"] }),
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFornecedor(null);
    setForm({
      produto: "",
      categoria: "carnes",
      nome_fornecedor: "",
      contato_telefone: "",
      contato_email: "",
      valor_unitario: "",
      unidade_medida: "kg",
      condicao_pagamento: "",
      cidade_regiao: "",
      observacoes: "",
      ativo: true,
    });
  };

  const handleEdit = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setForm({
      produto: fornecedor.produto || "",
      categoria: fornecedor.categoria || "carnes",
      nome_fornecedor: fornecedor.nome_fornecedor || "",
      contato_telefone: fornecedor.contato_telefone || "",
      contato_email: fornecedor.contato_email || "",
      valor_unitario: fornecedor.valor_unitario || "",
      unidade_medida: fornecedor.unidade_medida || "kg",
      condicao_pagamento: fornecedor.condicao_pagamento || "",
      cidade_regiao: fornecedor.cidade_regiao || "",
      observacoes: fornecedor.observacoes || "",
      ativo: fornecedor.ativo !== false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      mentorado_id: mentoradoId,
      valor_unitario: Number(form.valor_unitario),
    };
    if (editingFornecedor) {
      updateMutation.mutate({ id: editingFornecedor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Análise de preços por produto
  const analisePrecos = useMemo(() => {
    const grupos = {};
    fornecedores.forEach((f) => {
      if (!grupos[f.produto]) {
        grupos[f.produto] = [];
      }
      grupos[f.produto].push(f);
    });

    const analise = {};
    Object.keys(grupos).forEach((produto) => {
      const fornecs = grupos[produto];
      const valores = fornecs.map((f) => f.valor_unitario);
      const menorValor = Math.min(...valores);
      const somaValores = valores.reduce((a, b) => a + b, 0);
      const mediaValor = somaValores / valores.length;

      analise[produto] = {
        fornecedores: fornecs,
        menorValor,
        mediaValor,
      };
    });

    return analise;
  }, [fornecedores]);

  const getPrecoStatus = (fornecedor) => {
    const analise = analisePrecos[fornecedor.produto];
    if (!analise) return "normal";

    if (fornecedor.valor_unitario === analise.menorValor) {
      return "menor";
    } else if (fornecedor.valor_unitario > analise.mediaValor) {
      return "acima_media";
    }
    return "normal";
  };

  // Filtros
  const filtered = fornecedores.filter((f) => {
    const matchSearch =
      f.produto?.toLowerCase().includes(search.toLowerCase()) ||
      f.nome_fornecedor?.toLowerCase().includes(search.toLowerCase()) ||
      f.cidade_regiao?.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = categoriaFilter === "todos" || f.categoria === categoriaFilter;
    const matchProduto = produtoFilter === "todos" || f.produto === produtoFilter;
    const matchCidade = cidadeFilter === "todos" || f.cidade_regiao === cidadeFilter;
    return matchSearch && matchCategoria && matchProduto && matchCidade;
  });

  // Listas para filtros
  const produtos = [...new Set(fornecedores.map((f) => f.produto))].sort();
  const cidades = [...new Set(fornecedores.filter((f) => f.cidade_regiao).map((f) => f.cidade_regiao))].sort();

  // Agrupar por produto para visualização
  const fornecedoresPorProduto = useMemo(() => {
    const grupos = {};
    filtered.forEach((f) => {
      if (!grupos[f.produto]) {
        grupos[f.produto] = [];
      }
      grupos[f.produto].push(f);
    });
    return grupos;
  }, [filtered]);

  const exportarExcel = () => {
    const headers = ["Produto", "Categoria", "Fornecedor", "Telefone", "Email", "Valor", "Unidade", "Pagamento", "Cidade", "Status"];
    const rows = fornecedores.map((f) => [
      f.produto,
      categoriaLabels[f.categoria] || f.categoria,
      f.nome_fornecedor,
      f.contato_telefone,
      f.contato_email,
      f.valor_unitario,
      f.unidade_medida,
      f.condicao_pagamento,
      f.cidade_regiao,
      getPrecoStatus(f) === "menor" ? "MENOR PREÇO" : getPrecoStatus(f) === "acima_media" ? "ACIMA DA MÉDIA" : "NORMAL"
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell || ""}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fornecedores_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (!hasPermission) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <p className="text-white/50">Você não tem permissão para acessar esta página</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            to={createPageUrl(`MentoradoDetalhe?id=${mentoradoId}`)}
            className="inline-flex items-center gap-2 text-[#FF4D00] hover:text-white mb-3"
          >
            <Home size={16} />
            Voltar para {mentorado?.nome || "Mentorado"}
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileSpreadsheet className="text-[#FF4D00]" />
            Lista de Fornecedores
          </h1>
          <p className="text-white/50">{mentorado?.nome} - {mentorado?.negocio}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportarExcel}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            <Download size={18} className="mr-2" /> Exportar CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={20} className="mr-2" /> Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-[#FF4D00]" />
          <span className="font-medium text-white">Filtros</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <Label className="text-white/60 text-xs">Buscar</Label>
            <div className="relative mt-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Produto ou fornecedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Categoria</Label>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todas</SelectItem>
                {Object.entries(categoriaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Produto</Label>
            <Select value={produtoFilter} onValueChange={setProdutoFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todos</SelectItem>
                {produtos.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Cidade</Label>
            <Select value={cidadeFilter} onValueChange={setCidadeFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="todos">Todas</SelectItem>
                {cidades.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategoriaFilter("todos");
                setProdutoFilter("todos");
                setCidadeFilter("todos");
              }}
              className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            >
              <X size={16} className="mr-2" /> Limpar
            </Button>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-emerald-500/30 border border-emerald-500 rounded"></div>
          <span className="text-white/70">Menor Preço</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-red-500/30 border border-red-500 rounded"></div>
          <span className="text-white/70">Acima da Média</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-white/10 border border-white/20 rounded"></div>
          <span className="text-white/70">Normal</span>
        </div>
      </div>

      {/* Tabela agrupada por produto */}
      {isLoading ? (
        <div className="bg-white/5 rounded-2xl p-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-4" />
          <div className="h-8 bg-white/10 rounded mb-4" />
          <div className="h-8 bg-white/10 rounded mb-4" />
        </div>
      ) : Object.keys(fornecedoresPorProduto).length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <FileSpreadsheet size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/50 mb-4">Nenhum fornecedor cadastrado</p>
          <Button onClick={() => setDialogOpen(true)} className="bg-[#FF4D00] hover:bg-[#E64500]">
            <Plus size={16} className="mr-2" /> Adicionar Primeiro Fornecedor
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(fornecedoresPorProduto)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([produto, fornecs]) => {
              const analise = analisePrecos[produto];
              const economia = analise
                ? Math.max(...fornecs.map((f) => f.valor_unitario)) - analise.menorValor
                : 0;

              return (
                <div key={produto} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Header do Produto */}
                  <div className="bg-white/5 border-b border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{produto}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                          <span>{fornecs.length} fornecedores</span>
                          {analise && (
                            <>
                              <span className="flex items-center gap-1">
                                <TrendingDown size={14} className="text-emerald-400" />
                                Menor: R$ {analise.menorValor.toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Minus size={14} className="text-white/40" />
                                Média: R$ {analise.mediaValor.toFixed(2)}
                              </span>
                              {economia > 0 && (
                                <span className="text-emerald-400 font-medium">
                                  💰 Economia: R$ {economia.toFixed(2)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        fornecs[0]?.categoria ? `bg-${categoriaLabels[fornecs[0].categoria] ? 'blue' : 'gray'}-500/20 text-${categoriaLabels[fornecs[0].categoria] ? 'blue' : 'gray'}-400` : 'bg-white/10 text-white/50'
                      }`}>
                        {categoriaLabels[fornecs[0]?.categoria] || "Sem categoria"}
                      </span>
                    </div>
                  </div>

                  {/* Tabela de Fornecedores */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white/50">Fornecedor</TableHead>
                          <TableHead className="text-white/50">Contato</TableHead>
                          <TableHead className="text-white/50">Valor</TableHead>
                          <TableHead className="text-white/50">Pagamento</TableHead>
                          <TableHead className="text-white/50">Cidade</TableHead>
                          <TableHead className="text-white/50">Observações</TableHead>
                          <TableHead className="text-white/50 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fornecs
                          .sort((a, b) => a.valor_unitario - b.valor_unitario)
                          .map((fornecedor) => {
                            const status = getPrecoStatus(fornecedor);
                            const bgColor =
                              status === "menor"
                                ? "bg-emerald-500/10 border-l-4 border-emerald-500"
                                : status === "acima_media"
                                ? "bg-red-500/10 border-l-4 border-red-500"
                                : "";

                            return (
                              <TableRow
                                key={fornecedor.id}
                                className={`border-white/10 hover:bg-white/5 ${bgColor}`}
                              >
                                <TableCell className="font-medium text-white">
                                  {fornecedor.nome_fornecedor}
                                  {status === "menor" && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                      ✓ Menor
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {fornecedor.contato_telefone && (
                                      <a
                                        href={`https://wa.me/${fornecedor.contato_telefone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                                      >
                                        <Phone size={12} /> {fornecedor.contato_telefone}
                                      </a>
                                    )}
                                    {fornecedor.contato_email && (
                                      <a
                                        href={`mailto:${fornecedor.contato_email}`}
                                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                                      >
                                        <Mail size={12} /> {fornecedor.contato_email}
                                      </a>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`font-bold ${
                                      status === "menor"
                                        ? "text-emerald-400"
                                        : status === "acima_media"
                                        ? "text-red-400"
                                        : "text-white"
                                    }`}
                                  >
                                    R$ {fornecedor.valor_unitario.toFixed(2)}
                                  </span>
                                  <span className="text-white/40 text-xs ml-1">
                                    /{fornecedor.unidade_medida}
                                  </span>
                                </TableCell>
                                <TableCell className="text-white/70 text-sm">
                                  {fornecedor.condicao_pagamento || "-"}
                                </TableCell>
                                <TableCell className="text-white/70 text-sm">
                                  {fornecedor.cidade_regiao || "-"}
                                </TableCell>
                                <TableCell className="text-white/50 text-sm max-w-xs truncate">
                                  {fornecedor.observacoes || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEdit(fornecedor)}
                                      className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => deleteMutation.mutate(fornecedor.id)}
                                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400/50 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Produto *</Label>
                <Input
                  value={form.produto}
                  onChange={(e) => setForm({ ...form, produto: e.target.value })}
                  placeholder="Ex: Mussarela"
                  className="bg-white/5 border-white/10 text-white mt-1"
                  list="produtos-list"
                />
                <datalist id="produtos-list">
                  {produtos.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label className="text-white/70">Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(categoriaLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white/70">Nome do Fornecedor *</Label>
              <Input
                value={form.nome_fornecedor}
                onChange={(e) => setForm({ ...form, nome_fornecedor: e.target.value })}
                placeholder="Ex: Distribuidora ABC"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Telefone / WhatsApp</Label>
                <Input
                  value={form.contato_telefone}
                  onChange={(e) => setForm({ ...form, contato_telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Email</Label>
                <Input
                  type="email"
                  value={form.contato_email}
                  onChange={(e) => setForm({ ...form, contato_email: e.target.value })}
                  placeholder="contato@fornecedor.com"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Valor Unitário * (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor_unitario}
                  onChange={(e) => setForm({ ...form, valor_unitario: e.target.value })}
                  placeholder="0.00"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Unidade</Label>
                <Select value={form.unidade_medida} onValueChange={(v) => setForm({ ...form, unidade_medida: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="g">Gramas</SelectItem>
                    <SelectItem value="l">Litro</SelectItem>
                    <SelectItem value="ml">ML</SelectItem>
                    <SelectItem value="un">Unidade</SelectItem>
                    <SelectItem value="cx">Caixa</SelectItem>
                    <SelectItem value="pc">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Condição de Pagamento</Label>
                <Input
                  value={form.condicao_pagamento}
                  onChange={(e) => setForm({ ...form, condicao_pagamento: e.target.value })}
                  placeholder="Ex: À vista, 30 dias, 15/30"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/70">Cidade / Região</Label>
                <Input
                  value={form.cidade_regiao}
                  onChange={(e) => setForm({ ...form, cidade_regiao: e.target.value })}
                  placeholder="Ex: São Paulo - SP"
                  className="bg-white/5 border-white/10 text-white mt-1"
                  list="cidades-list"
                />
                <datalist id="cidades-list">
                  {cidades.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <Label className="text-white/70">Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Ex: Entrega apenas terças e sextas"
                className="bg-white/5 border-white/10 text-white mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1 border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.produto || !form.nome_fornecedor || !form.valor_unitario}
                className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
              >
                {editingFornecedor ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}