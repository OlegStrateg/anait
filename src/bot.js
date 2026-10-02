import { replyAsAnait } from "../lib/anait.js";
import {
  deleteWebhook,
  getMe,
  getUpdates,
  sendChatAction,
  sendTelegramMessage
} from "../lib/telegram.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleMessage(message) {
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  if (!chatId || !text) return;

  if (text === "/start") {
    await sendTelegramMessage(
      chatId,
      "Я Анаит. Напиши, что сейчас больше всего не даёт тебе покоя — отношения, человек, работа, деньги или решение, которое не можешь принять."
    );
    return;
  }

  if (text === "/status") {
    const llmConfigured = Boolean(process.env.LLM_API_KEY && process.env.LLM_BASE_URL);
    await sendTelegramMessage(
      chatId,
      llmConfigured
        ? `Связь есть. Модель: ${process.env.LLM_MODEL || "gpt-6-luna"}.`
        : "Telegram подключён. Осталось подключить ключ API Master."
    );
    return;
  }

  try {
    await sendChatAction(chatId, "typing").catch(() => {});
    const answer = await replyAsAnait(text);
    await sendTelegramMessage(chatId, answer);
  } catch (error) {
    console.error("message_error", {
      chatId,
      message: error?.message
    });

    if (String(error?.message).includes("LLM_NOT_CONFIGURED")) {
      await sendTelegramMessage(
        chatId,
        "Telegram уже подключён. Сейчас не хватает только ключа API Master для моих ответов."
      );
      return;
    }

    await sendTelegramMessage(
      chatId,
      "Сейчас не смогла нормально ответить. Это техническая ошибка, а не твой вопрос — попробуй ещё раз."
    ).catch(() => {});
  }
}

async function main() {
  const me = await getMe();
  console.log(`Anait Lite started as @${me.username || me.id}`);

  // Long polling and webhook cannot work for the same bot at the same time.
  await deleteWebhook();

  let offset = 0;
  let failures = 0;

  while (true) {
    try {
      const updates = await getUpdates(offset);

      for (const update of updates) {
        offset = Math.max(offset, Number(update.update_id) + 1);
        await handleMessage(update.message);
      }

      failures = 0;
    } catch (error) {
      failures += 1;
      const delay = Math.min(30_000, 1_000 * 2 ** Math.min(failures, 5));

      console.error("polling_error", {
        failures,
        delay,
        message: error?.message
      });

      await sleep(delay);
    }
  }
}

main().catch((error) => {
  console.error("fatal", error?.message || error);
  process.exit(1);
});
