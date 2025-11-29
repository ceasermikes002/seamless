import { Event } from '@/types';

export const CalendarService = {
  async createEvent(accessToken: string, event: Event): Promise<void> {
    const body = {
      summary: event.title,
      location: event.location,
      start: { dateTime: new Date(event.date).toISOString() },
      end: { dateTime: new Date(event.date).toISOString() },
    };
    await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },
};
