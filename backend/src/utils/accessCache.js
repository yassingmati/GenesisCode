// Simple TTL cache for access decisions (in-memory)
// Key: `${userId}:${pathId}:${levelId || ''}:${exerciseId || ''}`

const DEFAULT_TTL_MS = Number(process.env.ACCESS_CACHE_TTL_MS || 60000);
const ENABLED = (process.env.ACCESS_CACHE_ENABLED || 'true').toLowerCase() !== 'false';

class AccessCache {
  constructor() {
    this.map = new Map();
  }

  _now() {
    return Date.now();
  }

  _isExpired(entry) {
    return !entry || entry.expiresAt <= this._now();
  }

  get(key) {
    if (!ENABLED) return null;
    const entry = this.map.get(key);
    if (this._isExpired(entry)) {
      if (entry) this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    if (!ENABLED) return;
    this.map.set(key, { value, expiresAt: this._now() + ttlMs });
  }

  del(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

module.exports = new AccessCache();




