export class PerformanceTimer {
  private readonly startedAt = PerformanceTimer.now();
  private stoppedAt?: number;

  static start(): PerformanceTimer {
    return new PerformanceTimer();
  }

  stop(): number {
    if (this.stoppedAt === undefined) this.stoppedAt = PerformanceTimer.now();
    return this.durationMs();
  }

  durationMs(): number {
    return Math.max(0, (this.stoppedAt ?? PerformanceTimer.now()) - this.startedAt);
  }

  private static now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }
}
