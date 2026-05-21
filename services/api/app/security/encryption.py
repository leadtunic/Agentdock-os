from cryptography.fernet import Fernet

from app.core.config import settings


def _get_fernet() -> Fernet:
    key = settings.encryption_key.encode()
    if len(key) < 32:
        key = key.ljust(32, b"=")
    return Fernet(key)


def encrypt_value(value: str) -> str:
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt_value(encrypted_value: str) -> str:
    return _get_fernet().decrypt(encrypted_value.encode()).decode()
