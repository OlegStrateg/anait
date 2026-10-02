function getToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN_LITE;
  if (!token) throw new Error("TELEGRAM_NOT_CONFIGURED");
  return token;
}

async function telegramCall(method, payload = {}) {
  const token = getToken();
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(
      `TELEGRAM_${method.toUpperCase()}_${response.status}: ${JSON.stringify(data)?.slice(0, 600)}`
    );
  }

  return data.result;
}

export async function getMe() {
  return telegramCall("getMe");
}

export async function deleteWebhook() {
  return telegramCall("deleteWebhook", { drop_pending_updates: false });
}

export async function getUpdates(offset) {
  return telegramCall("getUpdates", {
    offset,
    timeout: 25,
    allowed_updates: ["message"]
  });
}

export async function sendChatAction(chatId, action = "typing") {
  return telegramCall("sendChatAction", {
    chat_id: chatId,
    action
  });
}

export async function sendTelegramMessage(chatId, text) {
  return telegramCall("sendMessage", {
    chat_id: chatId,
    text: String(text).slice(0, 4096),
    disable_web_page_preview: true
  });
}
