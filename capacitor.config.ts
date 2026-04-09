import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.focus.study',
  appName: 'Focus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
