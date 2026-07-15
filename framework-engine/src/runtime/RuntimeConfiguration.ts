export interface RuntimeConfigurationInput {
  timeout?: number;
  verbose?: boolean;
  debug?: boolean;
  dryRun?: boolean;
  metricsEnabled?: boolean;
}

export class RuntimeConfiguration {
  readonly timeout: number;
  readonly verbose: boolean;
  readonly debug: boolean;
  readonly dryRun: boolean;
  readonly metricsEnabled: boolean;

  constructor(input: RuntimeConfigurationInput = {}) {
    const timeout = input.timeout ?? 30_000;

    if (!Number.isFinite(timeout) || timeout < 0) {
      throw new TypeError('Runtime timeout must be a non-negative finite number.');
    }

    this.timeout = timeout;
    this.verbose = input.verbose ?? false;
    this.debug = input.debug ?? false;
    this.dryRun = input.dryRun ?? false;
    this.metricsEnabled = input.metricsEnabled ?? true;
  }

  toJSON(): RuntimeConfigurationInput {
    return {
      timeout: this.timeout,
      verbose: this.verbose,
      debug: this.debug,
      dryRun: this.dryRun,
      metricsEnabled: this.metricsEnabled,
    };
  }
}
