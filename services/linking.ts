import { Event, MockEmail, ParsedEvent } from '@/types';
import { CactusAI } from '@/services/cactus';

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
const norm = (a: number[]) => Math.sqrt(a.reduce((s, v) => s + v * v, 0));
const cosine = (a: number[], b: number[]) => {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  return dot(a, b) / (na * nb);
};

const eventText = (e: Event) => [e.title, e.location, e.trackingId].filter(Boolean).join(' ');

export const LinkingService = {
  async findMatch(email: MockEmail, parsed: ParsedEvent, events: Event[]): Promise<Event | null> {
    if (parsed.trackingId) {
      const byId = events.find(e => e.trackingId && e.trackingId === parsed.trackingId);
      if (byId) return byId;
    }
    const emailEmb = (await CactusAI.embedText(`${email.subject}\n${email.content}`)).embedding as number[];
    let best: { e: Event; score: number } | null = null;
    for (const e of events) {
      const evEmb = (await CactusAI.embedText(eventText(e))).embedding as number[];
      const score = cosine(emailEmb, evEmb);
      if (!best || score > best.score) best = { e, score };
    }
    if (best && best.score >= 0.85) return best.e;
    return null;
  },
};

