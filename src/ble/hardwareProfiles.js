/**
 * Hardware profiles supported by Smart TMJ Pro.
 *
 * These profiles identify common BLE firmware families. The BLE service and
 * characteristic UUIDs are intentionally configurable: ESP32, ESP32-C3,
 * nRF52840 and Arduino BLE sketches do not share one universal GATT layout.
 * Never treat a profile match as proof that a sensor is calibrated.
 */

export const HARDWARE_PROFILES = {
  generic: {
    id: 'generic',
    label: 'Generic BLE',
    aliases: ['generic-ble', 'custom-ble'],
    transport: 'ble',
    serviceUUIDs: [],
    notifyCharacteristicUUIDs: [],
    writeCharacteristicUUID: null,
    protocol: 'auto',
  },
  esp32: {
    id: 'esp32',
    label: 'ESP32',
    aliases: ['esp32'],
    transport: 'ble',
    serviceUUIDs: [],
    notifyCharacteristicUUIDs: [],
    writeCharacteristicUUID: null,
    protocol: 'auto',
  },
  esp32c3: {
    id: 'esp32c3',
    label: 'ESP32-C3',
    aliases: ['esp32-c3'],
    transport: 'ble',
    serviceUUIDs: [],
    notifyCharacteristicUUIDs: [],
    writeCharacteristicUUID: null,
    protocol: 'auto',
  },
  nrf52: {
    id: 'nrf52',
    label: 'Nordic nRF52 / nRF52840',
    aliases: ['nrf52', 'nrf52840'],
    transport: 'ble',
    serviceUUIDs: [],
    notifyCharacteristicUUIDs: [],
    writeCharacteristicUUID: null,
    protocol: 'auto',
  },
  arduinoBLE: {
    id: 'arduino-ble',
    label: 'Arduino with BLE module',
    aliases: ['arduino-ble', 'arduino'],
    transport: 'ble',
    serviceUUIDs: [],
    notifyCharacteristicUUIDs: [],
    writeCharacteristicUUID: null,
    protocol: 'auto',
  },
};

export function getHardwareProfile(profileId = 'generic') {
  return HARDWARE_PROFILES[profileId] || HARDWARE_PROFILES.generic;
}

export function normalizeHardwareProfile(profile) {
  if (!profile) return HARDWARE_PROFILES.generic;
  const value = String(profile).trim().toLowerCase();
  return Object.values(HARDWARE_PROFILES).find(item =>
    item.id === value || item.label.toLowerCase() === value ||
    item.aliases.some(alias => alias.toLowerCase() === value)
  ) || HARDWARE_PROFILES.generic;
}

/**
 * Merge board-specific GATT values supplied by the firmware integrator.
 * UUIDs must come from the actual firmware; no UUID is guessed here.
 */
export function configureHardwareProfile(profileId, overrides = {}) {
  const base = getHardwareProfile(profileId);
  return {
    ...base,
    ...overrides,
    serviceUUIDs: overrides.serviceUUIDs || base.serviceUUIDs,
    notifyCharacteristicUUIDs:
      overrides.notifyCharacteristicUUIDs || base.notifyCharacteristicUUIDs,
  };
}
