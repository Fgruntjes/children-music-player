import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDeviceId } from '../utils/device';

export function PairPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { device, isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-paired'>('loading');
  const [error, setError] = useState<string | null>(null);

  const handlePairing = useCallback(async () => {
    if (!deviceId || !device) return;

    setStatus('loading');
    setError(null);

    try {
      if (device.type === 'child') {
        // Child scanning parent's QR code
        const result = await api.createPairingRequest(device.id, deviceId);
        if (result.error) {
          setError(result.error);
          setStatus('error');
        } else {
          setStatus('success');
        }
      } else if (device.type === 'parent') {
        // Parent scanning child's QR code - directly approve
        const result = await api.createPairingRequest(deviceId, device.id);
        if (result.error) {
          setError(result.error);
          setStatus('error');
        } else if (result.data?.request) {
          // Auto-approve since parent is scanning
          const approveResult = await api.respondToPairing(result.data.request.id, 'approved');
          if (approveResult.error) {
            setError(approveResult.error);
            setStatus('error');
          } else {
            setStatus('success');
          }
        }
      }
    } catch {
      setError('Failed to process pairing request');
      setStatus('error');
    }
  }, [deviceId, device]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!device) {
      navigate('/device-setup');
      return;
    }

    if (device.type === 'child' && device.parentDeviceId) {
      setStatus('already-paired');
      return;
    }

    if (deviceId) {
      handlePairing();
    }
  }, [deviceId, device, isAuthenticated, navigate, handlePairing]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-base-content/60 mt-4">Processing pairing request...</p>
      </div>
    );
  }

  if (status === 'already-paired') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body items-center text-center">
            <span className="text-6xl mb-4">🔗</span>
            <h1 className="card-title text-2xl">Already Paired</h1>
            <p className="text-base-content/60 mb-4">
              This device is already linked to a parent.
            </p>
            {device?.parentDeviceId && (
              <p className="font-mono text-sm text-base-content/40">
                Parent: {formatDeviceId(device.parentDeviceId)}
              </p>
            )}
            <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body items-center text-center">
            <span className="text-6xl mb-4">❌</span>
            <h1 className="card-title text-2xl">Pairing Failed</h1>
            <p className="text-base-content/60 mb-4">
              {error || 'Something went wrong. Please try again.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/')} className="btn btn-ghost">
                Go Home
              </button>
              <button onClick={handlePairing} className="btn btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card bg-base-100 shadow-xl max-w-md">
        <div className="card-body items-center text-center">
          <span className="text-6xl mb-4">✅</span>
          <h1 className="card-title text-2xl">
            {device?.type === 'parent' ? 'Device Linked!' : 'Request Sent!'}
          </h1>
          <p className="text-base-content/60 mb-4">
            {device?.type === 'parent'
              ? 'The child device has been successfully linked to your account.'
              : 'Your pairing request has been sent. Ask a parent to approve it.'}
          </p>
          {deviceId && (
            <p className="font-mono text-sm text-base-content/40 mb-4">
              Device: {formatDeviceId(deviceId)}
            </p>
          )}
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
