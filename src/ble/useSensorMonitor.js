import { useEffect, useRef, useState } from 'react';
import { sensorBridge } from './sensorBridge';
import { saveMonitoringSession } from './sessionStorage';

function eventKey(event) {
  if (!event || !event.startTime) return null;
  return String(event.channel || 'sensor') + ':' + String(event.startTime);
}

export function useSensorMonitor(patientId = 'default-patient') {
  const [monitor, setMonitor] = useState(() => sensorBridge.getSnapshot());
  const lastSavedEventKey = useRef(null);
  const lastSnapshotAt = useRef(0);
  const patientIdRef = useRef(patientId);

  useEffect(() => {
    patientIdRef.current = patientId;
    lastSavedEventKey.current = null;
    lastSnapshotAt.current = 0;
  }, [patientId]);

  useEffect(() => {
    let active = true;

    const unsubscribe = sensorBridge.subscribe(snapshot => {
      if (!active) return;
      setMonitor(snapshot);

      const events = Array.isArray(snapshot.events) ? snapshot.events : [];
      const latestEvent = events.length ? events[events.length - 1] : null;
      const latestKey = eventKey(latestEvent);
      const eventChanged = Boolean(latestKey && latestKey !== lastSavedEventKey.current);
      const now = Date.now();
      const hasReadings = Object.values(snapshot.readings || {}).some(
        reading => reading && Number.isFinite(Number(reading.timestamp))
      );
      const snapshotDue = hasReadings && now - lastSnapshotAt.current >= 2000;

      // Persist periodic readings as well as newly completed events. This keeps
      // useful sensor history even during long sessions with no threshold event.
      if (eventChanged || snapshotDue) {
        if (eventChanged) lastSavedEventKey.current = latestKey;
        lastSnapshotAt.current = now;
        saveMonitoringSession({
          id: String(patientIdRef.current) + ':' + String(now),
          patientId: patientIdRef.current,
          timestamp: now,
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
