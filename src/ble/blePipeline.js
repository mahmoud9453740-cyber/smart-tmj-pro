import { bleProtocolAdapter } from './protocolAdapter';
import { sensorProcessor } from './sensorProcessor';
import { monitoringEngine } from './monitoringEngine';

class BLEPipeline {
  constructor() {
    this.eventListeners = new Set();
    this.latestRawReading = null;
  }

  setThreshold(value) {
    return monitoringEngine.setThreshold(value);
  }

  receiveSample(channel, value, timestamp = Date.now()) {
    const sample = sensorProcessor.processSample(channel, value, timestamp);
    if (!sample) return null;

    const event = monitoringEngine.processSample(sample);
    if (event) this.emitEvent(event);

    return { sample, event };
  }

  emitEvent(event) {
    this.eventListeners.forEach(listener => {
      try { listener(event); } catch (error) {
        console.warn('BLE event listener failed', error);
      }
    });
  }

  subscribeToEvents(callback) {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  processRawMessage(raw) {
    return this.processMessage(raw);
  }

  processMessage(raw) {
    const parsed = bleProtocolAdapter.parseMessage(raw);
    if (!parsed) return null;

    this.latestRawReading = parsed;
    const samples = [];
    const events = [];

    for (const channel of ['left', 'right', 'wristband']) {
      const value = parsed[channel];
      if (value === null || value === undefined) continue;
      const result = this.receiveSample(channel, value, parsed.timestamp);
      if (result && result.sample) samples.push(result.sample);
      if (result && result.event) events.push(result.event);
    }

    return samples.length ? { parsed, samples, events } : null;
  }

  processSample(channel, value, timestamp = Date.now()) {
    return this.receiveSample(channel, value, timestamp);
  }

  getLatestReadings() {
    return sensorProcessor.getLatest();
  }

  getEvents() {
    return monitoringEngine.getEvents();
  }

  reset() {
    sensorProcessor.reset();
    monitoringEngine.reset();
    this.latestRawReading = null;
  }
}

export const blePipeline = new BLEPipeline();
