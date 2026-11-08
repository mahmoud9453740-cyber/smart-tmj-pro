import { blePipeline } from './blePipeline';

const listeners = new Set();

export const sensorBridge = {
  receive(raw) {
    const result = blePipeline.processMessage(raw);
    if (!result) return null;

    const readings = blePipeline.getLatestReadings();
    const events = blePipeline.getEvents();

    const snapshot = { readings, events, receivedAt: Date.now() };
    listeners.forEach((listener) => listener(snapshot));
    return snapshot;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return {
      readings: blePipeline.getLatestReadings(),
      events: blePipeline.getEvents(),
    };
  },
};
