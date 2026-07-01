import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { system, prompt } = await req.json();

    const fullPrompt = `${system || 'Responda SOMENTE com JSON válido sem markdown.'}\n\n${prompt}`;
    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      response_json_schema: { type: "object" }
    });

    return Response.json({ resultado });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});