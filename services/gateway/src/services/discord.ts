import type { ChannelMessage, ChannelResponse } from '../types.js';

const pendingMessages = new Map<string, ChannelMessage>();

export async function handleDiscordEvent(event: Record<string, unknown>): Promise<ChannelMessage | null> {
  const type = event.type as string | undefined;

  if (type === 'MESSAGE_CREATE') {
    const data = event.data as Record<string, unknown> | undefined;
    if (!data) return null;

    const author = data.author as Record<string, unknown> | undefined;
    const channel = data.channel as Record<string, unknown> | undefined;

    const channelMessage: ChannelMessage = {
      id: String(data.id ?? crypto.randomUUID()),
      channelId: 'discord',
      channelType: 'discord',
      senderId: String(author?.id ?? 'unknown'),
      senderName: author?.username as string | undefined,
      content: (data.content as string) ?? '',
      timestamp: new Date().toISOString(),
      metadata: {
        channelId: channel?.id,
        guildId: data.guild_id,
        messageId: data.id,
      },
    };

    if (data.attachments) {
      channelMessage.attachments = ((data.attachments as unknown[]) ?? []).map((a: Record<string, unknown>) => ({
        type: 'file' as const,
        url: a.url as string | undefined,
        filename: a.filename as string | undefined,
      }));
    }

    pendingMessages.set(channelMessage.id, channelMessage);
    return channelMessage;
  }

  return null;
}

export async function sendDiscordMessage(channelId: string, content: string, replyTo?: string): Promise<ChannelResponse> {
  const response: ChannelResponse = {
    channelId: 'discord',
    content,
    replyTo,
  };

  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (token && channelId) {
      const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
      const body: Record<string, unknown> = { content };
      if (replyTo) {
        body.message_reference = { message_id: replyTo };
      }

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bot ${token}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
    }
  } catch (error) {
    console.error('Failed to send Discord message:', error);
  }

  return response;
}

export function getPendingMessages(): ChannelMessage[] {
  return Array.from(pendingMessages.values());
}
