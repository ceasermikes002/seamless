import { AppStorage, Event, MockEmail, STORAGE_KEYS, Theme } from '../types';
let MMKVClass: any;
try {
  const mod = require('react-native-mmkv');
  MMKVClass = mod && mod.MMKV ? mod.MMKV : undefined;
} catch (e) {
  MMKVClass = undefined;
}
if (!MMKVClass) {
  MMKVClass = class {
    private map: Record<string, string> = {};
    constructor(_: any) {}
    getString(key: string): string | null {
      return this.map[key] ?? null;
    }
    set(key: string, value: string): void {
      this.map[key] = String(value);
    }
    clearAll(): void {
      this.map = {};
    }
  };
}

// Initialize MMKV storage
export const storage = new MMKVClass({
  id: 'email-to-event-storage',
  encryptionKey: 'email-to-event-encryption-key',
});

// Storage helper functions
export const Storage = {
  // Events
  getEvents: (): Event[] => {
    try {
      const eventsJson = storage.getString(STORAGE_KEYS.EVENTS);
      if (eventsJson) {
        const events = JSON.parse(eventsJson);
        // Convert date strings back to Date objects
        return events.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
    return [];
  },

  setEvents: (events: Event[]): void => {
    try {
      storage.set(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  },

  addEvent: (event: Event): void => {
    const events = Storage.getEvents();
    events.push(event);
    Storage.setEvents(events);
  },

  updateEvent: (eventId: string, updates: Partial<Event>): void => {
    const events = Storage.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates, updatedAt: new Date() };
      Storage.setEvents(events);
    }
  },

  deleteEvent: (eventId: string): void => {
    const events = Storage.getEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    Storage.setEvents(filteredEvents);
  },

  // Emails
  getEmails: (): MockEmail[] => {
    try {
      const emailsJson = storage.getString(STORAGE_KEYS.EMAILS);
      if (emailsJson) {
        const emails = JSON.parse(emailsJson);
        // Convert date strings back to Date objects
        return emails.map((email: any) => ({
          ...email,
          receivedAt: new Date(email.receivedAt),
        }));
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    }
    return [];
  },

  setEmails: (emails: MockEmail[]): void => {
    try {
      storage.set(STORAGE_KEYS.EMAILS, JSON.stringify(emails));
    } catch (error) {
      console.error('Error saving emails:', error);
    }
  },

  updateEmail: (emailId: string, updates: Partial<MockEmail>): void => {
    const emails = Storage.getEmails();
    const index = emails.findIndex(e => e.id === emailId);
    if (index !== -1) {
      emails[index] = { ...emails[index], ...updates };
      Storage.setEmails(emails);
    }
  },

  // Settings
  getSettings: (): AppStorage['settings'] => {
    try {
      const settingsJson = storage.getString(STORAGE_KEYS.SETTINGS);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return {
      theme: 'light',
      notifications: true,
      developerMode: false,
    };
  },

  setSettings: (settings: AppStorage['settings']): void => {
    try {
      storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  // Theme
  getTheme: (): Theme => {
    try {
      const theme = storage.getString(STORAGE_KEYS.THEME);
      if (theme === 'light' || theme === 'dark') {
        return theme;
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
    return 'light';
  },

  setTheme: (theme: Theme): void => {
    try {
      storage.set(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    storage.clearAll();
  },
};
