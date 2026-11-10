import { blePipeline } from './blePipeline';
import { monitoringEngine } from './monitoringEngine';

const listeners = new Set();

function createSnapshot() {
  return {
    readings: blePipeline.getLatestReadings(),
    events: blePipeline.getEvents(),
    receivedAt: Date.now(),
    eventDetectionReady: Object.values(monitoringEngine.getThresholds()).some(value => value !== null),
    thresholds: monitoringEngine.getThresholds(),
  };
}

export const sensorBridge = {
  receive(raw) {
    const result = blePipeline.processMessage(raw);
    if (!result) return null;

    const snapshot = createSnapshot();
    listeners.forEach(listener => {
      try { listener(snapshot); } catch (error) {
        console.warn('Sensor monitor subscriber failed', error);
      }
    });
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
      receivedAt: null,
      eventDetectionReady: Object.values(monitoringEngine.getThresholds()).some(value => value !== null),
      thresholds: monitoringEngine.getThresholds(),
    };
  },
};
