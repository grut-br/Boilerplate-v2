export type LoaderErrorCode =
  | 'FRAMEWORK_ROOT_NOT_FOUND'
  | 'DIRECTORY_NOT_FOUND'
  | 'DOCUMENT_NOT_FOUND'
  | 'INVALID_DOCUMENT_NAME'
  | 'INVALID_ENCODING'
  | 'DUPLICATE_DOCUMENT'
  | 'INVALID_MARKDOWN'
  | 'READ_ERROR';

export interface LoaderErrorDetails {
  path?: string;
  name?: string;
  cause?: string;
}

export class LoaderError extends Error {
  readonly code: LoaderErrorCode;
  readonly details: LoaderErrorDetails;

  constructor(code: LoaderErrorCode, message: string, details: LoaderErrorDetails = {}) {
    super(message);
    this.name = 'LoaderError';
    this.code = code;
    this.details = details;
  }
}

export function isLoaderError(error: unknown): error is LoaderError {
  return error instanceof LoaderError;
}
