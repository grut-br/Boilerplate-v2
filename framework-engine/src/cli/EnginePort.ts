export type EngineState = string;

export interface DoctorReport {
  node: { version: string; valid: boolean };
  packageManager: { name: string; version?: string; valid: boolean };
  workspace: { path?: string; open: boolean; valid: boolean };
  configuration: { valid: boolean; details?: string };
  provider: { name?: string; available: boolean; valid: boolean };
  engine: { version: string; state: EngineState; valid: boolean };
}

export interface EngineStatus {
  version: string;
  workspace?: string;
  provider?: string;
  documentCount: number;
  state: EngineState;
}

export interface ProviderStatus {
  name: string;
  type: string;
  active: boolean;
  available: boolean;
}

export interface EngineVersion {
  version: string;
  build: string;
  commit?: string;
}

export interface EnginePort {
  doctor(): Promise<DoctorReport> | DoctorReport;
  status(): Promise<EngineStatus> | EngineStatus;
  openWorkspace(path: string): Promise<unknown> | unknown;
  listProviders(): Promise<ProviderStatus[]> | ProviderStatus[];
  version(): Promise<EngineVersion> | EngineVersion;
}
