export const BLE_DEVICE_CONFIG = {
  scanDuration: 10000,
  reconnect: true,
  supportedProfiles: [
    'generic-ble',
    'esp32',
    'esp32-c3',
    'nrf52',
    'nrf52840',
    'custom-ble',
  ],
};

export const SENSOR_CHANNELS = {
  LEFT_PVDF: 'left',
  RIGHT_PVDF: 'right',
  WRISTBAND: 'wristband',
};

export const DEVICE_STATUS = {
  DISCONNECTED: 'disconnected',
  SCANNING: 'scanning',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};
