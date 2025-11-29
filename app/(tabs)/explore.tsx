import { EmailCard } from '@/components/EmailCard';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { AppBar } from '@/components/ui/AppBar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { useEmails } from '@/contexts/EmailContext';
import { useEvents } from '@/contexts/EventContext';
import { useToast } from '@/contexts/ToastContext';
import { CactusAI } from '@/services/cactus';
import { GmailService } from '@/services/gmail';
import { LinkingService } from '@/services/linking';
import { Event } from '@/types';
import { Storage } from '@/utils/storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { colors, spacing, typography, maxContentWidth } from '@/constants/theme';

export default function EmailInboxScreen() {
  const router = useRouter();
  const { emails, loading, refreshEmails, processEmail } = useEmails();
  const { events, addEvent, editEvent } = useEvents();
  const { isAuthenticated, accessToken, signIn } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEmails();
    setRefreshing(false);
  }, [refreshEmails]);

  const handleEmailPress = async (email: any) => {
    if (!CactusAI.isAvailable()) {
      showError('Local AI requires a native dev build. Run: npx expo start --dev-client');
      return;
    }
    try {
      const parsedEvent = await CactusAI.extract(email);
      processEmail(email.id);
      router.push({ pathname: '/parse/[emailId]', params: { emailId: email.id, parsedEvent: JSON.stringify(parsedEvent) } });
    } catch (error: any) {
      showError(error?.message || 'Failed to parse email');
    }
  };

  const handleQuickParse = async (email: any) => {
    if (!CactusAI.isAvailable()) {
      showError('Local AI requires a native dev build. Run: npx expo start --dev-client');
      return;
    }
    try {
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
        showSuccess('Event updated successfully');
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
      showSuccess('Event created successfully');
    } catch (error: any) {
      showError(error?.message || 'Failed to parse email');
    }
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
      <View style={styles.container}>
        <StatusBar style="light" />
        <AppBar title="Emails" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading emails...</Text>
        </View>
      </View>
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
      showSuccess(`Fetched ${items.length} email${items.length !== 1 ? 's' : ''} from Gmail`);
    } catch (e: any) {
      showError(e?.message || 'Failed to fetch Gmail. Check scopes and API enablement.');
    } finally {
      setFetching(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppBar 
        title="Emails" 
        rightAction={emails.length > 0 ? {
          label: `${emails.length}`,
          onPress: () => {},
        } : undefined}
      />
      
      <View style={styles.actionBar}>
        <PrimaryButton
          title={fetching ? 'Fetching...' : (isAuthenticated ? 'Fetch Gmail' : 'Sign In with Google')}
          onPress={handleFetchFromGmail}
          disabled={fetching}
          size="sm"
          fullWidth
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.content}>
          {!CactusAI.isAvailable() && (
            <ThemedCard variant="outlined" style={styles.infoCard}>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  Local AI requires a native dev build. Use Dev Client.
                </Text>
                <Text style={styles.infoText}>
                  Run: npx expo start --dev-client
                </Text>
              </View>
            </ThemedCard>
          )}
          
          {unprocessedEmails.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New Emails</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accent + '30' }]}>
                  <Text style={[styles.countText, { color: colors.accent }]}>
                    {unprocessedEmails.length}
                  </Text>
                </View>
              </View>
              {unprocessedEmails.map((email, index) => (
                <View key={email.id} style={styles.emailWrapper}>
                  <EmailCard
                    email={email}
                    onPress={() => handleEmailPress(email)}
                    index={index}
                  />
                  {summaries[email.id] && (
                    <Text style={styles.summaryText}>{summaries[email.id]}</Text>
                  )}
                  <View style={styles.quickParseWrapper}>
                    <PrimaryButton
                      title="Quick Parse"
                      onPress={() => handleQuickParse(email)}
                      size="sm"
                      fullWidth
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {processedEmails.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Processed</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accentSecondary + '30' }]}>
                  <Text style={[styles.countText, { color: colors.accentSecondary }]}>
                    {processedEmails.length}
                  </Text>
                </View>
              </View>
              {processedEmails.map((email, index) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onPress={() => handleEmailPress(email)}
                  index={index}
                />
              ))}
            </View>
          )}

          {emails.length === 0 && (
            <ThemedCard variant="outlined" style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>No emails</Text>
                <Text style={styles.emptyText}>
                  Fetch Gmail to load your inbox.
                </Text>
              </View>
            </ThemedCard>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: maxContentWidth,
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
    }),
  },
  section: {
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  countText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  emailWrapper: {
    marginBottom: spacing.md,
  },
  summaryText: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  quickParseWrapper: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  errorContent: {
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.xs,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  infoContent: {
    padding: spacing.lg,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.xs,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing['3xl'],
  },
  emptyContent: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
});
