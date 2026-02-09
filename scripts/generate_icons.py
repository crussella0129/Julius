#!/usr/bin/env python3
"""Generate app icons for Julius from ball python J design."""

import math
import struct
from pathlib import Path
from PIL import Image, ImageDraw

RESOURCES = Path(__file__).parent.parent / "resources"


def draw_ball_python_j(size: int) -> Image.Image:
    """Draw a ball python curled in a J shape at the given size."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = size / 64  # scale factor from our 64x64 design space

    # Background: rounded rectangle with warm dark color
    pad = int(4 * s)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=int(12 * s),
        fill=(42, 36, 32, 255),
    )

    # -- Draw the J-shaped body --
    # We'll draw it as a thick path using circles along a bezier-like curve
    body_color = (196, 149, 85)  # warm tan #C49555
    body_width = int(5 * s)

    # Generate points along the J shape
    # Vertical part: from top (35,10) down to (36,40)
    points = []
    for t_i in range(100):
        t = t_i / 99.0
        if t < 0.55:
            # Straight vertical part
            tt = t / 0.55
            x = 35 + tt * 1
            y = 10 + tt * 30
        else:
            # Curved hook part
            tt = (t - 0.55) / 0.45
            angle = tt * math.pi * 0.85
            cx, cy = 28, 42  # center of the hook curve
            radius = 12
            x = cx + radius * math.sin(angle)
            y = cy + radius * (1 - math.cos(angle)) * 0.7
            # Pull it left and down
            x = 36 - (36 - x) * 1.0
            y = 40 + (y - 42 + 5) * 0.9

        points.append((x * s, y * s))

    # Draw body as overlapping circles for smooth thick line
    for px, py in points:
        draw.ellipse(
            [px - body_width, py - body_width, px + body_width, py + body_width],
            fill=body_color,
        )

    # -- Dark brown patches (ball python pattern) --
    patch_color = (92, 61, 46, 200)  # dark brown with some transparency
    patches = [
        (35.5, 15, 5, 3.5, -5),
        (36, 24, 4.5, 3, 3),
        (36, 33, 5, 3.5, -2),
        (33, 42, 4.5, 3, 15),
        (25, 49, 4, 3, 35),
        (17, 50, 3.5, 2.5, 60),
    ]
    for cx, cy, rx, ry, angle in patches:
        draw_rotated_ellipse(draw, cx * s, cy * s, rx * s, ry * s, angle, patch_color)

    # -- Lighter belly highlights --
    highlight_color = (232, 213, 176, 100)
    highlights = [
        (35, 19, 2.5, 1.8, -5),
        (35.5, 29, 2.5, 1.5, 0),
        (34, 38, 2, 1.5, 5),
        (28, 47, 2, 1.2, 30),
    ]
    for cx, cy, rx, ry, angle in highlights:
        draw_rotated_ellipse(
            draw, cx * s, cy * s, rx * s, ry * s, angle, highlight_color
        )

    # -- Head --
    head_color = (107, 66, 38)  # dark brown
    draw_rotated_ellipse(draw, 35 * s, 8 * s, 6.5 * s, 5 * s, -5, head_color)
    # Head lighter pattern
    head_pattern = (160, 112, 76, 140)
    draw_rotated_ellipse(draw, 35 * s, 8 * s, 4.5 * s, 2.5 * s, -5, head_pattern)

    # -- Eye --
    eye_x, eye_y = 33 * s, 6 * s
    eye_r = 1.5 * s
    draw.ellipse(
        [eye_x - eye_r, eye_y - eye_r, eye_x + eye_r, eye_y + eye_r],
        fill=(26, 26, 26),
    )
    # Eye inner
    inner_r = 1.0 * s
    draw.ellipse(
        [eye_x - inner_r, eye_y - inner_r, eye_x + inner_r, eye_y + inner_r],
        fill=(45, 24, 16),
    )
    # Eye shine
    shine_r = 0.4 * s
    shine_x, shine_y = eye_x - 0.4 * s, eye_y - 0.5 * s
    draw.ellipse(
        [
            shine_x - shine_r,
            shine_y - shine_r,
            shine_x + shine_r,
            shine_y + shine_r,
        ],
        fill=(255, 255, 255, 210),
    )

    # -- Nostril --
    nostril_r = 0.5 * s
    draw.ellipse(
        [
            30.5 * s - nostril_r,
            7.5 * s - nostril_r,
            30.5 * s + nostril_r,
            7.5 * s + nostril_r,
        ],
        fill=(45, 24, 16, 160),
    )

    # -- Tongue --
    tongue_color = (204, 51, 51)
    tongue_width = max(1, int(0.6 * s))
    draw.line(
        [(29 * s, 9 * s), (26.5 * s, 10.5 * s)],
        fill=tongue_color,
        width=tongue_width,
    )
    draw.line(
        [(26.5 * s, 10.5 * s), (25.5 * s, 9.8 * s)],
        fill=tongue_color,
        width=tongue_width,
    )
    draw.line(
        [(26.5 * s, 10.5 * s), (25.5 * s, 11.2 * s)],
        fill=tongue_color,
        width=tongue_width,
    )

    # -- Tail tip --
    tail_color = (196, 149, 85)
    tail_width = max(1, int(2.5 * s))
    # Small curved tail end
    tail_pts = []
    for t_i in range(20):
        t = t_i / 19.0
        tx = (18 + t * 4) * s
        ty = (44 - math.sin(t * math.pi) * 2) * s
        tail_pts.append((tx, ty))
    for i in range(len(tail_pts) - 1):
        w = max(1, int(tail_width * (1 - i / len(tail_pts))))
        draw.line([tail_pts[i], tail_pts[i + 1]], fill=tail_color, width=w)

    return img


def draw_rotated_ellipse(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    angle_deg: float,
    color: tuple,
) -> None:
    """Draw a filled rotated ellipse using polygon approximation."""
    angle_rad = math.radians(angle_deg)
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    points = []
    n_pts = 36
    for i in range(n_pts):
        theta = 2 * math.pi * i / n_pts
        x = rx * math.cos(theta)
        y = ry * math.sin(theta)
        rx2 = x * cos_a - y * sin_a + cx
        ry2 = x * sin_a + y * cos_a + cy
        points.append((rx2, ry2))
    draw.polygon(points, fill=color)


def create_ico(png_path: Path, ico_path: Path) -> None:
    """Create a multi-size ICO file from a PNG."""
    img = Image.open(png_path)
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(str(ico_path), format="ICO", sizes=sizes)


def create_icns(png_path: Path, icns_path: Path) -> None:
    """Create an ICNS file from a PNG using raw struct packing.

    ICNS format: 4-byte magic 'icns', 4-byte total length, then icon entries.
    Each entry: 4-byte type, 4-byte length (including header), PNG data.
    """
    img = Image.open(png_path)
    # ICNS icon types for PNG-compressed data
    icon_types = [
        (b"icp4", 16),
        (b"icp5", 32),
        (b"icp6", 64),
        (b"ic07", 128),
        (b"ic08", 256),
        (b"ic09", 512),
    ]

    entries = []
    for type_code, size in icon_types:
        resized = img.resize((size, size), Image.LANCZOS)
        import io

        buf = io.BytesIO()
        resized.save(buf, format="PNG")
        png_data = buf.getvalue()
        entry_len = 8 + len(png_data)
        entries.append(type_code + struct.pack(">I", entry_len) + png_data)

    body = b"".join(entries)
    total_len = 8 + len(body)
    icns_data = b"icns" + struct.pack(">I", total_len) + body

    icns_path.write_bytes(icns_data)


def main() -> None:
    RESOURCES.mkdir(exist_ok=True)

    print("Generating 512x512 icon PNG...")
    icon = draw_ball_python_j(512)
    png_path = RESOURCES / "icon.png"
    icon.save(str(png_path), "PNG")
    print(f"  Saved {png_path}")

    print("Generating ICO...")
    ico_path = RESOURCES / "icon.ico"
    create_ico(png_path, ico_path)
    print(f"  Saved {ico_path}")

    print("Generating ICNS...")
    icns_path = RESOURCES / "icon.icns"
    create_icns(png_path, icns_path)
    print(f"  Saved {icns_path}")

    print("Done!")


if __name__ == "__main__":
    main()
