import { useEffect, useRef, useState } from 'react';
import { sensorBridge } from './sensorBridge';
import { saveMonitoringSession } from './sessionStorage';

export function useSensorMonitor() {
  const [monitor, setMonitor] = useState(() => sensorBridge.getSnapshot());
  const lastSavedCount = useRef(0);

  useEffect(() => {
    let active = true;

    const unsubscribe = sensorBridge.subscribe((snapshot) => {
      if (!active) return;

      setMonitor(snapshot);

      const events = Array.isArray(snapshot.events) ? snapshot.events : [];

      if (events.length > lastSavedCount.current) {
        lastSavedCount.current = events.length;

        saveMonitoringSession({
          id: Date.now(),
          timestamp: Date.now(),
          eventCount: events.length,
          readings: snapshot.readings || {},
          events: events.slice(-20),
        });
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return monitor;
}
