"""OpenAI-compatible Groq chat for the LMS assistant fallback."""

import json
import logging
import os

import requests

logger = logging.getLogger(__name__)

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_MODELS = (
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
)


def groq_api_key():
    return (
        os.environ.get("GROQ_API_KEY")
        or os.environ.get("GROQ_API_KEY_LOCAL")
        or ""
    ).strip()


def groq_models():
    preferred = (os.environ.get("GROQ_MODEL") or "").strip()
    models = []
    if preferred:
        models.append(preferred)
    for model in DEFAULT_GROQ_MODELS:
        if model not in models:
            models.append(model)
    return models


def groq_tools():
    return [
        {
            "type": "function",
            "function": {
                "name": "generate_spreadsheet",
                "description": "Generates a downloadable Excel (.xlsx) spreadsheet for the user.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title of the spreadsheet.",
                        },
                        "rows": {
                            "type": "array",
                            "items": {"type": "array", "items": {"type": "string"}},
                            "description": "The data rows, first row is header.",
                        },
                    },
                    "required": ["title", "rows"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "generate_document",
                "description": "Generates a downloadable Word (.docx) document for the user.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title of the document.",
                        },
                        "content": {
                            "type": "string",
                            "description": "The text content, newlines separate paragraphs.",
                        },
                    },
                    "required": ["title", "content"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "generate_image",
                "description": "Generates an image for the user based on a prompt and displays it in the chat.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "prompt": {
                            "type": "string",
                            "description": "A detailed prompt for generating the image.",
                        }
                    },
                    "required": ["prompt"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "remember_fact",
                "description": "Saves a meaningful fact, preference, goal, or struggle area about the student to long-term memory.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "fact": {
                            "type": "string",
                            "description": "The fact to remember.",
                        },
                        "category": {
                            "type": "string",
                            "enum": [
                                "preference",
                                "personal",
                                "academic",
                                "goal",
                                "struggle",
                                "general",
                            ],
                            "description": "Category: preference, personal, academic, goal, struggle, or general.",
                        },
                    },
                    "required": ["fact", "category"],
                },
            },
        },
    ]


def build_messages(system_prompt, history, query):
    messages = [{"role": "system", "content": system_prompt}]
    for item in history or []:
        content = (item.get("content") or "").strip()
        if not content:
            continue
        role = "assistant" if item.get("role") in ("assistant", "model") else "user"
        messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": query})
    return messages


def message_text(message):
    content = (message or {}).get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str) and part.strip():
                parts.append(part)
            elif isinstance(part, dict):
                text = part.get("text") or part.get("content") or ""
                if text:
                    parts.append(text)
        return "\n".join(parts)
    return ""


def _parse_tool_args(raw_args):
    if isinstance(raw_args, dict):
        return raw_args
    if isinstance(raw_args, str) and raw_args.strip():
        try:
            parsed = json.loads(raw_args)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, dict) else {}
    return {}


def to_gemini_payload(message):
    parts = []
    text = message_text(message)
    if text:
        parts.append({"text": text})
    for tool_call in (message or {}).get("tool_calls") or []:
        function = tool_call.get("function") or {}
        parts.append(
            {
                "functionCall": {
                    "name": function.get("name"),
                    "args": _parse_tool_args(function.get("arguments")),
                }
            }
        )
    if not parts:
        return None
    return {"candidates": [{"content": {"parts": parts}}]}


def complete_chat(*, api_key, system_prompt, history, query, timeout=60):
    if not api_key:
        return None, "Groq is not configured."

    messages = build_messages(system_prompt, history, query)
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    last_error = "Groq is temporarily unavailable."
    tools = groq_tools()

    for model in groq_models():
        for use_tools in (True, False):
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 4096,
            }
            if model.startswith("openai/gpt-oss"):
                payload["reasoning_effort"] = "low"
            if use_tools:
                payload["tools"] = tools
                payload["tool_choice"] = "auto"
            try:
                logger.info("GROQ: Calling %s tools=%s", model, use_tools)
                response = requests.post(
                    GROQ_CHAT_URL, headers=headers, json=payload, timeout=timeout
                )
            except Exception as exc:
                last_error = "Groq encountered an error. Please try again later."
                logger.error("GROQ: Exception (%s): %s", model, exc)
                continue

            logger.info("GROQ: Status %s (%s)", response.status_code, model)
            if response.status_code == 200:
                data = response.json()
                choices = data.get("choices") or []
                message = (choices[0].get("message") or {}) if choices else {}
                gemini_payload = to_gemini_payload(message)
                if gemini_payload:
                    return gemini_payload, model
                last_error = "Groq returned an empty reply."
                continue

            body = (response.text or "")[:400]
            last_error = f"Groq error ({response.status_code})."
            logger.error("GROQ: Error %s: %s", response.status_code, body)
            if response.status_code in (401, 403):
                return None, last_error
            if response.status_code == 404:
                break

    return None, last_error
