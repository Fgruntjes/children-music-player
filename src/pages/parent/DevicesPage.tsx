import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDeviceStore } from '../../store/deviceStore';
import { api } from '../../api/client';
import { DeviceCard } from '../../components/DeviceCard';
import { QRCodeDisplay } from '../../components/QRCode';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function DevicesPage() {
  const { device } = useAuthStore();
  const { linkedDevices, pairingRequests, setLinkedDevices, setPairingRequests, updatePairingRequest } = useDeviceStore();
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceCode, setDeviceCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (device?.id) {
      loadLinkedDevices();
      loadPairingRequests();
    }
  }, [device?.id]);

  const loadLinkedDevices = async () => {
    if (!device?.id) return;
    const result = await api.getLinkedDevices(device.id);
    if (result.data) {
      setLinkedDevices(result.data.devices);
    }
  };

  const loadPairingRequests = async () => {
    if (!device?.id) return;
    const result = await api.getPairingRequests(device.id);
    if (result.data) {
      setPairingRequests(result.data.requests);
    }
  };

  const handleAddDevice = async () => {
    if (!device?.id || !deviceCode.trim()) return;

    setIsLoading(true);
    setError(null);

    const cleanCode = deviceCode.replace(/[-\s]/g, '').toUpperCase();
    const result = await api.createPairingRequest(cleanCode, device.id);

    if (result.error) {
      setError(result.error);
    } else {
      setDeviceCode('');
      setShowAddDevice(false);
      loadPairingRequests();
    }

    setIsLoading(false);
  };

  const handleRespondToPairing = async (requestId: string, status: 'approved' | 'rejected') => {
    const result = await api.respondToPairing(requestId, status);
    if (result.data) {
      updatePairingRequest(requestId, status);
      if (status === 'approved') {
        loadLinkedDevices();
      }
    }
  };

  const pendingRequests = pairingRequests.filter((r) => r.status === 'pending');
  const childDevices = linkedDevices.filter((d) => d.type === 'child');
  const parentDevices = linkedDevices.filter((d) => d.type === 'parent' && d.id !== device?.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Devices</h1>
          <p className="text-base-content/60">
            Link and manage child devices
          </p>
        </div>
        <button
          onClick={() => setShowAddDevice(!showAddDevice)}
          className={`btn ${showAddDevice ? 'btn-ghost' : 'btn-primary'}`}
        >
          {showAddDevice ? 'Cancel' : '+ Add Device'}
        </button>
      </div>

      {showAddDevice && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">Add a Child Device</h3>
            <p className="text-base-content/60 text-sm mb-4">
              Enter the device code shown on the child's device, or scan their QR code
            </p>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Device Code</span>
              </label>
              <div className="join w-full">
                <input
                  type="text"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                  placeholder="e.g., ABC1-2DEF-3GHI"
                  className="input input-bordered join-item flex-1 font-mono uppercase"
                />
                <button
                  onClick={handleAddDevice}
                  className="btn btn-primary join-item"
                  disabled={isLoading || !deviceCode.trim()}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Add'}
                </button>
              </div>
              {error && (
                <label className="label">
                  <span className="label-text-alt text-error">{error}</span>
                </label>
              )}
            </div>

            <div className="divider">OR</div>

            <div className="text-center">
              <p className="text-sm text-base-content/60 mb-4">
                Have the child scan your device's QR code
              </p>
              {device && <QRCodeDisplay deviceId={device.id} size={150} />}
            </div>
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="card bg-warning/10 border border-warning/20">
          <div className="card-body">
            <h3 className="card-title text-warning">
              Pending Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-base-100 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Child Device</p>
                    <p className="text-sm text-base-content/60 font-mono">
                      {request.childDeviceId}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToPairing(request.id, 'approved')}
                      className="btn btn-success btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRespondToPairing(request.id, 'rejected')}
                      className="btn btn-ghost btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Child Devices ({childDevices.length})
        </h2>
        {childDevices.length === 0 ? (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center py-12">
              <span className="text-5xl mb-4">👶</span>
              <p className="text-base-content/60">
                No child devices linked yet. Add one to get started!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {childDevices.map((d) => (
              <DeviceCard
                key={d.id}
                device={d}
                onManage={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {parentDevices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Other Parent Devices ({parentDevices.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {parentDevices.map((d) => (
              <DeviceCard key={d.id} device={d} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {device && (
        <div>
          <h2 className="text-xl font-semibold mb-4">This Device</h2>
          <DeviceCard device={device} isCurrentDevice showActions={false} />
        </div>
      )}
    </div>
  );
}
