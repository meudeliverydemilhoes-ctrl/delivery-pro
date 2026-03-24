import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { tipo, dados } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 });

    let system = 'Você é especialista em mentoria de delivery. Responda sempre em português brasileiro.';
    let prompt = '';

    if (tipo === 'guia') {
      const d = dados;
      prompt = `Gere um Guia do Mentorado personalizado para a Mentoria Delivery Pro.

DADOS:
- Mentorado: ${d.nome_mentorado}
- Negócio: ${d.nome_negocio} (${d.tipo_delivery})
- Cidade: ${d.cidade}
- Data de início: ${d.data_inicio}

Retorne JSON válido sem markdown:
{
  "boas_vindas": "mensagem personalizada de 2 parágrafos usando o nome do mentorado e negócio, calorosa e motivadora",
  "visao_metodo": "2 parágrafos descrevendo a jornada direção → organização → crescimento → escala → posicionamento adaptado ao tipo de delivery",
  "pilares": [
    {"numero": 1, "nome": "Norte Estratégico", "descricao": "2 frases sobre MVV, posicionamento e propósito"},
    {"numero": 2, "nome": "Estrutura Operacional", "descricao": "2 frases sobre processos, fluxogramas, SOPs"},
    {"numero": 3, "nome": "Performance e Lucro", "descricao": "2 frases sobre CMV, financeiro, ticket médio"},
    {"numero": 4, "nome": "Escala e Produtividade", "descricao": "2 frases sobre equipe, liderança, tempo livre"},
    {"numero": 5, "nome": "Posicionamento e Autoridade", "descricao": "2 frases sobre marketing, iFood, presença digital"}
  ],
  "o_que_vai_mudar": ["mudança 1 específica para o tipo de delivery", "mudança 2", "mudança 3", "mudança 4", "mudança 5"],
  "primeiros_passos": ["passo 1 prático", "passo 2", "passo 3"],
  "semanas": [
    {"semana": 1, "tema": "tema da semana 1", "objetivo": "objetivo curto", "entregas": ["entrega 1", "entrega 2"]},
    {"semana": 2, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 3, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 4, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 5, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 6, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 7, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 8, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 9, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 10, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 11, "tema": "...", "objetivo": "...", "entregas": ["..."]},
    {"semana": 12, "tema": "...", "objetivo": "...", "entregas": ["..."]}
  ]
}`;
    }

    if (tipo === 'ingredientes') {
      const d = dados;
      prompt = `Sugira ingredientes e gramaturas para uma ficha técnica de delivery.

Produto: ${d.produto}
Tipo de estabelecimento: ${d.tipo_delivery}
Tamanhos: ${d.tamanhos?.join(', ') || 'P, M, G'}

Retorne JSON válido sem markdown:
{
  "ingredientes": [
    {"nome": "ingrediente", "unidade": "g|ml|un", "quantidades": {"P": 100, "M": 150, "G": 200, "Família": 300}}
  ]
}
Forneça de 6 a 12 ingredientes realistas para o produto solicitado.`;
    }

    if (tipo === 'analise_gargalos') {
      const { briefing, mentorado } = dados;
      const fluxKeys = briefing?.fluxogramas_data ? Object.keys(briefing.fluxogramas_data) : [];
      prompt = `Analise este mentorado de delivery e gere diagnóstico completo.

MENTORADO: ${mentorado?.nome} — ${mentorado?.negocio}, ${mentorado?.cidade}
Faturamento: R$ ${briefing?.faturamento_mensal || 'Não informado'}
Ticket médio: R$ ${briefing?.ticket_medio || 'Não informado'}
CMV: ${briefing?.cmv ? briefing.cmv + '%' : 'NÃO DEFINIDO'}
Pedidos/dia: ${briefing?.media_pedidos_dia || 'Não informado'}
Fichas técnicas: ${briefing?.fichas_tecnicas?.length || 0}
Fluxogramas: ${fluxKeys.length ? fluxKeys.join(', ') : 'NENHUM'}
Financeiro organizado: ${briefing?.checklist_maturidade?.financeiro_organizado ? 'SIM' : 'NÃO'}
Problemas relatados: ${briefing?.problemas_identificados || 'Não informado'}
Objetivos: ${briefing?.objetivos || 'Não informado'}

Retorne JSON válido sem markdown:
{
  "panorama_executivo": "3 parágrafos separados por \\n\\n",
  "frase_motivacional": "frase curta e poderosa",
  "faturamento_potencial": número,
  "percentual_crescimento": número,
  "top5_gargalos": [
    {"titulo": "...", "criticidade": "critico|alto|medio", "descricao": "...", "impacto": "...", "acao": "...", "semana_foco": "Semana X-Y"}
  ],
  "plano_12_semanas": [
    {"semana": "1-2", "tema": "...", "objetivo": "...", "acoes": ["ação 1", "ação 2"]}
  ],
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Erro Anthropic: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;
    let result;
    try { result = JSON.parse(text); }
    catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else return Response.json({ error: 'Resposta inválida da IA' }, { status: 500 });
    }
    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});