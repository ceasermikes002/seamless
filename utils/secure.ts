import { Platform } from 'react-native';
let _asyncStorage: any;
const getAsyncStorage = (): any | undefined => {
  if (_asyncStorage !== undefined) return _asyncStorage;
  try {
    const _req = eval('require');
    _asyncStorage = _req('@react-native-async-storage/async-storage');
    return _asyncStorage;
  } catch {
    _asyncStorage = undefined;
    return undefined;
  }
};
const memory: Record<string, string> = {};

const getSecureStore = (): any | undefined => {
  if (Platform.OS === 'web') return undefined;
  try {
    const _req = eval('require');
    return _req('expo-secure-store');
  } catch {
    return undefined;
  }
};

export const Secure = {
  async getItem(key: string): Promise<string | null> {
    const SecureStore = getSecureStore();
    if (SecureStore) {
      return await SecureStore.getItemAsync(key);
    }
    const AS = getAsyncStorage();
    if (AS) {
      try {
        const v = await AS.getItem(key);
        return v;
      } catch {
        return null;
      }
    }
    return memory[key] ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    const SecureStore = getSecureStore();
    if (SecureStore) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const AS = getAsyncStorage();
    if (AS) {
      await AS.setItem(key, value);
      return;
    }
    memory[key] = String(value);
  },
  async deleteItem(key: string): Promise<void> {
    const SecureStore = getSecureStore();
    if (SecureStore) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    const AS = getAsyncStorage();
    if (AS) {
      await AS.removeItem(key);
      return;
    }
    delete memory[key];
  },
};
