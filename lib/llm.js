function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

export async function askLlm(messages) {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = normalizeBaseUrl(process.env.LLM_BASE_URL);
  const model = process.env.LLM_MODEL || "gpt-6-luna";
  const style = process.env.LLM_API_STYLE || "chat_completions";

  if (!apiKey || !baseUrl) {
    throw new Error("LLM_NOT_CONFIGURED");
  }

  if (style === "responses") {
    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: messages.map((m) => ({
          role: m.role,
          content: [{ type: "input_text", text: m.content }]
        }))
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM_HTTP_${response.status}: ${body.slice(0, 600)}`);
    }

    const data = await response.json();
    const text =
      data.output_text ||
      data.output?.flatMap((item) => item.content || [])
        .find((item) => item.type === "output_text")?.text;

    if (!text) throw new Error("LLM_EMPTY_RESPONSE");
    return text.trim();
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM_HTTP_${response.status}: ${body.slice(0, 600)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("LLM_EMPTY_RESPONSE");
  return String(text).trim();
}
