export class BLEProtocolAdapter {
  parseMessage(raw) {
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!data || typeof data !== "object") return null;
      const left = Number(data.left ?? data.leftPVDF ?? data.left_pvdf);
      const right = Number(data.right ?? data.rightPVDF ?? data.right_pvdf);
      if (!Number.isFinite(left) && !Number.isFinite(right)) return null;
      return {
        timestamp: Number(data.timestamp) || Date.now(),
        left: Number.isFinite(left) ? left : null,
        right: Number.isFinite(right) ? right : null,
        source: "BLE"
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
