// Event interface
export interface Event {
  id: string;
  title: string;
  date: Date;
  location?: string;
  category: 'delivery' | 'travel' | 'appointment' | 'ticket' | 'subscription';
  status: 'pending' | 'approved' | 'rejected';
  extractedFrom?: string;
  trackingId?: string;
  qrCode?: string;
  notes?: string;
  embedding?: number[];
  linkKeys?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Email interface
export interface MockEmail {
  id: string;
  sender: string;
  subject: string;
  content: string;
  receivedAt: Date;
  isProcessed: boolean;
  category?: string;
}

// Parsed event from email
export interface ParsedEvent {
  title: string;
  date: Date;
  location?: string;
  category: string;
  confidence: number;
  trackingId?: string;
  rawExtractions: Record<string, any>;
}

// Storage keys for MMKV
export const STORAGE_KEYS = {
  EVENTS: 'email_events_v1',
  EMAILS: 'mock_emails_v1',
  SETTINGS: 'app_settings_v1',
  THEME: 'app_theme_v1'
} as const;

// Storage interface
export interface AppStorage {
  events: Event[];
  emails: MockEmail[];
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    developerMode: boolean;
  };
}

// Theme type
export type Theme = 'light' | 'dark';

// Event category type alias for UI usage
export type EventCategory = Event['category'];

// Navigation params
export type RootStackParamList = {
  '(tabs)': undefined;
  'modal': undefined;
  'emails': undefined;
  'parse/:emailId': { emailId: string };
  'edit/:eventId': { eventId: string };
  'widget': undefined;
};

// Tab params
export type TabParamList = {
  'index': undefined;
  'emails': undefined;
  'widget': undefined;
  'settings': undefined;
};
