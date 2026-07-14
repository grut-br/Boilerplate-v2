export class GraphNotInitialized extends Error {
  constructor(message = 'Graph Manager has not been initialized.') {
    super(message);
    this.name = 'GraphNotInitialized';
  }
}

export class InvalidGraphState extends Error {
  constructor(providerId: string, state: string, message: string) {
    super(`Graph '${providerId}' in invalid state '${state}': ${message}`);
    this.name = 'InvalidGraphState';
  }
}

export class SynchronizationRejected extends Error {
  constructor(reason: string) {
    super(`Synchronization rejected: ${reason}`);
    this.name = 'SynchronizationRejected';
  }
}

export class SnapshotUnavailable extends Error {
  constructor(message = 'Graph snapshot is currently unavailable.') {
    super(message);
    this.name = 'SnapshotUnavailable';
  }
}
