import fnmatch
import re

from sqlalchemy.orm import Session

from app.models.governance import CommandPolicy, FilePolicy, ToolPolicy


BLOCKED_COMMANDS = [
    "rm -rf /",
    "rm -rf /*",
    "mkfs",
    "dd if=",
    "chmod 777",
    "chmod -R 777",
    "wget",
    "curl",
    "nc ",
    "netcat",
    "nmap",
    "sudo",
    "su ",
    "passwd",
    "shutdown",
    "reboot",
    "init 0",
    "init 6",
]

SENSITIVE_FILES = [
    ".env",
    ".env.*",
    "*.key",
    "*.pem",
    "*.p12",
    "*.pfx",
    "id_rsa",
    "id_ed25519",
    ".ssh/*",
    "secrets.yml",
    "secrets.json",
    "credentials.json",
    ".git/config",
]


def evaluate_tool_call(db: Session, agent_id: str, tool_name: str, input_data: dict) -> dict:
    policies = db.query(ToolPolicy).filter(
        ToolPolicy.agent_id.in_([agent_id, None]),
        ToolPolicy.is_active == True,
        ToolPolicy.tool_name.in_([tool_name, "*"]),
    ).all()

    for policy in policies:
        if policy.tool_name == tool_name or policy.tool_name == "*":
            if policy.action == "deny":
                return {"allowed": False, "reason": f"Tool '{tool_name}' is denied by policy"}
            if policy.action == "require_approval" or policy.requires_approval:
                return {"allowed": True, "requires_approval": True, "reason": f"Tool '{tool_name}' requires approval"}

    return {"allowed": True, "requires_approval": False}


def evaluate_file_access(db: Session, agent_id: str, file_path: str, action: str) -> dict:
    policies = db.query(FilePolicy).filter(
        FilePolicy.agent_id.in_([agent_id, None]),
        FilePolicy.is_active == True,
    ).all()

    for sensitive in SENSITIVE_FILES:
        if fnmatch.fnmatch(file_path, sensitive) or file_path.endswith("/" + sensitive):
            return {"allowed": False, "reason": f"File '{file_path}' matches sensitive pattern '{sensitive}'"}

    for policy in policies:
        if fnmatch.fnmatch(file_path, policy.pattern):
            if policy.action == "deny":
                return {"allowed": False, "reason": f"File '{file_path}' is denied by policy"}
            if policy.action == "allow":
                return {"allowed": True}

    return {"allowed": True}


def evaluate_command(db: Session, agent_id: str, command: str) -> dict:
    for blocked in BLOCKED_COMMANDS:
        if blocked in command:
            return {"allowed": False, "reason": f"Command contains blocked pattern: '{blocked}'"}

    policies = db.query(CommandPolicy).filter(
        CommandPolicy.agent_id.in_([agent_id, None]),
        CommandPolicy.is_active == True,
    ).all()

    for policy in policies:
        if fnmatch.fnmatch(command, policy.pattern) or re.search(policy.pattern, command):
            if policy.action == "deny":
                return {"allowed": False, "reason": f"Command matches denied policy pattern"}
            if policy.requires_approval:
                return {"allowed": True, "requires_approval": True}

    return {"allowed": True}


def check_approval_required(db: Session, agent_id: str, action_type: str) -> bool:
    from app.models.governance import ApprovalPolicy

    policies = db.query(ApprovalPolicy).filter(
        ApprovalPolicy.agent_id.in_([agent_id, None]),
        ApprovalPolicy.action_type.in_([action_type, "*"]),
        ApprovalPolicy.is_active == True,
        ApprovalPolicy.requires_approval == True,
    ).all()

    return len(policies) > 0
