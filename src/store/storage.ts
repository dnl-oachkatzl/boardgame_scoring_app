import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppData } from './types';

const KEY = 'bga_data_v1';

const DEFAULTS: AppData = { games: [], players: [], sessions: [] };

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppData) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}
