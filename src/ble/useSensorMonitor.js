import { useEffect, useRef, useState } from 'react';
import { sensorBridge } from './sensorBridge';
import { saveMonitoringSession } from './sessionStorage';

function eventKey(event) {
  if (!event || !event.startTime) return null;
  return String(event.channel || 'sensor') + ':' + String(event.startTime);
}

export function useSensorMonitor() {
  const [monitor, setMonitor] = useState(() => sensorBridge.getSnapshot());
  const lastSavedEventKey = useRef(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = sensorBridge.subscribe(snapshot => {
      if (!active) return;
      setMonitor(snapshot);

      const events = Array.isArray(snapshot.events) ? snapshot.events : [];
      const latestEvent = events.length ? events[events.length - 1] : null;
      const latestKey = eventKey(latestEvent);

      if (latestKey && latestKey !== lastSavedEventKey.current) {
        lastSavedEventKey.current = latestKey;
        saveMonitoringSession({
          id: latestKey,
          timestamp: Date.now(),
          eventCount: events.length,
          readings: snapshot.readings || {},
          events: events.slice(-50),
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
