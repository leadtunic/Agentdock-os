export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  status: ChannelStatus;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ChannelType = 'telegram' | 'discord' | 'slack' | 'email' | 'webhook' | 'webchat';
export type ChannelStatus = 'active' | 'inactive' | 'error' | 'connecting';

export interface ChannelMessage {
  id: string;
  channelId: string;
  channelType: ChannelType;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

export interface Attachment {
  type: 'image' | 'file' | 'audio' | 'video';
  url?: string;
  data?: string;
  filename?: string;
  mimeType?: string;
}

export interface ChannelResponse {
  channelId: string;
  content: string;
  attachments?: Attachment[];
  replyTo?: string;
}

export interface WebhookEvent {
  id: string;
  channel: string;
  payload: Record<string, unknown>;
  timestamp: string;
  processed: boolean;
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  sessionId: string;
  actionType: string;
  summary: string;
  payload: Record<string, unknown>;
  channelId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  respondedAt?: string;
  respondedBy?: string;
}
