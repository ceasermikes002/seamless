import * as FileSystem from 'expo-file-system';
import { Linking, Platform } from 'react-native';

export const WidgetCache = {
  async update(events: { id: string; title: string; date: Date; location?: string }[]): Promise<void> {
    try {
      const today = new Date();
      const todays = events.filter(e => new Date(e.date).toDateString() === today.toDateString());
      const next = todays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      const payload = {
        todayCount: todays.length,
        nextTitle: next ? next.title : '',
        nextTime: next ? new Date(next.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
      };
      const path = (FileSystem.documentDirectory || '') + 'widget.json';
      if (!path) return;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(payload));
      if (Platform.OS === 'android') {
        try { await Linking.openURL('seamless://update-widget'); } catch {}
      }
    } catch {}
  },
};
