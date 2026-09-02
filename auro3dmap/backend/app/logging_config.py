"""Merkezi loglama yapılandırması.

Önceden hatalar `print()` ile stdout'a yazılıyordu ve istisna detayları
doğrudan istemciye dönüyordu. Artık iç detaylar burada loglanır, istemciye
sadece genel/güvenli bir mesaj gider.
"""

from __future__ import annotations

import logging
import os

_configured = False


def configure_logging() -> None:
    global _configured
    if _configured:
        return
    level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    _configured = True


logger = logging.getLogger("auro3dmap")
