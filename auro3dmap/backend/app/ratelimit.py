"""Basit bellek-içi hız sınırlayıcı.

Tek worker'lı çalışmada IP + endpoint bazlı istek sayısını sınırlar. Çoklu
worker/instance kurulumunda her süreç kendi sayaçlarını tutar; bu yüzden
production'da önde bir reverse-proxy/CDN (Cloudflare, nginx `limit_req` vb.)
seviyesinde de sınırlama önerilir — bu modül son bir savunma hattıdır.
"""

from __future__ import annotations

import time
from collections import deque

from fastapi import HTTPException, Request

_hits: dict[str, deque[float]] = {}
_last_sweep = 0.0
_SWEEP_INTERVAL_S = 300.0


def _client_key(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _sweep(now: float) -> None:
    global _last_sweep
    if now - _last_sweep < _SWEEP_INTERVAL_S:
        return
    _last_sweep = now
    stale = [k for k, bucket in _hits.items() if not bucket or now - bucket[-1] > _SWEEP_INTERVAL_S]
    for k in stale:
        _hits.pop(k, None)


def rate_limit(max_requests: int, window_s: float):
    """FastAPI `Depends()` ile kullanılacak basit sabit-pencere sayaç sınırlayıcısı."""

    async def _dependency(request: Request) -> None:
        now = time.monotonic()
        _sweep(now)
        key = f"{request.url.path}:{_client_key(request)}"
        bucket = _hits.setdefault(key, deque())
        while bucket and now - bucket[0] > window_s:
            bucket.popleft()
        if len(bucket) >= max_requests:
            raise HTTPException(429, "Çok fazla istek; lütfen biraz sonra tekrar deneyin.")
        bucket.append(now)

    return _dependency
