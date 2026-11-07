/* ============================================================
   KoliBus Transport — Configuration & constantes
   ============================================================ */
import Constants from 'expo-constants';

/** URL du projet Supabase — renseigner dans app.json extra ou via
 *  variables d'environnement EAS (eas secret:create). */
export const SUPABASE_URL: string =
  (Constants.expoConfig?.extra as { supabaseUrl?: string })?.supabaseUrl ?? '';
export const SUPABASE_ANON_KEY: string =
  (Constants.expoConfig?.extra as { supabaseAnonKey?: string })?.supabaseAnonKey ?? '';

export const APP = {
  name: 'KoliBus Transport',
  slogan: 'Réserver. Suivre. Récupérer.',
  colors: {
    green: '#123D33',
    greenDark: '#0C2E27',
    amber: '#F6C25C',
    cream: '#F7F2E7',
    ink: '#14231E',
    slate: '#5F6B62',
    line: '#E7E2D4',
    white: '#FFFFFF',
    red: '#D64545',
  },
} as const;

/** GPS — fréquence raisonnable (batterie + budget base de données) */
export const GPS_CONFIG = {
  accuracy: 3 as const,            // Balanced = quelques dizaines de mètres
  distanceInterval: 25,            // mètres min. entre deux envois
  timeInterval: 15000,             // ms max entre deux envois
  foregroundService: {
    notificationTitle: 'KoliBus — mission active',
    notificationBody: 'Transmission de la position du véhicule pendant la mission.',
    notificationColor: '#123D33',
    killServiceOnDestroy: true,
  },
} as const;
