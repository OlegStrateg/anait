export async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN_LITE;
  if (!token) throw new Error("TELEGRAM_NOT_CONFIGURED");

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TELEGRAM_HTTP_${response.status}: ${body.slice(0, 600)}`);
  }

  return response.json();
}
