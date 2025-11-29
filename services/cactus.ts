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
    const cactus = getCactus();
    return !!cactus?.CactusLM;
  },
  async complete(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], onToken?: (t: string) => void) {
    const cactus = getCactus();
    if (!cactus?.CactusLM) {
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
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
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
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
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
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
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
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
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
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
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
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
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
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
      throw new Error('Cactus SDK not available on this platform. Use a native development build.');
    }
    const lm = new cactus.CactusLM({ model: CactusConfig.visionModel });
    await lm.download({});
    const result = await lm.imageEmbed({ imagePath });
    await lm.destroy();
    return result;
  },
};
