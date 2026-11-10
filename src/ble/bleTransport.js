import { BleManager } from '@srivathsav03/react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { sensorBridge } from './sensorBridge';

const manager = new BleManager();
const listeners = new Set();
let scanTimer = null;
let activeDevice = null;
let activeSubscription = null;
let currentGatt = {
  serviceUUID: null,
  notifyCharacteristicUUID: null,
  writeCharacteristicUUID: null,
};
let state = { adapterState: 'Unknown', scanning: false, connectedDevice: null, error: null };

function emit(patch) {
  state = { ...state, ...patch };
  listeners.forEach(listener => {
    try { listener({ ...state }); } catch (error) {
      console.warn('BLE state listener failed', error);
    }
  });
}

async function requestPermissions() {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(results).every(value => value === PermissionsAndroid.RESULTS.GRANTED);
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function decodeBase64Utf8(value) {
  if (!value) return '';
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const clean = value.replace(/[^A-Za-z0-9+/=]/g, '');
    const bytes = [];
    let buffer = 0;
    let bits = 0;
    for (const char of clean) {
      if (char === '=') break;
      const index = alphabet.indexOf(char);
      if (index < 0) continue;
      buffer = (buffer << 6) | index;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((buffer >> bits) & 255);
      }
    }
    const encoded = bytes.map(byte => '%' + byte.toString(16).padStart(2, '0')).join('');
    return decodeURIComponent(encoded);
  } catch {
    return value;
  }
}

function encodeBase64Utf8(value) {
  const binary = unescape(encodeURIComponent(value));
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const hasB = i + 1 < binary.length;
    const hasC = i + 2 < binary.length;
    const b = hasB ? binary.charCodeAt(i + 1) : 0;
    const c = hasC ? binary.charCodeAt(i + 2) : 0;
    output += alphabet[a >> 2];
    output += alphabet[((a & 3) << 4) | (b >> 4)];
    output += hasB ? alphabet[((b & 15) << 2) | (c >> 6)] : '=';
    output += hasC ? alphabet[c & 63] : '=';
  }
  return output;
}

export const bleTransport = {
  subscribe(listener) {
    listeners.add(listener);
    listener({ ...state });
    return () => listeners.delete(listener);
  },

  getState() {
    return { ...state };
  },

  setGattConfig(config = {}) {
    currentGatt = {
      serviceUUID: config.serviceUUID || null,
      notifyCharacteristicUUID: config.notifyCharacteristicUUID || null,
      writeCharacteristicUUID: config.writeCharacteristicUUID || null,
    };
    return { ...currentGatt };
  },

  getGattConfig() {
    return { ...currentGatt };
  },

  async initialize() {
    try {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        emit({ error: 'Bluetooth permissions were not granted.' });
        return false;
      }
      const subscription = manager.onStateChange(adapterState => {
        emit({ adapterState, error: null });
      }, true);
      this._adapterSubscription?.remove?.();
      this._adapterSubscription = subscription;
      return true;
    } catch (error) {
      emit({ error: error.message || 'Bluetooth initialization failed.' });
      return false;
    }
  },

  async startScan(onDevice, durationMs = 12000) {
    const permissionGranted = await requestPermissions();
    if (!permissionGranted) throw new Error('Bluetooth permission denied.');
    if (state.adapterState !== 'PoweredOn') {
      throw new Error('Turn on Bluetooth before scanning.');
    }
    this.stopScan();
    emit({ scanning: true, error: null });
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        this.stopScan();
        emit({ error: error.message || 'BLE scan failed.' });
        return;
      }
      if (device) onDevice?.(device);
    });
    scanTimer = setTimeout(() => this.stopScan(), durationMs);
  },

  stopScan() {
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = null;
    try { manager.stopDeviceScan(); } catch {}
    if (state.scanning) emit({ scanning: false });
  },

  async connect(deviceId) {
    if (!deviceId) throw new Error('A BLE device ID is required.');
    this.stopScan();
    this.disconnect();
    emit({ error: null });
    try {
      const device = await manager.connectToDevice(deviceId, { autoConnect: false });
      activeDevice = await device.discoverAllServicesAndCharacteristics();
      emit({
        connectedDevice: {
          id: activeDevice.id,
          name: activeDevice.name || activeDevice.localName || 'Unknown BLE device',
          rssi: activeDevice.rssi ?? null,
        },
      });
      await this.attachNotifications();
      return activeDevice;
    } catch (error) {
      activeDevice = null;
      emit({ connectedDevice: null, error: error.message || 'BLE connection failed.' });
      throw error;
    }
  },

  async attachNotifications() {
    if (!activeDevice) throw new Error('Connect a device before subscribing to sensor data.');
    if (!currentGatt.serviceUUID || !currentGatt.notifyCharacteristicUUID) {
      emit({ error: 'Connected. Configure the firmware Service UUID and Notify Characteristic UUID to receive sensor data.' });
      return false;
    }
    activeSubscription?.remove?.();
    activeSubscription = activeDevice.monitorCharacteristicForService(
      currentGatt.serviceUUID,
      currentGatt.notifyCharacteristicUUID,
      (error, characteristic) => {
        if (error) {
          emit({ error: error.message || 'BLE notification stream failed.' });
          return;
        }
        if (characteristic?.value) {
          const decoded = decodeBase64Utf8(characteristic.value);
          sensorBridge.receive(decoded);
        }
      }
    );
    return true;
  },

  async writeCommand(command, value = null) {
    if (!activeDevice) throw new Error('No connected BLE device.');
    if (!currentGatt.serviceUUID || !currentGatt.writeCharacteristicUUID) {
      throw new Error('Configure the firmware Service UUID and Write Characteristic UUID first.');
    }
    const payload = JSON.stringify({ command, value });
    const encoded = encodeBase64Utf8(payload);
    return activeDevice.writeCharacteristicWithResponseForService(
      currentGatt.serviceUUID,
      currentGatt.writeCharacteristicUUID,
      encoded
    );
  },

  async disconnect() {
    activeSubscription?.remove?.();
    activeSubscription = null;
    if (activeDevice) {
      const id = activeDevice.id;
      activeDevice = null;
      try { await manager.cancelDeviceConnection(id); } catch {}
    }
    emit({ connectedDevice: null });
  },

  async destroy() {
    this.stopScan();
    await this.disconnect();
    this._adapterSubscription?.remove?.();
    this._adapterSubscription = null;
    try { await manager.destroy(); } catch {}
  },
};
