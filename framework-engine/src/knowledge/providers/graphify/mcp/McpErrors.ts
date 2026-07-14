export class McpConnectionError extends Error {
  constructor(message: string) {
    super(`MCP Connection Error: ${message}`);
    this.name = 'McpConnectionError';
  }
}

export class McpTimeout extends Error {
  constructor(message = 'MCP Request timed out.') {
    super(message);
    this.name = 'McpTimeout';
  }
}

export class McpProtocolError extends Error {
  constructor(message: string) {
    super(`MCP Protocol Error: ${message}`);
    this.name = 'McpProtocolError';
  }
}

export class InvalidMcpResponse extends Error {
  constructor(message: string) {
    super(`Invalid MCP Response: ${message}`);
    this.name = 'InvalidMcpResponse';
  }
}

export class HandshakeFailed extends Error {
  constructor(message = 'MCP handshake failed.') {
    super(message);
    this.name = 'HandshakeFailed';
  }
}
