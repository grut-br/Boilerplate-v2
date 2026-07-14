export class MarkdownNotFound extends Error {
  readonly path: string;
  constructor(filePath: string, message = `Markdown file not found: ${filePath}`) {
    super(message);
    this.name = 'MarkdownNotFound';
    this.path = filePath;
  }
}

export class InvalidMarkdown extends Error {
  readonly path: string;
  constructor(filePath: string, message = `Invalid markdown structure: ${filePath}`) {
    super(message);
    this.name = 'InvalidMarkdown';
    this.path = filePath;
  }
}

export class MarkdownParseError extends Error {
  readonly path: string;
  readonly cause?: any;
  constructor(filePath: string, message = `Failed to parse markdown file: ${filePath}`, cause?: any) {
    super(message);
    this.name = 'MarkdownParseError';
    this.path = filePath;
    this.cause = cause;
  }
}

export class UnsupportedMarkdown extends Error {
  readonly path: string;
  constructor(filePath: string, message = `Unsupported markdown features/elements: ${filePath}`) {
    super(message);
    this.name = 'UnsupportedMarkdown';
    this.path = filePath;
  }
}
