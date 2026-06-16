# Copilot quick instructions

- This is a plain static HTML/CSS site served by GitHub Pages from the repo root. There is **no build step** (no Jekyll, no bundler).
- Repo structure:
    - Root: main page `index.html`.
    - Blog: index at `blog/index.html`; each post is a standalone HTML file in `blog/posts/`.
    - Projects: index at `projects/index.html`.
- Styling:
    - `css/base.css` — global dark theme: design tokens (`:root` variables), layout, and shared components (`a.simple`, `.section`, `.proj`, etc.).
    - `css/post.css` — light theme used only by individual blog posts.
    - Each page's `<style>` block holds only that page's accent color / `--bg` override. Keep shared rules in `base.css`, not duplicated per page.
    - All stylesheet hrefs are absolute (`/css/...`) so they resolve at any directory depth on GitHub Pages.
- Content updates:
    - New blog post: copy an existing file in `blog/posts/` (links `/css/base.css` + `/css/post.css`, includes the MathJax CDN), then add a `.blogpost` card linking to it in `blog/index.html`.
    - New project: add a `.proj` card in `projects/index.html`.
- Test changes locally (serve the repo root, e.g. `python3 -m http.server`) before committing; absolute `/css/...` paths do not resolve from `file://`.
