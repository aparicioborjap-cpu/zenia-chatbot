export async function getZeniaResponseStream(
  userMessage: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[], 
  userName: string = 'Paula', 
  gender: string = 'femenino',
  upcomingEvents: { title: string, date: string }[] = [],
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage,
        history,
        userName,
        gender,
        upcomingEvents,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get AI response");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    if (!reader) {
      throw new Error("No response reader available in response body.");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      accumulatedText += chunkText;
      onChunk(chunkText);
    }

    return accumulatedText;
  } catch (error) {
    console.error("Error calling Zenia API stream:", error);
    throw error;
  }
}
