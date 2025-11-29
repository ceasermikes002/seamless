import { MockEmail } from '@/types';

const decodeBase64Url = (b64: string): string => {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  try {
    // @ts-ignore
    if (typeof Buffer !== 'undefined') {
      // @ts-ignore
      return Buffer.from(normalized, 'base64').toString('utf-8');
    }
  } catch {}
  try {
    // Some environments may have atob
    // @ts-ignore
    const bin = globalThis.atob ? globalThis.atob(normalized) : '';
    if (bin) {
      const bytes = new Uint8Array([...bin].map(c => c.charCodeAt(0)));
      return new TextDecoder('utf-8').decode(bytes);
    }
  } catch {}
  return '';
};

export const GmailService = {
  async listMessages(accessToken: string): Promise<string[]> {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gmail listMessages failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    const ids = (json.messages || []).map((m: any) => m.id);
    return ids;
  },

  async getMessage(accessToken: string, id: string): Promise<MockEmail> {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gmail getMessage failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    const headers: Record<string, string> = {};
    (json.payload?.headers || []).forEach((h: any) => { headers[h.name] = h.value; });
    const sender = headers['From'] || 'Unknown';
    const subject = headers['Subject'] || '';
    const receivedAt = new Date(Number(json.internalDate));
    let content = '';
    const parts = json.payload?.parts || [];
    const bodyData = json.payload?.body?.data;
    if (bodyData) content = decodeBase64Url(bodyData);
    else {
      for (const p of parts) {
        if (p.mimeType?.includes('text/plain') && p.body?.data) { content = decodeBase64Url(p.body.data); break; }
        if (p.mimeType?.includes('text/html') && p.body?.data) { content = decodeBase64Url(p.body.data); break; }
      }
    }
    return {
      id,
      sender,
      subject,
      content,
      receivedAt,
      isProcessed: false,
      category: undefined,
    };
  },
};
