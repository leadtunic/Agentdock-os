from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GovernanceDecision:
    allowed: bool
    reason: str | None = None
    requires_approval: bool = False


BLOCKED_COMMAND_PATTERNS = ["rm -rf", "sudo", "docker system prune", "mkfs", ":(){"]
SENSITIVE_FILE_PATTERNS = [".env", "secrets/", "id_rsa", "credentials"]


def evaluate_tool_call(tool_name: str, payload: dict[str, Any]) -> GovernanceDecision:
    if tool_name.startswith("shell."):
        command = str(payload.get("command", ""))
        for pattern in BLOCKED_COMMAND_PATTERNS:
            if pattern in command:
                return GovernanceDecision(False, f"Blocked command pattern: {pattern}")
    return GovernanceDecision(True)


def evaluate_file_access(path: str, write: bool = False) -> GovernanceDecision:
    for pattern in SENSITIVE_FILE_PATTERNS:
        if pattern in path:
            return GovernanceDecision(
                allowed=False if write else True,
                reason=f"Sensitive file pattern requires approval: {pattern}",
                requires_approval=True,
            )
    return GovernanceDecision(True)
