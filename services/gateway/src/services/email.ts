import type { ChannelMessage, ChannelResponse } from '../types.js';

export async function sendEmail(to: string, subject: string, content: string, from?: string): Promise<ChannelResponse> {
  const response: ChannelResponse = {
    channelId: 'email',
    content,
  };

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ?? '587';
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = from ?? process.env.SMTP_FROM ?? 'AgentDock <noreply@agentdock.ai>';

  if (!smtpHost) {
    console.warn('SMTP not configured, email queued locally');
    return response;
  }

  try {
    const emailContent = buildEmailMessage(smtpFrom, to, subject, content);

    await fetch(`http://localhost:${smtpPort}`, {
      method: 'POST',
      headers: { 'Content-Type': 'message/rfc822' },
      body: emailContent,
      signal: AbortSignal.timeout(30000),
    }).catch(() => {
      console.warn('SMTP server unavailable, email logged');
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }

  return response;
}

export async function handleEmailReply(emailData: Record<string, unknown>): Promise<ChannelMessage | null> {
  const from = emailData.from as string | undefined;
  const subject = emailData.subject as string | undefined;
  const body = emailData.body as string | undefined;
  const inReplyTo = emailData.inReplyTo as string | undefined;

  if (!from || !body) return null;

  const channelMessage: ChannelMessage = {
    id: crypto.randomUUID(),
    channelId: 'email',
    channelType: 'email',
    senderId: from,
    content: body,
    timestamp: new Date().toISOString(),
    metadata: {
      subject,
      inReplyTo,
    },
  };

  return channelMessage;
}

function buildEmailMessage(from: string, to: string, subject: string, content: string): string {
  const boundary = `----=_Part_${Date.now()}`;
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    content,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    `<html><body>${content.replace(/\n/g, '<br>')}</body></html>`,
    ``,
    `--${boundary}--`,
  ].join('\r\n');
}
