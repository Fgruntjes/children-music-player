import type { Device } from '../types';
import { formatDeviceId } from '../utils/device';

interface DeviceCardProps {
  device: Device;
  onRemove?: () => void;
  onManage?: () => void;
  showActions?: boolean;
  isCurrentDevice?: boolean;
}

export function DeviceCard({
  device,
  onRemove,
  onManage,
  showActions = true,
  isCurrentDevice = false,
}: DeviceCardProps) {
  const typeIcon = device.type === 'parent' ? '👨‍👩‍👧' : '👶';
  const typeLabel = device.type === 'parent' ? 'Parent' : 'Child';

  return (
    <div
      className={`card bg-base-100 shadow-md ${
        isCurrentDevice ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{typeIcon}</span>
            <div>
              <h3 className="card-title text-base">
                {device.name || `${typeLabel} Device`}
                {isCurrentDevice && (
                  <span className="badge badge-primary badge-sm ml-2">You</span>
                )}
              </h3>
              <p className="font-mono text-xs text-base-content/60">
                {formatDeviceId(device.id)}
              </p>
            </div>
          </div>
          <span
            className={`badge ${
              device.type === 'parent' ? 'badge-secondary' : 'badge-accent'
            }`}
          >
            {typeLabel}
          </span>
        </div>

        {device.type === 'parent' && device.childDeviceIds && device.childDeviceIds.length > 0 && (
          <p className="text-sm text-base-content/60 mt-2">
            {device.childDeviceIds.length} linked child device(s)
          </p>
        )}

        {showActions && (onRemove || onManage) && (
          <div className="card-actions justify-end mt-4">
            {onManage && (
              <button onClick={onManage} className="btn btn-primary btn-sm">
                Manage
              </button>
            )}
            {onRemove && !isCurrentDevice && (
              <button onClick={onRemove} className="btn btn-error btn-sm btn-outline">
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
