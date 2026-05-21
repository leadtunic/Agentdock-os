export class AgentDockAgentClient {
  constructor(private readonly apiUrl: string) {}

  async createTask(input: Record<string, unknown>) {
    const response = await fetch(`${this.apiUrl}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    });
    return response.json();
  }
}
