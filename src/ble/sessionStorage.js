import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@smart_tmj/monitoring_sessions';

export async function getSavedSessions() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMonitoringSession(session) {
  try {
    const sessions = await getSavedSessions();
    const updated = [session, ...sessions].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function clearSavedSessions() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
