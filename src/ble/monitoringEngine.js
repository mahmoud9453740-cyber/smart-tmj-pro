class MonitoringEngine {
  constructor() {
    this.threshold = null;
    this.activeEvent = null;
    this.events = [];
  }

  setThreshold(value) {
    const threshold = Number(value);
    if (!Number.isFinite(threshold) || threshold < 0) return false;

    this.threshold = threshold;
    return true;
  }

  processSample(sample) {
    if (!sample || !Number.isFinite(sample.value)) return null;
    if (this.threshold === null) return null;

    const isActive = Math.abs(sample.value) >= this.threshold;

    if (isActive && !this.activeEvent) {
      this.activeEvent = {
        startTime: sample.timestamp,
        peakValue: Math.abs(sample.value),
        channel: sample.channel,
      };
    } else if (isActive && this.activeEvent) {
      this.activeEvent.peakValue = Math.max(
        this.activeEvent.peakValue,
        Math.abs(sample.value)
      );
    } else if (!isActive && this.activeEvent) {
      const event = {
        ...this.activeEvent,
        endTime: sample.timestamp,
        duration: Math.max(
          0,
          sample.timestamp - this.activeEvent.startTime
        ),
      };

      this.events.push(event);
      this.activeEvent = null;
      return event;
    }

    return null;
  }

  getEvents() {
    return [...this.events];
  }

  reset() {
    this.activeEvent = null;
    this.events = [];
  }
}

export const monitoringEngine = new MonitoringEngine();
