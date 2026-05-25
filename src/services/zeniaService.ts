export async function getZeniaResponseStream(
  userMessage: string, 
  history: { role: 'user' | 'model', text: string }[], 
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
        history: history.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text || '',
        })),
        userName,
        gender,
        upcomingEvents,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get AI response");
    }

    const data = await response.json();
    const text = data.text || "";
    onChunk(text);
    return text;

  } catch (error) {
    console.error("Error calling Zenia API:", error);
    throw error;
  }
}  }
}
