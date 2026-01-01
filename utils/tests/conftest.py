from __future__ import annotations

import pytest

# Override anyio fixture to only use asyncio backend
@pytest.fixture(params=["asyncio"])
def anyio_backend(request):
    return request.param
