import type { AIConfig } from "@/store/ai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildAuthHeaders(config: AIConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  switch (config.authMode) {
    case "x-api-key":
      headers["x-api-key"] = config.apiKey;
      break;
    case "custom":
      if (config.customHeaderName) {
        headers[config.customHeaderName] = config.apiKey;
      }
      break;
    case "bearer":
    default:
      headers["Authorization"] = `Bearer ${config.apiKey}`;
      break;
  }

  return headers;
}

export async function streamChat(
  config: AIConfig,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  if (!config.apiKey) throw new Error("Please configure your AI API key in settings");

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: buildAuthHeaders(config),
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`AI API error (${res.status}): ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onChunk(delta);
        }
      } catch {}
    }
  }

  return full;
}

export async function chat(
  config: AIConfig,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  let result = "";
  await streamChat(config, messages, (chunk) => { result += chunk; }, signal);
  return result;
}
