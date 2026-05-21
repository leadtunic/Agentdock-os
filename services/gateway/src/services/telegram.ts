import type { ChannelMessage, ChannelResponse, Attachment } from '../types.js';

const pendingMessages = new Map<string, ChannelMessage>();
const responseQueue: ChannelResponse[] = [];

export async function handleTelegramUpdate(update: Record<string, unknown>): Promise<ChannelMessage | null> {
  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return null;

  const chat = message.chat as Record<string, unknown> | undefined;
  const from = message.from as Record<string, unknown> | undefined;

  const channelMessage: ChannelMessage = {
    id: String(message.message_id ?? crypto.randomUUID()),
    channelId: 'telegram',
    channelType: 'telegram',
    senderId: String(from?.id ?? 'unknown'),
    senderName: from?.username ? `@${from.username}` : (from?.first_name as string | undefined),
    content: (message.text as string) ?? (message.caption as string) ?? '',
    timestamp: new Date().toISOString(),
    metadata: {
      chatId: chat?.id,
      messageId: message.message_id,
      updateType: 'message',
    },
  };

  if (message.photo) {
    channelMessage.attachments = [{
      type: 'image',
      data: String(message.photo),
    }];
  }

  pendingMessages.set(channelMessage.id, channelMessage);
  return channelMessage;
}

export async function sendTelegramMessage(chatId: string, content: string, replyTo?: string): Promise<ChannelResponse> {
  const response: ChannelResponse = {
    channelId: 'telegram',
    content,
    replyTo,
  };

  responseQueue.push(response);

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const body: Record<string, unknown> = {
        chat_id: chatId,
        text: content,
        parse_mode: 'Markdown',
      };
      if (replyTo) {
        body.reply_to_message_id = parseInt(replyTo, 10);
      }

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }

  return response;
}

export function getPendingMessages(): ChannelMessage[] {
  return Array.from(pendingMessages.values());
}

export function clearPendingMessages(): void {
  pendingMessages.clear();
}
