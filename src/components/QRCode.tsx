import { QRCodeSVG } from 'qrcode.react';
import { formatDeviceId } from '../utils/device';

interface QRCodeDisplayProps {
  deviceId: string;
  size?: number;
}

export function QRCodeDisplay({ deviceId, size = 200 }: QRCodeDisplayProps) {
  const pairingUrl = `${window.location.origin}/pair/${deviceId}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <QRCodeSVG
          value={pairingUrl}
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-base-content/60 mb-1">Device ID</p>
        <p className="font-mono text-lg font-bold tracking-wider">
          {formatDeviceId(deviceId)}
        </p>
      </div>
    </div>
  );
}
