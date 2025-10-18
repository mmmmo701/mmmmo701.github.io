# Copilot quick instructions

- Repo structure:
    - Root: static main page `index.html`.
    - Blog: static site in `blog/index.html` + posts in `blog/_posts/`.
    - Projects: static index at `projects/index.html` (contains client-side `PROJECTS` array).
- Styling:
    - Global styles in `css/normalize.css`.
    - Page-specific styles in `<style>` tags within each HTML file.
- Content updates:
    - Blog posts: add markdown files in `blog/_posts/` with YAML front matter
    - Projects: update `PROJECTS` array in `projects/index.html`.
- Commit guidelines:
    - Use clear commit messages.
    - Test changes locally before committing.

- If unsure about build tools, theme changes, or new top-level dirs, request review from the repo owner.