import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getCactus = (): any | undefined => {
  if (Platform.OS === 'web') return undefined;
  try {
    const _req = eval('require');
    return _req('cactus-react-native');
  } catch {
    return undefined;
  }
};

export default function CactusExamplesScreen() {
  const { isDark } = useTheme();
  const [output, setOutput] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const cactus = getCactus();

  const ensureModel = async (lm: any) => {
    setOutput('');
    setProgress(0);
    await lm.download({ onProgress: (p: number) => setProgress(p) });
  };

  const runCompletion = useCallback(async () => {
    if (!cactus?.CactusLM) return;
    const { CactusConfig } = require('@/services/cactusConfig');
    const lm = CactusConfig.textModel ? new cactus.CactusLM({ model: CactusConfig.textModel }) : new cactus.CactusLM();
    await ensureModel(lm);
    const messages = [{ role: 'user', content: 'Hello, World!' }];
    const result = await lm.complete({ messages });
    setOutput(result.response);
    await lm.destroy();
  }, [cactus]);

  const runVision = useCallback(async () => {
    if (!cactus?.CactusLM) return;
    const { CactusConfig } = require('@/services/cactusConfig');
    const lm = new cactus.CactusLM({ model: CactusConfig.visionModel });
    await ensureModel(lm);
    const messages = [{ role: 'user', content: "What's in the image?", images: [Image.resolveAssetSource(require('@/assets/images/icon.png')).uri] }];
    const result = await lm.complete({ messages });
    setOutput(result.response);
    await lm.destroy();
  }, [cactus]);

  const runToolCall = useCallback(async () => {
    if (!cactus?.CactusLM) return;
    const tools = [
      {
        name: 'get_weather',
        description: 'Get current weather for a location',
        parameters: {
          type: 'object',
          properties: { location: { type: 'string', description: 'City name' } },
          required: ['location'],
        },
      },
    ];
    const lm = new cactus.CactusLM();
    await ensureModel(lm);
    const messages = [{ role: 'user', content: "What's the weather in San Francisco?" }];
    const result = await lm.complete({ messages, tools });
    setOutput(JSON.stringify({ response: result.response, functionCalls: result.functionCalls }, null, 2));
    await lm.destroy();
  }, [cactus]);

  const runRag = useCallback(async () => {
    if (!cactus?.CactusLM) return;
    const lm = new cactus.CactusLM({ corpusDir: 'path/to/your/corpus' });
    await ensureModel(lm);
    const messages = [{ role: 'user', content: 'What information is in the documents?' }];
    const result = await lm.complete({ messages });
    setOutput(result.response);
    await lm.destroy();
  }, [cactus]);

  const runTextEmbedding = useCallback(async () => {
    if (!cactus?.CactusLM) return;
    const { CactusConfig } = require('@/services/cactusConfig');
    const lm = CactusConfig.textModel ? new cactus.CactusLM({ model: CactusConfig.textModel }) : new cactus.CactusLM();
    await ensureModel(lm);
    const result = await lm.embed({ text: 'Hello, World!' });
    setOutput(`Embedding length: ${result.embedding.length}`);
    await lm.destroy();
  }, [cactus]);

  const runImageEmbedding = useCallback(async () => {
    if (!cactus?.CactusLM) return;
    const { CactusConfig } = require('@/services/cactusConfig');
    const lm = new cactus.CactusLM({ model: CactusConfig.visionModel });
    await ensureModel(lm);
    const imagePath = Image.resolveAssetSource(require('@/assets/images/icon.png')).uri;
    const result = await lm.imageEmbed({ imagePath });
    setOutput(`Embedding length: ${result.embedding.length}`);
    await lm.destroy();
  }, [cactus]);

  const disabled = false;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Cactus SDK Examples</Text>
        <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>Run local AI examples on-device</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} onPress={runCompletion} disabled={disabled}>
            <Text style={styles.buttonText}>Completion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} onPress={runVision} disabled={false}>
            <Text style={styles.buttonText}>Vision</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} onPress={runToolCall} disabled={disabled}>
            <Text style={styles.buttonText}>Tool Calling</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} onPress={runRag} disabled={disabled}>
            <Text style={styles.buttonText}>RAG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} onPress={runTextEmbedding} disabled={disabled}>
            <Text style={styles.buttonText}>Text Embedding</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} onPress={runImageEmbedding} disabled={disabled}>
            <Text style={styles.buttonText}>Image Embedding</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.output}>
          {disabled ? (
            <Text style={[styles.outputText, isDark && styles.darkSubtext]}>Run on a native build to use Cactus SDK.</Text>
          ) : (
            <>
              <Text style={[styles.progress, isDark && styles.darkSubtext]}>Download: {Math.round(progress * 100)}%</Text>
              <Text style={[styles.outputText, isDark && styles.darkText]}>{output}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  darkContainer: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  content: { padding: 20 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  button: { backgroundColor: '#6B46C1', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  output: { marginTop: 16 },
  progress: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  outputText: { fontSize: 14, color: '#1F2937' },
  darkText: { color: '#F9FAFB' },
  darkSubtext: { color: '#9CA3AF' },
});
