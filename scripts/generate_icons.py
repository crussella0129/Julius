#!/usr/bin/env python3
"""Generate app icons for Julius by rendering the SVG logo to PNG/ICO/ICNS."""

import io
import struct
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw

ROOT = Path(__file__).parent.parent
SVG_PATH = ROOT / "src" / "renderer" / "src" / "assets" / "logo.svg"
RESOURCES = ROOT / "resources"

ICON_SIZE = 512
BG_COLOR = (42, 36, 32, 255)
BG_RADIUS_RATIO = 12 / 64  # from original 64x64 design space
BG_PAD_RATIO = 4 / 64


def render_svg_to_png(svg_path: Path, size: int) -> Image.Image:
    """Render an SVG file to a Pillow Image at the given size."""
    png_data = cairosvg.svg2png(
        url=str(svg_path),
        output_width=size,
        output_height=size,
    )
    return Image.open(io.BytesIO(png_data)).convert("RGBA")


def make_icon(size: int) -> Image.Image:
    """Create app icon: dark rounded-rect background + centered SVG snake."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw background
    pad = int(BG_PAD_RATIO * size)
    radius = int(BG_RADIUS_RATIO * size)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=radius,
        fill=BG_COLOR,
    )

    # Render SVG at high res, crop to content, scale to fit, center
    snake = render_svg_to_png(SVG_PATH, size * 2)
    bbox = snake.getbbox()
    if bbox:
        cropped = snake.crop(bbox)
        cw, ch = cropped.size

        # Fit within 82% of icon size
        max_dim = int(size * 0.82)
        scale = min(max_dim / cw, max_dim / ch)
        new_w, new_h = int(cw * scale), int(ch * scale)
        snake_scaled = cropped.resize((new_w, new_h), Image.LANCZOS)

        ox = (size - new_w) // 2
        oy = (size - new_h) // 2
        img.paste(snake_scaled, (ox, oy), snake_scaled)

    return img


def create_ico(png_path: Path, ico_path: Path) -> None:
    """Create a multi-size ICO file from a PNG."""
    img = Image.open(png_path)
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(str(ico_path), format="ICO", sizes=sizes)


def create_icns(png_path: Path, icns_path: Path) -> None:
    """Create an ICNS file from a PNG using raw struct packing."""
    img = Image.open(png_path)
    icon_types = [
        (b"icp4", 16), (b"icp5", 32), (b"icp6", 64),
        (b"ic07", 128), (b"ic08", 256), (b"ic09", 512),
    ]
    entries = []
    for type_code, sz in icon_types:
        resized = img.resize((sz, sz), Image.LANCZOS)
        buf = io.BytesIO()
        resized.save(buf, format="PNG")
        png_data = buf.getvalue()
        entries.append(type_code + struct.pack(">I", 8 + len(png_data)) + png_data)
    body = b"".join(entries)
    icns_data = b"icns" + struct.pack(">I", 8 + len(body)) + body
    icns_path.write_bytes(icns_data)


def main() -> None:
    RESOURCES.mkdir(exist_ok=True)

    print(f"Rendering SVG: {SVG_PATH}")
    print("Generating 512x512 icon PNG...")
    icon = make_icon(ICON_SIZE)
    png_path = RESOURCES / "icon.png"
    icon.save(str(png_path), "PNG")
    print(f"  Saved {png_path}")

    print("Generating ICO...")
    create_ico(png_path, RESOURCES / "icon.ico")
    print("  Saved icon.ico")

    print("Generating ICNS...")
    create_icns(png_path, RESOURCES / "icon.icns")
    print("  Saved icon.icns")

    print("Done!")


if __name__ == "__main__":
    main()
