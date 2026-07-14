import assert from 'node:assert/strict';
import test from 'node:test';
import { McpClient } from './McpClient.ts';
import { StdioMcpTransport } from './McpTransport.ts';
import { toMcpRequest } from './McpRequest.ts';
import { toGraphifyResponse } from './McpResponse.ts';
import {
  McpConnectionError,
  McpTimeout,
  McpProtocolError,
  HandshakeFailed,
  InvalidMcpResponse
} from './McpErrors.ts';

test('McpClient - handshake, ping and health validations', async () => {
  const transport = new StdioMcpTransport();
  const client = new McpClient(transport);

  assert.equal(client.getHealth().connected, false);

  await client.connect();
  assert.equal(client.getHealth().connected, true);
  assert.equal(client.getHealth().transport, 'stdio');

  const latency = await client.ping();
  assert.ok(latency >= 0);
  assert.ok(client.getHealth().lastPing > 0);

  await client.disconnect();
  assert.equal(client.getHealth().connected, false);
});

test('McpClient - async requests, mapper integration and response translation', async () => {
  const transport = new StdioMcpTransport();
  const client = new McpClient(transport);
  await client.connect();

  const gRequest = {
    query: 'retrieve database configuration',
    workspaceRoot: '/app',
    depth: 2,
    limit: 10,
    capability: 'semanticSearch',
  };

  const mcpPayload = toMcpRequest('msg-99', gRequest);
  
  const responsePayload = await client.request(mcpPayload);
  client.validateProtocol(responsePayload);

  const graphifyRes = toGraphifyResponse(responsePayload);
  assert.equal(graphifyRes.documents.length, 1);
  assert.equal(graphifyRes.documents[0].id, 'mcp-doc-1');
  assert.equal(graphifyRes.documents[0].content.includes('retrieve database configuration'), true);
  assert.equal(graphifyRes.nodes.length, 1);
  assert.equal(graphifyRes.nodes[0].properties.name, 'queryResult');

  await client.disconnect();
});

test('McpClient - request timeouts handling', async () => {
  class GhostMcpTransport extends StdioMcpTransport {
    override async send(): Promise<void> {
      // simulation of a ghost server that doesn't answer back
    }
  }

  const transport = new GhostMcpTransport();
  const client = new McpClient(transport);

  await assert.rejects(async () => {
    await client.connect(10);
  }, HandshakeFailed);
});

test('McpResponse - validation of invalid payloads', () => {
  assert.throws(() => {
    toGraphifyResponse({
      jsonrpc: '2.0',
      error: { code: -1, message: 'some critical failure' }
    });
  }, InvalidMcpResponse);

  assert.throws(() => {
    toGraphifyResponse({
      jsonrpc: '2.0',
      result: null
    });
  }, InvalidMcpResponse);
});
