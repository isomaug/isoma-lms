import os


class AgentUnavailable(Exception):
    pass


def gateway_configured():
    return bool(os.environ.get("EKEBUAI_GATEWAY_URL"))


def translate(*args, **kwargs):
    raise AgentUnavailable("EkebuAI gateway is not configured in local dev.")


def transcribe(*args, **kwargs):
    raise AgentUnavailable("EkebuAI gateway is not configured in local dev.")


def chat(*args, **kwargs):
    raise AgentUnavailable("EkebuAI gateway is not configured in local dev.")


def generate(*args, **kwargs):
    raise AgentUnavailable("EkebuAI gateway is not configured in local dev.")
