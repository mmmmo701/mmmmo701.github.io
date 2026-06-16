# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal website for Mike Mo, served as a **plain static HTML site via GitHub Pages** at `mmmmo701.github.io`. Despite the "Initial GitHub pages site with Jekyll" commit and the Jekyll-oriented `.gitignore`, there is **no `_config.yml`, no Gemfile, and no build step** — the site is hand-written HTML/CSS with no framework. There is nothing to build, lint, or test.

## Development

- **Preview locally:** open the HTML files directly in a browser, or serve the repo root with `python3 -m http.server` and visit `http://localhost:8000`. A server is needed because pages link CSS via absolute paths (`/css/...`) that don't resolve from `file://`.
- **Deploy:** push to `main`; GitHub Pages serves the repo root automatically.

## Structure & conventions

- `index.html` — landing page with Intro / Blog / Research / Projects / Contact sections.
- `blog/index.html` — manually-maintained list of blog posts; each post is a standalone file in `blog/posts/`.
- `projects/index.html` — manually-maintained list of project cards linking to external GitHub repos.
- `css/normalize.css` — global theme (dark, CSS custom properties on `:root` like `--bg`, `--muted`, `--gap`). Loaded by `index.html`, `blog/index.html`, `projects/index.html`.
- `css/blog-post.css` — separate **light** theme used only by individual blog posts in `blog/posts/`.

Key conventions to follow when editing:

- **CSS is split between a shared file and per-page `<style>` blocks.** `normalize.css`/`blog-post.css` hold shared/base styles; page-specific layout and the per-page color theme live inline in each file's `<style>`. Each top-level page sets its own accent color and overrides `--bg` inline (e.g. teal/pink/lime/amber sections in `index.html`, `--bg: #062010` for projects, `--bg: #200720` for blog).
- **All stylesheet `href`s are absolute (`/css/...`).** This is intentional (see commit `f0e2464`) so paths work from any directory depth on GitHub Pages.
- **Adding a blog post:** create a new standalone HTML file in `blog/posts/` (copy an existing post as a template — it links `/css/normalize.css` + `/css/blog-post.css` and includes the MathJax CDN script for LaTeX), then add a `.blogpost` card linking to it in `blog/index.html`. There is no automatic post index.
- **Adding a project:** add a `.proj` card in `projects/index.html` (and optionally feature it in `index.html`'s Projects section). Note: `.github/copilot-instructions.md` claims projects live in a client-side `PROJECTS` array — that is outdated; projects are hardcoded HTML cards.
- Blog posts use **MathJax 4** (jsDelivr CDN) for inline `\( ... \)` math.

## Note on stale docs

`.github/copilot-instructions.md` describes a Jekyll/markdown workflow (`blog/_posts/` with YAML front matter, a `PROJECTS` JS array) that **no longer matches the repo** — the site is now hand-written static HTML. Trust the actual files over that document.
