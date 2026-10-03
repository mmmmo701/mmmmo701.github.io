# Copilot quick instructions

- Plain static HTML/CSS site served by GitHub Pages from the repo root. **No build step** (no Jekyll, no bundler).
- Structure:
    - `index.html` — landing page, one `.section` card per topic.
    - `blog/index.html` — hand-maintained post list; posts are standalone files in `blog/posts/`.
    - `projects/index.html` — hand-maintained project list.
    - `past-current/index.html` — what I'm reading / working through.
- Styling:
    - `css/base.css` — the dark theme for `index.html` and the three index pages: tokens, layout, `.section`, `.entry-list` / `.one-entry` / `.entry-title`, `a.simple`, `.actions`.
    - `css/post.css` — self-contained dark theme for blog posts. Posts load **only** this file, not `base.css`.
    - A page's `<style>` block sets **only** `--bg`, `--accent` and `--accent-rgb`. Never copy rules between pages; shared rules go in `base.css`.
- Math: pages with math load `/js/mathjax.js` (the single MathJax config + loader). Never inline a MathJax config in a page. A literal dollar in prose must be written `\$`.
- Links: stylesheet, script and in-site page hrefs are absolute (`/css/...`, `/blog/...`). Off-site links get `target="_blank" rel="noopener"`.
- Content updates:
    - New post: copy a file in `blog/posts/` (links `/css/post.css` + `/js/mathjax.js`), then add a `.one-entry` card to `blog/index.html`.
    - New project: add a `.one-entry` card to `projects/index.html`.
- Test with a server (`python3 -m http.server`) before committing; absolute `/css/...` paths do not resolve from `file://`.
