import { OAuthConfig } from '@/services/oauthConfig';
import { Secure } from '@/utils/secure';
import Constants from 'expo-constants';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';

type AuthContextType = {
  isAuthenticated: boolean;
  accessToken?: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    (async () => {
      const token = await Secure.getItem('google_access_token');
      if (token) setAccessToken(token);
    })();
    if (Platform.OS === 'web') {
      try {
        const hash = (globalThis.location && globalThis.location.hash) || '';
        if (hash.startsWith('#')) {
          const params = new URLSearchParams(hash.slice(1));
          const at = params.get('access_token');
          if (at) {
            setAccessToken(at);
            Secure.setItem('google_access_token', at);
            const url = new URL(globalThis.location as unknown as string);
            url.hash = '';
            globalThis.history.replaceState({}, '', url.toString());
          }
        }
      } catch {}
    }
  }, []);

  const signIn = async () => {
    const appScheme = Array.isArray(Constants.expoConfig?.scheme)
      ? Constants.expoConfig?.scheme[0]
      : Constants.expoConfig?.scheme || 'seamless';
    const redirectUriBase = OAuthConfig.redirectUriBase;
    const redirectUriWeb = (typeof window !== 'undefined' && (process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI_WEB || window.location.origin)) || redirectUriBase;
    const clientId = Platform.OS === 'web'
      ? OAuthConfig.clientIdWeb
      : OAuthConfig.clientIdWeb;
    if (!clientId) {
      console.error('Missing Google OAuth client IDs in app.json extra.googleOauth');
      return;
    }
    if (Platform.OS === 'web') {
      const params = new URLSearchParams({
        client_id: clientId!,
        redirect_uri: redirectUriWeb,
        response_type: 'token',
        scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
        include_granted_scopes: 'true',
        prompt: 'consent',
      });
      const authUrl = `${discovery.authorizationEndpoint}?${params.toString()}`;
      globalThis.location.href = authUrl;
      return;
    }

    const AuthSession = await getAuthSessionAsync();
    if (!AuthSession?.startAsync) {
      console.warn('expo-auth-session startAsync unavailable on native. Build a Dev Client.');
      return;
    }
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const params = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
      include_granted_scopes: 'true',
      prompt: 'consent',
    });
    const authUrl = `${discovery.authorizationEndpoint}?${params.toString()}`;
    const result: any = await AuthSession.startAsync({ authUrl, returnUrl: redirectUri });
    if (result?.type === 'success' && result?.params?.access_token) {
      const token = result.params.access_token as string;
      setAccessToken(token);
      await Secure.setItem('google_access_token', token);
    }
  };

  const signOut = async () => {
    setAccessToken(undefined);
    await Secure.deleteItem('google_access_token');
  };

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated: !!accessToken,
    accessToken,
    signIn,
    signOut,
  }), [accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
const getAuthSessionAsync = async (): Promise<any | undefined> => {
  try {
    const mod = await import('expo-auth-session');
    return mod as any;
  } catch {
    return undefined;
  }
};
