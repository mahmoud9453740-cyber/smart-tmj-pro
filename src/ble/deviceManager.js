import { blePipeline } from './blePipeline';
import {
  BLE_DEVICE_CONFIG,
  DEVICE_STATUS,
} from './deviceConfig';

class DeviceManager {
  constructor() {
    this.status = DEVICE_STATUS.DISCONNECTED;
    this.devices = [];
    this.activeDevice = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());

    return () => this.listeners.delete(listener);
  }

  getState() {
    return {
      status: this.status,
      devices: [...this.devices],
      activeDevice: this.activeDevice,
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  setStatus(status) {
    this.status = status;
    this.notify();
  }

  setDiscoveredDevices(devices) {
    this.devices = devices;
    this.notify();
  }

  setActiveDevice(device) {
    this.activeDevice = device;
    this.setStatus(
      device ? DEVICE_STATUS.CONNECTED : DEVICE_STATUS.DISCONNECTED
    );
  }

  receiveSensorData(raw) {
    return blePipeline.processMessage(raw);
  }

  disconnect() {
    this.activeDevice = null;
    this.setStatus(DEVICE_STATUS.DISCONNECTED);
  }

  getSupportedProfiles() {
    return [...BLE_DEVICE_CONFIG.supportedProfiles];
  }
}

export const deviceManager = new DeviceManager();
