import type { WebhookEvent, ChannelMessage } from '../types.js';

const webhookEvents: WebhookEvent[] = [];
const pendingMessages: ChannelMessage[] = [];

export function processWebhook(channel: string, payload: Record<string, unknown>): WebhookEvent {
  const event: WebhookEvent = {
    id: crypto.randomUUID(),
    channel,
    payload,
    timestamp: new Date().toISOString(),
    processed: false,
  };

  webhookEvents.push(event);

  const message = transformToChannelMessage(channel, payload);
  if (message) {
    pendingMessages.push(message);
    event.processed = true;
  }

  return event;
}

export function getWebhookEvents(filter?: { channel?: string; processed?: boolean }): WebhookEvent[] {
  let result = webhookEvents;
  if (filter?.channel) result = result.filter((e) => e.channel === filter.channel);
  if (filter?.processed !== undefined) result = result.filter((e) => e.processed === filter.processed);
  return result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getPendingWebhookMessages(): ChannelMessage[] {
  return pendingMessages;
}

export function clearProcessedEvents(): void {
  for (let i = webhookEvents.length - 1; i >= 0; i--) {
    if (webhookEvents[i]!.processed) {
      webhookEvents.splice(i, 1);
    }
  }
}

function transformToChannelMessage(channel: string, payload: Record<string, unknown>): ChannelMessage | null {
  const content = extractContent(payload);
  if (!content) return null;

  return {
    id: crypto.randomUUID(),
    channelId: channel,
    channelType: 'webhook',
    senderId: String(payload.sender_id ?? payload.from ?? 'webhook'),
    senderName: String(payload.sender_name ?? payload.name ?? undefined),
    content,
    timestamp: new Date().toISOString(),
    metadata: {
      sourceChannel: channel,
      rawPayload: payload,
    },
  };
}

function extractContent(payload: Record<string, unknown>): string | null {
  if (typeof payload.content === 'string') return payload.content;
  if (typeof payload.message === 'string') return payload.message;
  if (typeof payload.text === 'string') return payload.text;
  if (typeof payload.body === 'string') return payload.body;

  const contentObj = payload.content as Record<string, unknown> | undefined;
  if (contentObj && typeof contentObj.text === 'string') return contentObj.text;

  return JSON.stringify(payload);
}
