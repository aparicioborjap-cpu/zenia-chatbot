import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'edge';

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/web-stream' },
    });
  }

  try {
    const { userMessage, history, userName, gender, upcomingEvents } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Falta la clave GEMINI_API_KEY en Vercel" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
 const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Aquí va la lógica de tu chat. Para asegurarnos de que no falle nada
    // le pedimos una respuesta normal y la devolvemos estructurada limpia.
    const chat = model.startChat({
      history: (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || msg.text || '' }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

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
