import type { Channel, ChannelType, ChannelStatus } from '../types.js';

const channels = new Map<string, Channel>();

export function createChannel(params: {
  id?: string;
  type: ChannelType;
  name: string;
  config: Record<string, unknown>;
}): Channel {
  const now = new Date().toISOString();
  const channel: Channel = {
    id: params.id ?? crypto.randomUUID(),
    type: params.type,
    name: params.name,
    status: 'active',
    config: params.config,
    createdAt: now,
    updatedAt: now,
  };
  channels.set(channel.id, channel);
  return channel;
}

export function getChannel(id: string): Channel | undefined {
  return channels.get(id);
}

export function listChannels(filter?: { type?: ChannelType; status?: ChannelStatus }): Channel[] {
  let result = Array.from(channels.values());
  if (filter?.type) result = result.filter((c) => c.type === filter.type);
  if (filter?.status) result = result.filter((c) => c.status === filter.status);
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateChannelStatus(id: string, status: ChannelStatus): Channel | undefined {
  const channel = channels.get(id);
  if (!channel) return undefined;
  channel.status = status;
  channel.updatedAt = new Date().toISOString();
  return channel;
}

export function updateChannelConfig(id: string, config: Record<string, unknown>): Channel | undefined {
  const channel = channels.get(id);
  if (!channel) return undefined;
  channel.config = { ...channel.config, ...config };
  channel.updatedAt = new Date().toISOString();
  return channel;
}

export function deleteChannel(id: string): boolean {
  return channels.delete(id);
}

export function getChannelCount(): number {
  return channels.size;
}

export function getActiveChannelCount(): number {
  return Array.from(channels.values()).filter((c) => c.status === 'active').length;
}
