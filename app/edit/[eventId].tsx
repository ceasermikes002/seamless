import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, FileText, MapPin, Save, Tag, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { useEvents } from '../../contexts/EventContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Event, EventCategory } from '../../types';

export default function EventEditorScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { events, editEvent } = useEvents();
  const { theme } = useTheme();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    category: 'appointment' as EventCategory,
    notes: '',
  });

  useEffect(() => {
    if (eventId) {
      const existingEvent = events.find(e => e.id === eventId);
      if (existingEvent) {
        setEvent(existingEvent);
        setFormData({
          title: existingEvent.title,
          date: existingEvent.date.toISOString().slice(0, 10),
          time: `${existingEvent.date.getHours().toString().padStart(2, '0')}:${existingEvent.date.getMinutes().toString().padStart(2, '0')}`,
          location: existingEvent.location || '',
          category: existingEvent.category,
          notes: existingEvent.notes || '',
        });
      }
    }
  }, [eventId, events]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.date) {
      Alert.alert('Validation Error', 'Title and date are required fields.');
      return;
    }

    if (event) {
      const composedDate = formData.time
        ? new Date(`${formData.date}T${formData.time}`)
        : new Date(formData.date);

      editEvent(event.id, {
        title: formData.title.trim(),
        date: composedDate,
        location: formData.location.trim() || undefined,
        category: formData.category,
        notes: formData.notes.trim() || undefined,
        updatedAt: new Date(),
      });

      router.back();
    }
  };

  const categoryColors: Record<EventCategory, string> = {
    delivery: 'bg-indigo-500',
    travel: 'bg-blue-500',
    appointment: 'bg-purple-500',
    ticket: 'bg-pink-500',
    subscription: 'bg-green-500',
  };

  const categoryOptions: { value: EventCategory; label: string }[] = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'travel', label: 'Travel' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'ticket', label: 'Ticket' },
    { value: 'subscription', label: 'Subscription' },
  ];

  if (!event) {
    return (
      <View className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800">
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <Text className="text-white text-lg">Event not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800">
      <View className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-bold">Edit Event</Text>
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <GlassCard intensity={60} className="mb-4">
            <View className="flex-row items-center mb-4">
              <Tag size={20} color="#ffffff" className="mr-3" />
              <Text className="text-white text-lg font-semibold">Basic Information</Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">Title *</Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter event title"
                placeholderTextColor="#9ca3af"
                className="bg-white/10 rounded-lg p-3 text-white border border-white/20"
              />
            </View>

            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-300 text-sm mb-2">Date *</Text>
                <View className="flex-row items-center bg-white/10 rounded-lg p-3 border border-white/20">
                  <Calendar size={16} color="#9ca3af" className="mr-2" />
                  <TextInput
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-white"
                  />
                </View>
              </View>
              
              <View className="flex-1">
                <Text className="text-gray-300 text-sm mb-2">Time</Text>
                <View className="flex-row items-center bg-white/10 rounded-lg p-3 border border-white/20">
                  <Clock size={16} color="#9ca3af" className="mr-2" />
                  <TextInput
                    value={formData.time}
                    onChangeText={(text) => setFormData({ ...formData, time: text })}
                    placeholder="HH:MM"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-white"
                  />
                </View>
              </View>
            </View>
          </GlassCard>

          <GlassCard intensity={60} className="mb-4">
            <View className="flex-row items-center mb-4">
              <MapPin size={20} color="#ffffff" className="mr-3" />
              <Text className="text-white text-lg font-semibold">Location & Details</Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">Location</Text>
              <TextInput
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Enter location"
                placeholderTextColor="#9ca3af"
                className="bg-white/10 rounded-lg p-3 text-white border border-white/20"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setFormData({ ...formData, category: option.value })}
                    className={`px-3 py-2 rounded-full ${
                      formData.category === option.value
                        ? categoryColors[option.value]
                        : 'bg-white/20'
                    }`}
                  >
                    <Text className={`text-sm ${
                      formData.category === option.value
                        ? 'text-white font-semibold'
                        : 'text-gray-300'
                    }`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassCard>

          <GlassCard intensity={60} className="mb-6">
            <View className="flex-row items-center mb-4">
              <FileText size={20} color="#ffffff" className="mr-3" />
              <Text className="text-white text-lg font-semibold">Additional Notes</Text>
            </View>
            
            <TextInput
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Add any additional notes or details"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              className="bg-white/10 rounded-lg p-3 text-white border border-white/20 min-h-[100px]"
            />
          </GlassCard>

          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center"
          >
            <Save size={20} color="#ffffff" className="mr-2" />
            <Text className="text-white text-lg font-semibold">Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

