/**
 * Converts BLE characteristic payloads into normalized PVDF channel values.
 * Text formats: JSON, LEFT:12.4,RIGHT:11.8, or 12.4,11.8.
 * Binary layouts must be decoded only from the actual firmware specification.
 */
export function decodeSensorPayload(payload) {
  if (payload == null) return null;
  let text = payload;
  if (typeof payload !== 'string') {
    if (payload instanceof Uint8Array) {
      try { text = new TextDecoder().decode(payload); }
      catch { return null; }
    } else if (ArrayBuffer.isView(payload)) {
      try {
        text = new TextDecoder().decode(
          new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength)
        );
      } catch { return null; }
    } else {
      text = String(payload);
    }
  }

  const raw = String(text).trim().replace(/\0+$/g, '');
  if (!raw) return null;

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    const named = raw.match(/(?:left|l)\s*[:=]\s*(-?\d+(?:\.\d+)?)[,;\s]+(?:right|r)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
    const pair = raw.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (named) data = { left: Number(named[1]), right: Number(named[2]) };
    else if (pair) data = { left: Number(pair[1]), right: Number(pair[2]) };
    else return null;
  }

  if (!data || typeof data !== 'object') return null;
  const leftValue = data.left ?? data.leftPVDF ?? data.left_pvdf;
  const rightValue = data.right ?? data.rightPVDF ?? data.right_pvdf;
  const left = leftValue == null ? null : Number(leftValue);
  const right = rightValue == null ? null : Number(rightValue);
  if ((left !== null && !Number.isFinite(left)) ||
      (right !== null && !Number.isFinite(right))) return null;
  if (left === null && right === null) return null;

  return {
    left,
    right,
    timestamp: Number(data.timestamp) || Date.now(),
    source: 'BLE',
    raw: raw.slice(0, 256),
  };
}
