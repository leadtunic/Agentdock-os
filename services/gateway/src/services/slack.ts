import type { ChannelMessage, ChannelResponse } from '../types.js';

const pendingMessages = new Map<string, ChannelMessage>();

export async function handleSlackEvent(event: Record<string, unknown>): Promise<ChannelMessage | null> {
  const type = event.type as string | undefined;

  if (type === 'event_callback') {
    const payload = event.event as Record<string, unknown> | undefined;
    if (!payload) return null;

    const user = payload.user as string | undefined;

    const channelMessage: ChannelMessage = {
      id: String(payload.client_msg_id ?? crypto.randomUUID()),
      channelId: 'slack',
      channelType: 'slack',
      senderId: user ?? 'unknown',
      content: (payload.text as string) ?? '',
      timestamp: new Date().toISOString(),
      metadata: {
        channel: payload.channel,
        ts: payload.ts,
        eventType: payload.type,
      },
    };

    pendingMessages.set(channelMessage.id, channelMessage);
    return channelMessage;
  }

  if (type === 'url_verification') {
    return null;
  }

  return null;
}

export async function sendSlackMessage(channelId: string, content: string, replyTo?: string): Promise<ChannelResponse> {
  const response: ChannelResponse = {
    channelId: 'slack',
    content,
    replyTo,
  };

  try {
    const token = process.env.SLACK_BOT_TOKEN;
    if (token) {
      const url = 'https://slack.com/api/chat.postMessage';
      const body: Record<string, unknown> = {
        channel: channelId,
        text: content,
      };
      if (replyTo) {
        body.thread_ts = replyTo;
      }

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
    }
  } catch (error) {
    console.error('Failed to send Slack message:', error);
  }

  return response;
}

export function getPendingMessages(): ChannelMessage[] {
  return Array.from(pendingMessages.values());
}
