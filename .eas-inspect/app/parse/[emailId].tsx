import { GlassCard } from '@/components/ui/GlassCard';
import { useEmails } from '@/contexts/EmailContext';
import { useEvents } from '@/contexts/EventContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Event, MockEmail, ParsedEvent } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarService } from '@/services/calendar';

export default function ParsePreviewScreen() {
  const { emailId, parsedEvent: parsedEventParam } = useLocalSearchParams();
  const router = useRouter();
  const { emails } = useEmails();
  const { addEvent } = useEvents();
  const { accessToken } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState<MockEmail | null>(null);
  const [parsedEvent, setParsedEvent] = useState<ParsedEvent | null>(null);

  useEffect(() => {
    // Find the email by ID
    const foundEmail = emails.find(e => e.id === emailId);
    if (foundEmail) {
      setEmail(foundEmail);
      
      // Parse the event data from params
      if (parsedEventParam && typeof parsedEventParam === 'string') {
        try {
          const parsed = JSON.parse(parsedEventParam);
          setParsedEvent(parsed);
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      }
    }
  }, [emailId, emails, parsedEventParam]);

  const handleApprove = () => {
    if (!parsedEvent) return;

    const newEvent: Event = {
      id: Date.now().toString(),
      title: parsedEvent.title,
      date: new Date(parsedEvent.date),
      location: parsedEvent.location,
      category: parsedEvent.category as Event['category'],
      status: 'approved',
      trackingId: parsedEvent.trackingId,
      extractedFrom: emailId as string,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addEvent(newEvent);
    if (accessToken) {
      CalendarService.createEvent(accessToken, newEvent);
    }
    Alert.alert('Success', 'Event has been added to your events list!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleEdit = () => {
    if (!parsedEvent) return;
    
    // Create a temporary event for editing
    const tempEvent: Event = {
      id: 'temp_' + Date.now(),
      title: parsedEvent.title,
      date: new Date(parsedEvent.date),
      location: parsedEvent.location,
      category: parsedEvent.category as Event['category'],
      status: 'pending',
      trackingId: parsedEvent.trackingId,
      extractedFrom: emailId as string,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    router.push({
      pathname: '/edit/[eventId]',
      params: { 
        eventId: tempEvent.id,
        isFromParse: 'true',
        parsedEvent: JSON.stringify(parsedEvent),
        emailId: emailId
      }
    });
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Event',
      'Are you sure you want to reject this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      delivery: '#3B82F6',
      travel: '#10B981',
      appointment: '#F59E0B',
      ticket: '#EF4444',
      subscription: '#8B5CF6',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  if (!email || !parsedEvent) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDark && styles.darkSubtext]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Parse Preview</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
            Review the extracted event details
          </Text>
        </View>

        <View style={styles.content}>
          {/* Email Content */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Original Email</Text>
            <GlassCard style={[styles.card, isDark && styles.darkCard]}>
              <View style={styles.emailHeader}>
                <Text style={[styles.sender, isDark && styles.darkText]}>{email.sender}</Text>
                <Text style={[styles.date, isDark && styles.darkSubtext]}>
                  {formatDate(email.receivedAt)}
                </Text>
              </View>
              <Text style={[styles.subject, isDark && styles.darkText]}>{email.subject}</Text>
              <Text style={[styles.contentText, isDark && styles.darkSubtext]}>{email.content}</Text>
            </GlassCard>
          </View>

          {/* Extracted Event */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Extracted Event</Text>
            <GlassCard style={[styles.card, isDark && styles.darkCard]}>
              <View style={styles.eventHeader}>
                <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(parsedEvent.category) }]} />
                <Text style={[styles.eventTitle, isDark && styles.darkText]}>{parsedEvent.title}</Text>
              </View>
              
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDark && styles.darkSubtext]}>Date:</Text>
                  <Text style={[styles.detailValue, isDark && styles.darkText]}>
                    {formatDate(parsedEvent.date)}
                  </Text>
                </View>
                
                {parsedEvent.location && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isDark && styles.darkSubtext]}>Location:</Text>
                    <Text style={[styles.detailValue, isDark && styles.darkText]}>
                      {parsedEvent.location}
                    </Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDark && styles.darkSubtext]}>Category:</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(parsedEvent.category) + '20' }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(parsedEvent.category) }]}>
                      {parsedEvent.category}
                    </Text>
                  </View>
                </View>
                
                {parsedEvent.trackingId && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isDark && styles.darkSubtext]}>Tracking ID:</Text>
                    <Text style={[styles.detailValue, isDark && styles.darkText]}>
                      {parsedEvent.trackingId}
                    </Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDark && styles.darkSubtext]}>Confidence:</Text>
                  <Text style={[styles.detailValue, isDark && styles.darkText]}>
                    {Math.round(parsedEvent.confidence * 100)}%
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Raw Extractions */}
          {parsedEvent.rawExtractions && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Raw Extractions</Text>
              <GlassCard style={[styles.card, isDark && styles.darkCard]}>
                <Text style={[styles.rawData, isDark && styles.darkSubtext]}>
                  {JSON.stringify(parsedEvent.rawExtractions, null, 2)}
                </Text>
              </GlassCard>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={handleReject}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={handleApprove}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    marginHorizontal: 0,
  },
  darkCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  emailHeader: {
    marginBottom: 12,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  subject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
    marginTop: 4,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  eventDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rawData: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
});
