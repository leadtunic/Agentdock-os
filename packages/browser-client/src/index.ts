export class AgentDockBrowserClient {
  constructor(private readonly browserRuntimeUrl: string) {}

  async createSession() {
    const response = await fetch(`${this.browserRuntimeUrl}/sessions`, { method: 'POST' });
    return response.json();
  }
}
