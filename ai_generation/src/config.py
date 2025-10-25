from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv


@dataclass
class Settings:
    google_api_key: Optional[str]
    model: str = "gemini-1.5-pro"
    timeout: int = 60


def load_settings() -> Settings:
    load_dotenv(override=False)
    key = os.getenv("GOOGLE_API_KEY")
    model = os.getenv("MODEL", "gemini-1.5-pro")
    timeout_str = os.getenv("TIMEOUT", "60")
    try:
        timeout = int(timeout_str)
    except ValueError:
        timeout = 60
    return Settings(google_api_key=key, model=model, timeout=timeout)

