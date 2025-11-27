-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  access_token TEXT,
  refresh_token TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('parent', 'child')),
  parent_device_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_device_id) REFERENCES devices(id)
);

-- Pairing requests table
CREATE TABLE IF NOT EXISTS pairing_requests (
  id TEXT PRIMARY KEY,
  child_device_id TEXT NOT NULL,
  parent_device_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (child_device_id) REFERENCES devices(id),
  FOREIGN KEY (parent_device_id) REFERENCES devices(id)
);

-- Whitelists table
CREATE TABLE IF NOT EXISTS whitelists (
  id TEXT PRIMARY KEY,
  parent_device_id TEXT UNIQUE NOT NULL,
  child_device_ids TEXT, -- Comma-separated list of child device IDs
  artists TEXT, -- JSON array of artist objects
  tracks TEXT, -- JSON array of track objects
  playlists TEXT, -- JSON array of playlist objects
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_device_id) REFERENCES devices(id)
);

-- Playlists table (for child-created playlists)
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  tracks TEXT, -- JSON array of track objects
  owner_id TEXT NOT NULL,
  owner_device_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (owner_device_id) REFERENCES devices(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_parent_device_id ON devices(parent_device_id);
CREATE INDEX IF NOT EXISTS idx_pairing_requests_parent ON pairing_requests(parent_device_id);
CREATE INDEX IF NOT EXISTS idx_pairing_requests_child ON pairing_requests(child_device_id);
CREATE INDEX IF NOT EXISTS idx_playlists_owner_device ON playlists(owner_device_id);
