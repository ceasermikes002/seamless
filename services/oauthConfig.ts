import Constants from 'expo-constants';

const scheme = Array.isArray(Constants.expoConfig?.scheme)
  ? Constants.expoConfig?.scheme[0]
  : Constants.expoConfig?.scheme || 'seamless';

export const OAuthConfig = {
  clientIdWeb: (typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB : undefined) || Constants.expoConfig?.extra?.googleOauth?.clientIdWeb,
  clientIdAndroid: (typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID : undefined) || Constants.expoConfig?.extra?.googleOauth?.clientIdAndroid,
  clientIdIOS: (typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS : undefined) || Constants.expoConfig?.extra?.googleOauth?.clientIdIOS,
  redirectUriBase: Constants.expoConfig?.extra?.googleOauth?.redirectUri || `${scheme}://redirect`,
};

