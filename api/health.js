export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "anait-lite",
    version: "0.1.0",
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN_LITE),
    llmConfigured: Boolean(process.env.LLM_API_KEY && process.env.LLM_BASE_URL),
    model: process.env.LLM_MODEL || "gpt-6-luna"
  });
}
