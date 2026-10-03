# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal website for Mike Mo, served as a **plain static HTML site via GitHub Pages** at `mmmmo701.github.io`. Despite the "Initial GitHub pages site with Jekyll" commit in the history, there is **no `_config.yml`, no Gemfile, and no build step** — the site is hand-written HTML/CSS with no framework. There is nothing to build, lint, or test.

## Development

- **Preview locally:** serve the repo root with `python3 -m http.server` and visit `http://localhost:8000`. A server (not `file://`) is required because every stylesheet, script and in-site page link is absolute (`/css/...`, `/blog/...`).
- **Deploy:** push to `main`; GitHub Pages serves the repo root automatically.

## Structure

- `index.html` — landing page. One `.section` card per topic (Intro / Current / Blog / Research / Projects / Cool Links / Beyond CS / Contact); the Current, Blog and Projects cards are short teasers that link to their own pages.
- `blog/index.html` — manually-maintained list of blog posts; each post is a standalone file in `blog/posts/`.
- `projects/index.html` — manually-maintained list of project cards.
- `past-current/index.html` — the books and papers currently being read, and finished ones.
- `css/base.css` — dark theme for `index.html` and the three index pages.
- `css/post.css` — **self-contained** dark theme for individual blog posts. Posts load only this file.
- `js/mathjax.js` — the single MathJax config + CDN loader, used by every page that contains math.

## Conventions

### Theming

`base.css` owns every rule. A page or a section sets exactly three variables and nothing else:

```css
:root { --bg: #200720; --accent: #eeb3bb; --accent-rgb: 238, 179, 187 }
```

`--accent` colours headings and links; `--accent-rgb` is the same colour as `r, g, b` and is what `.section` builds its tint gradient from — **keep the two in sync**. On `index.html` the same three variables are set per section class (`.intro`, `.blog`, …) instead of on `:root`.

Never copy a rule between pages. If two pages need it, it belongs in `base.css`.

### Components

- `.section` — the big tinted card on the landing page (`h2` + `p` + optional `.entry-list` / `.actions`).
- `.entry-list` > `.one-entry` — the list-item card used by every page. Inside: `.entry-title`, `.meta`, and optionally one `a.simple`. Use the `.entry-title` class, not an inline `font-weight`.
- `.actions` — a flex row of `a.simple` call-to-action links.

Blog posts use a different vocabulary entirely (`.page`, `header.meta`, `main.card`, `.content`, `a.back`) from `post.css`.

### Links

- Stylesheets, scripts and in-site pages: absolute (`/css/base.css`, `/blog/index.html`).
- Off-site: `target="_blank" rel="noopener"`.

### Math

Pages containing math load `/js/mathjax.js` and nothing else — **do not** inline a `window.MathJax` config in a page, and do not add a second MathJax `<script>`. Delimiters are `\( \)` / `$ $` inline and `$$ $$` / `\[ \]` display.

Because `$` opens inline math, a **literal dollar sign in prose must be written `\$`** (e.g. `\$100`). Forgetting this silently swallows everything up to the next `$` as math.

### Adding content

- **Blog post:** copy an existing file in `blog/posts/` as a template (it links `/css/post.css` + `/js/mathjax.js`), then add a `.one-entry` card linking to it in `blog/index.html`. There is no automatic post index. Inside `<article class="content">` the section headings are `<h2>` — the single `<h1>` is the post title in `<header class="meta">`.
- **Project:** add a `.one-entry` card in `projects/index.html`, and optionally feature it in `index.html`'s Projects section.
