# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal website for Mike Mo, served as a **plain static HTML site via GitHub Pages** at `mmmmo701.github.io`. Despite the "Initial GitHub pages site with Jekyll" commit and the Jekyll-oriented `.gitignore`, there is **no `_config.yml`, no Gemfile, and no build step** — the site is hand-written HTML/CSS with no framework. There is nothing to build, lint, or test.

## Development

- **Preview locally:** serve the repo root with `python3 -m http.server` and visit `http://localhost:8000`. A server (not `file://`) is required because pages link CSS via absolute paths (`/css/...`).
- **Deploy:** push to `main`; GitHub Pages serves the repo root automatically.

## Structure & conventions

- `index.html` — landing page with Intro / Blog / Research / Projects / Contact sections.
- `blog/index.html` — manually-maintained list of blog posts; each post is a standalone file in `blog/posts/`.
- `projects/index.html` — manually-maintained list of project cards linking to external GitHub repos.
- `css/base.css` — global **dark** theme: design tokens (`:root` vars like `--bg`, `--muted`, `--gap`), layout (`body`, `.wrap`, `header`, `footer`), and the shared components used by more than one page (`a.simple`, `.section h2/p`, `.actions`, `.proj-list`, `.proj`, `.small`). Loaded by `index.html`, `blog/index.html`, `projects/index.html`, and the posts.
- `css/post.css` — separate **light** theme used only by individual blog posts in `blog/posts/`.

Key conventions to follow when editing:

- **Shared styles live in `base.css`; each page's `<style>` block holds only that page's unique theme.** Put anything reused across pages in `base.css` (don't copy-paste rules between pages). A page's inline `<style>` should be limited to its accent color and `--bg` override (teal/pink/lime/amber sections in `index.html`, `--bg: #062010` + lime `a.simple` for projects, `--bg: #200720` + pink for blog) plus any genuinely page-only tweak (e.g. the home vs. projects `.proj` padding differs).
- **All stylesheet `href`s are absolute (`/css/...`).** This is intentional (see commit `f0e2464`) so paths work from any directory depth on GitHub Pages.
- **Adding a blog post:** create a new standalone HTML file in `blog/posts/` (copy an existing post as a template — it links `/css/base.css` + `/css/post.css` and includes the MathJax CDN script for LaTeX), then add a `.blogpost` card linking to it in `blog/index.html`. There is no automatic post index.
- **Adding a project:** add a `.proj` card in `projects/index.html` (and optionally feature it in `index.html`'s Projects section). Projects are hardcoded HTML cards — there is no data file or script generating them.
- Blog posts use **MathJax 4** (jsDelivr CDN) for inline `\( ... \)` and display `$$ ... $$` math.
