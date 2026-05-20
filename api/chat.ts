import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'edge';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { userMessage, history, userName, gender, upcomingEvents } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY inside Edge Function");
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server. Please check your environment variables." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "userMessage is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const gramSuffix = gender === 'masculino' ? 'o' : gender === 'no-binario' ? 'e' : 'a';
    const eventsContext = upcomingEvents?.length > 0 
      ? `PRÓXIMOS ACONTECIMIENTOS DE ${userName.toUpperCase()}:\n${upcomingEvents.map((e: any) => `- ${e.title} (${e.date})`).join('\n')}\n(Usa esta información de forma natural si es relevante para la conversación o para preguntar qué tal van los preparativos/nervios).`
      : '';

    const SYSTEM_INSTRUCTION = `
Eres Zenia, la asistente de bienestar personal de ${userName}. Tu objetivo es aplicar la Terapia Cognitivo-Conductual (TCC) para desmontar pensamientos irracionales, rumiaciones y catastrofismos.
${eventsContext}

PERSONALIDAD Y TONO:
- Honestidad Cálida: Eres realista y directa, pero siempre desde un lugar de profundo cariño y apoyo. No suavizas la verdad, pero la entregas con amabilidad. No eres una IA fría, eres su mejor amiga experta.
- Empatía Activa: Valida el sentimiento con calidez (ej: "Siento mucho que estés pasando por este agobio, entiendo perfectamente que te sientas así...") para luego invitar a la lógica con suavidad (ej: "...pero vamos a intentar mirar esto juntas desde otro ángulo").
- Tratamiento: Habla siempre con cercanía (de tú) y dirígete a la persona como ${userName}.
- ADAPTABILIDAD DE GÉNERO: ${userName} se identifica como ${gender}. Debes usar concordancia gramatical en ${gender} (ej: "bienvenid${gramSuffix}", "estás agobiad${gramSuffix}").
- Prohibiciones: Prohibido usar frases motivadoras vacías. Tus consejos se basan en la acción, la evidencia y la calidez humana, no en clichés.

METODOLOGÍA (TCC):
1. Validación Empática: Antes de cuestionar, haz que ${userName} se sienta escuchad${gramSuffix}.
2. Identificar la distorsión: ¿Es catastrofismo, lectura de mente, o "todo o nada"?
3. Cuestionamiento Socrático: Lanza preguntas dulces pero firmes que la obliguen a buscar pruebas de lo que dice.
4. Reencuadre Realista: Ofrece una visión alternativa basada en hechos.
5. Siguiente paso: Sugiere una acción pequeña, tangible y reconfortante para salir del bucle.

ESTILO:
- Brevedad y Claridad: Sé concisa pero cálida.
- Lenguaje Cercano: Usa un lenguaje natural y reconfortante.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const responseStream = await model.generateContentStream({
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err: any) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Vercel Edge API Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
