import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { nomeProduto, categoria, tipo } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 });

    let prompt = '';

    if (tipo === 'ingredientes') {
      prompt = `Crie uma ficha técnica completa para "${nomeProduto}" categoria "${categoria}".

Retorne APENAS JSON válido sem markdown:
{
  "tamanhos": [
    {
      "nome": "Pequena 1/2",
      "ingredientes": [{"qtd": 115, "unidade": "g", "nome": "Ingrediente"}]
    },
    {
      "nome": "Grande 1/3",
      "ingredientes": [{"qtd": 125, "unidade": "g", "nome": "Ingrediente"}]
    },
    {
      "nome": "Grande 1/2",
      "ingredientes": [{"qtd": 160, "unidade": "g", "nome": "Ingrediente"}]
    },
    {
      "nome": "Quarto Família 1/4",
      "ingredientes": [{"qtd": 200, "unidade": "g", "nome": "Ingrediente"}]
    },
    {
      "nome": "Terço Família 1/3",
      "ingredientes": [{"qtd": 250, "unidade": "g", "nome": "Ingrediente"}]
    }
  ]
}

Use gramagens REALISTAS para delivery brasileiro. Para pizzas doces use ingredientes como recheio, cobertura, granulado, etc. Para pizzas salgadas use molho, mussarela, ingrediente principal. Para hambúrgueres use pão, carne, queijo, etc.`;
    }

    if (tipo === 'preparo') {
      prompt = `Crie o modo de preparo passo a passo para "${nomeProduto}" categoria "${categoria}" no contexto de um delivery/restaurante brasileiro.

Retorne APENAS JSON válido sem markdown:
{
  "passos": [
    "Passo 1: descrição detalhada",
    "Passo 2: descrição detalhada"
  ],
  "tempo_preparo": "X minutos",
  "dicas": "dica importante de execução"
}

Seja prático, direto, com linguagem para equipe de cozinha.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: 'Você é especialista em fichas técnicas de delivery e restaurantes brasileiros. Sempre responda em JSON válido, sem markdown, sem texto extra.',
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