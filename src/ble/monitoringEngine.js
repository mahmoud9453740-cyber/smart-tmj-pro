/**
 * Raw-signal event segmentation.
 *
 * Thresholds are hardware-specific raw units and must be calibrated for the
 * connected sensor/firmware. Events are activity segments, not a diagnosis of
 * sleep bruxism or a validated clinical Bruxism Index.
 */
class MonitoringEngine {
  constructor() {
    this.thresholds = { left: null, right: null, wristband: null };
    this.activeEvents = { left: null, right: null, wristband: null };
    this.events = [];
    this.minimumEventDurationMs = 250;
  }

  setThreshold(value, channel = 'all') {
    const threshold = Number(value);
    if (!Number.isFinite(threshold) || threshold < 0) return false;
    const channels = channel === 'all' ? Object.keys(this.thresholds) : [channel];
    if (channels.some(key => !Object.prototype.hasOwnProperty.call(this.thresholds, key))) return false;
    channels.forEach(key => { this.thresholds[key] = threshold; });
    return true;
  }

  getThresholds() {
    return { ...this.thresholds };
  }

  processSample(sample) {
    if (!sample || !Number.isFinite(sample.value)) return null;
    const channel = sample.channel;
    if (!Object.prototype.hasOwnProperty.call(this.thresholds, channel)) return null;
    const threshold = this.thresholds[channel];
    if (threshold === null) return null;

    const magnitude = Math.abs(sample.value);
    const active = magnitude >= threshold;
    const current = this.activeEvents[channel];

    if (active && !current) {
      this.activeEvents[channel] = {
        startTime: sample.timestamp,
        peakValue: magnitude,
        channel,
      };
      return null;
    }

    if (active && current) {
      current.peakValue = Math.max(current.peakValue, magnitude);
      return null;
    }

    if (!active && current) {
      this.activeEvents[channel] = null;
      const duration = Math.max(0, sample.timestamp - current.startTime);
      if (duration < this.minimumEventDurationMs) return null;

      const event = {
        ...current,
        endTime: sample.timestamp,
        duration,
        classification: 'threshold-crossing activity',
        threshold,
        unit: 'raw sensor units',
      };
      this.events.push(event);
      if (this.events.length > 500) this.events.shift();
      return event;
    }

    return null;
  }

  getEvents() {
    return [...this.events];
  }

  reset() {
    this.activeEvents = { left: null, right: null, wristband: null };
    this.events = [];
  }
}

export const monitoringEngine = new MonitoringEngine();
