import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { tipo, dados } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 });

    let prompt = '';

    if (tipo === 'preencher_mvv') {
      prompt = `Você é especialista em branding para delivery e restaurantes. Com base nos dados abaixo, crie missão, visão, valores e regras de conduta profissionais e inspiradores para este negócio.

Negócio: ${dados.nome_negocio}
Tipo: ${dados.tipo_delivery}
Dono: ${dados.nome_responsavel}
Cidade: ${dados.cidade}
Funcionários: ${dados.num_funcionarios}
Tom de atendimento: ${dados.tom_atendimento}

Responda APENAS com JSON:
{
  "missao": "frase de missão poderosa e específica para delivery",
  "visao": "frase de visão ambiciosa para 5 anos",
  "valores": ["valor 1", "valor 2", "valor 3", "valor 4", "valor 5"],
  "regras_conduta": "lista numerada de 8-10 regras de conduta para colaboradores de delivery"
}`;
    } else if (tipo === 'gerar_manual') {
      prompt = `Você é especialista em RH e gestão para delivery e restaurantes. Gere um Manual do Colaborador completo, profissional e motivador para:

Negócio: ${dados.nome_negocio}
Tipo: ${dados.tipo_delivery}
Responsável: ${dados.nome_responsavel}
Cidade: ${dados.cidade}
Funcionários: ${dados.num_funcionarios}
Missão: ${dados.missao || 'A ser definida'}
Visão: ${dados.visao || 'A ser definida'}
Valores: ${dados.valores || 'A ser definida'}
Horário: ${dados.horario_funcionamento || 'A definir'}
Uniforme/Dress code: ${dados.dress_code || 'A definir'}
Regras de conduta: ${dados.regras_conduta || 'A definir'}
Tom de atendimento: ${dados.tom_atendimento}

Responda APENAS com JSON:
{
  "boas_vindas": "mensagem calorosa do dono para os colaboradores (2-3 parágrafos)",
  "nossa_historia": "história inspiradora do negócio (2 parágrafos)",
  "missao": "missão do negócio",
  "visao": "visão do negócio",
  "valores": ["valor 1: descrição", "valor 2: descrição", "valor 3: descrição", "valor 4: descrição", "valor 5: descrição"],
  "regras_conduta": ["regra 1", "regra 2", "regra 3", "regra 4", "regra 5", "regra 6", "regra 7", "regra 8"],
  "uniforme": "descrição detalhada do uniforme e apresentação pessoal",
  "horarios": "regras de horário, pontualidade e faltas",
  "atendimento": ["padrão 1 de atendimento", "padrão 2", "padrão 3", "padrão 4", "padrão 5"],
  "higiene": ["regra de higiene 1", "regra 2", "regra 3", "regra 4", "regra 5"],
  "celular_redes": "política de uso do celular e redes sociais durante o trabalho",
  "punicoes": ["advertência verbal: situações", "advertência escrita: situações", "desligamento imediato: situações graves"]
}`;
    } else if (tipo === 'analise_ia') {
      const { briefing, mentorado } = dados;
      prompt = `Analise o briefing deste mentorado de delivery e gere um diagnóstico completo:

MENTORADO: ${mentorado?.nome || 'N/A'} — ${mentorado?.negocio || 'N/A'} (${mentorado?.cidade || 'N/A'})
Faturamento: R$ ${briefing?.faturamento_mensal || 'Não informado'}/mês
Ticket Médio: R$ ${briefing?.ticket_medio || 'N/A'}
CMV: ${briefing?.cmv ? briefing.cmv + '%' : 'NÃO DEFINIDO'}
Pedidos/dia: ${briefing?.media_pedidos_dia || 'N/A'}
Equipe: ${briefing?.estrutura_equipe || 'N/A'}
Tem fichas técnicas: ${briefing?.fichas_tecnicas?.length > 0 ? 'SIM' : 'NÃO'}
Tem fluxogramas: ${briefing?.fluxogramas_data && Object.keys(briefing.fluxogramas_data).length > 0 ? 'SIM' : 'NÃO'}
Problemas: ${briefing?.problemas_identificados || 'N/A'}
Objetivos: ${briefing?.objetivos || 'N/A'}

Retorne APENAS JSON:
{
  "panorama": "3 parágrafos de diagnóstico executivo separados por \\n\\n",
  "frase_motivacional": "frase poderosa e personalizada para este mentorado",
  "faturamento_projetado": número em reais após 12 semanas de mentoria,
  "percentual_crescimento": número percentual,
  "top5_gargalos": [
    {"titulo": "título", "criticidade": "critico|alto|medio", "impacto": "impacto no negócio", "acao": "o que fazer", "semana": "semana X-Y"}
  ],
  "plano_semanas": [
    {"semanas": "1-2", "tema": "título", "foco": "descrição do foco", "entregavel": "o que será entregue"}
  ]
}`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: 'Você é analista especialista em delivery e restaurantes brasileiro. Responda sempre em português e APENAS com JSON válido, sem markdown.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Erro na API Anthropic: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else return Response.json({ error: 'Resposta inválida da IA' }, { status: 500 });
    }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});