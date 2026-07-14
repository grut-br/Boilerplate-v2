export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export class CacheMiss extends Error {
  constructor(hash: string) {
    super(`Cache entry not found or expired for hash: ${hash}`);
    this.name = 'CacheMiss';
  }
}

export class InvalidCachePolicy extends Error {
  constructor(message: string) {
    super(`Invalid Cache Policy: ${message}`);
    this.name = 'InvalidCachePolicy';
  }
}
