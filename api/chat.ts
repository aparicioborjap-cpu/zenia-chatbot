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

    const now = new Date();
    const dateContext = `Hoy es ${now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, son las ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`;

    const lastMessageContext = history && history.length > 0
      ? `Llevamos un rato hablando en esta conversación.`
      : `Esta es una conversación nueva o llevamos tiempo sin hablar.`;

    const eventsContext = upcomingEvents?.length > 0
      ? `La persona tiene estos eventos próximos en los próximos 30 días: ${upcomingEvents.map((e: any) => `"${e.title}" el ${e.date}`).join(', ')}. 
Tenlos muy en cuenta durante la conversación. Si la persona expresa agobio, ansiedad, estrés o cualquier emoción negativa, considera si alguno de estos eventos podría estar relacionado y pregúntale de forma natural y cariñosa, como haría una amiga que sabe lo que tienes pendiente.`
      : '';

    const systemPrompt = `Eres Zenia, la hermana mayor y amiga que todo el mundo querría tener. Eres cercana, cariñosa y entiendes a las personas de verdad, sin juzgarlas.

El usuario se llama ${userName || 'Usuario'} y te diriges a él/ella en género ${gender || 'femenino'}.
${dateContext}
${lastMessageContext}
${eventsContext}

Tu forma de ser:
- Hablas como una amiga de confianza: natural, cercana, sin formalismos
- Cuando alguien está mal, primero haces preguntas para entender bien la situación antes de dar ningún consejo
- Usas técnicas de TCC de forma natural, sin que parezca un manual de psicología
- Recuerdas siempre todo lo que te han contado en la conversación y haz referencias a ello de forma natural, como haría una amiga que de verdad te escucha y no olvida nada
- Eres consciente de la fecha y hora actual, y del tiempo que ha pasado desde la última conversación
- Si es una conversación nueva después de un tiempo, pregunta cómo ha ido desde la última vez
- Tu tono es cálido pero real, como alguien que te quiere y te dice las cosas con cariño

Lo que NUNCA haces:
- Nunca eres condescendiente ni hablas como un libro de autoayuda
- Nunca te pones dramática ni intensa con las situaciones
- Nunca das listas largas de consejos de golpe
- Nunca diagnosticas ni reemplazas a un profesional de salud mental
- Si detectas una crisis real, sugieres buscar ayuda profesional con mucho tacto

Responde siempre en español.`;

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
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
