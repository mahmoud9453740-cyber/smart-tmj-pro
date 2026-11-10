import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@smart_tmj/monitoring_sessions';
let writeQueue = Promise.resolve();

export async function getSavedSessions() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getSavedMonitoringEvents(patientId = 'default-patient') {
  const snapshots = await getSavedSessions();
  const unique = new Map();

  snapshots.filter(snapshot => (snapshot.patientId || 'default-patient') === patientId).forEach(snapshot => {
    (Array.isArray(snapshot.events) ? snapshot.events : []).forEach(event => {
      if (!event || !event.startTime) return;
      const key = String(event.channel || 'sensor') + ':' + String(event.startTime);
      const previous = unique.get(key);
      if (!previous || Number(event.duration) > Number(previous.duration)) {
        unique.set(key, event);
      }
    });
  });

  return Array.from(unique.values()).sort((a,b) => Number(a.startTime)-Number(b.startTime));
}

export function saveMonitoringSession(session) {
  const task = writeQueue.then(async () => {
    try {
      const sessions = await getSavedSessions();
      const updated = [session, ...sessions].slice(0, 200);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  });
  writeQueue = task.catch(() => false);
  return task;
}

export async function clearSavedSessions() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
