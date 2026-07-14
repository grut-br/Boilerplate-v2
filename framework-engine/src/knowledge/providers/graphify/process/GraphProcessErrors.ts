export class ProcessStartError extends Error {
  constructor(message: string) {
    super(`Process Start Failed: ${message}`);
    this.name = 'ProcessStartError';
  }
}

export class ProcessStopped extends Error {
  constructor(message = 'Graphify process was stopped unexpectedly.') {
    super(message);
    this.name = 'ProcessStopped';
  }
}

export class SynchronizationFailed extends Error {
  constructor(message: string) {
    super(`Graphify Synchronization Failed: ${message}`);
    this.name = 'SynchronizationFailed';
  }
}

export class DirtyStateCorrupted extends Error {
  constructor(message = 'Dirty state has been corrupted.') {
    super(message);
    this.name = 'DirtyStateCorrupted';
  }
}

export class QueueOverflow extends Error {
  constructor(message = 'Synchronization queue exceeded maximum limit.') {
    super(message);
    this.name = 'QueueOverflow';
  }
}

export class GraphUnavailable extends Error {
  constructor(message = 'Graphify service is unavailable.') {
    super(message);
    this.name = 'GraphUnavailable';
  }
}
