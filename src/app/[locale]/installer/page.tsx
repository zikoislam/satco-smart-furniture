'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MapPin, WifiOff, Wrench } from 'lucide-react';

interface AssignedJob {
  installationJobId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  scheduledDate: string;
  timeSlot: string;
  district: string;
  buildingNumber: string;
  status: string;
}

const OFFLINE_QUEUE_KEY = 'satco_installer_offline_queue';

export default function InstallerPwaPage() {
  const [jobs, setJobs] = useState<AssignedJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 24.7136,
    lng: 46.6753,
  });
  const [isOffline, setIsOffline] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const token = localStorage.getItem('satco_access_token');
    if (token && navigator.onLine) {
      fetch('/api/v1/installations/assigned', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.data?.jobs) {
            setJobs(json.data.jobs);
            localStorage.setItem('satco_cached_installer_jobs', JSON.stringify(json.data.jobs));
            if (json.data.jobs[0]) setSelectedJobId(json.data.jobs[0].installationJobId);
          }
        })
        .catch(() => {
          const cached = localStorage.getItem('satco_cached_installer_jobs');
          if (cached) setJobs(JSON.parse(cached));
        });
    } else {
      const cached = localStorage.getItem('satco_cached_installer_jobs');
      if (cached) setJobs(JSON.parse(cached));
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  function captureGps() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1c1917';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  async function handleCompleteHandover() {
    if (!selectedJobId) return;
    const signDataUrl =
      canvasRef.current?.toDataURL('image/png') ?? 'data:image/png;base64,iVBORw0KGgo=';

    const payload = {
      customerSignDataUrl: signDataUrl,
      completionPhotos: ['https://satco-assets.sa/installations/handover-1.jpg'],
      latitude: coords.lat,
      longitude: coords.lng,
      technicianNotes: notes || 'Installed & calibrated on site.',
    };

    if (!navigator.onLine) {
      const existing = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) ?? '[]');
      existing.push({ jobId: selectedJobId, payload });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existing));
      setStatusMessage('Offline: Handover queued locally and will sync when online.');
      return;
    }

    const token = localStorage.getItem('satco_access_token') ?? '';
    const res = await fetch(`/api/v1/installations/${selectedJobId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (res.ok) {
      setStatusMessage(`Handover completed! Milestone 3 due: ${json.data.finalHandoverDueSar} SAR`);
    } else {
      setStatusMessage(json.message ?? 'Failed to submit handover');
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2.5">
          <Wrench className="h-6 w-6 text-stone-800" />
          <h1 className="text-xl font-bold text-stone-900">SATCO Field Installer PWA</h1>
        </div>
        {isOffline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            <WifiOff className="h-3.5 w-3.5" /> Offline Mode
          </span>
        )}
      </header>

      <div className="space-y-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <label className="mb-2 block text-xs font-semibold text-stone-700">
            Assigned Job
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {jobs.length === 0 ? (
              <option value="">No active jobs loaded</option>
            ) : (
              jobs.map((j) => (
                <option key={j.installationJobId} value={j.installationJobId}>
                  {j.orderNumber} — {j.customerName} ({j.district})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">Customer Digital Signature</span>
            <button
              type="button"
              onClick={captureGps}
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              <MapPin className="h-3.5 w-3.5" />
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={560}
            height={160}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full touch-none rounded-xl border border-dashed border-stone-300 bg-stone-50"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Technician handover notes..."
            rows={2}
            className="mt-3 w-full rounded-lg border border-stone-300 p-2.5 text-sm"
          />
        </div>

        {statusMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
            {statusMessage}
          </div>
        )}

        <button
          type="button"
          disabled={!selectedJobId}
          onClick={handleCompleteHandover}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Submit Digital Handover & Unlock Milestone 3
        </button>
      </div>
    </main>
  );
}
