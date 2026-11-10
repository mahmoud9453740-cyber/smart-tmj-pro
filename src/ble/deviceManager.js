import { blePipeline } from './blePipeline';
import { monitoringEngine } from './monitoringEngine';
import { bleTransport } from './bleTransport';
import { sensorBridge } from './sensorBridge';
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
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.manualDisconnect = false;
    this.transportSubscription = bleTransport.subscribe(state => {
      if (state.lastDisconnectedDevice && !this.manualDisconnect) {
        this.scheduleReconnect(state.lastDisconnectedDevice);
      }
      if (state.scanning) this.status = DEVICE_STATUS.SCANNING;
      else if (state.connectedDevice) {
        this.status = DEVICE_STATUS.CONNECTED;
        this.activeDevice = state.connectedDevice;
      } else if (state.error) this.status = DEVICE_STATUS.ERROR;
      else if (this.status === DEVICE_STATUS.RECONNECTING) {
        // Keep the reconnecting state while a retry is scheduled.
      } else if (this.status !== DEVICE_STATUS.SCANNING) {
        this.status = DEVICE_STATUS.DISCONNECTED;
        this.activeDevice = null;
      }
      this.notify();
    });
  }

  scheduleReconnect(deviceId) {
    if (!BLE_DEVICE_CONFIG.reconnect || this.manualDisconnect || this.reconnectTimer) return;
    if (this.reconnectAttempts >= 3) {
      this.status = DEVICE_STATUS.ERROR;
      this.notify();
      return;
    }
    this.reconnectAttempts += 1;
    this.status = DEVICE_STATUS.RECONNECTING;
    this.notify();
    const delay = 1500 * (2 ** (this.reconnectAttempts - 1));
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.manualDisconnect) return;
      try {
        await bleTransport.connect(deviceId);
        this.activeDevice = bleTransport.getState().connectedDevice;
        this.status = DEVICE_STATUS.CONNECTED;
        this.reconnectAttempts = 0;
        this.notify();
      } catch {
        this.scheduleReconnect(deviceId);
      }
    }, delay);
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
      bluetooth: bleTransport.getState(),
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try { listener(state); } catch (error) {
        console.warn('Device manager listener failed', error);
      }
    });
  }

  async initialize() {
    return bleTransport.initialize();
  }

  async scan(durationMs = BLE_DEVICE_CONFIG.scanDuration) {
    this.devices = [];
    this.notify();
    await bleTransport.startScan(device => {
      const existing = this.devices.findIndex(item => item.id === device.id);
      const normalized = {
        id: device.id,
        name: device.name || device.localName || 'Unknown BLE device',
        rssi: device.rssi ?? null,
        isConnectable: device.isConnectable ?? null,
      };
      if (existing >= 0) this.devices[existing] = normalized;
      else this.devices.push(normalized);
      this.notify();
    }, durationMs);
  }

  stopScan() {
    bleTransport.stopScan();
  }

  async connect(deviceId) {
    this.manualDisconnect = false;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.status = DEVICE_STATUS.CONNECTING;
    this.notify();
    try {
      const device = await bleTransport.connect(deviceId);
      this.activeDevice = {
        id: device.id,
        name: device.name || device.localName || 'Unknown BLE device',
      };
      this.status = DEVICE_STATUS.CONNECTED;
      this.notify();
      return this.activeDevice;
    } catch (error) {
      this.status = DEVICE_STATUS.ERROR;
      this.notify();
      throw error;
    }
  }

  async configureGatt(config) {
    const saved = bleTransport.setGattConfig(config);
    if (this.activeDevice) await bleTransport.attachNotifications();
    return saved;
  }

  async disconnect() {
    this.manualDisconnect = true;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    await bleTransport.disconnect();
    this.activeDevice = null;
    this.status = DEVICE_STATUS.DISCONNECTED;
    this.notify();
  }

  receiveSensorData(raw) {
    return blePipeline.processMessage(raw);
  }

  setDetectionThreshold(value, channel = 'all') {
    const saved = monitoringEngine.setThreshold(value, channel);
    this.notify();
    return saved;
  }

  getDetectionThresholds() {
    return monitoringEngine.getThresholds();
  }

  resetMonitoringData() {
    sensorBridge.reset();
    this.notify();
    return true;
  }

  async sendCommand(command, value = null) {
    return bleTransport.writeCommand(command, value);
  }

  getSupportedProfiles() {
    return [...BLE_DEVICE_CONFIG.supportedProfiles];
  }
}

export const deviceManager = new DeviceManager();
