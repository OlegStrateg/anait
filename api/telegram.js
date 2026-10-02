import { replyAsAnait } from "../lib/anait.js";
import { sendTelegramMessage } from "../lib/telegram.js";

function validWebhookSecret(req) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return req.headers["x-telegram-bot-api-secret-token"] === expected;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, endpoint: "telegram-webhook" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  if (!validWebhookSecret(req)) {
    return res.status(401).json({ ok: false, error: "INVALID_WEBHOOK_SECRET" });
  }

  const update = req.body || {};
  const message = update.message || update.edited_message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  if (!chatId || !text) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  try {
    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        "Я Анаит. Напиши, что сейчас больше всего не даёт тебе покоя — отношения, человек, работа, деньги или решение, которое не можешь принять."
      );
      return res.status(200).json({ ok: true });
    }

    const answer = await replyAsAnait(text);
    await sendTelegramMessage(chatId, answer);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("telegram_webhook_error", {
      message: error?.message,
      updateId: update.update_id
    });

    if (String(error?.message).includes("LLM_NOT_CONFIGURED")) {
      await sendTelegramMessage(
        chatId,
        "Я уже здесь. Сейчас подключают мой основной интеллект — попробуй написать ещё раз чуть позже."
      ).catch(() => {});
    }

    return res.status(200).json({ ok: false, handled: true });
  }
}
