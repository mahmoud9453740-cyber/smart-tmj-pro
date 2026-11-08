import { SENSOR_CHANNELS } from './deviceConfig';

class SensorProcessor {
  constructor() {
    this.latest = {
      left: null,
      right: null,
      wristband: null,
    };
    this.history = [];
  }

  processSample(channel, value, timestamp = Date.now()) {
    if (!Object.values(SENSOR_CHANNELS).includes(channel)) {
      return null;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return null;
    }

    const sample = {
      channel,
      value: numericValue,
      timestamp,
    };

    this.latest[channel] = sample;
    this.history.push(sample);

    if (this.history.length > 1000) {
      this.history.shift();
    }

    return sample;
  }

  getLatest() {
    return { ...this.latest };
  }

  getHistory() {
    return [...this.history];
  }

  reset() {
    this.latest = {
      left: null,
      right: null,
      wristband: null,
    };
    this.history = [];
  }
}

export const sensorProcessor = new SensorProcessor();
