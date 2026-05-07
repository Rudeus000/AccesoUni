"""Genera icon16/32/48/128.png cuadrados desde accesouni-logo.png (recorte superior izquierdo)."""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image
except ImportError as e:
    raise SystemExit("Instale Pillow: py -3 -m pip install Pillow") from e

EXTENSION_ROOT = Path(__file__).resolve().parent.parent
ICONS = EXTENSION_ROOT / "icons"
SRC = ICONS / "accesouni-logo.png"


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    s = min(w, h)
    crop = im.crop((0, 0, s, s))
    for size in (16, 32, 48, 128):
        out = crop.resize((size, size), Image.Resampling.LANCZOS)
        dest = ICONS / f"icon{size}.png"
        out.save(dest, optimize=True)
        print("wrote", dest, out.size)


if __name__ == "__main__":
    main()
