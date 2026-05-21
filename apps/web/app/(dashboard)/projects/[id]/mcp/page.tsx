'use client';

import { McpList } from '@/components/mcp/mcp-list';

export default function McpPage() {
  return (
    <div className="space-y-6">
      <McpList onAdd={() => console.log('Add MCP server')} />
    </div>
  );
}
