import pytest
from backend.app.services.ai.openrouter_provider import OpenRouterAIProvider
from backend.app.services.ai.service import AIService
from backend.app.services.ai.mock_provider import MockAIProvider

from backend.app.core.config import settings

def test_openrouter_provider_initialization():
    provider = OpenRouterAIProvider(api_key="sk-or-v1-testkey123", model_name="google/gemini-2.5-flash")
    assert provider.api_key == "sk-or-v1-testkey123"
    assert provider.model_name == "google/gemini-2.5-flash"

def test_openrouter_clean_json_text():
    provider = OpenRouterAIProvider(api_key="sk-or-v1-testkey123")
    
    # Test wrapped in markdown
    raw_markdown = "```json\n{\"destination\": \"Rome\", \"days\": []}\n```"
    cleaned = provider._clean_json_text(raw_markdown)
    assert cleaned == '{"destination": "Rome", "days": []}'

    # Test already clean
    plain = '{"destination": "Rome", "days": []}'
    assert provider._clean_json_text(plain) == plain

def test_ai_service_provider_resolution(monkeypatch):
    ai_service = AIService()

    # 1. No keys -> MockAIProvider
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    monkeypatch.setattr(settings, "AI_PROVIDER", "auto")
    monkeypatch.setenv("OPENROUTER_API_KEY", "")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    monkeypatch.setenv("AI_PROVIDER", "auto")
    provider = ai_service.get_provider()
    assert isinstance(provider, MockAIProvider)

    # 2. OpenRouter key provided -> OpenRouterAIProvider
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "sk-or-v1-realformatkey123456789")
    monkeypatch.setenv("OPENROUTER_API_KEY", "sk-or-v1-realformatkey123456789")
    provider_or = ai_service.get_provider()
    assert isinstance(provider_or, OpenRouterAIProvider)
    assert provider_or.api_key == "sk-or-v1-realformatkey123456789"

    # 3. Gemini key provided without OpenRouter -> GeminiAIProvider
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "AIzaSyTest123456789012345")
    monkeypatch.setenv("OPENROUTER_API_KEY", "")
    monkeypatch.setenv("GEMINI_API_KEY", "AIzaSyTest123456789012345")
    provider_gemini = ai_service.get_provider()
    from backend.app.services.ai.gemini_provider import GeminiAIProvider
    assert isinstance(provider_gemini, GeminiAIProvider)
