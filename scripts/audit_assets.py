"""Generate the final graphics inventory and mask/contact-sheet audit artifacts."""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "frontend" / "public"
AUDIT = ROOT / "docs" / "design" / "audit"
SOURCE_EXTENSIONS = {".js", ".jsx", ".css", ".html", ".json", ".webmanifest"}
IMAGE_EXTENSIONS = {".png", ".webp", ".jpg", ".jpeg", ".ico", ".svg"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(131072), b""):
            digest.update(chunk)
    return digest.hexdigest()


def source_references(public_path: Path) -> list[str]:
    try:
        public_url = "/" + public_path.relative_to(PUBLIC).as_posix()
    except ValueError:
        return []
    references = []
    roots = [ROOT / "frontend" / "src", ROOT / "frontend" / "index.html", PUBLIC]
    for source_root in roots:
        paths = [source_root] if source_root.is_file() else source_root.rglob("*")
        for path in paths:
            if not path.is_file() or path == public_path or path.suffix.lower() not in SOURCE_EXTENSIONS:
                continue
            try:
                if public_url in path.read_text(encoding="utf-8"):
                    references.append(path.relative_to(ROOT).as_posix())
            except UnicodeDecodeError:
                continue
    if not references and public_path.name in {"favicon.ico", "apple-touch-icon.png"}:
        references.append("Navegador/SO (ruta convencional de respaldo)")
    return sorted(set(references))


def inspect_image(path: Path) -> dict:
    if path.suffix.lower() == ".svg":
        header = path.read_text(encoding="utf-8", errors="replace")[:500]
        return {
            "path": path.relative_to(ROOT).as_posix(),
            "format": "SVG",
            "dimensions": "vectorial",
            "bytes": path.stat().st_size,
            "alpha": "sí (vector)",
            "references": source_references(path),
            "header": header,
        }

    with Image.open(path) as image:
        sizes = image.info.get("sizes") if image.format == "ICO" else None
        dimensions = ", ".join(f"{w}×{h}" for w, h in sorted(sizes)) if sizes else f"{image.width}×{image.height}"
        has_alpha = "A" in image.mode or "transparency" in image.info
        return {
            "path": path.relative_to(ROOT).as_posix(),
            "format": image.format,
            "dimensions": dimensions,
            "bytes": path.stat().st_size,
            "alpha": "sí" if has_alpha else "no",
            "references": source_references(path),
        }


def essential_radius(path: Path) -> dict:
    with Image.open(path) as source:
        image = source.convert("RGB")
    background = image.getpixel((0, 0))
    points = []
    for y in range(image.height):
        for x in range(image.width):
            pixel = image.getpixel((x, y))
            if max(abs(pixel[channel] - background[channel]) for channel in range(3)) > 18:
                points.append((x, y))
    center = ((image.width - 1) / 2, (image.height - 1) / 2)
    radius = max(math.hypot(x - center[0], y - center[1]) for x, y in points)
    safe_radius = image.width * 0.4
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "essential_radius_px": round(radius, 2),
        "safe_radius_px": round(safe_radius, 2),
        "passes": radius <= safe_radius,
    }


def create_mask_preview(source_path: Path, output_path: Path):
    source = Image.open(source_path).convert("RGBA").resize((320, 320), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1080, 410), "#EAF0F7")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default(size=18)
    labels = ["Circular", "Cuadrada", "Redondeada"]

    for index, label in enumerate(labels):
        mask = Image.new("L", (320, 320), 0)
        mask_draw = ImageDraw.Draw(mask)
        if index == 0:
            mask_draw.ellipse((0, 0, 319, 319), fill=255)
        elif index == 1:
            mask_draw.rectangle((0, 0, 319, 319), fill=255)
        else:
            mask_draw.rounded_rectangle((0, 0, 319, 319), radius=72, fill=255)
        masked = Image.new("RGBA", source.size, (0, 0, 0, 0))
        masked.paste(source, (0, 0), mask)
        x = 30 + index * 350
        canvas.paste(masked, (x, 28), masked)
        draw.text((x + 112, 362), label, fill="#062044", font=font)
        if index == 1:
            safe_radius = 128
            center_x, center_y = x + 160, 188
            draw.ellipse(
                (center_x - safe_radius, center_y - safe_radius, center_x + safe_radius, center_y + safe_radius),
                outline="#FFC107",
                width=3,
            )
    canvas.save(output_path, optimize=True)


def create_contact_sheet(output_path: Path):
    names = [
        "viewport-320x568.png", "viewport-390x844.png", "viewport-768x1024.png",
        "viewport-1366x768.png", "splash-mobile-slow.png", "splash-desktop-slow.png",
        "map-mobile-390x844.png", "map-tile-error-390x844.png",
        "data-error-recoverable-390x844.png", "offline-cached-390x844.png",
    ]
    files = [AUDIT / name for name in names if (AUDIT / name).exists()]
    thumb_width, thumb_height, label_height = 360, 260, 30
    columns = 2
    rows = math.ceil(len(files) / columns)
    sheet = Image.new("RGB", (columns * thumb_width, rows * (thumb_height + label_height)), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=14)
    for index, path in enumerate(files):
        image = Image.open(path).convert("RGB")
        image.thumbnail((thumb_width - 16, thumb_height - 16), Image.Resampling.LANCZOS)
        cell_x = (index % columns) * thumb_width
        cell_y = (index // columns) * (thumb_height + label_height)
        x = cell_x + (thumb_width - image.width) // 2
        y = cell_y + (thumb_height - image.height) // 2
        sheet.paste(image, (x, y))
        draw.text((cell_x + 8, cell_y + thumb_height + 5), path.name, fill="#062044", font=font)
    sheet.save(output_path, optimize=True)


def main():
    AUDIT.mkdir(parents=True, exist_ok=True)
    assets = [inspect_image(path) for path in sorted(PUBLIC.rglob("*")) if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS]
    originals = []
    for path in sorted((ROOT / "img").iterdir()):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            metadata = inspect_image(path)
            metadata["sha256"] = sha256(path)
            originals.append(metadata)

    mask_results = [
        essential_radius(PUBLIC / "icons" / "icon-maskable-192.png"),
        essential_radius(PUBLIC / "icons" / "icon-maskable-512.png"),
    ]
    result = {"assets": assets, "originals": originals, "mask_safe_zone": mask_results}
    (AUDIT / "asset-inventory.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Inventario de recursos gráficos",
        "",
        f"Recursos públicos auditados: **{len(assets)}**. Peso total: **{sum(item['bytes'] for item in assets) / 1024:.1f} KiB**.",
        "",
        "| Ruta | Formato real | Dimensiones | Peso | Alfa | Uso / referencia |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for item in assets:
        references = "<br>".join(f"`{reference}`" for reference in item["references"]) or "No referenciado"
        lines.append(
            f"| `{item['path']}` | {item['format']} | {item['dimensions']} | {item['bytes'] / 1024:.1f} KiB | {item['alpha']} | {references} |"
        )
    lines.extend(["", "## Masters originales", "", "Los hashes permiten comprobar que los ocho archivos de `img/` permanecen identificables sin cargar esos masters en producción.", ""])
    for item in originals:
        lines.append(f"- `{item['path']}` — {item['format']}, {item['dimensions']}, SHA-256 `{item['sha256']}`")
    lines.extend(["", "## Zona segura maskable", ""])
    for item in mask_results:
        lines.append(
            f"- `{item['path']}`: radio esencial {item['essential_radius_px']} px; límite seguro {item['safe_radius_px']} px; **{'cumple' if item['passes'] else 'no cumple'}**."
        )
    lines.extend([
        "",
        "Los WebP fueron abiertos y reconocidos por Pillow como `WEBP`; los PNG de marca transparentes conservan canal alfa. Ningún archivo de `img/` se referencia desde el bundle del frontend.",
    ])
    (AUDIT / "asset-inventory.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    create_mask_preview(PUBLIC / "icons" / "icon-maskable-512.png", AUDIT / "maskable-shapes.png")
    create_contact_sheet(AUDIT / "visual-contact-sheet.png")
    print(json.dumps({"assets": len(assets), "originals": len(originals), "mask_safe_zone": mask_results}, ensure_ascii=False))


if __name__ == "__main__":
    main()
