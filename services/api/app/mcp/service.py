import time

from sqlalchemy.orm import Session

from app.models.mcp import McpServer, McpTool
from app.schemas.mcp import McpTestResponse


def test_mcp_server(db: Session, server: McpServer) -> McpTestResponse:
    start = time.time()
    try:
        if server.transport == "stdio":
            return _test_stdio(server)
        elif server.transport == "sse":
            return _test_sse(server)
        elif server.transport == "http":
            return _test_http(server)
        else:
            return McpTestResponse(success=False, message=f"Unknown transport: {server.transport}")
    except Exception as e:
        server.status = "error"
        server.last_tested_at = time.time()
        server.last_test_result = "failed"
        db.commit()
        return McpTestResponse(success=False, message=str(e))


def _test_stdio(server: McpServer) -> McpTestResponse:
    import subprocess
    import json

    cmd = server.config.get("command", "")
    if not cmd:
        return McpTestResponse(success=False, message="No command configured")

    try:
        result = subprocess.run([cmd, "--help"], capture_output=True, text=True, timeout=10)
        latency = int((time.time() - start) * 1000) if "start" in dir() else None
        server.status = "connected" if result.returncode == 0 else "error"
        server.last_tested_at = time.time()
        server.last_test_result = "connected" if result.returncode == 0 else "failed"
        db.commit()
        return McpTestResponse(
            success=result.returncode == 0,
            message="Server responded" if result.returncode == 0 else f"Exit code: {result.returncode}",
            latency_ms=latency,
        )
    except Exception as e:
        return McpTestResponse(success=False, message=str(e))


def _test_sse(server: McpServer) -> McpTestResponse:
    import requests

    url = server.config.get("url", "")
    if not url:
        return McpTestResponse(success=False, message="No URL configured")

    try:
        resp = requests.get(url, timeout=10)
        latency = int((time.time() - start) * 1000) if "start" in dir() else None
        server.status = "connected" if resp.status_code == 200 else "error"
        server.last_tested_at = time.time()
        server.last_test_result = "connected" if resp.status_code == 200 else "failed"
        db.commit()
        return McpTestResponse(
            success=resp.status_code == 200,
            message=f"HTTP {resp.status_code}",
            latency_ms=latency,
        )
    except Exception as e:
        return McpTestResponse(success=False, message=str(e))


def _test_http(server: McpServer) -> McpTestResponse:
    import requests

    url = server.config.get("url", "")
    if not url:
        return McpTestResponse(success=False, message="No URL configured")

    try:
        resp = requests.get(url, timeout=10)
        server.status = "connected" if resp.status_code == 200 else "error"
        server.last_tested_at = time.time()
        server.last_test_result = "connected" if resp.status_code == 200 else "failed"
        db.commit()
        return McpTestResponse(success=resp.status_code == 200, message=f"HTTP {resp.status_code}")
    except Exception as e:
        return McpTestResponse(success=False, message=str(e))


def call_mcp_tool(db: Session, server: McpServer, tool_name: str, arguments: dict) -> dict:
    from app.audit.service import record_audit

    record_audit(
        db,
        event_type="mcp.tool_call",
        resource_type="mcp_tool",
        resource_id=tool_name,
        payload={"server": server.name, "tool": tool_name, "arguments": arguments},
    )

    if server.transport == "stdio":
        return _call_stdio_tool(server, tool_name, arguments)
    else:
        return _call_http_tool(server, tool_name, arguments)


def _call_stdio_tool(server: McpServer, tool_name: str, arguments: dict) -> dict:
    import subprocess
    import json

    cmd = server.config.get("command", "")
    payload = json.dumps({"method": "tools/call", "params": {"name": tool_name, "arguments": arguments}})
    result = subprocess.run([cmd], input=payload, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise Exception(f"MCP tool call failed: {result.stderr}")
    return json.loads(result.stdout)


def _call_http_tool(server: McpServer, tool_name: str, arguments: dict) -> dict:
    import requests

    url = server.config.get("url", "")
    resp = requests.post(f"{url}/tools/{tool_name}", json=arguments, timeout=60)
    resp.raise_for_status()
    return resp.json()
