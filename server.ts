import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { userMessage, history, userName, gender, upcomingEvents } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY");
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please check your environment variables." });
      }

      if (!userMessage) {
        return res.status(400).json({ error: "userMessage is required" });
      }

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

      const responseStream = await genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
      }).generateContentStream({
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: {
          temperature: 0.7,
        },
      });

      // Set headers for standard raw text streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of responseStream.stream) {
        const text = chunk.text();
        if (text) {
          res.write(text);
        }
      }

      res.end();
    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to get AI response" });
      } else {
        res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
