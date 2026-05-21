import * as React from 'react';

type AgentDockToolbarProps = {
  projectId: string;
  apiUrl?: string;
};

type SelectedElementContext = {
  selector: string;
  tagName: string;
  text: string;
  html: string;
  route: string;
  bounds: DOMRect;
};

function getSelector(element: Element): string {
  if (element.id) return `#${element.id}`;
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
    let selector = current.nodeName.toLowerCase();
    if (current.className && typeof current.className === 'string') {
      const className = current.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (className) selector += `.${className}`;
    }
    parts.unshift(selector);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

export function AgentDockToolbar({ projectId, apiUrl = 'http://localhost:8000' }: AgentDockToolbarProps) {
  const [selecting, setSelecting] = React.useState(false);
  const [selected, setSelected] = React.useState<SelectedElementContext | null>(null);

  React.useEffect(() => {
    if (!selecting) return;

    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const element = event.target as Element;
      const bounds = element.getBoundingClientRect();
      setSelected({
        selector: getSelector(element),
        tagName: element.tagName.toLowerCase(),
        text: element.textContent?.slice(0, 500) ?? '',
        html: element.outerHTML.slice(0, 5000),
        route: window.location.href,
        bounds
      });
      setSelecting(false);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [selecting]);

  async function createTask() {
    if (!selected) return;
    await fetch(`${apiUrl}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        title: `Improve selected ${selected.tagName}`,
        description: 'Task created from AgentDock visual toolbar.',
        source: 'toolbar',
        context: selected
      })
    });
  }

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 2147483647, fontFamily: 'system-ui' }}>
      <div style={{ background: '#121210', color: '#f4f3ef', border: '1px solid #34312b', borderRadius: 20, padding: 12, boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
        <strong>AgentDock</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={() => setSelecting(true)}>Select UI</button>
          <button onClick={createTask} disabled={!selected}>Create Task</button>
        </div>
        {selected ? <small>{selected.selector}</small> : null}
      </div>
    </div>
  );
}
