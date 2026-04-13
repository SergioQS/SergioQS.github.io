# Local Development

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.

## Quick Start

```bash
docker compose up --build
```

The site will be available at **http://localhost:8080** with live-reload on port 35729.

## Rebuilding after Gemfile changes

```bash
docker compose build --no-cache
docker compose up
```

## Notebook conversion (local)

```bash
python bin/convert_notebooks.py
```

Converts all `.ipynb` files in `_notebooks/` into Jekyll-ready posts under `_posts/`.

## Project Structure (key paths)

| Path | Purpose |
|---|---|
| `_posts/` | Blog posts (Markdown) |
| `_notebooks/` | Source Jupyter notebooks (auto-converted) |
| `_data/wolfram.yml` | Wolfram Community entries metadata |
| `assets/jupyter/` | Legacy notebook embeds |
| `assets/interactive/` | Prebuilt interactive HTML widgets |
| `_sass/` | SCSS partials |
| `assets/css/main.scss` | CSS entry point |
