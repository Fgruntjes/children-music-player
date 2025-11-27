import { useAuthStore } from '../store/authStore';
import { QRCodeDisplay } from '../components/QRCode';
import { formatDeviceId } from '../utils/device';

export function DeviceInfoPage() {
  const { device, user } = useAuthStore();

  if (!device || !user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Device Information</h1>
        <p className="text-base-content/60">
          Share this code to link devices
        </p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center">
          <QRCodeDisplay deviceId={device.id} size={250} />

          <div className="divider">Device Details</div>

          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Type</span>
              <span className={`badge ${device.type === 'parent' ? 'badge-secondary' : 'badge-accent'} badge-lg`}>
                {device.type === 'parent' ? '👨‍👩‍👧 Parent' : '👶 Child'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Device ID</span>
              <span className="font-mono text-sm">{formatDeviceId(device.id)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Owner</span>
              <div className="flex items-center gap-2">
                <div className="avatar">
                  <div className="w-6 rounded-full">
                    <img src={user.picture} alt={user.name} />
                  </div>
                </div>
                <span>{user.name}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Created</span>
              <span>{new Date(device.createdAt).toLocaleDateString()}</span>
            </div>

            {device.type === 'child' && device.parentDeviceId && (
              <div className="flex justify-between items-center">
                <span className="text-base-content/60">Linked to Parent</span>
                <span className="font-mono text-sm">
                  {formatDeviceId(device.parentDeviceId)}
                </span>
              </div>
            )}

            {device.type === 'parent' && device.childDeviceIds && device.childDeviceIds.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-base-content/60">Linked Children</span>
                <span className="badge badge-neutral">
                  {device.childDeviceIds.length} device{device.childDeviceIds.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-info/10 border border-info/20">
        <div className="card-body">
          <h3 className="card-title text-info text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            How to link devices
          </h3>
          {device.type === 'parent' ? (
            <p className="text-sm">
              To add a child device, scan the child's QR code using the camera or
              enter their device ID manually in the Devices section.
            </p>
          ) : (
            <p className="text-sm">
              Ask a parent to scan your QR code or enter your device ID to link
              this device. Once linked, you'll have access to approved music.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
