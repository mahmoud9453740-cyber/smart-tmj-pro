# Multi-board BLE hardware support

Smart TMJ Pro now defines profiles for:

- ESP32
- ESP32-C3
- Nordic nRF52 / nRF52840
- Arduino boards with a BLE module
- Generic/custom BLE peripherals

## Important hardware requirement

These boards do not share a universal Bluetooth GATT service or data format.
The profile layer therefore does not invent service UUIDs or claim that a board
is connected. To complete pairing for a particular firmware, provide:

1. Advertised device name or manufacturer data.
2. GATT service UUID.
3. Notify characteristic UUID carrying sensor samples.
4. Optional write characteristic UUID for commands.
5. Payload format (JSON, CSV/text, or a documented binary layout).
6. PVDF signal scale, sample rate and calibration procedure.

The decoder currently accepts JSON and simple text pairs for left/right PVDF
channels. Binary payloads need a firmware-specific decoder based on the actual
packet specification.

## Integration status

This is the cross-board profile and protocol foundation. A native BLE transport
and physical-device test are still required before live scanning, pairing,
reconnection, battery reporting or sensor monitoring can be marked operational.
