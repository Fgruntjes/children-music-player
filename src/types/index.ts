export type DeviceType = 'parent' | 'child' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken?: string;
  hasMusicAccess: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  userId: string;
  createdAt: string;
  parentDeviceId?: string;
  childDeviceIds?: string[];
}

export interface Artist {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

export interface Track {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  albumName?: string;
  albumId?: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  tracks: Track[];
  ownerId: string;
  ownerDeviceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Whitelist {
  id: string;
  parentDeviceId: string;
  childDeviceIds: string[];
  artists: Artist[];
  playlists: Playlist[];
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface PairingRequest {
  id: string;
  childDeviceId: string;
  parentDeviceId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
