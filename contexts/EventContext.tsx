import { WidgetCache } from '@/utils/widget';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Event } from '../types';
import { Storage } from '../utils/storage';

interface EventContextType {
  events: Event[];
  loading: boolean;
  addEvent: (event: Event) => void;
  editEvent: (eventId: string, updates: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  refreshEvents: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context) return context;
  return {
    events: [],
    loading: false,
    addEvent: () => {},
    editEvent: () => {},
    removeEvent: () => {},
    refreshEvents: () => {},
  } as EventContextType;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events from storage on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    try {
      setLoading(true);
      const storedEvents = Storage.getEvents();
      setEvents(storedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = (event: Event) => {
    try {
      Storage.addEvent(event);
      setEvents(prev => {
        const next = [...prev, event];
        WidgetCache.update(next);
        return next;
      });
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const editEvent = (eventId: string, updates: Partial<Event>) => {
    try {
      Storage.updateEvent(eventId, updates);
      setEvents(prev => {
        const next = prev.map(event => 
          event.id === eventId 
            ? { ...event, ...updates, updatedAt: new Date() }
            : event
        );
        WidgetCache.update(next);
        return next;
      });
    } catch (error) {
      console.error('Error editing event:', error);
    }
  };

  const removeEvent = (eventId: string) => {
    try {
      Storage.deleteEvent(eventId);
      setEvents(prev => {
        const next = prev.filter(event => event.id !== eventId);
        WidgetCache.update(next);
        return next;
      });
    } catch (error) {
      console.error('Error removing event:', error);
    }
  };

  const refreshEvents = () => {
    loadEvents();
  };

  const value: EventContextType = {
    events,
    loading,
    addEvent,
    editEvent,
    removeEvent,
    refreshEvents,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
