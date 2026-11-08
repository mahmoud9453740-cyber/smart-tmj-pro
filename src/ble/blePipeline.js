import { bleProtocolAdapter } from './protocolAdapter';
import { sensorProcessor } from './sensorProcessor';
import { monitoringEngine } from './monitoringEngine';

class BLEPipeline {
  constructor() {
    this.onEvent = null;
  }

  setThreshold(value) {
    return monitoringEngine.setThreshold(value);
  }

  receiveSample(channel, value, timestamp = Date.now()) {
    const sample = sensorProcessor.processSample(
      channel,
      value,
      timestamp
    );

    if (!sample) return null;

    const event = monitoringEngine.processSample(sample);

    if (event && this.onEvent) {
      this.onEvent(event);
    }

    return {
      sample,
      event,
    };
  }

  subscribeToEvents(callback) {
    this.onEvent = callback;
    return () => {
      if (this.onEvent === callback) {
        this.onEvent = null;
      }
    };
  }

  processRawMessage(raw) {
    const parsed = bleProtocolAdapter.parseMessage(raw);
    if (!parsed) return null;

    this.latestRawReading = parsed;

    if (typeof sensorProcessor.processReading === 'function') {
      sensorProcessor.processReading(parsed);
    } else if (typeof sensorProcessor.addReading === 'function') {
      sensorProcessor.addReading(parsed);
    }

    return parsed;
  }

  processMessage(raw) {
    const parsed = bleProtocolAdapter.parseMessage(raw);
    if (!parsed) return null;

    const samples = [];

    if (parsed.left !== null) {
      const sample = sensorProcessor.processSample(
        'left', parsed.left, parsed.timestamp
      );
      if (sample) {
        monitoringEngine.processSample(sample);
        samples.push(sample);
      }
    }

    if (parsed.right !== null) {
      const sample = sensorProcessor.processSample(
        'right', parsed.right, parsed.timestamp
      );
      if (sample) {
        monitoringEngine.processSample(sample);
        samples.push(sample);
      }
    }

    return samples;
  }

  processSample(channel, value, timestamp = Date.now()) {
    const sample = sensorProcessor.processSample(channel, value, timestamp);
    if (sample) monitoringEngine.processSample(sample);
    return sample;
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
  }
}

export const blePipeline = new BLEPipeline();
