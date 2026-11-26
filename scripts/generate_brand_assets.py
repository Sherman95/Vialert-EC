"""Build production-ready brand assets from the approved masters in img/.

The source files are read-only inputs. Re-running this script is deterministic and
only replaces generated files below docs/design and frontend/public.
"""

from pathlib import Path
import shutil

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "img"
PUBLIC = ROOT / "frontend" / "public"
BRAND = PUBLIC / "brand"
ICONS = PUBLIC / "icons"
SPLASH = PUBLIC / "splash"
SOCIAL = PUBLIC / "images"
DOCS = ROOT / "docs" / "design"

RESAMPLE = Image.Resampling.LANCZOS
BLUE = "#0D47A1"
NAVY = "#062044"


def ensure_directories():
    for directory in (BRAND, ICONS, SPLASH, SOCIAL, DOCS):
        directory.mkdir(parents=True, exist_ok=True)


def alpha_crop(image: Image.Image, padding_ratio: float = 0.035) -> Image.Image:
    rgba = image.convert("RGBA")
    # Ignore nearly transparent export noise so logos do not keep huge empty margins.
    alpha_mask = rgba.getchannel("A").point(lambda value: 255 if value > 12 else 0)
    bbox = alpha_mask.getbbox()
    if not bbox:
        return rgba
    width, height = bbox[2] - bbox[0], bbox[3] - bbox[1]
    padding = max(4, round(max(width, height) * padding_ratio))
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(rgba.width, bbox[2] + padding)
    bottom = min(rgba.height, bbox[3] + padding)
    return rgba.crop((left, top, right, bottom))


def nonwhite_crop(image: Image.Image, padding_ratio: float = 0.06) -> Image.Image:
    rgb = image.convert("RGB")
    background = Image.new("RGB", rgb.size, "white")
    difference = ImageChops.difference(rgb, background).convert("L")
    difference = difference.point(lambda value: 255 if value > 14 else 0)
    bbox = difference.getbbox()
    if not bbox:
        return rgb
    width, height = bbox[2] - bbox[0], bbox[3] - bbox[1]
    padding = max(4, round(max(width, height) * padding_ratio))
    return rgb.crop((
        max(0, bbox[0] - padding),
        max(0, bbox[1] - padding),
        min(rgb.width, bbox[2] + padding),
        min(rgb.height, bbox[3] + padding),
    ))


def fit_square(image: Image.Image, size: int, background="white", occupancy=0.84) -> Image.Image:
    mode = "RGBA" if image.mode == "RGBA" or background is None else "RGB"
    canvas_color = (0, 0, 0, 0) if background is None else background
    canvas = Image.new(mode, (size, size), canvas_color)
    limit = max(1, round(size * occupancy))
    fitted = image.copy()
    fitted.thumbnail((limit, limit), RESAMPLE)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    if mode == "RGBA":
        fitted = fitted.convert("RGBA")
        canvas.alpha_composite(fitted, (x, y))
    else:
        canvas.paste(fitted.convert("RGB"), (x, y))
    return canvas


def build_brand_assets():
    horizontal = alpha_crop(Image.open(SOURCE / "logo-horizontal.png"), 0.025)
    symbol = alpha_crop(Image.open(SOURCE / "isotype-color.png"), 0.025)

    horizontal.save(BRAND / "logo-horizontal.png", optimize=True)
    symbol.save(BRAND / "logo-compact.png", optimize=True)
    symbol.save(BRAND / "isotype-color.png", optimize=True)

    # Approved one-colour applications for dark surfaces.
    white_logo = Image.new("RGBA", horizontal.size, (255, 255, 255, 0))
    white_logo.putalpha(horizontal.getchannel("A"))
    white_logo.save(BRAND / "logo-dark.png", optimize=True)

    white_symbol = Image.new("RGBA", symbol.size, (255, 255, 255, 0))
    white_symbol.putalpha(symbol.getchannel("A"))
    white_symbol.save(BRAND / "isotype-light.png", optimize=True)


def build_icons():
    app_master = nonwhite_crop(Image.open(SOURCE / "pwa-icon-master.png"), 0.0)
    symbol = alpha_crop(Image.open(SOURCE / "isotype-color.png"), 0.01)
    favicon = nonwhite_crop(Image.open(SOURCE / "favicon-master.png"), 0.04)

    for size in (48, 72, 96, 128, 144, 152, 192, 384, 512):
        fit_square(app_master, size, background="white", occupancy=0.94).save(
            ICONS / f"icon-{size}.png", optimize=True
        )

    # Maskable icons keep every essential part inside the central 80% safe zone.
    for size in (192, 512):
        fit_square(symbol, size, background=BLUE, occupancy=0.62).save(
            ICONS / f"icon-maskable-{size}.png", optimize=True
        )

    favicon_outputs = []
    for size in (16, 32, 48):
        icon = fit_square(favicon, size, background="white", occupancy=0.88)
        icon.save(ICONS / f"favicon-{size}.png", optimize=True)
        favicon_outputs.append(icon)

    # Browsers that support prefers-color-scheme receive a tab icon whose
    # background blends with their light or dark chrome.
    fit_square(favicon, 32, background="white", occupancy=0.88).save(
        ICONS / "favicon-light-32.png", optimize=True
    )
    fit_square(symbol, 32, background=NAVY, occupancy=0.70).save(
        ICONS / "favicon-dark-32.png", optimize=True
    )
    for output in (ICONS / "favicon.ico", PUBLIC / "favicon.ico"):
        favicon_outputs[-1].save(
            output,
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48)],
        )
    apple_icon = fit_square(app_master, 180, background="white", occupancy=0.92)
    apple_icon.save(ICONS / "apple-touch-icon.png", optimize=True)
    apple_icon.save(PUBLIC / "apple-touch-icon.png", optimize=True)


def build_splash_assets():
    for name in ("mobile", "desktop"):
        image = Image.open(SOURCE / f"splash-{name}.webp").convert("RGB")
        image.save(SPLASH / f"splash-{name}.webp", format="WEBP", quality=86, method=6)


def build_social_card():
    width, height = 1200, 630
    canvas = Image.new("RGB", (width, height), NAVY)
    pixels = canvas.load()
    top = (13, 71, 161)
    bottom = (6, 32, 68)
    for y in range(height):
        progress = y / (height - 1)
        color = tuple(round(top[channel] * (1 - progress) + bottom[channel] * progress) for channel in range(3))
        for x in range(width):
            pixels[x, y] = color

    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.polygon([(0, 445), (220, 270), (430, 440), (655, 245), (900, 445)], fill=(25, 118, 210, 115))
    draw.polygon([(0, 515), (260, 355), (500, 515), (770, 335), (1030, 515)], fill=(46, 125, 50, 150))
    draw.polygon([(0, 565), (285, 430), (540, 560), (855, 405), (1200, 555), (1200, 630), (0, 630)], fill=(3, 28, 61, 245))

    # A wide road motif echoes the approved splash artwork without copying UI chrome.
    road_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    road = ImageDraw.Draw(road_layer)
    road.line([(1230, 650), (940, 545), (855, 475)], fill=(3, 24, 50, 255), width=170)
    road.line([(1230, 650), (940, 545), (855, 475)], fill=(255, 255, 255, 220), width=7)
    road.line([(1200, 620), (930, 525), (858, 474)], fill=(255, 193, 7, 230), width=7)
    canvas = Image.alpha_composite(canvas.convert("RGBA"), road_layer.filter(ImageFilter.GaussianBlur(0.4)))

    logo = alpha_crop(Image.open(SOURCE / "logo-horizontal.png"), 0.01)
    logo.thumbnail((650, 285), RESAMPLE)
    panel = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    panel_draw = ImageDraw.Draw(panel, "RGBA")
    panel_draw.rounded_rectangle((54, 74, 756, 424), radius=34, fill=(255, 255, 255, 238))
    panel_draw.rounded_rectangle((54, 74, 756, 424), radius=34, outline=(255, 255, 255, 255), width=2)
    canvas = Image.alpha_composite(canvas, panel)
    shadow = Image.new("RGBA", logo.size, (0, 0, 0, 0))
    shadow.putalpha(logo.getchannel("A").filter(ImageFilter.GaussianBlur(14)))
    logo_x = 82 + (646 - logo.width) // 2
    logo_y = 92 + (305 - logo.height) // 2
    canvas.alpha_composite(shadow, (logo_x + 8, logo_y + 12))
    canvas.alpha_composite(logo, (logo_x, logo_y))

    # Ecuador tricolour detail.
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.rounded_rectangle((82, 520, 340, 532), radius=6, fill=(255, 193, 7, 255))
    draw.rounded_rectangle((340, 520, 505, 532), radius=6, fill=(25, 118, 210, 255))
    draw.rounded_rectangle((505, 520, 642, 532), radius=6, fill=(229, 57, 53, 255))

    canvas.convert("RGB").save(SOCIAL / "og-image.png", optimize=True)


def copy_references():
    shutil.copy2(SOURCE / "vialert-brand-board.png", DOCS / "vialert-brand-board.png")
    shutil.copy2(SOURCE / "web-header-reference.png", DOCS / "web-header-reference.png")


def main():
    ensure_directories()
    build_brand_assets()
    build_icons()
    build_splash_assets()
    build_social_card()
    copy_references()

    generated = sorted(
        path.relative_to(ROOT) for directory in (BRAND, ICONS, SPLASH, SOCIAL, DOCS)
        for path in directory.iterdir() if path.is_file()
    )
    print(f"Generated {len(generated)} assets:")
    for path in generated:
        print(f"- {path.as_posix()}")


if __name__ == "__main__":
    main()
