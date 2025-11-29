import { CactusConfig } from '@/services/cactusConfig';
import { ParsedEvent } from '@/types';
import { Platform } from 'react-native';

const getCactus = (): any | undefined => {
  if (Platform.OS === 'web') return undefined;
  try {
    const _req = eval('require');
    const mod = _req('cactus-react-native');
    return mod;
  } catch (e) {
    return undefined;
  }
};


export const CactusAI = {
  isAvailable(): boolean {
    if (Platform.OS === 'web') return true;
    const cactus = getCactus();
    return !!cactus?.CactusLM;
  },
  async complete(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], onToken?: (t: string) => void) {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      const last = messages[messages.length - 1]?.content || '';
      const response = `Echo: ${last}`;
      onToken?.(response);
      return { response } as any;
    }
    const lm = CactusConfig.textModel ? new cactus.CactusLM({ model: CactusConfig.textModel }) : new cactus.CactusLM();
    await lm.download({});
    const result = await lm.complete({ messages, onToken });
    await lm.destroy();
    return result;
  },

  async summarize(text: string): Promise<string> {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      const trimmed = text.replace(/\s+/g, ' ').trim();
      return trimmed.length > 200 ? trimmed.slice(0, 200) + '…' : trimmed;
    }
    const lm = CactusConfig.textModel ? new cactus.CactusLM({ model: CactusConfig.textModel }) : new cactus.CactusLM();
    await lm.download({});
    const result = await lm.complete({ messages: [{ role: 'user', content: `Summarize: ${text}` }] });
    await lm.destroy();
    return result.response;
  },

  async extract(email: { id: string; sender: string; subject: string; content: string }): Promise<ParsedEvent> {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} \w+ \d{4})/g;
      const timeRegex = /(\d{1,2}:\d{2} (AM|PM|am|pm))/g;
      const trackingRegex = /(tracking|order|confirmation|reference).*?[:#]\s*(\w+)/gi;
      const detectCategory = (sender: string, content: string): string => {
        const s = sender.toLowerCase();
        const c = content.toLowerCase();
        if (/amazon|fedex|ups|dhl|delivery|package|shipment/.test(s + ' ' + c)) return 'delivery';
        if (/airline|flight|hotel|booking\.com|expedia|airbnb/.test(s + ' ' + c)) return 'travel';
        if (/appointment|meeting|reservation|schedule/.test(s + ' ' + c)) return 'appointment';
        if (/ticket|event|concert|movie|show|theater/.test(s + ' ' + c)) return 'ticket';
        if (/subscription|renewal|billing|payment|invoice/.test(s + ' ' + c)) return 'subscription';
        return 'appointment';
      };
      const extractedDate = email.content.match(dateRegex)?.[0];
      const extractedTime = email.content.match(timeRegex)?.[0];
      const trackingMatch = email.content.match(trackingRegex);
      const trackingId = trackingMatch ? (trackingMatch as any)[0]?.replace(/.*[:#]\s*/,'') : undefined;
      const locationRegex = /(?:at|location|venue|address)[:\s]*([A-Za-z0-9\s,]+?)(?:\.|\n|$)/i;
      const extractedLocation = email.content.match(locationRegex)?.[1]?.trim();
      const iso = extractedDate ? new Date(extractedDate) : new Date();
      return {
        title: email.subject.replace(/^(Re:|Fwd?:)\s*/i, ''),
        date: iso,
        location: extractedLocation,
        category: detectCategory(email.sender, email.content),
        confidence: 0.8,
        trackingId,
        rawExtractions: { date: extractedDate, time: extractedTime, location: extractedLocation, trackingId },
      };
    }
    const tools = [
      {
        name: 'propose_event',
        description: 'Propose a structured event parsed from an email',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            dateTime: { type: 'string', description: 'ISO 8601 date-time' },
            location: { type: 'string' },
            category: { type: 'string', description: 'delivery|travel|appointment|ticket|subscription' },
            trackingId: { type: 'string' },
          },
          required: ['title', 'dateTime', 'category'],
        },
      },
    ];
    const lm = CactusConfig.textModel ? new cactus.CactusLM({ model: CactusConfig.textModel }) : new cactus.CactusLM();
    await lm.download({});
    const messages = [
      {
        role: 'user',
        content: `Extract a single event using the tool with accurate fields.
Subject: ${email.subject}
From: ${email.sender}
Body:
${email.content}`,
      },
    ];
    const result = await lm.complete({ messages, tools });
    await lm.destroy();
    const fc = Array.isArray(result.functionCalls) ? result.functionCalls.find((c: any) => c.name === 'propose_event') : undefined;
    let parsed: any = undefined;
    if (fc && typeof fc.arguments === 'object') parsed = fc.arguments;
    if (!parsed) {
      try {
        parsed = JSON.parse(result.response);
      } catch {}
    }
    const title = parsed?.title || email.subject;
    const dt = parsed?.dateTime ? new Date(parsed.dateTime) : new Date();
    const location = parsed?.location || undefined;
    const category = parsed?.category || 'appointment';
    const trackingId = parsed?.trackingId || undefined;
    return {
      title,
      date: dt,
      location,
      category,
      confidence: 0.9,
      trackingId,
      rawExtractions: { response: result.response, functionCalls: result.functionCalls, parsed },
    };
  },

  async visionComplete(messages: { role: 'user' | 'assistant' | 'system'; content: string; images?: string[] }[]) {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      return { response: 'Vision is not supported on web.' } as any;
    }
    const lm = new cactus.CactusLM({ model: CactusConfig.visionModel });
    await lm.download({});
    const result = await lm.complete({ messages });
    await lm.destroy();
    return result;
  },

  async toolCall(messages: any[], tools: any[]) {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      const last = messages[messages.length - 1]?.content || '';
      return { response: `Echo: ${last}`, functionCalls: [] } as any;
    }
    const lm = CactusConfig.textModel ? new cactus.CactusLM({ model: CactusConfig.textModel }) : new cactus.CactusLM();
    await lm.download({});
    const result = await lm.complete({ messages, tools });
    await lm.destroy();
    return result;
  },

  async ragComplete(messages: any[], corpusDir: string) {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      const last = messages[messages.length - 1]?.content || '';
      return { response: `RAG not supported on web. Query: ${last}` } as any;
    }
    const lm = new cactus.CactusLM({ corpusDir });
    await lm.download({});
    const result = await lm.complete({ messages });
    await lm.destroy();
    return result;
  },

  async embedText(text: string) {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const dim = 256; const vec = new Array<number>(dim).fill(0);
      for (const t of tokens) { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; vec[h % dim] += 1; }
      return { embedding: vec } as any;
    }
    const lm = CactusConfig.textModel ? new cactus.CactusLM({ model: CactusConfig.textModel }) : new cactus.CactusLM();
    await lm.download({});
    const result = await lm.embed({ text });
    await lm.destroy();
    return result;
  },

  async embedImage(imagePath: string) {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      return { embedding: [] } as any;
    }
    const lm = new cactus.CactusLM({ model: CactusConfig.visionModel });
    await lm.download({});
    const result = await lm.imageEmbed({ imagePath });
    await lm.destroy();
    return result;
  },
};
