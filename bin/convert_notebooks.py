#!/usr/bin/env python3
"""Convert Jupyter notebooks in _notebooks/ to Jekyll blog posts in _posts/.

Supports two modes:
  --fast   : convert pre-executed notebooks (default)
  --execute: execute notebooks before conversion

Usage:
  python bin/convert_notebooks.py [--fast|--execute]

Front matter is extracted from the first cell if it is a raw or markdown cell
whose content starts with '---'. Otherwise a companion YAML sidecar file
(<notebook_name>.yml) is used.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

NOTEBOOKS_DIR = Path("_notebooks")
POSTS_DIR = Path("_posts")
IMG_DIR = Path("assets/img/notebooks")

MAX_INLINE_IMG_KB = 200


def extract_front_matter(nb_path: Path) -> tuple[str, bool]:
    """Return (front_matter_string, was_found_in_notebook)."""
    with open(nb_path, encoding="utf-8") as f:
        nb = json.load(f)

    cells = nb.get("cells", [])
    if cells:
        first = cells[0]
        src = "".join(first.get("source", []))
        if src.strip().startswith("---"):
            return src.strip(), True

    sidecar = nb_path.with_suffix(".yml")
    if sidecar.exists():
        return sidecar.read_text(encoding="utf-8").strip(), False

    stem = nb_path.stem
    date_match = re.match(r"(\d{4}-\d{2}-\d{2})", stem)
    date_str = date_match.group(1) if date_match else "2026-01-01"
    title = re.sub(r"^\d{4}-\d{2}-\d{2}-?", "", stem).replace("_", " ").replace("-", " ").title()
    return f"---\nlayout: post\ntitle: \"{title}\"\ndate: {date_str}\ncategories: computation\ndescription: \"Auto-generated from notebook.\"\n---", False


def convert(nb_path: Path, execute: bool = False):
    """Convert a single notebook to a Jekyll post."""
    print(f"Converting: {nb_path}")

    front_matter, fm_in_nb = extract_front_matter(nb_path)

    cmd = ["jupyter", "nbconvert", "--to", "markdown", "--output-dir", str(POSTS_DIR)]
    if execute:
        cmd.extend(["--execute", "--ExecutePreprocessor.timeout=120"])
    cmd.append(str(nb_path))

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr}", file=sys.stderr)
        return False

    md_name = nb_path.stem + ".md"
    md_path = POSTS_DIR / md_name
    if not md_path.exists():
        print(f"  WARNING: expected output {md_path} not found")
        return False

    content = md_path.read_text(encoding="utf-8")

    if fm_in_nb:
        content = re.sub(r"^---\s*\n.*?\n---\s*\n?", "", content, count=1, flags=re.DOTALL)

    content = front_matter + "\n\n" + content.lstrip()

    img_subdir = nb_path.stem + "_files"
    src_img_dir = POSTS_DIR / img_subdir
    if src_img_dir.exists():
        dest_img_dir = IMG_DIR / nb_path.stem
        dest_img_dir.mkdir(parents=True, exist_ok=True)
        for img in src_img_dir.iterdir():
            shutil.move(str(img), str(dest_img_dir / img.name))
        shutil.rmtree(src_img_dir)
        content = content.replace(
            img_subdir + "/",
            f"/assets/img/notebooks/{nb_path.stem}/",
        )

    for match in re.finditer(r"!\[.*?\]\(data:image/.*?;base64,([^)]+)\)", content):
        b64_len = len(match.group(1))
        kb = b64_len * 3 / 4 / 1024
        if kb > MAX_INLINE_IMG_KB:
            print(f"  WARNING: inline image ~{kb:.0f}KB exceeds {MAX_INLINE_IMG_KB}KB limit")

    md_path.write_text(content, encoding="utf-8")
    print(f"  -> {md_path}")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="Execute notebooks before converting")
    parser.add_argument("--fast", action="store_true", default=True, help="Convert pre-executed (default)")
    args = parser.parse_args()

    if not NOTEBOOKS_DIR.exists():
        print(f"No {NOTEBOOKS_DIR} directory found.")
        return

    IMG_DIR.mkdir(parents=True, exist_ok=True)

    notebooks = sorted(NOTEBOOKS_DIR.glob("*.ipynb"))
    if not notebooks:
        print("No notebooks found in _notebooks/")
        return

    ok = 0
    for nb in notebooks:
        if nb.name.startswith("_"):
            continue
        if convert(nb, execute=args.execute):
            ok += 1

    print(f"\nConverted {ok}/{len(notebooks)} notebooks.")


if __name__ == "__main__":
    main()
