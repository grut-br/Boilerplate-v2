export class GraphifyNotConfigured extends Error {
  constructor(message = 'Graphify is not configured.') {
    super(message);
    this.name = 'GraphifyNotConfigured';
  }
}

export class GraphifyUnavailable extends Error {
  constructor(message = 'Graphify service is unavailable.') {
    super(message);
    this.name = 'GraphifyUnavailable';
  }
}

export class GraphifyInvalidResponse extends Error {
  constructor(message = 'Received an invalid response from Graphify.') {
    super(message);
    this.name = 'GraphifyInvalidResponse';
  }
}

export class GraphifyConfigurationError extends Error {
  constructor(message: string) {
    super(`Graphify configuration error: ${message}`);
    this.name = 'GraphifyConfigurationError';
  }
}

export class UnsupportedCapability extends Error {
  constructor(capability: string) {
    super(`Capability '${capability}' is not supported by Graphify.`);
    this.name = 'UnsupportedCapability';
  }
}
