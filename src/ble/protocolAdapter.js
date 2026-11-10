export class BLEProtocolAdapter {
  parseMessage(raw) {
    try {
      let data = raw;

      if (typeof raw === 'string') {
        const text = raw.trim().replace(/\0+$/g, '');
        if (!text) return null;
        try {
          data = JSON.parse(text);
        } catch {
          const named = text.match(/(?:left|l)\s*[:=]\s*(-?\d+(?:\.\d+)?)[,;\s]+(?:right|r)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
          const pair = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)\s*$/);
          if (named) data = { left: Number(named[1]), right: Number(named[2]) };
          else if (pair) data = { left: Number(pair[1]), right: Number(pair[2]) };
          else return null;
        }
      }

      if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

      const readNumber = (...keys) => {
        const key = keys.find(name => data[name] !== undefined && data[name] !== null && data[name] !== '');
        if (!key) return null;
        const value = Number(data[key]);
        return Number.isFinite(value) ? value : null;
      };

      const left = readNumber('left', 'leftPVDF', 'left_pvdf');
      const right = readNumber('right', 'rightPVDF', 'right_pvdf');
      const wristband = readNumber('wristband', 'wrist', 'activity');

      if (left === null && right === null && wristband === null) return null;

      const timestampValue = Number(data.timestamp);
      return {
        timestamp: Number.isFinite(timestampValue) && timestampValue > 0
          ? timestampValue : Date.now(),
        left,
        right,
        wristband,
        source: 'BLE',
      };
    } catch {
      return null;
    }
  }

  encodedCommand(command, value = null) {
    return JSON.stringify({ command, value });
  }
}

export const bleProtocolAdapter = new BLEProtocolAdapter();
