import time

from sqlalchemy.orm import Session

from app.models.providers import Provider
from app.schemas.providers import ProviderTestResponse


def test_provider_connection(db: Session, provider: Provider, model: str | None = None) -> ProviderTestResponse:
    from app.core.config import settings

    start = time.time()
    try:
        if provider.provider_type == "openai":
            return _test_openai(provider, model)
        elif provider.provider_type == "anthropic":
            return _test_anthropic(provider, model)
        elif provider.provider_type == "gemini":
            return _test_gemini(provider, model)
        elif provider.provider_type == "groq":
            return _test_groq(provider, model)
        elif provider.provider_type == "openrouter":
            return _test_openrouter(provider, model)
        elif provider.provider_type == "ollama":
            return _test_ollama(provider, model)
        elif provider.provider_type == "lm_studio":
            return _test_lm_studio(provider, model)
        else:
            return ProviderTestResponse(success=False, message=f"Unknown provider type: {provider.provider_type}")
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def _test_openai(provider: Provider, model: str | None) -> ProviderTestResponse:
    try:
        from openai import OpenAI

        base_url = provider.base_url or "https://api.openai.com/v1"
        keys = provider.keys.filter_by(is_active=True).first()
        if not keys:
            return ProviderTestResponse(success=False, message="No active API key found")

        from app.security.encryption import decrypt_value

        client = OpenAI(api_key=decrypt_value(keys.encrypted_value), base_url=base_url)
        test_model = model or "gpt-4o-mini"
        client.models.retrieve(test_model)
        return ProviderTestResponse(success=True, message="Connection successful", model=test_model)
    except ImportError:
        return ProviderTestResponse(success=False, message="openai package not installed")
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def _test_anthropic(provider: Provider, model: str | None) -> ProviderTestResponse:
    try:
        from anthropic import Anthropic

        keys = provider.keys.filter_by(is_active=True).first()
        if not keys:
            return ProviderTestResponse(success=False, message="No active API key found")

        from app.security.encryption import decrypt_value

        client = Anthropic(api_key=decrypt_value(keys.encrypted_value))
        test_model = model or "claude-sonnet-4-20250514"
        client.messages.create(model=test_model, max_tokens=1, messages=[{"role": "user", "content": "test"}])
        return ProviderTestResponse(success=True, message="Connection successful", model=test_model)
    except ImportError:
        return ProviderTestResponse(success=False, message="anthropic package not installed")
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def _test_gemini(provider: Provider, model: str | None) -> ProviderTestResponse:
    try:
        import google.generativeai as genai

        keys = provider.keys.filter_by(is_active=True).first()
        if not keys:
            return ProviderTestResponse(success=False, message="No active API key found")

        from app.security.encryption import decrypt_value

        genai.configure(api_key=decrypt_value(keys.encrypted_value))
        test_model = model or "gemini-2.0-flash"
        genai.get_model(test_model)
        return ProviderTestResponse(success=True, message="Connection successful", model=test_model)
    except ImportError:
        return ProviderTestResponse(success=False, message="google-generativeai package not installed")
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def _test_groq(provider: Provider, model: str | None) -> ProviderTestResponse:
    try:
        from groq import Groq

        keys = provider.keys.filter_by(is_active=True).first()
        if not keys:
            return ProviderTestResponse(success=False, message="No active API key found")

        from app.security.encryption import decrypt_value

        client = Groq(api_key=decrypt_value(keys.encrypted_value))
        test_model = model or "llama-3.3-70b-versatile"
        client.models.retrieve(test_model)
        return ProviderTestResponse(success=True, message="Connection successful", model=test_model)
    except ImportError:
        return ProviderTestResponse(success=False, message="groq package not installed")
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def _test_openrouter(provider: Provider, model: str | None) -> ProviderTestResponse:
    try:
        from openai import OpenAI

        keys = provider.keys.filter_by(is_active=True).first()
        if not keys:
            return ProviderTestResponse(success=False, message="No active API key found")

        from app.security.encryption import decrypt_value

        client = OpenAI(api_key=decrypt_value(keys.encrypted_value), base_url="https://openrouter.ai/api/v1")
        test_model = model or "openai/gpt-4o-mini"
        client.models.retrieve(test_model)
        return ProviderTestResponse(success=True, message="Connection successful", model=test_model)
    except ImportError:
        return ProviderTestResponse(success=False, message="openai package not installed")
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def _test_ollama(provider: Provider, model: str | None) -> ProviderTestResponse:
    try:
        import requests

        base_url = provider.base_url or "http://localhost:11434"
        test_model = model or "llama3.2"
        resp = requests.get(f"{base_url}/api/tags", timeout=5)
        if resp.status_code != 200:
            return ProviderTestResponse(success=False, message=f"Ollama returned {resp.status_code}")
        models = resp.json().get("models", [])
        model_names = [m.get("name", "") for m in models]
        if test_model not in model_names:
            return ProviderTestResponse(success=False, message=f"Model {test_model} not found. Available: {model_names}")
        return ProviderTestResponse(success=True, message="Connection successful", model=test_model)
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def _test_lm_studio(provider: Provider, model: str | None) -> ProviderTestResponse:
    try:
        import requests

        base_url = provider.base_url or "http://localhost:1234/v1"
        resp = requests.get(f"{base_url}/models", timeout=5)
        if resp.status_code != 200:
            return ProviderTestResponse(success=False, message=f"LM Studio returned {resp.status_code}")
        return ProviderTestResponse(success=True, message="Connection successful")
    except Exception as e:
        return ProviderTestResponse(success=False, message=str(e))


def get_provider_client(db: Session, provider: Provider):
    from app.security.encryption import decrypt_value

    keys = provider.keys.filter_by(is_active=True).first()
    api_key = decrypt_value(keys.encrypted_value) if keys else None

    if provider.provider_type == "openai":
        from openai import OpenAI

        return OpenAI(api_key=api_key, base_url=provider.base_url or "https://api.openai.com/v1")
    elif provider.provider_type == "anthropic":
        from anthropic import Anthropic

        return Anthropic(api_key=api_key)
    else:
        raise ValueError(f"Unsupported provider type: {provider.provider_type}")
