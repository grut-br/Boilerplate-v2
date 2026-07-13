export type HydrationErrorCode =
  | 'CAPABILITY_NOT_REGISTERED'
  | 'REQUIRED_DOCUMENT_NOT_FOUND'
  | 'INVALID_WORK_UNIT'
  | 'CONTEXT_BUDGET_INVALID'
  | 'CONTEXT_ASSEMBLY_FAILED';

export class HydrationError extends Error {
  readonly code: HydrationErrorCode;
  readonly details: Record<string, string | number | boolean | undefined>;

  constructor(
    code: HydrationErrorCode,
    message: string,
    details: Record<string, string | number | boolean | undefined> = {},
  ) {
    super(message);
    this.name = 'HydrationError';
    this.code = code;
    this.details = details;
  }
}
