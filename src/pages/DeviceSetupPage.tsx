import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { DeviceType } from '../types';

export function DeviceSetupPage() {
  const navigate = useNavigate();
  const { user, device, setDevice, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<DeviceType>(null);

  const handleSelectType = async (type: 'parent' | 'child') => {
    if (!user || !device) return;

    setSelectedType(type);
    setIsSubmitting(true);
    setError(null);

    const result = await api.updateDevice(device.id, { type });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      setSelectedType(null);
      return;
    }

    if (result.data?.device) {
      setDevice(result.data.device);
      navigate('/');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-base-content/60">
            Choose how this device will be used
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Parent Option */}
          <button
            onClick={() => handleSelectType('parent')}
            disabled={isSubmitting}
            className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 ${
              selectedType === 'parent' ? 'border-primary' : 'border-transparent'
            } ${isSubmitting && selectedType !== 'parent' ? 'opacity-50' : ''}`}
          >
            <div className="card-body items-center text-center">
              {isSubmitting && selectedType === 'parent' ? (
                <LoadingSpinner size="lg" />
              ) : (
                <>
                  <span className="text-6xl mb-4">👨‍👩‍👧</span>
                  <h2 className="card-title text-2xl">Parent Device</h2>
                  <ul className="text-left text-sm text-base-content/70 space-y-2 mt-4">
                    <li className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      Manage child devices
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      Curate music whitelists
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      View children's playlists
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      Full music access
                    </li>
                  </ul>
                </>
              )}
            </div>
          </button>

          {/* Child Option */}
          <button
            onClick={() => handleSelectType('child')}
            disabled={isSubmitting}
            className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 ${
              selectedType === 'child' ? 'border-accent' : 'border-transparent'
            } ${isSubmitting && selectedType !== 'child' ? 'opacity-50' : ''}`}
          >
            <div className="card-body items-center text-center">
              {isSubmitting && selectedType === 'child' ? (
                <LoadingSpinner size="lg" />
              ) : (
                <>
                  <span className="text-6xl mb-4">👶</span>
                  <h2 className="card-title text-2xl">Child Device</h2>
                  <ul className="text-left text-sm text-base-content/70 space-y-2 mt-4">
                    <li className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      Browse approved music
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      Create personal playlists
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      Safe listening experience
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-info">ℹ</span>
                      Needs parent approval
                    </li>
                  </ul>
                </>
              )}
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-base-content/40 mt-8">
          You can change this setting later in your device settings
        </p>
      </div>
    </div>
  );
}
