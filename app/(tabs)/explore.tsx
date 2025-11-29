import { EmailCard } from '@/components/EmailCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useEmails } from '@/contexts/EmailContext';
import { useEvents } from '@/contexts/EventContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CactusAI } from '@/services/cactus';
import { GmailService } from '@/services/gmail';
import { LinkingService } from '@/services/linking';
import { Event } from '@/types';
import { Storage } from '@/utils/storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmailInboxScreen() {
  const router = useRouter();
  const { emails, loading, refreshEmails, processEmail } = useEmails();
  const { addEvent, editEvent } = useEvents();
  const { isDark } = useTheme();
  const { isAuthenticated, accessToken, signIn } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEmails();
    setRefreshing(false);
  }, [refreshEmails]);

  const handleEmailPress = async (email: any) => {
    if (!CactusAI.isAvailable()) {
      alert('Local AI requires a native dev build. Run: npx expo start --dev-client and open your Dev Client.');
      return;
    }
    const parsedEvent = await CactusAI.extract(email);
    processEmail(email.id);
    router.push({ pathname: '/parse/[emailId]', params: { emailId: email.id, parsedEvent: JSON.stringify(parsedEvent) } });
  };

  const handleQuickParse = async (email: any) => {
    if (!CactusAI.isAvailable()) {
      alert('Local AI requires a native dev build. Run: npx expo start --dev-client and open your Dev Client.');
      return;
    }
    const parsedEvent = await CactusAI.extract(email);
    const match = await LinkingService.findMatch(email, parsedEvent, events);
    if (match) {
      editEvent(match.id, {
        title: parsedEvent.title || match.title,
        date: parsedEvent.date || match.date,
        location: parsedEvent.location || match.location,
        trackingId: parsedEvent.trackingId || match.trackingId,
      });
      processEmail(email.id);
      return;
    }
    const newEvent: Event = {
      id: Date.now().toString(),
      title: parsedEvent.title,
      date: parsedEvent.date,
      location: parsedEvent.location,
      category: parsedEvent.category as Event['category'],
      status: 'approved',
      trackingId: parsedEvent.trackingId,
      extractedFrom: email.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addEvent(newEvent);
    processEmail(email.id);
  };

  const unprocessedEmails = emails.filter(email => !email.isProcessed);
  const processedEmails = emails.filter(email => email.isProcessed);

  useEffect(() => {
    const looksMock = emails.some(e =>
      /Amazon Orders|Delta Airlines|Netflix|Ticketmaster|Appointment Reminder/i.test(e.sender) ||
      /Flight Confirmation|Your package|subscription/i.test(e.subject)
    );
    if (isAuthenticated && accessToken && (emails.length === 0 || looksMock)) {
      handleFetchFromGmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, emails]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Email Inbox</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDark && styles.darkSubtext]}>Loading emails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleFetchFromGmail = async () => {
    if (!isAuthenticated || !accessToken) {
      await signIn();
    }
    if (!isAuthenticated || !accessToken) {
      return;
    }
    setFetching(true);
    setFetchError(null);
    try {
      const ids = await GmailService.listMessages(accessToken);
      const items = await Promise.all(ids.slice(0, 10).map(id => GmailService.getMessage(accessToken, id)));
      Storage.setEmails(items);
      refreshEmails();
      const map: Record<string, string> = {};
      if (CactusAI.isAvailable()) {
        for (const it of items) {
          map[it.id] = await CactusAI.summarize(it.content);
        }
      }
      setSummaries(map);
    } catch (e: any) {
      setFetchError(e?.message || 'Failed to fetch Gmail. Check scopes and API enablement.');
    } finally {
      setFetching(false);
    }
  };


  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Email Inbox</Text>
        <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
          {emails.length} email{emails.length !== 1 ? 's' : ''} • {unprocessedEmails.length} new
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <TouchableOpacity 
          style={[styles.quickParseButton, isDark && styles.darkQuickParseButton]} 
          onPress={handleFetchFromGmail}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickParseText, isDark && styles.darkQuickParseText]}>
            {fetching ? 'Fetching...' : (isAuthenticated ? 'Fetch Gmail' : 'Sign In with Google')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={isDark ? ['#8B5CF6'] : ['#6B46C1']}
            tintColor={isDark ? '#8B5CF6' : '#6B46C1'}
          />
        }
      >
        {fetchError && (
          <View style={{ marginHorizontal: 20, marginTop: 12 }}>
            <GlassCard style={[styles.emptyCard, isDark && styles.darkEmptyCard]}>
              <View style={styles.emptyContent}>
                <Text style={[styles.emptyText, isDark && styles.darkSubtext]}>Error: {fetchError}</Text>
                <Text style={[styles.emptyText, isDark && styles.darkSubtext]}>Ensure Gmail API is enabled, scopes are approved, and your account is a Test User.</Text>
              </View>
            </GlassCard>
          </View>
        )}
        {!CactusAI.isAvailable() && (
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <GlassCard style={[styles.emptyCard, isDark && styles.darkEmptyCard]}>
              <View style={styles.emptyContent}>
                <Text style={[styles.emptyText, isDark && styles.darkSubtext]}>Local AI requires a native dev build. Use Dev Client.</Text>
                <Text style={[styles.emptyText, isDark && styles.darkSubtext]}>Run: npx expo start --dev-client</Text>
              </View>
            </GlassCard>
          </View>
        )}
        {unprocessedEmails.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>New Emails</Text>
              <Text style={[styles.sectionCount, isDark && styles.darkSubtext]}>
                {unprocessedEmails.length}
              </Text>
            </View>
            {unprocessedEmails.map(email => (
              <View key={email.id} style={styles.emailWrapper}>
                <EmailCard
                  email={email}
                  onPress={() => handleEmailPress(email)}
                />
                {summaries[email.id] && (
                  <Text style={{ marginHorizontal: 28, color: isDark ? '#9CA3AF' : '#6B7280' }}>{summaries[email.id]}</Text>
                )}
                <TouchableOpacity
                  style={[styles.quickParseButton, isDark && styles.darkQuickParseButton]}
                  onPress={() => handleQuickParse(email)}
                >
                  <Text style={[styles.quickParseText, isDark && styles.darkQuickParseText]}>
                    Quick Parse
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {processedEmails.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Processed</Text>
              <Text style={[styles.sectionCount, isDark && styles.darkSubtext]}>
                {processedEmails.length}
              </Text>
            </View>
            {processedEmails.map(email => (
              <EmailCard
                key={email.id}
                email={email}
                onPress={() => handleEmailPress(email)}
              />
            ))}
          </View>
        )}

        {emails.length === 0 && (
          <GlassCard style={[styles.emptyCard, isDark && styles.darkEmptyCard]}>
            <View style={styles.emptyContent}>
              <Text style={[styles.emptyTitle, isDark && styles.darkText]}>No emails</Text>
              <Text style={[styles.emptyText, isDark && styles.darkSubtext]}>Fetch Gmail to load your inbox.</Text>
            </View>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionCount: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emailWrapper: {
    marginBottom: 12,
  },
  quickParseButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  darkQuickParseButton: {
    backgroundColor: '#8B5CF6',
  },
  quickParseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  darkQuickParseText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyCard: {
    marginHorizontal: 20,
    marginVertical: 40,
  },
  darkEmptyCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  emptyContent: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
});
