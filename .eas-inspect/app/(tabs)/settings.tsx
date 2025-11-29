import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useEmails } from '@/contexts/EmailContext';
import { useEvents } from '@/contexts/EventContext';
import { useTheme } from '@/contexts/ThemeContext';
// Removed mock data imports for real implementation
import { Storage } from '@/utils/storage';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { toggleTheme, isDark } = useTheme();
  const { refreshEmails } = useEmails();
  const { refreshEvents } = useEvents();
  const { isAuthenticated, accessToken, signIn, signOut } = useAuth();
  const [developerMode, setDeveloperMode] = useState(false);
  const [showMockData, setShowMockData] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleResetData = () => {
    Storage.clearAll();
    refreshEmails();
    refreshEvents();
  };

  const handleImportMockData = () => {
    alert('Mock data has been removed in real mode. Connect Gmail to import emails.');
  };

  const handleExportData = () => {
    const emails = Storage.getEmails();
    const events = Storage.getEvents();
    const settings = Storage.getSettings();
    
    const exportData = {
      emails,
      events,
      settings,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Export Data:', JSON.stringify(exportData, null, 2));
    alert('Data exported to console. Check developer tools.');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Settings</Text>
        <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
          Customize your email-to-event experience
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Appearance</Text>
          
          <GlassCard style={[styles.settingCard, isDark && styles.darkCard]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  Switch between light and dark themes
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Notifications</Text>
          
          <GlassCard style={[styles.settingCard, isDark && styles.darkCard]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>Enable Notifications</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  Get notified about new events and updates
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Data Management</Text>
          
          <GlassCard style={[styles.settingCard, isDark && styles.darkCard]}>
            <TouchableOpacity style={styles.settingButton} onPress={handleImportMockData}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>Import Mock Data</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  Load sample emails and events
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingButton} onPress={handleResetData}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>Reset All Data</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  Clear all emails and events
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingButton} onPress={handleExportData}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>Export Data</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  Export data to console for debugging
                </Text>
              </View>
            </TouchableOpacity>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Google Account</Text>
          <GlassCard style={[styles.settingCard, isDark && styles.darkCard]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>{isAuthenticated ? 'Signed In' : 'Not Signed In'}</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  {isAuthenticated ? `Access Token: ${accessToken?.slice(0, 8)}...` : 'Connect Google to read Gmail locally'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingButton} onPress={isAuthenticated ? signOut : signIn}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>{isAuthenticated ? 'Sign Out' : 'Sign In with Google'}</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  {isAuthenticated ? 'Disconnect account and clear token' : 'OAuth via Google Accounts'}
                </Text>
              </View>
            </TouchableOpacity>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Developer Options</Text>
          
          <GlassCard style={[styles.settingCard, isDark && styles.darkCard]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDark && styles.darkText]}>Developer Mode</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                  Show additional debugging information
                </Text>
              </View>
              <Switch
                value={developerMode}
                onValueChange={setDeveloperMode}
                trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                thumbColor={developerMode ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            {developerMode && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.settingButton}
                  onPress={() => setShowMockData(!showMockData)}
                >
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, isDark && styles.darkText]}>Show Mock Data</Text>
                    <Text style={[styles.settingDescription, isDark && styles.darkSubtext]}>
                      Display JSON data in console
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>About</Text>
          
          <GlassCard style={[styles.settingCard, isDark && styles.darkCard]}>
            <View style={styles.aboutContent}>
              <Text style={[styles.aboutTitle, isDark && styles.darkText]}>Email-to-Event AI Widget</Text>
              <Text style={[styles.aboutVersion, isDark && styles.darkSubtext]}>Version 1.0.0</Text>
              <Text style={[styles.aboutDescription, isDark && styles.darkSubtext]}>
                Automatically parse transactional emails and convert them into actionable events.
                Powered by AI and built with React Native.
              </Text>
            </View>
          </GlassCard>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 16,
  },
  settingCard: {
    marginHorizontal: 20,
  },
  darkCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingButton: {
    padding: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 16,
  },
  aboutContent: {
    padding: 16,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
});
