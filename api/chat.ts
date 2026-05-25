export const runtime = 'edge';

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { userMessage, history, userName, gender, upcomingEvents } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Falta la clave GROQ_API_KEY en Vercel" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const eventsContext = upcomingEvents?.length > 0
      ? `La persona tiene estos eventos próximos: ${upcomingEvents.map((e: any) => `${e.title} el ${e.date}`).join(', ')}.`
      : '';

    const systemPrompt = `Eres Zenia, una asistente de bienestar emocional empática, cálida y profesional. Tu misión es ayudar a las personas a gestionar sus emociones y pensamientos usando técnicas de Terapia Cognitivo-Conductual (TCC).

El usuario se llama ${userName || 'Usuario'} y prefieres dirigirte a él/ella en género ${gender || 'femenino'}.
${eventsContext}

Tus principios:
- Escucha activa y sin juicios
- Usa técnicas de TCC: reestructuración cognitiva, respiración, mindfulness
- Responde siempre en español, con calidez pero sin ser condescendiente
- Sé concisa pero profunda, no des listas largas innecesarias
- Nunca diagnostiques ni reemplaces a un profesional de salud mental
- Si detectas una crisis, sugiere buscar ayuda profesional con delicadeza
- Recuerda el contexto de la conversación y haz referencias a lo que el usuario ha compartido antes`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content || msg.text || '',
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        m
