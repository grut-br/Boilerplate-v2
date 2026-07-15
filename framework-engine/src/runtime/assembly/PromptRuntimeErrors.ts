export class PromptAssemblyFailed extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PromptAssemblyFailed';
  }
}

export class PromptAssemblyUnavailable extends Error {
  constructor(message = 'Prompt Assembly Engine is unavailable.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'PromptAssemblyUnavailable';
  }
}

export class InvalidPromptAssemblyRequest extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidPromptAssemblyRequest';
  }
}

export class PromptAssemblyTimeout extends Error {
  constructor(message = 'Prompt assembly process timed out.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'PromptAssemblyTimeout';
  }
}
