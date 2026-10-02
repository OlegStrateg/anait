const token = process.env.TELEGRAM_BOT_TOKEN_LITE;
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token || !webhookUrl) {
  throw new Error("Set TELEGRAM_BOT_TOKEN_LITE and TELEGRAM_WEBHOOK_URL");
}

const url = new URL(`https://api.telegram.org/bot${token}/setWebhook`);
url.searchParams.set("url", webhookUrl);
if (secret) url.searchParams.set("secret_token", secret);
url.searchParams.set("drop_pending_updates", "true");

const response = await fetch(url, { method: "POST" });
const data = await response.json();
if (!response.ok || !data.ok) {
  throw new Error(JSON.stringify(data));
}

console.log("Webhook configured:", data.description);
