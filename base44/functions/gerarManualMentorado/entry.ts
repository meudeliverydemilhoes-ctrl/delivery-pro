import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { nomeCliente, nomeNegocio, mentorResponsavel, dataInicio } = await req.json();

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 3000,
      system: 'Você é especialista em mentoria de delivery. Crie documentos profissionais e motivadores em português brasileiro. Responda APENAS com JSON válido, sem markdown.',
      messages: [{
        role: 'user',
        content: `Crie um Manual do Mentorado completo para:
- Nome: ${nomeCliente}
- Negócio: ${nomeNegocio}
- Mentor: ${mentorResponsavel}
- Início: ${dataInicio}

Retorne um JSON com exatamente estas chaves:
{
  "carta_boas_vindas": "carta calorosa e motivadora de 3 parágrafos",
  "como_funciona": "explicação das 12 semanas e 5 pilares em 2 parágrafos",
  "o_que_vai_receber": ["item1", "item2", "...lista com 8 itens do kit completo"],
  "como_acessar_app": "instruções passo a passo para acessar o Delivery Pro",
  "compromissos": ["compromisso1", "compromisso2", "...lista com 6 compromissos do mentorado"],
  "equipe": [
    {"nome": "Talison Rosa", "cargo": "Mentor Principal", "descricao": "breve apresentação"},
    {"nome": "Brenda Pereira", "cargo": "Gestora Comercial", "descricao": "breve apresentação"},
    {"nome": "Marcel", "cargo": "Mentor Financeiro", "descricao": "breve apresentação"},
    {"nome": "Rosiane", "cargo": "Suporte Operacional", "descricao": "breve apresentação"}
  ],
  "cronograma_12_semanas": [
    {"semana": 1, "foco": "...", "entregavel": "..."},
    {"semana": 2, "foco": "...", "entregavel": "..."},
    {"semana": 3, "foco": "...", "entregavel": "..."},
    {"semana": 4, "foco": "...", "entregavel": "..."},
    {"semana": 5, "foco": "...", "entregavel": "..."},
    {"semana": 6, "foco": "...", "entregavel": "..."},
    {"semana": 7, "foco": "...", "entregavel": "..."},
    {"semana": 8, "foco": "...", "entregavel": "..."},
    {"semana": 9, "foco": "...", "entregavel": "..."},
    {"semana": 10, "foco": "...", "entregavel": "..."},
    {"semana": 11, "foco": "...", "entregavel": "..."},
    {"semana": 12, "foco": "...", "entregavel": "..."}
  ]
}`
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) return Response.json({ error: data.error?.message || 'Anthropic error' }, { status: 500 });

  const text = data.content[0].text;
  const manual = JSON.parse(text.replace(/```json|```/g, '').trim());
  return Response.json({ manual });
});